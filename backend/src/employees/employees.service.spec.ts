import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmploymentType, SalaryType, EmployeeStatus, PayrollStatus } from '@prisma/client';

describe('EmployeesService (Unit Tests)', () => {
  let service: EmployeesService;
  let prisma: any;

  const mockEmployee = {
    id: 'emp-1',
    organizationId: 'org-1',
    firstName: 'Anvar',
    lastName: 'Qodirov',
    phone: '+998901112233',
    position: 'Senior Teacher',
    department: 'English',
    employmentType: EmploymentType.FULL_TIME,
    salaryType: SalaryType.FIXED,
    baseSalary: 6000000,
    status: EmployeeStatus.ACTIVE,
  };

  beforeEach(async () => {
    prisma = {
      employee: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      expenseCategory: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      expense: {
        create: jest.fn(),
      },
      payroll: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an employee successfully', async () => {
    prisma.employee.create.mockResolvedValue(mockEmployee);

    const result = await service.create(
      {
        firstName: 'Anvar',
        lastName: 'Qodirov',
        phone: '+998901112233',
        position: 'Senior Teacher',
        baseSalary: 6000000,
      },
      'org-1',
    );

    expect(result.id).toBe('emp-1');
    expect(prisma.employee.create).toHaveBeenCalled();
  });

  it('should calculate net payroll amount correctly (base + bonus - deduction)', async () => {
    prisma.employee.findFirst.mockResolvedValue(mockEmployee);
    prisma.expenseCategory.findFirst.mockResolvedValue({ id: 'cat-1' });
    prisma.expense.create.mockResolvedValue({ id: 'exp-1' });

    const mockPayroll = {
      id: 'pay-1',
      employeeId: 'emp-1',
      period: '2026-09',
      baseAmount: 6000000,
      bonusAmount: 500000,
      deductionAmount: 200000,
      netAmount: 6300000,
      status: PayrollStatus.PAID,
    };

    prisma.payroll.create.mockResolvedValue(mockPayroll);

    const result = await service.createPayroll(
      {
        employeeId: 'emp-1',
        period: '2026-09',
        baseAmount: 6000000,
        bonusAmount: 500000,
        deductionAmount: 200000,
      },
      'org-1',
    );

    expect(result.netAmount).toBe(6300000);
    expect(prisma.payroll.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          baseAmount: 6000000,
          bonusAmount: 500000,
          deductionAmount: 200000,
          netAmount: 6300000,
        }),
      }),
    );
  });

  it('should generate payroll summary accurately', async () => {
    const mockPayrolls = [
      { baseAmount: 5000000, bonusAmount: 500000, deductionAmount: 100000, netAmount: 5400000 },
      { baseAmount: 6000000, bonusAmount: 0, deductionAmount: 200000, netAmount: 5800000 },
    ];

    prisma.payroll.findMany.mockResolvedValue(mockPayrolls);

    const summary = await service.getPayrollSummary('2026-09', 'org-1');

    expect(summary.period).toBe('2026-09');
    expect(summary.employeeCount).toBe(2);
    expect(summary.totalBase).toBe(11000000);
    expect(summary.totalBonus).toBe(500000);
    expect(summary.totalDeductions).toBe(300000);
    expect(summary.totalNet).toBe(11200000);
  });
});
