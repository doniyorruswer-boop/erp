import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';

describe('InvoicesService (Unit Tests)', () => {
  let service: InvoicesService;
  let prisma: any;
  let auditService: any;

  beforeEach(async () => {
    prisma = {
      invoice: {
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      branch: {
        findFirst: jest.fn().mockResolvedValue({ id: 'branch-1', organizationId: 'org-1' }),
      },
      student: {
        findFirst: jest.fn(),
      },
      customer: {
        findFirst: jest.fn(),
      },
    };

    auditService = {
      log: jest.fn().mockResolvedValue({ id: 'audit-log-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if invoice items are empty', async () => {
      await expect(
        service.create(
          {
            studentId: 'student-1',
            items: [],
          } as any,
          'org-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if student does not belong to org', async () => {
      prisma.student.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          {
            studentId: 'unknown-student',
            items: [{ description: 'Kurs tolovi', quantity: 1, unitPrice: 500000 }],
          } as any,
          'org-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate totals and create invoice successfully', async () => {
      prisma.student.findFirst.mockResolvedValue({
        id: 'student-1',
        organizationId: 'org-1',
        branchId: 'branch-1',
      });

      const mockInvoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-202609-0001',
        totalAmount: 500000,
        status: InvoiceStatus.ISSUED,
      };

      prisma.invoice.create.mockResolvedValue(mockInvoice);

      const result = await service.create(
        {
          studentId: 'student-1',
          branchId: 'branch-1',
          items: [{ description: 'Matematika kursi', quantity: 1, unitPrice: 500000 }],
        } as any,
        'org-1',
        'user-1',
      );

      expect(result).toEqual(mockInvoice);
      expect(prisma.invoice.create).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if invoice not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'org-1')).rejects.toThrow(NotFoundException);
    });

    it('should return invoice if found', async () => {
      const mockInvoice = { id: 'inv-1', organizationId: 'org-1' };
      prisma.invoice.findFirst.mockResolvedValue(mockInvoice);

      const result = await service.findOne('inv-1', 'org-1');
      expect(result).toEqual(mockInvoice);
    });
  });
});
