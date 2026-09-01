import { ForbiddenException } from '@nestjs/common';

export interface BranchContext {
  organizationId: string;
  branchId?: string; // requested target branchId
  accessibleBranchIds: string[];
  isOrgAdmin: boolean;
}

/**
 * Builds Prisma where condition for branch-scoped queries based on user's authorized branches.
 * - Org Admins can view all branches or filter by requestedBranchId.
 * - Branch users can only view their authorized branches.
 */
export function buildBranchWhere(
  ctx: BranchContext,
  requestedBranchId?: string,
): { branchId?: string | { in: string[] } } {
  const target = requestedBranchId || ctx.branchId;

  // Org-wide administrators
  if (ctx.isOrgAdmin) {
    if (target) {
      return { branchId: target };
    }
    return {}; // All branches of the organization
  }

  // Branch-restricted users
  if (target) {
    if (!ctx.accessibleBranchIds.includes(target)) {
      throw new ForbiddenException("Sizda ushbu filial ma'lumotlariga kirish huquqi yo'q");
    }
    return { branchId: target };
  }

  if (!ctx.accessibleBranchIds || ctx.accessibleBranchIds.length === 0) {
    throw new ForbiddenException("Siz hech qaysi filialga biriktirilmagansiz");
  }

  if (ctx.accessibleBranchIds.length === 1) {
    return { branchId: ctx.accessibleBranchIds[0] };
  }

  return { branchId: { in: ctx.accessibleBranchIds } };
}

/**
 * Asserts that the authenticated user has access to a specific branch for write/modify actions.
 * Returns the validated branchId.
 */
export function assertBranchAccess(
  ctx: BranchContext,
  targetBranchId?: string,
): string | undefined {
  const target = targetBranchId || ctx.branchId;

  if (!target) {
    if (ctx.isOrgAdmin) return undefined;
    if (ctx.accessibleBranchIds && ctx.accessibleBranchIds.length === 1) {
      return ctx.accessibleBranchIds[0];
    }
    if (!ctx.accessibleBranchIds || ctx.accessibleBranchIds.length === 0) {
      throw new ForbiddenException("Siz hech qaysi filialga biriktirilmagansiz");
    }
    return ctx.accessibleBranchIds[0];
  }

  if (ctx.isOrgAdmin) {
    return target;
  }

  if (!ctx.accessibleBranchIds.includes(target)) {
    throw new ForbiddenException("Siz ushbu filialga kirish yoki amal bajarish huquqiga ega emassiz");
  }

  return target;
}
