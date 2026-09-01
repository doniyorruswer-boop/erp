import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, TransactionType } from '@prisma/client';
import { CreateCashboxDto, UpdateCashboxDto, QueryCashboxDto } from '../dto/cashbox.dto';
import { BranchContext, buildBranchWhere, assertBranchAccess } from '../../auth/branch-access';

@Injectable()
export class CashboxService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async ensureDefaultCashbox(orgId: string, branchId?: string) {
    const existing = await this.prisma.cashbox.findFirst({
      where: {
        organizationId: orgId,
        ...(branchId ? { branchId } : {}),
        deletedAt: null,
      },
    });
    if (existing) return existing;

    const cashbox = await this.prisma.cashbox.create({
      data: {
        organizationId: orgId,
        branchId: branchId || null,
        name: 'Asosiy Kassa',
        code: 'MAIN_CASHBOX',
        currency: 'UZS',
        balance: 0,
        isDefault: true,
        isActive: true,
      },
    });

    return cashbox;
  }

  async findAll(params: QueryCashboxDto & { orgId: string }, branchCtx?: BranchContext) {
    const branchWhere = branchCtx
      ? buildBranchWhere(branchCtx, params.branchId)
      : (params.branchId ? { branchId: params.branchId } : {});
    const activeWhere = params.isActive !== undefined ? { isActive: params.isActive } : {};

    let cashboxes = await this.prisma.cashbox.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        ...branchWhere,
        ...activeWhere,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        _count: {
          select: {
            transactions: true,
            payments: { where: { deletedAt: null } },
            expenses: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    if (cashboxes.length === 0 && (!branchCtx || branchCtx.isOrgAdmin)) {
      await this.ensureDefaultCashbox(params.orgId, params.branchId);
      cashboxes = await this.findAll(params, branchCtx);
    }

    return cashboxes;
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const cashbox = await this.prisma.cashbox.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
      include: {
        branch: true,
        transactions: {
          take: 50,
          orderBy: { date: 'desc' },
        },
      },
    });
    if (!cashbox) throw new NotFoundException('Kassa topilmadi yoki ushbu filialga kirish huquqi yo\'q');
    return cashbox;
  }

  async create(data: CreateCashboxDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    if (branchCtx) {
      data.branchId = assertBranchAccess(branchCtx, data.branchId);
    }

    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    if (data.isDefault) {
      await this.prisma.cashbox.updateMany({
        where: { organizationId: orgId, branchId: data.branchId || null },
        data: { isDefault: false },
      });
    }

    const cashbox = await this.prisma.cashbox.create({
      data: {
        organizationId: orgId,
        branchId: data.branchId || null,
        name: data.name,
        code: data.code || null,
        currency: data.currency || 'UZS',
        balance: data.balance || 0,
        isDefault: data.isDefault || false,
        isActive: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Cashbox',
      entityId: cashbox.id,
      after: cashbox,
    });

    return cashbox;
  }

  async update(id: string, data: UpdateCashboxDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.cashbox.findFirst({ where: { id, organizationId: orgId, deletedAt: null, ...branchWhere } });
    if (!existing) throw new NotFoundException('Kassa topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    if (data.branchId && branchCtx) {
      assertBranchAccess(branchCtx, data.branchId);
    }

    if (data.branchId && data.branchId !== existing.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    if (data.isDefault) {
      await this.prisma.cashbox.updateMany({
        where: { organizationId: orgId, branchId: existing.branchId },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.cashbox.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Cashbox',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.cashbox.findFirst({ where: { id, organizationId: orgId, deletedAt: null, ...branchWhere } });
    if (!existing) throw new NotFoundException('Kassa topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const deleted = await this.prisma.cashbox.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Cashbox',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.cashbox.findFirst({ where: { id, organizationId: orgId, ...branchWhere } });
    if (!existing) throw new NotFoundException('Kassa topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const restored = await this.prisma.cashbox.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'Cashbox',
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }
}
