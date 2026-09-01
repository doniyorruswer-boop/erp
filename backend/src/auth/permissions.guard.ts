import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { Role, PermissionScope } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Avtorizatsiyadan o'tilmagan");
    }

    // Super Admin & Admin have all permissions with ORGANIZATION scope
    if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
      request.permissionScope = PermissionScope.ORGANIZATION;
      request.isOrgAdmin = true;
      request.userBranches = [];
      return true;
    }

    // Fetch user with customRole & userBranches
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        customRole: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        userBranches: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
      throw new ForbiddenException("Foydalanuvchi hisobi nofaol yoki o'chirilgan");
    }

    // Attach user branches to request for branch filtering
    request.userBranches = dbUser.userBranches || [];

    let grantedCodes: { code: string; scope: PermissionScope }[] = [];

    // Strict Priority Order:
    // 1. If user has customRole assigned, use ONLY database permissions (even if empty)
    // 2. If user has NO customRole, use built-in defaultRolePerms fallback
    if (dbUser.customRole) {
      grantedCodes = (dbUser.customRole.permissions || []).map((p) => ({
        code: p.permission.code,
        scope: p.scope,
      }));
    } else {
      // Fallback for default built-in roles
      const defaultRolePerms: Record<Role, string[]> = {
        SUPER_ADMIN: ['*'],
        ADMIN: ['*'],
        BRANCH_MANAGER: [
          'students.*',
          'groups.*',
          'courses.*',
          'attendance.*',
          'payments.*',
          'leads.*',
          'crm.*',
          'rooms.*',
          'reports.view',
          'branches.view',
          'notifications.view',
        ],
        MANAGER: [
          'students.view',
          'students.create',
          'students.update',
          'groups.view',
          'courses.view',
          'attendance.view',
          'leads.view',
          'leads.create',
          'leads.update',
          'crm.view',
          'crm.create',
          'crm.update',
          'crm.convert',
          'payments.view',
          'payments.create',
          'reports.view',
          'rooms.manage',
          'notifications.view',
        ],
        TEACHER: [
          'groups.view',
          'attendance.view',
          'attendance.create',
          'students.view',
          'courses.view',
          'notifications.view',
        ],
        CASHIER: [
          'payments.view',
          'payments.create',
          'students.view',
          'groups.view',
          'reports.view',
          'notifications.view',
        ],
        STUDENT: ['students.view', 'groups.view', 'attendance.view', 'notifications.view'],
      };

      const rolePerms = defaultRolePerms[user.role as Role] || [];
      const defaultScope =
        user.role === Role.BRANCH_MANAGER || user.role === Role.TEACHER
          ? PermissionScope.BRANCH
          : PermissionScope.ORGANIZATION;

      grantedCodes = rolePerms.map((code) => ({
        code,
        scope: defaultScope,
      }));
    }

    const checkPermission = (required: string) => {
      const match = grantedCodes.find(
        (g) =>
          g.code === '*' ||
          g.code === required ||
          (g.code.endsWith('.*') && required.startsWith(g.code.replace('.*', ''))),
      );
      return match || null;
    };

    let dominantScope: PermissionScope = PermissionScope.ORGANIZATION;

    for (const reqPerm of requiredPermissions) {
      const match = checkPermission(reqPerm);
      if (!match) {
        throw new ForbiddenException(
          `Sizda ushbu amalni bajarish uchun ruxsat yo'q: (${reqPerm})`,
        );
      }
      dominantScope = match.scope;
    }

    request.permissionScope = dominantScope;
    request.isOrgAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;
    return true;
  }
}
