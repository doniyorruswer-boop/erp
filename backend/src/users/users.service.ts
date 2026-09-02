import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Role, AuditAction } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(query: { role?: Role; search?: string; branchId?: string; orgId: string }) {
    const branchWhere = query.branchId
      ? { userBranches: { some: { branchId: query.branchId } } }
      : {};

    return this.prisma.user.findMany({
      where: {
        organizationId: query.orgId,
        deletedAt: null,
        isActive: true,
        role: query.role,
        ...branchWhere,
        OR: query.search
          ? [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
            ]
          : undefined,
      },
      select: {
        id: true,
        organizationId: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        role: true,
        salaryType: true,
        salaryAmount: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        role: true,
        salaryType: true,
        salaryAmount: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  async create(data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    password?: string;
    role?: Role;
    customRoleId?: string;
    salaryType?: string;
    salaryAmount?: number;
  }, orgId: string, userId?: string) {
    // Privilege Escalation Protection: Cannot create SUPER_ADMIN
    if (data.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('SUPER_ADMIN rolini yaratish yoki biriktirish taqiqlanadi');
    }

    if (data.customRoleId) {
      const customRole = await this.prisma.customRole.findFirst({
        where: { id: data.customRoleId, organizationId: orgId, deletedAt: null },
      });
      if (!customRole) {
        throw new BadRequestException('Tanlangan custom rol topilmadi yoki ushbu tashkilotga tegishli emas');
      }
    }

    if (!data.password && process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Foydalanuvchi paroli ko\'rsatilishi shart!');
    }
    const rawPassword = data.password || 'admin123';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        organizationId: orgId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        password: passwordHash,
        role: data.role || Role.TEACHER,
        customRoleId: data.customRoleId || null,
        salaryType: data.salaryType,
        salaryAmount: data.salaryAmount,
      },
      select: {
        id: true,
        organizationId: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        role: true,
        salaryType: true,
        salaryAmount: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'User',
      entityId: user.id,
      after: user,
    });

    return user;
  }

  async update(id: string, data: any, orgId: string, currentUserId?: string) {
    const existing = await this.prisma.user.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Foydalanuvchi topilmadi');

    // Privilege Escalation Protection
    if (data.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('SUPER_ADMIN rolini berish taqiqlanadi');
    }

    if (existing.role === Role.SUPER_ADMIN && currentUserId !== existing.id) {
      throw new ForbiddenException("SUPER_ADMIN foydalanuvchisini o'zgartirish taqiqlanadi");
    }

    // Prevent self-role escalation
    if (currentUserId && id === currentUserId && data.role && data.role !== existing.role) {
      throw new ForbiddenException("O'z rolingizni o'zingiz o'zgartirishingiz taqiqlanadi");
    }

    if (data.customRoleId) {
      const customRole = await this.prisma.customRole.findFirst({
        where: { id: data.customRoleId, organizationId: orgId, deletedAt: null },
      });
      if (!customRole) {
        throw new BadRequestException('Tanlangan custom rol topilmadi yoki ushbu tashkilotga tegishli emas');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    delete data.organizationId; // Prevent tenant mutation
    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        organizationId: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        role: true,
        salaryType: true,
        salaryAmount: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId: currentUserId,
      action: AuditAction.UPDATE,
      entityType: 'User',
      entityId: id,
      before: { id: existing.id, firstName: existing.firstName, lastName: existing.lastName, role: existing.role },
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, currentUserId?: string) {
    const existing = await this.prisma.user.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Foydalanuvchi topilmadi');

    if (currentUserId && id === currentUserId) {
      throw new BadRequestException("O'z hisobingizni o'chira olmaysiz");
    }

    if (existing.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException("SUPER_ADMIN foydalanuvchisini o'chirish taqiqlanadi");
    }

    const deleted = await this.prisma.user.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
      select: {
        id: true,
        organizationId: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId: currentUserId,
      action: AuditAction.DELETE,
      entityType: 'User',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, currentUserId?: string) {
    const existing = await this.prisma.user.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Foydalanuvchi topilmadi');

    const restored = await this.prisma.user.update({
      where: { id },
      data: { isActive: true, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId: currentUserId,
      action: AuditAction.RESTORE,
      entityType: 'User',
      entityId: id,
      before: { id: existing.id, firstName: existing.firstName, lastName: existing.lastName },
      after: restored,
    });

    return restored;
  }
}
