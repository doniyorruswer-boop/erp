import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcryptjs';
import { Role, AuditAction } from '@prisma/client';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    // Seed initial Super Admin if not exists
    const defaultOrg = await this.prisma.organization.findFirst();
    const adminExists = await this.prisma.user.findFirst({
      where: { role: Role.SUPER_ADMIN },
    });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.prisma.user.create({
        data: {
          organizationId: defaultOrg ? defaultOrg.id : null,
          firstName: 'Bosh',
          lastName: 'Administrator',
          phone: '+998901234567',
          email: 'admin@educrm.uz',
          password: hashedPassword,
          role: Role.SUPER_ADMIN,
        },
      });
      console.log('Super Admin yaratildi: Tel: +998901234567, Parol: admin123');
    }
  }

  async login(loginDto: { phone?: string; email?: string; password: string }, ip?: string, userAgent?: string) {
    const where = loginDto.email ? { email: loginDto.email } : { phone: loginDto.phone };
    let user = await this.prisma.user.findUnique({
      where: where as any,
      include: { organization: true },
    });

    if (!user || !user.isActive || user.deletedAt) {
      await this.auditService.log({
        organizationId: undefined,
        action: AuditAction.LOGIN,
        entityType: 'User',
        entityId: 'failed-login',
        ip,
        userAgent,
        after: { identifier: loginDto.email || loginDto.phone, status: 'FAILED_USER_NOT_FOUND_OR_INACTIVE' },
      });
      throw new UnauthorizedException('Email yoki parol xato!');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      await this.auditService.log({
        organizationId: user.organizationId || undefined,
        userId: user.id,
        action: AuditAction.LOGIN,
        entityType: 'User',
        entityId: user.id,
        ip,
        userAgent,
        after: { identifier: loginDto.email || loginDto.phone, status: 'FAILED_INVALID_PASSWORD' },
      });
      throw new UnauthorizedException('Email yoki parol xato!');
    }

    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      organizationId: user.organizationId || null,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    await this.auditService.log({
      organizationId: user.organizationId || undefined,
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      ip,
      userAgent,
      after: { phone: user.phone, role: user.role },
    });

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        organizationId: user.organizationId || null,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
          slug: user.organization.slug,
          businessType: user.organization.businessType,
        } : null,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    };
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
      throw new ConflictException('Ushbu telefon raqami bilan foydalanuvchi allaqachon mavjud!');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const orgName = registerDto.organizationName || `${registerDto.firstName} ${registerDto.lastName} Markazi`;
    const baseSlug = orgName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'workspace';
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    // Atomically provision new isolated tenant, main branch, default config and admin user
    const result = await this.prisma.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: {
          name: orgName,
          slug: uniqueSlug,
          phone: registerDto.phone,
          currency: 'UZS',
        },
      });

      const mainBranch = await tx.branch.create({
        data: {
          organizationId: newOrg.id,
          name: 'Bosh filial',
          address: 'Asosiy manzil',
        },
      });

      await tx.systemConfig.create({
        data: {
          organizationId: newOrg.id,
          enabledModules: ['LEADS', 'STUDENTS', 'GROUPS', 'COURSES', 'ATTENDANCE', 'FINANCE', 'SMS', 'PAYMENTS'],
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
      entityType: 'Organization',
      entityId: result.organization.id,
      after: { name: result.organization.name, owner: result.user.phone },
    });

    return {
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
      },
    });
    return user;
  }
}
