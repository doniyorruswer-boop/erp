import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const orgId =
      request.headers['x-organization-id'] ||
      request.headers['x-tenant-id'] ||
      request.query?.orgId ||
      request.body?.orgId ||
      request.user?.organizationId;

    if (!orgId) {
      throw new UnauthorizedException('Organization context missing');
    }

    return orgId;
  },
);
