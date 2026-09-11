import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { CashboxService } from "./cashbox.service";
import { AuditAction, TransactionType, PaymentMethod } from "@prisma/client";
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  CreateExpenseCategoryDto,
  QueryExpenseDto,
} from "../dto/expense.dto";
import { BranchContext, buildBranchWhere, assertBranchAccess } from "../../auth/branch-access";

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private cashboxService: CashboxService
  ) {}

  // --- Categories ---
  async getCategories(orgId: string) {
    return this.prisma.expenseCategory.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { name: "asc" },
    });
  }

  async createCategory(data: CreateExpenseCategoryDto, orgId: string) {
    return this.prisma.expenseCategory.create({
      data: {
        organizationId: orgId,
        name: data.name,
        code: data.code || null,
        color: data.color || "#EF4444",
      },
    });
  }

  // --- Expenses ---
  async findAll(params: QueryExpenseDto & { orgId: string }, branchCtx?: BranchContext) {
    const branchWhere = branchCtx
      ? buildBranchWhere(branchCtx, params.branchId)
      : params.branchId
        ? { branchId: params.branchId }
        : {};
    const cashboxWhere = params.cashboxId ? { cashboxId: params.cashboxId } : {};
    const categoryWhere = params.categoryId ? { categoryId: params.categoryId } : {};

    const dateWhere: { date?: { gte?: Date; lte?: Date } } = {};
    if (params.startDate) dateWhere.date = { gte: new Date(params.startDate) };
    if (params.endDate)
      dateWhere.date = { ...(dateWhere.date || {}), lte: new Date(params.endDate) };

    return this.prisma.expense.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        ...branchWhere,
        ...cashboxWhere,
        ...categoryWhere,
        ...dateWhere,
      },
      include: {
        category: true,
        cashbox: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true, code: true } },
      },
      orderBy: { date: "desc" },
    });
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const expense = await this.prisma.expense.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
      include: { category: true, cashbox: true, branch: true },
    });
    if (!expense)
      throw new NotFoundException("Xarajat topilmadi yoki ushbu filialga kirish huquqi yo'q");
    return expense;
  }

  async create(data: CreateExpenseDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const amount = Number(data.amount);

    if (branchCtx) {
      data.branchId = assertBranchAccess(branchCtx, data.branchId);
    }

    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch)
        throw new BadRequestException("Filial topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    if (data.categoryId) {
      const cat = await this.prisma.expenseCategory.findFirst({
        where: { id: data.categoryId, organizationId: orgId, deletedAt: null },
      });
      if (!cat)
        throw new BadRequestException("Kategoriya topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    let cashboxId = data.cashboxId;
    if (cashboxId) {
      const cb = await this.prisma.cashbox.findFirst({
        where: { id: cashboxId, organizationId: orgId, deletedAt: null },
      });
      if (!cb)
        throw new BadRequestException("Kassa topilmadi yoki ushbu tashkilotga tegishli emas");
      if (data.branchId && cb.branchId && data.branchId !== cb.branchId) {
        throw new BadRequestException("Tanlangan kassa xarajat filialiga tegishli emas");
      }
    } else {
      const defaultCashbox = await this.cashboxService.ensureDefaultCashbox(orgId, data.branchId);
      cashboxId = defaultCashbox.id;
    }

    const expense = await this.prisma.$transaction(async (tx) => {
      const exp = await tx.expense.create({
        data: {
          organizationId: orgId,
          branchId: data.branchId || null,
          cashboxId,
          categoryId: data.categoryId || null,
          title: data.title,
          amount,
          date: data.date ? new Date(data.date) : new Date(),
          payee: data.payee || null,
          paymentMethod: data.paymentMethod || PaymentMethod.CASH,
          receiptUrl: data.receiptUrl || null,
          notes: data.notes || null,
        },
        include: { category: true, cashbox: true },
      });

      // Update cashbox balance atomically at DB level and record transaction
      const updatedCashbox = await tx.cashbox.update({
        where: { id: cashboxId },
        data: { balance: { decrement: amount } },
      });

      await tx.transaction.create({
        data: {
          organizationId: orgId,
          branchId: data.branchId || null,
          cashboxId,
          expenseId: exp.id,
          type: TransactionType.EXPENSE,
          amount: -amount,
          balanceAfter: updatedCashbox.balance,
          description: `Xarajat: ${exp.title}`,
          date: exp.date,
        },
      });

      return exp;
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: "Expense",
      entityId: expense.id,
      after: expense,
    });

    return expense;
  }

  async update(
    id: string,
    data: UpdateExpenseDto,
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext
  ) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.expense.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
    });
    if (!existing)
      throw new NotFoundException("Xarajat topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        ...data,
        amount: data.amount !== undefined ? Number(data.amount) : undefined,
        date: data.date ? new Date(data.date) : undefined,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Expense",
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.expense.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
    });
    if (!existing)
      throw new NotFoundException("Xarajat topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const deleted = await this.prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: "Expense",
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }
}
