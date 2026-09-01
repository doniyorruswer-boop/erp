import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, InvoiceStatus } from '@prisma/client';
import { CreateInvoiceDto, UpdateInvoiceDto, QueryInvoiceDto } from '../dto/invoice.dto';
import { BranchContext, buildBranchWhere, assertBranchAccess } from '../../auth/branch-access';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  private async generateInvoiceNumber(orgId: string) {
    const today = new Date();
    const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.prisma.invoice.count({
      where: {
        organizationId: orgId,
        invoiceNumber: { startsWith: prefix },
      },
    });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(params: QueryInvoiceDto & { orgId: string }, branchCtx?: BranchContext) {
    const branchWhere = branchCtx
      ? buildBranchWhere(branchCtx, params.branchId)
      : (params.branchId ? { branchId: params.branchId } : {});
    const statusWhere = params.status ? { status: params.status } : {};
    const customerWhere = params.customerId ? { customerId: params.customerId } : {};
    const studentWhere = params.studentId ? { studentId: params.studentId } : {};
    const searchWhere = params.search
      ? {
          OR: [
            { invoiceNumber: { contains: params.search, mode: 'insensitive' as const } },
            { notes: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.invoice.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        ...branchWhere,
        ...statusWhere,
        ...customerWhere,
        ...studentWhere,
        ...searchWhere,
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        student: { select: { id: true, firstName: true, lastName: true, phone: true } },
        items: true,
        allocations: true,
        branch: { select: { id: true, name: true, code: true } },
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
      include: {
        customer: true,
        student: true,
        items: {
          include: { productService: true },
        },
        allocations: {
          include: { payment: true },
        },
        branch: true,
      },
    });
    if (!invoice) throw new NotFoundException('Hisob-faktura (Invoice) topilmadi yoki ushbu filialga kirish huquqi yo\'q');
    return invoice;
  }

  async create(data: CreateInvoiceDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const invoiceNumber = data.invoiceNumber || (await this.generateInvoiceNumber(orgId));

    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Hisob-faktura kamida 1 ta mahsulot yoki xizmat bandini o\'z ichiga olishi kerak');
    }

    let customer = null;
    let student = null;

    // Cross-tenant verification
    if (data.customerId) {
      customer = await this.prisma.customer.findFirst({
        where: { id: data.customerId, organizationId: orgId, deletedAt: null },
      });
      if (!customer) throw new BadRequestException('Mijoz topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    if (data.studentId) {
      student = await this.prisma.student.findFirst({
        where: { id: data.studentId, organizationId: orgId, deletedAt: null },
      });
      if (!student) throw new BadRequestException('Talaba topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    let targetBranchId = data.branchId || student?.branchId || customer?.branchId || undefined;
    if (branchCtx) {
      targetBranchId = assertBranchAccess(branchCtx, targetBranchId);
      data.branchId = targetBranchId;
    }

    if (student && student.branchId && targetBranchId && student.branchId !== targetBranchId) {
      throw new BadRequestException("Hisob-faktura filiali o'quvchining filiali bilan mos kelmadi");
    }

    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    let subtotal = 0;
    let taxAmount = 0;

    const itemsData = [];
    for (const item of data.items) {
      if (item.productServiceId) {
        const ps = await this.prisma.productService.findFirst({
          where: { id: item.productServiceId, organizationId: orgId, deletedAt: null },
        });
        if (!ps) throw new BadRequestException('Mahsulot/xizmat topilmadi yoki ushbu tashkilotga tegishli emas');
      }

      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const rate = Number(item.taxRate) || 0;
      const amount = qty * price;
      const itemTax = amount * (rate / 100);

      subtotal += amount;
      taxAmount += itemTax;

      itemsData.push({
        productServiceId: item.productServiceId || null,
        description: item.description,
        quantity: qty,
        unitPrice: price,
        amount,
        taxRate: rate,
      });
    }

    const discountAmount = Number(data.discountAmount) || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoice = await this.prisma.invoice.create({
      data: {
        organizationId: orgId,
        branchId: data.branchId || null,
        customerId: data.customerId || null,
        studentId: data.studentId || null,
        invoiceNumber,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paidAmount: 0,
        status: InvoiceStatus.ISSUED,
        notes: data.notes || null,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
        customer: true,
        student: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Invoice',
      entityId: invoice.id,
      after: invoice,
    });

    return invoice;
  }

  async update(id: string, data: UpdateInvoiceDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.invoice.findFirst({ where: { id, organizationId: orgId, deletedAt: null, ...branchWhere } });
    if (!existing) throw new NotFoundException('Hisob-faktura topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        notes: data.notes,
      },
      include: { items: true, customer: true, student: true },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Invoice',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.invoice.findFirst({ where: { id, organizationId: orgId, deletedAt: null, ...branchWhere } });
    if (!existing) throw new NotFoundException('Hisob-faktura topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const deleted = await this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date(), status: InvoiceStatus.CANCELLED },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Invoice',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.invoice.findFirst({ where: { id, organizationId: orgId, ...branchWhere } });
    if (!existing) throw new NotFoundException('Hisob-faktura topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const restored = await this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: null, status: InvoiceStatus.ISSUED },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'Invoice',
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }
}
