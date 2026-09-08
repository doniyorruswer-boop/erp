import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PermissionScope, AuditAction } from '@prisma/client';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultPermissions();
  }

  async seedDefaultPermissions() {
    const defaultPermissions = [
      // Students
      { code: 'students.view', module: 'STUDENTS', description: "O'quvchilar ro'yxati va profilini ko'rish" },
      { code: 'students.create', module: 'STUDENTS', description: "Yangi o'quvchi qo'shish" },
      { code: 'students.update', module: 'STUDENTS', description: "O'quvchi ma'lumotlarini tahrirlash" },
      { code: 'students.delete', module: 'STUDENTS', description: "O'quvchini o'chirish" },
      { code: 'students.export', module: 'STUDENTS', description: "O'quvchilar ro'yxatini export qilish" },

      // Groups
      { code: 'groups.view', module: 'GROUPS', description: "Guruhlar ro'yxatini ko'rish" },
      { code: 'groups.create', module: 'GROUPS', description: "Yangi guruh ochish" },
      { code: 'groups.update', module: 'GROUPS', description: "Guruhni tahrirlash" },
      { code: 'groups.delete', module: 'GROUPS', description: "Guruhni o'chirish" },

      // Courses
      { code: 'courses.view', module: 'COURSES', description: "Kurslar ro'yxatini ko'rish" },
      { code: 'courses.create', module: 'COURSES', description: "Yangi kurs qo'shish" },
      { code: 'courses.update', module: 'COURSES', description: "Kursni tahrirlash" },
      { code: 'courses.delete', module: 'COURSES', description: "Kursni o'chirish" },

      // Payments & Finance
      { code: 'payments.view', module: 'FINANCE', description: "To'lovlar ro'yxatini ko'rish" },
      { code: 'payments.create', module: 'FINANCE', description: "To'lov qabul qilish" },
      { code: 'payments.refund', module: 'FINANCE', description: "To'lovni qaytarish (Refund)" },
      { code: 'payments.delete', module: 'FINANCE', description: "To'lovni bekor qilish" },

      // Attendance
      { code: 'attendance.view', module: 'ATTENDANCE', description: "Davomatni ko'rish" },
      { code: 'attendance.create', module: 'ATTENDANCE', description: "Davomat olish va belgilash" },

      // Leads / CRM
      { code: 'leads.view', module: 'CRM', description: "Lidlar va Kanban voronkasini ko'rish" },
      { code: 'leads.create', module: 'CRM', description: "Yangi lid qo'shish" },
      { code: 'leads.update', module: 'CRM', description: "Lid holatini o'zgartirish" },
      { code: 'leads.delete', module: 'CRM', description: "Lidni o'chirish" },

      // Core CRM
      { code: 'crm.view', module: 'CRM', description: "CRM mijozlar, vazifalar va voronkalarni ko'rish" },
      { code: 'crm.create', module: 'CRM', description: "CRM obyektlarini yaratish" },
      { code: 'crm.update', module: 'CRM', description: "CRM obyektlarini tahrirlash" },
      { code: 'crm.delete', module: 'CRM', description: "CRM obyektlarini o'chirish" },
      { code: 'crm.pipelines', module: 'CRM', description: "Voronkalar va bosqichlarni boshqarish" },
      { code: 'crm.convert', module: 'CRM', description: "Lidlarni mijozga/talabaga aylantirish" },

      // Branches & Resources
      { code: 'branches.view', module: 'BRANCHES', description: "Filiallarni ko'rish" },
      { code: 'branches.create', module: 'BRANCHES', description: "Filial yaratish va boshqarish" },
      { code: 'rooms.manage', module: 'RESOURCES', description: "Xonalar va resurslarni boshqarish" },

      // Reports & Dashboard
      { code: 'reports.view', module: 'REPORTS', description: "Analitika va hisobotlarni ko'rish" },
      { code: 'notifications.view', module: 'NOTIFICATIONS', description: "Bildirishnomalarni ko'rish va o'qilgan deb belgilash" },
      { code: 'settings.manage', module: 'SETTINGS', description: "Tizim va tashkilot sozlamalarini boshqarish" },
    ];

    for (const p of defaultPermissions) {
      await this.prisma.permission.upsert({
        where: { code: p.code },
        update: { module: p.module, description: p.description },
        create: { code: p.code, module: p.module, description: p.description },
      });
    }
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });
  }

  async findAll(orgId: string) {
    return this.prisma.customRole.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const role = await this.prisma.customRole.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        permissions: {
          include: { permission: true },
        },
        users: {
          where: { deletedAt: null },
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    });
    if (!role) throw new NotFoundException('Rol topilmadi');
    return role;
  }

  async create(data: {
    name: string;
    description?: string;
    permissions?: { permissionCode: string; scope?: PermissionScope }[];
  }, orgId: string, userId?: string) {
    const role = await this.prisma.$transaction(async (tx) => {
      const r = await tx.customRole.create({
        data: {
          organizationId: orgId,
          name: data.name,
          description: data.description,
        },
      });

      if (data.permissions && data.permissions.length > 0) {
        const codes = data.permissions.map((p) => p.permissionCode);
        const permRecords = await tx.permission.findMany({
          where: { code: { in: codes } },
        });

        const permMap = new Map(permRecords.map((p) => [p.code, p.id]));
        const rolePermData = [];

        for (const p of data.permissions) {
          const permId = permMap.get(p.permissionCode);
          if (permId) {
            rolePermData.push({
              roleId: r.id,
              permissionId: permId,
              scope: p.scope || PermissionScope.ORGANIZATION,
            });
          }
        }

        if (rolePermData.length > 0) {
          await tx.rolePermission.createMany({
            data: rolePermData,
            skipDuplicates: true,
          });
        }
      }

      return r;
    });

    const createdRole = await this.findOne(role.id, orgId);

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'CustomRole',
      entityId: role.id,
      after: createdRole,
    });

    return createdRole;
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    permissions?: { permissionCode: string; scope?: PermissionScope }[];
  }, orgId: string, userId?: string) {
    const existing = await this.prisma.customRole.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Rol topilmadi');

    if (existing.isSystem && data.name && data.name !== existing.name) {
      throw new ForbiddenException("Tizim standart rolining nomini o'zgartirish taqiqlanadi");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.customRole.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
      });

      if (data.permissions !== undefined) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });

        if (data.permissions.length > 0) {
          const codes = data.permissions.map((p) => p.permissionCode);
          const permRecords = await tx.permission.findMany({
            where: { code: { in: codes } },
          });

          const permMap = new Map(permRecords.map((p) => [p.code, p.id]));
          const rolePermData = [];

          for (const p of data.permissions) {
            const permId = permMap.get(p.permissionCode);
            if (permId) {
              rolePermData.push({
                roleId: id,
                permissionId: permId,
                scope: p.scope || PermissionScope.ORGANIZATION,
              });
            }
          }

          if (rolePermData.length > 0) {
            await tx.rolePermission.createMany({
              data: rolePermData,
              skipDuplicates: true,
            });
          }
        }
      }
    });

    const updatedRole = await this.findOne(id, orgId);

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'CustomRole',
      entityId: id,
      before: existing,
      after: updatedRole,
    });

    return updatedRole;
  }

  async remove(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.customRole.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Rol topilmadi');

    if (existing.isSystem) {
      throw new ForbiddenException("Tizim standart rolini o'chirish taqiqlanadi");
    }

    const deleted = await this.prisma.customRole.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: 'CustomRole',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.customRole.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Rol topilmadi');

    const restored = await this.prisma.customRole.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'CustomRole',
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }
}
