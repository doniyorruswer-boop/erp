import { Injectable, NotFoundException, ForbiddenException, Optional } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { AuditAction } from "@prisma/client";
import { BranchContext } from "../auth/branch-access";
import { UpdateBranchDto } from "./dto/branch.dto";

@Injectable()
export class BranchesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    @Optional() private subscriptionsService?: SubscriptionsService
  ) {}

  async findAll(params: { orgId: string; search?: string }, branchCtx?: BranchContext) {
    const orgWhere = { organizationId: params.orgId };
    const branchRestriction =
      branchCtx && !branchCtx.isOrgAdmin ? { id: { in: branchCtx.accessibleBranchIds } } : {};
    const searchWhere = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { code: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    return this.prisma.branch.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...orgWhere,
        ...branchRestriction,
        ...searchWhere,
      },
      include: {
        _count: {
          select: {
            students: true,
            groups: true,
            rooms: true,
            userBranches: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    if (branchCtx && !branchCtx.isOrgAdmin && !branchCtx.accessibleBranchIds.includes(id)) {
      throw new ForbiddenException("Siz ushbu filialga kirish huquqiga ega emassiz");
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        organization: true,
        userBranches: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, phone: true, role: true },
            },
          },
        },
        _count: {
          select: { students: true, groups: true, rooms: true, payments: true },
        },
      },
    });
    if (!branch) throw new NotFoundException("Filial topilmadi");
    return branch;
  }

  async create(
    data: {
      name: string;
      code?: string;
      phone?: string;
      address?: string;
    },
    orgId: string,
    userId?: string
  ) {
    if (this.subscriptionsService) {
      await this.subscriptionsService.checkLimit("MAX_BRANCHES", 1, orgId);
    }

    const branch = await this.prisma.branch.create({
      data: {
        organizationId: orgId,
        name: data.name,
        code: data.code,
        phone: data.phone,
        address: data.address,
        isActive: true,
      },
      include: { organization: true },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: branch.id,
      userId,
      action: AuditAction.CREATE,
      entityType: "Branch",
      entityId: branch.id,
      after: branch,
    });

    return branch;
  }

  async update(id: string, data: UpdateBranchDto, orgId: string, userId?: string) {
    const existing = await this.prisma.branch.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException("Filial topilmadi");

    const updated = await this.prisma.branch.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: id,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Branch",
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.branch.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException("Filial topilmadi");

    const deleted = await this.prisma.branch.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: id,
      userId,
      action: AuditAction.DELETE,
      entityType: "Branch",
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.branch.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException("Filial topilmadi");

    const restored = await this.prisma.branch.update({
      where: { id },
      data: { isActive: true, deletedAt: null },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: id,
      userId,
      action: AuditAction.RESTORE,
      entityType: "Branch",
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }

  async assignUserToBranch(branchId: string, userId: string, isDefault = false) {
    return this.prisma.userBranch.upsert({
      where: {
        userId_branchId: { userId, branchId },
      },
      update: { isDefault },
      create: { userId, branchId, isDefault },
    });
  }

  async removeUserFromBranch(branchId: string, userId: string) {
    return this.prisma.userBranch.delete({
      where: {
        userId_branchId: { userId, branchId },
      },
    });
  }

  async getUserBranches(userId: string) {
    return this.prisma.userBranch.findMany({
      where: { userId },
      include: { branch: true },
    });
  }
}
