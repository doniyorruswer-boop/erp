import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';
import { BranchContext, buildBranchWhere, assertBranchAccess } from '../auth/branch-access';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(params: { orgId: string; branchId?: string; search?: string }, branchCtx?: BranchContext) {
    const branchWhere = branchCtx
      ? buildBranchWhere(branchCtx, params.branchId)
      : (params.branchId ? { branchId: params.branchId } : {});

    const searchWhere = params.search
      ? { name: { contains: params.search, mode: 'insensitive' as const } }
      : {};

    return this.prisma.room.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        ...branchWhere,
        ...searchWhere,
      },
      include: {
        _count: { select: { groups: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const room = await this.prisma.room.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
      include: {
        groups: {
          where: { deletedAt: null },
        },
      },
    });
    if (!room) throw new NotFoundException('Xona topilmadi yoki ushbu filialga kirish huquqi yo\'q');
    return room;
  }

  async create(data: { name: string; capacity?: number; branchId?: string }, orgId: string, userId?: string, branchCtx?: BranchContext) {
    let targetBranchId = data.branchId;
    if (branchCtx) {
      targetBranchId = assertBranchAccess(branchCtx, data.branchId);
      data.branchId = targetBranchId;
    }

    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    const room = await this.prisma.room.create({
      data: {
        organizationId: orgId,
        branchId: data.branchId || null,
        name: data.name,
        capacity: data.capacity || 15,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Room',
      entityId: room.id,
      after: room,
    });

    return room;
  }

  async update(id: string, data: any, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.room.findFirst({ where: { id, organizationId: orgId, deletedAt: null, ...branchWhere } });
    if (!existing) throw new NotFoundException('Xona topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    if (data.branchId && branchCtx) {
      assertBranchAccess(branchCtx, data.branchId);
    }

    if (data.branchId && data.branchId !== existing.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    const updated = await this.prisma.room.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Room',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.room.findFirst({ where: { id, organizationId: orgId, deletedAt: null, ...branchWhere } });
    if (!existing) throw new NotFoundException('Xona topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const deleted = await this.prisma.room.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Room',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.room.findFirst({ where: { id, organizationId: orgId, ...branchWhere } });
    if (!existing) throw new NotFoundException('Xona topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const restored = await this.prisma.room.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'Room',
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }
}
