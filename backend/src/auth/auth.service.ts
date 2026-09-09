import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import * as bcrypt from "bcryptjs";
import { Role, AuditAction, Prisma, User, Organization } from "@prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "../constants/roles.constants";
import { JwtPayload } from "../types";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService
  ) {}

  resolveUserPermissions(
    role?: string,
    customRole?: {
      permissions?: Array<{
        permission?: { code?: string } | null;
      }>;
    } | null
  ): string[] {
    if (!role) return [];
    if (role === Role.SUPER_ADMIN || role === Role.ADMIN) {
      return ["*"];
    }
    if (customRole?.permissions && customRole.permissions.length > 0) {
      return customRole.permissions
        .map((p) => p.permission?.code)
        .filter((code): code is string => Boolean(code));
    }
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
  }

  private async generateTokens(user: {
    id: string;
    phone: string;
    role: Role;
    organizationId?: string | null;
    firstName: string;
    lastName: string;
  }) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      organizationId: user.organizationId || null,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(
    loginDto: { phone?: string; email?: string; password: string },
    ip?: string,
    userAgent?: string
  ) {
    const rawEmail = loginDto.email ? loginDto.email.trim() : undefined;
    const rawPhone = loginDto.phone ? loginDto.phone.trim() : undefined;
    const identifier = rawEmail || rawPhone || "";

    let user: (User & { organization?: Organization | null }) | null = null;

    const authInclude = {
      organization: true,
      customRole: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    };

    if (rawEmail) {
      user = await this.prisma.user.findFirst({
        where: {
          email: { equals: rawEmail, mode: "insensitive" },
          deletedAt: null,
        },
        include: authInclude,
      });

      // Compatibility fallback: eduhub.uz <-> educrm.uz admin aliases
      if (
        !user &&
        (rawEmail.toLowerCase() === "admin@eduhub.uz" ||
          rawEmail.toLowerCase() === "admin@educrm.uz")
      ) {
        user = await this.prisma.user.findFirst({
          where: {
            OR: [
              { email: { in: ["admin@eduhub.uz", "admin@educrm.uz"], mode: "insensitive" } },
              { phone: "+998901234567" },
            ],
            deletedAt: null,
          },
          include: authInclude,
        });
      }
    } else if (rawPhone) {
      user = await this.prisma.user.findFirst({
        where: {
          phone: rawPhone,
          deletedAt: null,
        },
        include: authInclude,
      });
    }

    if (!user || user.deletedAt) {
      await this.auditService.log({
        organizationId: undefined,
        action: AuditAction.LOGIN,
        entityType: "User",
        entityId: "failed-login",
        ip,
        userAgent,
        after: { identifier, status: "FAILED_USER_NOT_FOUND" },
      });
      throw new UnauthorizedException("Email yoki parol xato!");
    }

    if (!user.isActive) {
      await this.auditService.log({
        organizationId: user.organizationId || undefined,
        userId: user.id,
        action: AuditAction.LOGIN,
        entityType: "User",
        entityId: user.id,
        ip,
        userAgent,
        after: { identifier, status: "FAILED_ACCOUNT_INACTIVE" },
      });
      throw new UnauthorizedException(
        "Hisobingiz nofaol holatda. Iltimos, ma'muriyatga murojaat qiling!"
      );
    }

    // Check if account is currently locked out
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.max(
        1,
        Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000))
      );
      await this.auditService.log({
        organizationId: user.organizationId || undefined,
        userId: user.id,
        action: AuditAction.LOGIN,
        entityType: "User",
        entityId: user.id,
        ip,
        userAgent,
        after: { identifier, status: "BLOCKED_ACCOUNT_LOCKED", remainingMinutes },
      });
      throw new UnauthorizedException(
        `Hisobingiz ketma-ket 5 ta muvaffaqiyatsiz urinish sababli vaqtincha bloklangan. Iltimos, ${remainingMinutes} daqiqadan so'ng qayta urinib ko'ring.`
      );
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      let updateData: Prisma.UserUpdateInput = { failedLoginAttempts: failedAttempts };
      let errorMessage = "Email yoki parol xato!";

      if (failedAttempts >= 5) {
        const lockoutMinutes = process.env.LOCKOUT_MINUTES
          ? Number(process.env.LOCKOUT_MINUTES)
          : process.env.NODE_ENV === "development"
            ? 1
            : 15;
        const lockoutDurationMs = lockoutMinutes * 60 * 1000;
        updateData = {
          failedLoginAttempts: 0,
          lockedUntil: new Date(Date.now() + lockoutDurationMs),
        };
        errorMessage = `Parol 5 marta ketma-ket xato kiritildi. Xavfsizlik yuzasidan hisobingiz ${lockoutMinutes} daqiqaga bloklandi!`;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      await this.auditService.log({
        organizationId: user.organizationId || undefined,
        userId: user.id,
        action: AuditAction.LOGIN,
        entityType: "User",
        entityId: user.id,
        ip,
        userAgent,
        after: {
          identifier,
          status: failedAttempts >= 5 ? "ACCOUNT_LOCKED_15M" : "FAILED_INVALID_PASSWORD",
          failedAttempts,
        },
      });

      throw new UnauthorizedException(errorMessage);
    }

    // Reset failed attempts upon successful authentication
    if ((user.failedLoginAttempts && user.failedLoginAttempts > 0) || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    const tokens = await this.generateTokens(user);

    await this.auditService.log({
      organizationId: user.organizationId || undefined,
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: "User",
      entityId: user.id,
      ip,
      userAgent,
      after: { phone: user.phone, role: user.role },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        organizationId: user.organizationId || null,
        organization: user.organization
          ? {
              id: user.organization.id,
              name: user.organization.name,
              slug: user.organization.slug,
              businessType: user.organization.businessType,
            }
          : null,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        permissions: this.resolveUserPermissions(user.role, (user as any).customRole),
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token taqdim etilmadi");
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, { secret: refreshSecret });
    } catch (e) {
      throw new UnauthorizedException("Refresh token yaroqsiz yoki muddati o'tgan");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive || user.deletedAt || !user.hashedRefreshToken) {
      throw new UnauthorizedException("Foydalanuvchi topilmadi yoki sessiya bekor qilingan");
    }

    const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isMatch) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { hashedRefreshToken: null },
      });
      throw new ForbiddenException(
        "Refresh token xavfsizlik tekshiruvidan o'tmadi. Iltimos, qayta kiring."
      );
    }

    return this.generateTokens(user);
  }

  decodeToken(token: string) {
    try {
      return this.jwtService.decode(token);
    } catch {
      return null;
    }
  }

  async logout(userId?: string, refreshToken?: string) {
    if (userId) {
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { hashedRefreshToken: null },
        });
      } catch (e) {}
      return { success: true, message: "Tizimdan muvaffaqiyatli chiqildi" };
    }

    if (refreshToken) {
      try {
        const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        const payload: JwtPayload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
        if (payload && payload.sub) {
          await this.prisma.user.update({
            where: { id: payload.sub },
            data: { hashedRefreshToken: null },
          });
        }
      } catch (e) {
        // Token invalid or already revoked
      }
    }

    return { success: true, message: "Tizimdan muvaffaqiyatli chiqildi" };
  }

  async register(registerDto: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    password: string;
    organizationName?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { phone: registerDto.phone },
    });
    if (existing) {
      throw new ConflictException("Ushbu telefon raqami bilan foydalanuvchi allaqachon mavjud!");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const orgName =
      registerDto.organizationName || `${registerDto.firstName} ${registerDto.lastName} Markazi`;
    const baseSlug =
      orgName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "workspace";
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    // Atomically provision new isolated tenant, main branch, default config and admin user
    const result = await this.prisma.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: {
          name: orgName,
          slug: uniqueSlug,
          phone: registerDto.phone,
          currency: "UZS",
        },
      });

      const mainBranch = await tx.branch.create({
        data: {
          organizationId: newOrg.id,
          name: "Bosh filial",
          address: "Asosiy manzil",
        },
      });

      await tx.systemConfig.create({
        data: {
          organizationId: newOrg.id,
          enabledModules: [
            "LEADS",
            "STUDENTS",
            "GROUPS",
            "COURSES",
            "ATTENDANCE",
            "FINANCE",
            "SMS",
            "PAYMENTS",
          ],
        },
      });

      const newUser = await tx.user.create({
        data: {
          organizationId: newOrg.id,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          phone: registerDto.phone,
          email: registerDto.email,
          password: hashedPassword,
          role: Role.ADMIN, // Admin of their own new tenant
        },
      });

      await tx.userBranch.create({
        data: {
          userId: newUser.id,
          branchId: mainBranch.id,
        },
      });

      return { user: newUser, organization: newOrg };
    });

    await this.auditService.log({
      organizationId: result.organization.id,
      userId: result.user.id,
      action: AuditAction.CREATE,
      entityType: "Organization",
      entityId: result.organization.id,
      after: { name: result.organization.name, owner: result.user.phone },
    });

    const tokens = await this.generateTokens(result.user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: result.user.id,
        organizationId: result.organization.id,
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
        },
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        role: result.user.role,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            businessType: true,
          },
        },
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
        customRole: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
    if (!user) return null;
    const permissions = this.resolveUserPermissions(user.role, user.customRole);
    const { customRole, ...userProfile } = user;
    return {
      ...userProfile,
      permissions,
    };
  }

  async unlockAccount(identifier?: string) {
    if (!identifier) {
      const result = await this.prisma.user.updateMany({
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
      return { success: true, count: result.count, message: "Barcha hisoblar blokdan chiqarildi." };
    }
    const cleanId = identifier.trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanId, mode: "insensitive" } },
          { phone: cleanId },
          { id: cleanId },
        ],
      },
    });
    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi.");
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
    return { success: true, message: `${user.email || user.phone} blokdan chiqarildi.` };
  }
}
