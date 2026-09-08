import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('SubscriptionsService (Unit Tests)', () => {
  let service: SubscriptionsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      plan: {
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      planLimit: {
        create: jest.fn(),
      },
      planFeature: {
        create: jest.fn(),
      },
      subscription: {
        findFirst: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      user: {
        count: jest.fn(),
      },
      student: {
        count: jest.fn(),
      },
      customer: {
        count: jest.fn(),
      },
      branch: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkLimit', () => {
    it('should return { allowed: true } when current usage is under limit', async () => {
      prisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        organizationId: 'org-1',
        status: SubscriptionStatus.ACTIVE,
        plan: {
          code: 'FREE',
          limits: [
            { limitCode: 'MAX_STUDENTS_CUSTOMERS', value: 50 },
            { limitCode: 'MAX_BRANCHES', value: 1 },
            { limitCode: 'MAX_USERS', value: 2 },
          ],
        },
      });

      // Current usage: 30 students + 5 customers = 35 (limit is 50)
      prisma.user.count.mockResolvedValue(1);
      prisma.student.count.mockResolvedValue(30);
      prisma.customer.count.mockResolvedValue(5);
      prisma.branch.count.mockResolvedValue(1);

      const result = await service.checkLimit('MAX_STUDENTS_CUSTOMERS', 1, 'org-1');

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(35);
      expect(result.limit).toBe(50);
    });

    it('should throw ForbiddenException when increment causes usage to exceed limit', async () => {
      prisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        organizationId: 'org-1',
        status: SubscriptionStatus.ACTIVE,
        plan: {
          code: 'FREE',
          limits: [
            { limitCode: 'MAX_STUDENTS_CUSTOMERS', value: 50 },
            { limitCode: 'MAX_BRANCHES', value: 1 },
            { limitCode: 'MAX_USERS', value: 2 },
          ],
        },
      });

      // Current usage: 46 students + 4 customers = 50 (limit is 50)
      prisma.user.count.mockResolvedValue(2);
      prisma.student.count.mockResolvedValue(46);
      prisma.customer.count.mockResolvedValue(4);
      prisma.branch.count.mockResolvedValue(1);

      // Attempting to add 1 more student (50 + 1 > 50) should throw ForbiddenException
      await expect(
        service.checkLimit('MAX_STUDENTS_CUSTOMERS', 1, 'org-1'),
      ).rejects.toThrow(ForbiddenException);

      // Branch limit is 1, current is 1 -> adding 1 more branch should throw ForbiddenException
      await expect(
        service.checkLimit('MAX_BRANCHES', 1, 'org-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should never reject when limit is unlimited (value: -1)', async () => {
      prisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-enterprise',
        organizationId: 'org-1',
        status: SubscriptionStatus.ACTIVE,
        plan: {
          code: 'ENTERPRISE',
          limits: [
            { limitCode: 'MAX_USERS', value: -1 },
            { limitCode: 'MAX_STUDENTS_CUSTOMERS', value: -1 },
            { limitCode: 'MAX_BRANCHES', value: -1 },
          ],
        },
      });

      // Large usage
      prisma.user.count.mockResolvedValue(500);
      prisma.student.count.mockResolvedValue(10000);
      prisma.customer.count.mockResolvedValue(2000);
      prisma.branch.count.mockResolvedValue(50);

      const result = await service.checkLimit('MAX_STUDENTS_CUSTOMERS', 10, 'org-1');

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(12000);
      expect(result.limit).toBe(-1);
    });
  });
});
