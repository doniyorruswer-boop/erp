import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, ItemType } from '@prisma/client';
import { CreateProductServiceDto, UpdateProductServiceDto, QueryProductServiceDto } from '../dto/product-service.dto';

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(params: QueryProductServiceDto & { orgId: string }) {
    const branchWhere = params.branchId ? { branchId: params.branchId } : {};
    const typeWhere = params.type ? { type: params.type } : {};
    const activeWhere = params.isActive !== undefined ? { isActive: params.isActive } : {};
    const searchWhere = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' as const } },
            { code: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.productService.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        ...branchWhere,
        ...typeWhere,
        ...activeWhere,
        ...searchWhere,
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, orgId: string) {
    const item = await this.prisma.productService.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: { branch: true },
    });
    if (!item) throw new NotFoundException('Mahsulot/Xizmat topilmadi');
    return item;
  }

  async create(data: CreateProductServiceDto, orgId: string, userId?: string) {
    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    const item = await this.prisma.productService.create({
      data: {
        organizationId: orgId,
        branchId: data.branchId || null,
        name: data.name,
        code: data.code || null,
        type: data.type || ItemType.SERVICE,
        unitPrice: Number(data.unitPrice),
        unit: data.unit || 'dona',
        taxRate: data.taxRate ? Number(data.taxRate) : 0,
        customFields: data.customFields ? JSON.parse(JSON.stringify(data.customFields)) : undefined,
        isActive: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'ProductService',
      entityId: item.id,
      after: item,
    });

    return item;
  }

  async update(id: string, data: UpdateProductServiceDto, orgId: string, userId?: string) {
    const existing = await this.prisma.productService.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Mahsulot/Xizmat topilmadi');

    if (data.branchId && data.branchId !== existing.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    const updated = await this.prisma.productService.update({
      where: { id },
      data: {
        ...data,
        unitPrice: data.unitPrice !== undefined ? Number(data.unitPrice) : undefined,
        taxRate: data.taxRate !== undefined ? Number(data.taxRate) : undefined,
        customFields: data.customFields ? JSON.parse(JSON.stringify(data.customFields)) : undefined,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'ProductService',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.productService.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Mahsulot/Xizmat topilmadi');

    const deleted = await this.prisma.productService.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId,
      userId,
      action: AuditAction.DELETE,
      entityType: 'ProductService',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.productService.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Mahsulot/Xizmat topilmadi');

    const restored = await this.prisma.productService.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'ProductService',
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }
}
