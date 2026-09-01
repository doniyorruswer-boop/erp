import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction } from '@prisma/client';
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto } from '../dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(params: QueryCustomerDto & { orgId: string }) {
    const branchWhere = params.branchId ? { branchId: params.branchId } : {};
    const statusWhere = params.status ? { status: params.status } : {};
    const searchWhere = params.search
      ? {
          OR: [
            { firstName: { contains: params.search, mode: 'insensitive' as const } },
            { lastName: { contains: params.search, mode: 'insensitive' as const } },
            { phone: { contains: params.search } },
            { email: { contains: params.search, mode: 'insensitive' as const } },
            { company: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.customer.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        ...branchWhere,
        ...statusWhere,
        ...searchWhere,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        _count: {
          select: {
            leads: { where: { deletedAt: null } },
            tasks: { where: { deletedAt: null } },
            activities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        branch: true,
        leads: {
          where: { deletedAt: null },
          include: { pipeline: true, stage: true, manager: true },
        },
        activities: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          where: { deletedAt: null },
          include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { dueDate: 'asc' },
        },
        crmNotes: {
          where: { deletedAt: null },
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) throw new NotFoundException('Mijoz topilmadi');
    return customer;
  }

  async create(data: CreateCustomerDto, orgId: string, userId?: string) {
    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    const customer = await this.prisma.customer.create({
      data: {
        organizationId: orgId,
        branchId: data.branchId || null,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || null,
        company: data.company || null,
        status: data.status || 'ACTIVE',
        tags: data.tags || [],
        notes: data.notes || null,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Customer',
      entityId: customer.id,
      after: customer,
    });

    return customer;
  }

  async update(id: string, data: UpdateCustomerDto, orgId: string, userId?: string) {
    const existing = await this.prisma.customer.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Mijoz topilmadi');

    if (data.branchId && data.branchId !== existing.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Customer',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.customer.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Mijoz topilmadi');

    const deleted = await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Customer',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.customer.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Mijoz topilmadi');

    const restored = await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'Customer',
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }
}
