import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsService } from "./payments.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

type MockModel = Record<string, jest.Mock>;
interface MockPrisma {
  cashbox: MockModel;
  transaction: MockModel;
  payment: MockModel;
  student: MockModel;
  customer: MockModel;
  contract: MockModel;
  invoice: MockModel;
  $transaction: jest.Mock;
}
type MockAudit = Record<string, jest.Mock>;

describe("PaymentsService (Unit Tests)", () => {
  let service: PaymentsService;
  let prisma: MockPrisma;
  let auditService: MockAudit;

  beforeEach(async () => {
    prisma = {
      cashbox: {
        findFirst: jest.fn().mockResolvedValue({ id: "cashbox-1", organizationId: "org-1" }),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({ id: "cashbox-1", balance: 250000 }),
      },
      transaction: {
        create: jest.fn().mockResolvedValue({ id: "tx-1" }),
      },
      payment: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      student: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      customer: {
        findFirst: jest.fn(),
      },
      contract: {
        findFirst: jest.fn(),
      },
      invoice: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    auditService = {
      log: jest.fn().mockResolvedValue({ id: "audit-log-1" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should throw BadRequestException if student does not belong to org", async () => {
      prisma.student.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          { studentId: "unknown-student", amount: 100000, method: PaymentMethod.CASH },
          "org-1"
        )
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if student branch mismatches target branch", async () => {
      prisma.student.findFirst.mockResolvedValue({
        id: "student-1",
        organizationId: "org-1",
        branchId: "branch-A",
      });

      await expect(
        service.create(
          {
            studentId: "student-1",
            branchId: "branch-B",
            amount: 100000,
            method: PaymentMethod.CASH,
          },
          "org-1"
        )
      ).rejects.toThrow("To'lov filiali o'quvchining filiali bilan mos kelmadi");
    });

    it("should create payment and record audit log on success", async () => {
      prisma.student.findFirst.mockResolvedValue({
        id: "student-1",
        organizationId: "org-1",
        branchId: "branch-A",
        balance: 0,
      });

      const mockCreatedPayment = {
        id: "pay-1",
        organizationId: "org-1",
        studentId: "student-1",
        amount: 250000,
        status: PaymentStatus.PAID,
      };

      prisma.payment.create.mockResolvedValue(mockCreatedPayment);
      prisma.student.update.mockResolvedValue({ id: "student-1", balance: 250000 });

      const result = await service.create(
        {
          studentId: "student-1",
          branchId: "branch-A",
          amount: 250000,
          method: PaymentMethod.CASH,
        },
        "org-1",
        "admin-user-id"
      );

      expect(result).toEqual(mockCreatedPayment);
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should throw NotFoundException if payment does not exist", async () => {
      prisma.payment.findFirst.mockResolvedValue(null);

      await expect(service.findOne("non-existent-id", "org-1")).rejects.toThrow(NotFoundException);
    });

    it("should return payment if found", async () => {
      const mockPayment = { id: "pay-1", amount: 50000, organizationId: "org-1" };
      prisma.payment.findFirst.mockResolvedValue(mockPayment);

      const result = await service.findOne("pay-1", "org-1");
      expect(result).toEqual(mockPayment);
    });
  });
});
