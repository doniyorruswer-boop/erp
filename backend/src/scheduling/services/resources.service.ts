import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, ResourceType, ResourceStatus } from '@prisma/client';
import { CreateResourceDto, UpdateResourceDto, QueryResourceDto } from '../dto/resource.dto';
import { BranchContext, buildBranchWhere, assertBranchAccess } from '../../auth/branch-access';

@Injectable()
export class ResourcesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(params: QueryResourceDto & { orgId: string }, branchCtx?: BranchContext) {
    const branchWhere = branchCtx
      ? buildBranchWhere(branchCtx, params.branchId)
      : (params.branchId ? { branchId: params.branchId } : {});
    const typeWhere = params.type ? { type: params.type } : {};
    const statusWhere = params.status ? { status: params.status } : {};
    const searchWhere = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' as const } },
            { code: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.resource.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        ...branchWhere,
        ...typeWhere,
        ...statusWhere,
        ...searchWhere,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        _count: {
          select: {
            schedules: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const resource = await this.prisma.resource.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
      include: {
        branch: true,
        schedules: {
          where: { deletedAt: null },
          include: {
            instructor: { select: { id: true, firstName: true, lastName: true } },
            group: { select: { id: true, name: true } },
          },
          orderBy: { startAt: 'asc' },
        },
      },
    });
    if (!resource) throw new NotFoundException('Resurs topilmadi yoki ushbu filialga kirish huquqi yo\'q');
    return resource;
  }

  async create(data: CreateResourceDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    if (branchCtx) {
      data.branchId = assertBranchAccess(branchCtx, data.branchId);
    }

    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    const resource = await this.prisma.resource.create({
      data: {
        organizationId: orgId,
        branchId: data.branchId || null,
        name: data.name,
        code: data.code || null,
        type: data.type || ResourceType.ROOM,
        capacity: data.capacity || null,
        status: data.status || ResourceStatus.AVAILABLE,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
        customFields: data.customFields ? JSON.parse(JSON.stringify(data.customFields)) : undefined,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Resource',
      entityId: resource.id,
      after: resource,
    });

    return resource;
  }

  async update(id: string, data: UpdateResourceDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.resource.findFirst({ where: { id, organizationId: orgId, deletedAt: null, ...branchWhere } });
    if (!existing) throw new NotFoundException('Resurs topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    if (data.branchId && branchCtx) {
      assertBranchAccess(branchCtx, data.branchId);
    }

    if (data.branchId && data.branchId !== existing.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    const updated = await this.prisma.resource.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        capacity: data.capacity,
        status: data.status,
        branchId: data.branchId !== undefined ? data.branchId : undefined,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
        customFields: data.customFields ? JSON.parse(JSON.stringify(data.customFields)) : undefined,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Resource',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.resource.findFirst({ where: { id, organizationId: orgId, deletedAt: null, ...branchWhere } });
    if (!existing) throw new NotFoundException('Resurs topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const deleted = await this.prisma.resource.update({
      where: { id },
      data: { deletedAt: new Date(), status: ResourceStatus.RETIRED },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Resource',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.resource.findFirst({ where: { id, organizationId: orgId, ...branchWhere } });
    if (!existing) throw new NotFoundException('Resurs topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const restored = await this.prisma.resource.update({
      where: { id },
      data: { deletedAt: null, status: ResourceStatus.AVAILABLE },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'Resource',
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }
}
