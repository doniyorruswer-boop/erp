import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { BranchContext } from './branch-access';
import { PermissionScope, Role } from '@prisma/client';

export const CurrentBranch = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): BranchContext => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const orgId = user?.organizationId;

    if (!orgId) {
      throw new UnauthorizedException('Organization context missing');
    }

    const isOrgAdmin =
      request.isOrgAdmin !== undefined
        ? request.isOrgAdmin
        : user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;

    const userBranches = request.userBranches || [];
    const accessibleBranchIds = userBranches.map((ub: any) => ub.branchId);

    // Client-supplied target (query, body, or header) is ONLY treated as a requested target,
    // NEVER as proof of authorization. Real access is always verified by assertBranchAccess / buildBranchWhere.
    const requestedTarget =
      request.query?.branchId ||
      request.body?.branchId ||
      (request.headers['x-branch-id'] as string) ||
      undefined;

    return {
      organizationId: orgId,
      branchId: requestedTarget,
      accessibleBranchIds,
      isOrgAdmin,
    };
  },
);
