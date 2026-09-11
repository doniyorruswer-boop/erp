import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeeDto,
  CreatePayrollDto,
} from "./dto/employee.dto";
import { PayrollStatus, Prisma } from "@prisma/client";

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto, orgId: string) {
    return this.prisma.employee.create({
      data: {
        organizationId: orgId,
        branchId: dto.branchId,
        userId: dto.userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        position: dto.position,
        department: dto.department,
        employmentType: dto.employmentType,
        salaryType: dto.salaryType,
        baseSalary: dto.baseSalary || 0,
        notes: dto.notes,
      },
      include: {
        branch: { select: { id: true, name: true } },
        user: { select: { id: true, role: true, phone: true } },
      },
    });
  }

  async findAll(query: QueryEmployeeDto, orgId: string) {
    const where: Prisma.EmployeeWhereInput = {
      organizationId: orgId,
    };

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search } },
        { position: { contains: query.search, mode: "insensitive" } },
      ];
    }

    return this.prisma.employee.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
        user: { select: { id: true, role: true, phone: true } },
        _count: {
          select: { payrolls: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, orgId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, organizationId: orgId },
      include: {
        branch: { select: { id: true, name: true } },
        user: { select: { id: true, role: true, phone: true, email: true } },
        payrolls: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    });

    if (!employee) {
      throw new NotFoundException("Xodim topilmadi");
    }

    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, orgId: string) {
    await this.findOne(id, orgId);

    return this.prisma.employee.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        position: dto.position,
        department: dto.department,
        employmentType: dto.employmentType,
        salaryType: dto.salaryType,
        baseSalary: dto.baseSalary,
        status: dto.status,
        branchId: dto.branchId,
        notes: dto.notes,
      },
      include: {
        branch: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.employee.delete({
      where: { id },
    });
  }

  // --- PAYROLL MANAGEMENT ---

  async createPayroll(dto: CreatePayrollDto, orgId: string) {
    const employee = await this.findOne(dto.employeeId, orgId);

    const baseAmount = Number(dto.baseAmount);
    const bonusAmount = Number(dto.bonusAmount || 0);
    const deductionAmount = Number(dto.deductionAmount || 0);
    const netAmount = Math.max(0, baseAmount + bonusAmount - deductionAmount);

    // Optionally create an expense record for financial tracking
    let expenseId: string | null = null;
    try {
      // Find or create default Salary category
      let category = await this.prisma.expenseCategory.findFirst({
        where: { organizationId: orgId, name: "Ish haqi va Oylik" },
      });

      if (!category) {
        category = await this.prisma.expenseCategory.create({
          data: {
            organizationId: orgId,
            name: "Ish haqi va Oylik",
            code: "SALARY",
          },
        });
      }

      const expense = await this.prisma.expense.create({
        data: {
          organizationId: orgId,
          branchId: dto.branchId || employee.branchId,
          categoryId: category.id,
          title: `Ish haqi: ${employee.firstName} ${employee.lastName} (${dto.period})`,
          amount: netAmount,
          payee: `${employee.firstName} ${employee.lastName}`,
          paymentMethod: dto.paidVia || "CASH",
          notes: `Oylik maosh. Asosiy: ${baseAmount}, Bonus: ${bonusAmount}, Ushlab qolish: ${deductionAmount}`,
        },
      });
      expenseId = expense.id;
    } catch (e) {
      // If expense creation fails, proceed with payroll
    }

    return this.prisma.payroll.create({
      data: {
        organizationId: orgId,
        branchId: dto.branchId || employee.branchId,
        employeeId: dto.employeeId,
        period: dto.period,
        baseAmount,
        bonusAmount,
        deductionAmount,
        netAmount,
        status: PayrollStatus.PAID,
        paidVia: dto.paidVia || "CASH",
        paymentDate: new Date(),
        expenseId,
        notes: dto.notes,
      },
      include: {
        employee: { select: { firstName: true, lastName: true, position: true } },
      },
    });
  }

  async getEmployeePayrolls(employeeId: string, orgId: string) {
    await this.findOne(employeeId, orgId);

    return this.prisma.payroll.findMany({
      where: { employeeId, organizationId: orgId },
      orderBy: { createdAt: "desc" },
      include: {
        expense: { select: { id: true, amount: true, paymentMethod: true } },
      },
    });
  }

  async getPayrollSummary(period: string, orgId: string) {
    const payrolls = await this.prisma.payroll.findMany({
      where: { period, organizationId: orgId },
      include: {
        employee: { select: { firstName: true, lastName: true, position: true, department: true } },
      },
    });

    const totalBase = payrolls.reduce((sum, p) => sum + Number(p.baseAmount), 0);
    const totalBonus = payrolls.reduce((sum, p) => sum + Number(p.bonusAmount), 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + Number(p.deductionAmount), 0);
    const totalNet = payrolls.reduce((sum, p) => sum + Number(p.netAmount), 0);

    return {
      period,
      employeeCount: payrolls.length,
      totalBase,
      totalBonus,
      totalDeductions,
      totalNet,
      payrolls,
    };
  }
}
