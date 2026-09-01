import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MODULES_KEY } from './module.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModules = this.reflector.getAllAndOverride<string[]>(MODULES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredModules || requiredModules.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Foydalanuvchi autentifikatsiyadan otmagan');
    }

    // Super admin bypasses module restriction if not bound to an org
    if (user.role === Role.SUPER_ADMIN && !user.organizationId) {
      return true;
    }

    const orgId = user.organizationId;
    if (!orgId) {
      throw new ForbiddenException('Tashkilot aniqlanmadi');
    }

    // Fetch tenant's system config
    const config = await this.prisma.systemConfig.findUnique({
      where: { organizationId: orgId },
      select: { enabledModules: true },
    });

    const enabledModules = config?.enabledModules || ['LEADS', 'STUDENTS', 'GROUPS', 'COURSES', 'ATTENDANCE', 'FINANCE', 'SMS', 'PAYMENTS'];
    const normalizedEnabled = enabledModules.map(m => m.toUpperCase());

    // Check if all or any of the required modules are enabled
    const hasModule = requiredModules.some(reqMod => 
      normalizedEnabled.includes(reqMod.toUpperCase()) ||
      normalizedEnabled.includes('ALL')
    );

    if (!hasModule) {
      throw new ForbiddenException(
        `Ushbu modul ('${requiredModules.join(', ')}') tashkilotingiz uchun faollashtirilmagan`
      );
    }

    return true;
  }
}
