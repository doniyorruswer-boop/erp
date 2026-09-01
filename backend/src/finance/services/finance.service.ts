import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, TransactionType, PaymentStatus, InvoiceStatus } from '@prisma/client';
import { AllocatePaymentDto, CreateRefundDto } from '../dto/payment-allocation.dto';
import { BranchContext, buildBranchWhere } from '../../auth/branch-access';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async allocatePayment(dto: AllocatePaymentDto, orgId: string, userId?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: dto.paymentId, organizationId: orgId, deletedAt: null },
      include: { allocations: true },
    });
    if (!payment) throw new NotFoundException('To\'lov topilmadi yoki ushbu tashkilotga tegishli emas');

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, organizationId: orgId, deletedAt: null },
      include: { allocations: true },
    });
    if (!invoice) throw new NotFoundException('Hisob-faktura topilmadi yoki ushbu tashkilotga tegishli emas');

    const allocatedAmount = payment.allocations.reduce((sum, a) => sum + Number(a.amount), 0);
    const unallocated = Number(payment.amount) - allocatedAmount;

    if (dto.amount > unallocated) {
      throw new BadRequestException(`Taqsimlanmagan summa yetarli emas. Qolgan summa: ${unallocated} UZS`);
    }

    const allocation = await this.prisma.paymentAllocation.create({
      data: {
        paymentId: dto.paymentId,
        invoiceId: dto.invoiceId,
        amount: dto.amount,
      },
    });

    // Update Invoice paidAmount and status
    const newPaidAmount = Number(invoice.paidAmount) + Number(dto.amount);
    const newStatus = newPaidAmount >= Number(invoice.totalAmount) ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    await this.prisma.invoice.update({
      where: { id: dto.invoiceId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: invoice.branchId || payment.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Invoice',
      entityId: dto.invoiceId,
      after: { allocationId: allocation.id, paidAmount: newPaidAmount, status: newStatus },
    });

    return allocation;
  }

  async refundPayment(dto: CreateRefundDto, orgId: string, userId?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: dto.paymentId, organizationId: orgId, deletedAt: null },
      include: { allocations: { include: { invoice: true } } },
    });
    if (!payment) throw new NotFoundException('To\'lov topilmadi yoki ushbu tashkilotga tegishli emas');

    if (payment.status === PaymentStatus.VOIDED || payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Ushbu to\'lov allaqachon bekor qilingan yoki qaytarilgan');
    }

    const refundAmount = Number(dto.amount);
    if (refundAmount > Number(payment.amount)) {
      throw new BadRequestException('Qaytarilayotgan summa to\'lov summasidan oshishi mumkin emas');
    }

    let cashboxId = dto.cashboxId || payment.cashboxId;
    if (cashboxId) {
      const cb = await this.prisma.cashbox.findFirst({
        where: { id: cashboxId, organizationId: orgId, deletedAt: null },
      });
      if (!cb) throw new BadRequestException('Kassa topilmadi yoki ushbu tashkilotga tegishli emas');
    } else {
      const defaultCashbox = await this.prisma.cashbox.findFirst({
        where: { organizationId: orgId, isDefault: true, deletedAt: null },
      });
      cashboxId = defaultCashbox?.id;
    }

    const refundRecord = await this.prisma.refundRecord.create({
      data: {
        organizationId: orgId,
        branchId: payment.branchId,
        cashboxId: cashboxId || null,
        paymentId: payment.id,
        amount: refundAmount,
        reason: dto.reason,
        status: 'COMPLETED',
      },
    });

    // Mark payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
        refundReason: dto.reason,
      },
    });

    // Adjust student balance
    if (payment.studentId) {
      await this.prisma.student.update({
        where: { id: payment.studentId },
        data: { balance: { decrement: refundAmount } },
      });
    }

    // Adjust cashbox balance & record transaction
    if (cashboxId) {
      const cashbox = await this.prisma.cashbox.findUnique({ where: { id: cashboxId } });
      const newBalance = Number(cashbox?.balance || 0) - refundAmount;
      await this.prisma.cashbox.update({
        where: { id: cashboxId },
        data: { balance: newBalance },
      });

      await this.prisma.transaction.create({
        data: {
          organizationId: orgId,
          branchId: payment.branchId,
          cashboxId,
          paymentId: payment.id,
          refundId: refundRecord.id,
          type: TransactionType.REFUND,
          amount: -refundAmount,
          balanceAfter: newBalance,
          description: `Pul qaytarish (Refund): ${dto.reason}`,
        },
      });
    }

    await this.auditService.log({
      organizationId: orgId,
      branchId: payment.branchId || undefined,
      userId,
      action: AuditAction.REFUND,
      entityType: 'Payment',
      entityId: payment.id,
      after: refundRecord,
    });

    return refundRecord;
  }

  async getSummary(orgId: string, branchId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx
      ? buildBranchWhere(branchCtx, branchId)
      : (branchId ? { branchId } : {});

    // 1. Total Payments (Revenues)
    const paymentsAgg = await this.prisma.payment.aggregate({
      where: {
        organizationId: orgId,
        status: PaymentStatus.PAID,
        deletedAt: null,
        ...branchWhere,
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // 2. Total Expenses
    const expensesAgg = await this.prisma.expense.aggregate({
      where: {
        organizationId: orgId,
        deletedAt: null,
        ...branchWhere,
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // 3. Total Invoices & Debt
    const invoicesAgg = await this.prisma.invoice.aggregate({
      where: {
        organizationId: orgId,
        deletedAt: null,
        ...branchWhere,
      },
      _sum: { totalAmount: true, paidAmount: true },
      _count: { id: true },
    });

    // 4. Cashbox Balances
    const cashboxes = await this.prisma.cashbox.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        ...branchWhere,
      },
    });

    const totalRevenue = Number(paymentsAgg._sum.amount || 0);
    const totalExpenses = Number(expensesAgg._sum.amount || 0);
    const netProfit = totalRevenue - totalExpenses;
    const totalInvoiced = Number(invoicesAgg._sum.totalAmount || 0);
    const totalInvoicePaid = Number(invoicesAgg._sum.paidAmount || 0);
    const totalOutstandingDebt = Math.max(0, totalInvoiced - totalInvoicePaid);
    const totalCashboxBalance = cashboxes.reduce((sum, c) => sum + Number(c.balance), 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalInvoiced,
      totalInvoicePaid,
      totalOutstandingDebt,
      totalCashboxBalance,
      paymentsCount: paymentsAgg._count.id,
      expensesCount: expensesAgg._count.id,
      invoicesCount: invoicesAgg._count.id,
    };
  }
}
