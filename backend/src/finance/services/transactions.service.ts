import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { QueryTransactionDto } from "../dto/transaction.dto";

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: QueryTransactionDto & { orgId: string }) {
    const branchWhere = params?.branchId ? { branchId: params.branchId } : {};
    const cashboxWhere = params?.cashboxId ? { cashboxId: params.cashboxId } : {};
    const typeWhere = params?.type ? { type: params.type } : {};

    const dateWhere: { date?: { gte?: Date; lte?: Date } } = {};
    if (params?.startDate) dateWhere.date = { gte: new Date(params.startDate) };
    if (params?.endDate)
      dateWhere.date = { ...(dateWhere.date || {}), lte: new Date(params.endDate) };

    return this.prisma.transaction.findMany({
      where: {
        organizationId: params.orgId,
        ...branchWhere,
        ...cashboxWhere,
        ...typeWhere,
        ...dateWhere,
      },
      include: {
        cashbox: { select: { id: true, name: true, currency: true } },
        payment: { select: { id: true, receiptNumber: true, amount: true, method: true } },
        expense: { select: { id: true, title: true, amount: true } },
        refund: { select: { id: true, reason: true, amount: true } },
      },
      orderBy: { date: "desc" },
    });
  }
}
