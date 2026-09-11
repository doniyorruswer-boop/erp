import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AuditAction, Prisma } from "@prisma/client";
import { BranchContext, buildBranchWhere, assertBranchAccess } from "../auth/branch-access";
import { CreateContractDto, UpdateContractDto, QueryContractDto } from "./dto/contract.dto";

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  async findAll(query: QueryContractDto, orgId: string, branchCtx?: BranchContext) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const branchWhere = branchCtx
      ? buildBranchWhere(branchCtx, query.branchId)
      : query.branchId
        ? { branchId: query.branchId }
        : {};
    const branchFilter = branchWhere.branchId
      ? { student: { branchId: branchWhere.branchId } }
      : {};

    const where: Prisma.ContractWhereInput = {
      organizationId: orgId,
      status: query.status || { not: "DELETED" },
      studentId: query.studentId,
      ...branchFilter,
      OR: query.search
        ? [
            { contractNumber: { contains: query.search, mode: "insensitive" } },
            { student: { firstName: { contains: query.search, mode: "insensitive" } } },
            { student: { lastName: { contains: query.search, mode: "insensitive" } } },
          ]
        : undefined,
    };

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              branchId: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.contract.count({ where }),
    ]);

    const enrichedContracts = contracts.map((c) => {
      const totalAmount = Number(c.totalAmount);
      const discountAmount = Number(c.discountAmount);
      const finalAmount = totalAmount - discountAmount;
      const paidAmount = (c.payments || [])
        .filter((p) => p.status === "PAID")
        .reduce((sum: number, p) => sum + Number(p.amount), 0);
      const remainingAmount = Math.max(0, finalAmount - paidAmount);

      return {
        ...c,
        finalAmount,
        paidAmount,
        remainingAmount,
      };
    });

    return {
      items: enrichedContracts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const branchFilter = branchWhere.branchId
      ? { student: { branchId: branchWhere.branchId } }
      : {};

    const contract = await this.prisma.contract.findFirst({
      where: { id, organizationId: orgId, status: { not: "DELETED" }, ...branchFilter },
      include: {
        student: {
          include: {
            enrollments: {
              where: { isActive: true },
              include: { group: true },
            },
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException("Shartnoma topilmadi yoki ushbu filialga kirish huquqi yo'q");
    }

    const totalAmount = Number(contract.totalAmount);
    const discountAmount = Number(contract.discountAmount);
    const finalAmount = totalAmount - discountAmount;
    const paidAmount = (contract.payments || [])
      .filter((p) => p.status === "PAID")
      .reduce((sum: number, p) => sum + Number(p.amount), 0);
    const remainingAmount = Math.max(0, finalAmount - paidAmount);

    return {
      ...contract,
      finalAmount,
      paidAmount,
      remainingAmount,
    };
  }

  async create(dto: CreateContractDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    // 1. Verify student exists and belongs to org
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, organizationId: orgId, deletedAt: null },
    });

    if (!student) {
      throw new NotFoundException("O'quvchi topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    // Resolve target branch from student or dto and assert access
    const targetBranchId = dto.branchId || student.branchId || undefined;
    if (branchCtx && targetBranchId) {
      assertBranchAccess(branchCtx, targetBranchId);
    }

    // Cross-branch verification: Student's branch must match contract's branch
    if (student.branchId && dto.branchId && student.branchId !== dto.branchId) {
      throw new BadRequestException("Shartnoma filiali o'quvchining filiali bilan mos kelmadi");
    }

    // 2. Generate unique contract number if not provided
    const contractNumber =
      dto.contractNumber ||
      `SH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const contract = await this.prisma.contract.create({
      data: {
        organizationId: orgId,
        studentId: dto.studentId,
        contractNumber,
        totalAmount: dto.totalAmount,
        discountAmount: dto.discountAmount || 0,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: dto.status || "ACTIVE",
        notes: dto.notes,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, branchId: true } },
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: targetBranchId || undefined,
      userId,
      action: AuditAction.CREATE,
      entityType: "Contract",
      entityId: contract.id,
      after: contract,
    });

    return contract;
  }

  async update(
    id: string,
    dto: UpdateContractDto,
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext
  ) {
    const contract = await this.findOne(id, orgId, branchCtx);

    const targetBranchId = dto.branchId || contract.student?.branchId || undefined;
    if (dto.branchId && branchCtx) {
      assertBranchAccess(branchCtx, dto.branchId);
    }

    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        contractNumber: dto.contractNumber,
        totalAmount: dto.totalAmount,
        discountAmount: dto.discountAmount,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
        notes: dto.notes,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: targetBranchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Contract",
      entityId: id,
      before: contract,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const contract = await this.findOne(id, orgId, branchCtx);

    // Soft delete preserving contract history
    const softDeleted = await this.prisma.contract.update({
      where: { id },
      data: { status: "DELETED" },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: contract.student?.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: "Contract",
      entityId: id,
      before: contract,
      after: softDeleted,
    });

    return { success: true, message: "Shartnoma muvaffaqiyatli arxivlandi (soft delete)" };
  }

  async restore(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const branchFilter = branchWhere.branchId
      ? { student: { branchId: branchWhere.branchId } }
      : {};

    const contract = await this.prisma.contract.findFirst({
      where: { id, organizationId: orgId, status: "DELETED", ...branchFilter },
    });

    if (!contract) {
      throw new NotFoundException("O'chirilgan shartnoma topilmadi");
    }

    const restored = await this.prisma.contract.update({
      where: { id },
      data: { status: "ACTIVE" },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: contract.studentId ? undefined : undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: "Contract",
      entityId: id,
      after: restored,
    });

    return restored;
  }
}
