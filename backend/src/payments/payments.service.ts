import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkflowService } from '../workflow/workflow.service';
import { PaymentMethod, PaymentStatus, AuditAction, TransactionType, InvoiceStatus } from '@prisma/client';
import { BranchContext, buildBranchWhere, assertBranchAccess } from '../auth/branch-access';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    @Optional() private workflowService?: WorkflowService,
  ) {}

  private async ensureDefaultCashbox(orgId: string, branchId?: string) {
    let cashbox = await this.prisma.cashbox.findFirst({
      where: {
        organizationId: orgId,
        ...(branchId ? { branchId } : {}),
        deletedAt: null,
      },
    });

    if (!cashbox) {
      cashbox = await this.prisma.cashbox.create({
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
    }

    return cashbox;
  }

  async findAll(
    query: { studentId?: string; customerId?: string; method?: PaymentMethod; orgId: string; branchId?: string; page?: number; limit?: number },
    branchCtx?: BranchContext,
  ) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Math.min(Number(query.limit), 100) : 50;
    const skip = (page - 1) * limit;

    const branchFilter = branchCtx
      ? buildBranchWhere(branchCtx, query.branchId)
      : (query.branchId ? { branchId: query.branchId } : {});

    const where: any = {
      organizationId: query.orgId,
      studentId: query.studentId,
      customerId: query.customerId,
      method: query.method,
      ...branchFilter,
    };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          organization: { select: { id: true, name: true, slug: true, businessType: true } },
          student: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
          customer: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
          cashbox: {
            select: { id: true, name: true, currency: true },
          },
          allocations: {
            include: { invoice: true },
          },
          receivedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { paymentDate: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const payment = await this.prisma.payment.findFirst({
      where: { id, organizationId: orgId, ...branchFilter },
      include: {
        student: true,
        customer: true,
        cashbox: true,
        allocations: {
          include: { invoice: true },
        },
        receivedBy: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    });
    if (!payment) throw new NotFoundException("To'lov topilmadi");
    return payment;
  }

  async create(data: {
    studentId?: string;
    customerId?: string;
    invoiceId?: string;
    cashboxId?: string;
    contractId?: string;
    amount: number;
    method?: PaymentMethod;
    notes?: string;
    receivedById?: string;
    branchId?: string;
  }, orgId: string, userId?: string, branchCtx?: BranchContext) {
    let student = null;
    let customer = null;

    // Cross-tenant verification: Student must belong to orgId
    if (data.studentId) {
      student = await this.prisma.student.findFirst({
        where: { id: data.studentId, organizationId: orgId, deletedAt: null },
      });
      if (!student) throw new BadRequestException("Talaba topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    // Cross-tenant verification: Customer must belong to orgId
    if (data.customerId) {
      customer = await this.prisma.customer.findFirst({
        where: { id: data.customerId, organizationId: orgId, deletedAt: null },
      });
      if (!customer) throw new BadRequestException("Mijoz topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    // Resolve target branch and assert access
    let targetBranchId = data.branchId || student?.branchId || customer?.branchId || undefined;
    if (branchCtx) {
      targetBranchId = assertBranchAccess(branchCtx, targetBranchId);
      data.branchId = targetBranchId;
    }

    // Cross-branch verification: Student's branch must match payment's branch
    if (student && student.branchId && targetBranchId && student.branchId !== targetBranchId) {
      throw new BadRequestException("To'lov filiali o'quvchining filiali bilan mos kelmadi");
    }

    // Cross-tenant verification: Contract must belong to orgId
    if (data.contractId) {
      const contract = await this.prisma.contract.findFirst({
        where: { id: data.contractId, organizationId: orgId },
      });
      if (!contract) throw new BadRequestException("Shartnoma topilmadi yoki ushbu tashkilotga tegishli emas");
      if (data.studentId && contract.studentId !== data.studentId) {
        throw new BadRequestException("Tanlangan shartnoma ushbu o'quvchiga tegishli emas");
      }
    }

    // Cross-tenant verification: Invoice must belong to orgId and branch
    if (data.invoiceId) {
      const inv = await this.prisma.invoice.findFirst({
        where: { id: data.invoiceId, organizationId: orgId, deletedAt: null },
      });
      if (!inv) throw new BadRequestException("Invoys topilmadi yoki ushbu tashkilotga tegishli emas");
      if (targetBranchId && inv.branchId && targetBranchId !== inv.branchId) {
        throw new BadRequestException("Tanlangan hisob-faktura to'lov filialiga tegishli emas");
      }
    }

    // Cross-tenant verification: Cashbox must belong to orgId and branch
    let cashboxId = data.cashboxId;
    if (cashboxId) {
      const cb = await this.prisma.cashbox.findFirst({
        where: { id: cashboxId, organizationId: orgId, deletedAt: null },
      });
      if (!cb) throw new BadRequestException("Kassa topilmadi yoki ushbu tashkilotga tegishli emas");
      if (targetBranchId && cb.branchId && targetBranchId !== cb.branchId) {
        throw new BadRequestException("Tanlangan kassa to'lov filialiga tegishli emas");
      }
    } else {
      const defaultCashbox = await this.ensureDefaultCashbox(orgId, data.branchId);
      cashboxId = defaultCashbox.id;
    }

    const receiptNumber = `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;

    const payment = await this.prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          organizationId: orgId,
          branchId: data.branchId || null,
          studentId: data.studentId || null,
          customerId: data.customerId || null,
          contractId: data.contractId || null,
          cashboxId,
          receiptNumber,
          amount: Number(data.amount),
          method: data.method || PaymentMethod.CASH,
          notes: data.notes,
          receivedById: data.receivedById || null,
          status: PaymentStatus.PAID,
        },
        include: {
          student: true,
          customer: true,
          contract: true,
          cashbox: true,
          receivedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // Update Student Balance atomically
      if (data.studentId && student) {
        await tx.student.update({
          where: { id: data.studentId },
          data: {
            balance: {
              increment: Number(data.amount),
            },
          },
        });
      }

      // If invoiceId passed, allocate payment to invoice atomically with concurrency safety
      if (data.invoiceId) {
        const invoice = await tx.invoice.findFirst({ where: { id: data.invoiceId, organizationId: orgId } });
        if (invoice) {
          const invTotal = Number(invoice.totalAmount);
          const invPaid = Number(invoice.paidAmount);
          const invRemaining = Math.max(0, invTotal - invPaid);
          const allocationAmount = Math.min(Number(data.amount), invRemaining > 0 ? invRemaining : Number(data.amount));

          await tx.paymentAllocation.create({
            data: {
              paymentId: p.id,
              invoiceId: data.invoiceId,
              amount: allocationAmount,
            },
          });

          const isFullyPaid = (invPaid + allocationAmount) >= invTotal;
          await tx.invoice.update({
            where: { id: data.invoiceId },
            data: {
              paidAmount: { increment: allocationAmount },
              status: isFullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID,
            },
          });
        }
      }

      // Update Cashbox Balance & Create Transaction atomically
      if (cashboxId) {
        const updatedCashbox = await tx.cashbox.update({
          where: { id: cashboxId },
          data: { balance: { increment: Number(data.amount) } },
        });

        await tx.transaction.create({
          data: {
            organizationId: orgId,
            branchId: data.branchId,
            cashboxId,
            paymentId: p.id,
            type: TransactionType.INCOME,
            amount: Number(data.amount),
            balanceAfter: updatedCashbox.balance,
            description: `Kirim to'lovi (${receiptNumber}): ${data.notes || (student ? student.firstName + ' ' + student.lastName : 'Mijoz to\'lovi')}`,
          },
        });
      }

      return p;
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId || undefined,
      userId,
      action: AuditAction.PAYMENT,
      entityType: 'Payment',
      entityId: payment.id,
      after: payment,
    });

    if (this.workflowService) {
      try {
        await this.workflowService.processEvent(
          'payment.created',
          {
            id: payment.id,
            amount: payment.amount,
            studentId: payment.studentId,
            customerId: payment.customerId,
            receiptNumber: payment.receiptNumber,
            method: payment.method,
            branchId: payment.branchId,
          },
          orgId,
        );
      } catch (err: any) {
        this.logger.warn(`Workflow execution failed for payment.created: ${err.message}`);
      }
    }

    return payment;
  }

  async update(id: string, data: { method?: PaymentMethod; notes?: string }, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const oldPayment = await this.prisma.payment.findFirst({
      where: { id, organizationId: orgId, ...branchWhere },
    });
    if (!oldPayment) throw new NotFoundException("To'lov topilmadi yoki ushbu filialga kirish huquqi yo'q");

    if (oldPayment.status !== PaymentStatus.PAID) {
      throw new BadRequestException("Bekor qilingan yoki qaytarilgan to'lovni tahrirlab bo'lmaydi");
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        method: data.method,
        notes: data.notes,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: oldPayment.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Payment',
      entityId: id,
      before: oldPayment,
      after: updatedPayment,
    });

    return updatedPayment;
  }

  async voidPayment(id: string, reason: string | undefined, userId: string | undefined, orgId: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const oldPayment = await this.prisma.payment.findFirst({
      where: { id, organizationId: orgId, ...branchWhere },
    });
    if (!oldPayment) throw new NotFoundException("To'lov topilmadi yoki ushbu filialga kirish huquqi yo'q");

    if (oldPayment.status === PaymentStatus.VOIDED) {
      throw new BadRequestException("Ushbu to'lov allaqachon bekor qilingan (VOIDED)");
    }
    if (oldPayment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException("Ushbu to'lov allaqachon qaytarilgan (REFUNDED)");
    }

    const voidedPayment = await this.prisma.$transaction(async (tx) => {
      const vp = await tx.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.VOIDED,
          voidedAt: new Date(),
          voidReason: reason || "Administrator tomonidan bekor qilindi",
        },
      });

      if (oldPayment.studentId) {
        await tx.student.update({
          where: { id: oldPayment.studentId },
          data: {
            balance: {
              decrement: Number(oldPayment.amount),
            },
          },
        });
      }

      // Adjust Cashbox balance atomically
      if (oldPayment.cashboxId) {
        const updatedCashbox = await tx.cashbox.update({
          where: { id: oldPayment.cashboxId },
          data: { balance: { decrement: Number(oldPayment.amount) } },
        });

        await tx.transaction.create({
          data: {
            organizationId: orgId,
            branchId: oldPayment.branchId,
            cashboxId: oldPayment.cashboxId,
            paymentId: oldPayment.id,
            type: TransactionType.REFUND,
            amount: -Number(oldPayment.amount),
            balanceAfter: updatedCashbox.balance,
            description: `To'lov bekor qilindi (Void): ${reason || 'Administrator tomonidan'}`,
          },
        });
      }

      return vp;
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: oldPayment.branchId || undefined,
      userId,
      action: AuditAction.VOID,
      entityType: 'Payment',
      entityId: id,
      before: oldPayment,
      after: voidedPayment,
    });

    return voidedPayment;
  }

  async refundPayment(
    id: string,
    dtoOrReason: { reason?: string; amount?: number; cashboxId?: string } | string | undefined,
    userId: string | undefined,
    orgId: string,
    branchCtx?: BranchContext,
  ) {
    const reason = typeof dtoOrReason === 'string' ? dtoOrReason : dtoOrReason?.reason;
    const requestedAmount = typeof dtoOrReason === 'object' && dtoOrReason?.amount ? Number(dtoOrReason.amount) : undefined;
    const requestedCashboxId = typeof dtoOrReason === 'object' && dtoOrReason?.cashboxId ? dtoOrReason.cashboxId : undefined;

    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const oldPayment = await this.prisma.payment.findFirst({
      where: { id, organizationId: orgId, ...branchWhere },
    });
    if (!oldPayment) throw new NotFoundException("To'lov topilmadi yoki ushbu filialga kirish huquqi yo'q");

    if (oldPayment.status !== PaymentStatus.PAID) {
      throw new BadRequestException("Faqat to'langan (PAID) to'lovlarni qaytarish mumkin");
    }

    const refundAmount = requestedAmount && requestedAmount > 0
      ? Math.min(requestedAmount, Number(oldPayment.amount))
      : Number(oldPayment.amount);

    let targetCashboxId = requestedCashboxId || oldPayment.cashboxId;
    if (requestedCashboxId) {
      const cb = await this.prisma.cashbox.findFirst({
        where: { id: requestedCashboxId, organizationId: orgId, deletedAt: null },
      });
      if (!cb) throw new BadRequestException("Tanlangan kassa topilmadi yoki ushbu tashkilotga tegishli emas");
      if (branchCtx && cb.branchId) {
        assertBranchAccess(branchCtx, cb.branchId);
      }
    }

    const refundedPayment = await this.prisma.$transaction(async (tx) => {
      const isFullRefund = refundAmount >= Number(oldPayment.amount);
      const rp = await tx.payment.update({
        where: { id },
        data: {
          status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PAID,
          refundedAt: new Date(),
          refundReason: reason || "Mijoz talabiga ko'ra qaytarildi",
        },
      });

      if (oldPayment.studentId) {
        await tx.student.update({
          where: { id: oldPayment.studentId },
          data: {
            balance: {
              decrement: refundAmount,
            },
          },
        });
      }

      if (targetCashboxId) {
        const updatedCashbox = await tx.cashbox.update({
          where: { id: targetCashboxId },
          data: { balance: { decrement: refundAmount } },
        });

        await tx.transaction.create({
          data: {
            organizationId: orgId,
            branchId: oldPayment.branchId,
            cashboxId: targetCashboxId,
            paymentId: oldPayment.id,
            type: TransactionType.REFUND,
            amount: -refundAmount,
            balanceAfter: updatedCashbox.balance,
            description: `Pul qaytarildi (Refund ${refundAmount} UZS): ${reason || 'Mijoz talabi'}`,
          },
        });
      }

      return rp;
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: oldPayment.branchId || undefined,
      userId,
      action: AuditAction.REFUND,
      entityType: 'Payment',
      entityId: id,
      before: oldPayment,
      after: refundedPayment,
    });

    return refundedPayment;
  }

  async delete(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    return this.voidPayment(id, "O'chirish amali orqali bekor qilindi", userId, orgId, branchCtx);
  }

  async getFinancialSummary(orgId: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalIncome = await this.prisma.payment.aggregate({
      where: { organizationId: orgId, status: PaymentStatus.PAID, deletedAt: null, ...branchWhere },
      _sum: { amount: true },
    });

    const monthlyIncome = await this.prisma.payment.aggregate({
      where: { organizationId: orgId, status: PaymentStatus.PAID, deletedAt: null, paymentDate: { gte: startOfMonth }, ...branchWhere },
      _sum: { amount: true },
    });

    const debtors = await this.prisma.student.findMany({
      where: { organizationId: orgId, deletedAt: null, balance: { lt: 0 }, ...branchWhere },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        balance: true,
      },
      orderBy: { balance: 'asc' },
      take: 10,
    });

    const cashboxes = await this.prisma.cashbox.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { id: true, name: true, balance: true, currency: true },
    });

    return {
      totalIncome: totalIncome._sum.amount || 0,
      monthlyIncome: monthlyIncome._sum.amount || 0,
      debtorsCount: debtors.length,
      debtors,
      cashboxes,
    };
  }
}
