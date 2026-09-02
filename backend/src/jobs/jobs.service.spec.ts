import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JobStatus } from '@prisma/client';

describe('JobsService (Unit Tests)', () => {
  let service: JobsService;
  let prisma: any;
  let notificationsService: any;

  beforeEach(async () => {
    prisma = {
      job: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    notificationsService = {
      sendEvent: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a pending job in database and schedule execution', async () => {
    const mockCreatedJob = {
      id: 'job-1',
      organizationId: 'org-1',
      type: 'NOTIFICATION',
      payload: { event: 'TEST' },
      status: JobStatus.PENDING,
      maxRetries: 3,
      attempts: 0,
      runAt: new Date(),
      createdAt: new Date(),
    };

    prisma.job.create.mockResolvedValue(mockCreatedJob);

    const job = await service.addJob(
      { type: 'NOTIFICATION', payload: { event: 'TEST' }, delayMs: 1000 },
      'org-1',
    );

    expect(job.id).toBe('job-1');
    expect(prisma.job.create).toHaveBeenCalled();
  });

  it('should recover orphaned pending and processing jobs on bootstrap', async () => {
    const orphanedJobs = [
      {
        id: 'job-orphaned-1',
        status: JobStatus.PENDING,
        runAt: new Date(Date.now() - 5000),
      },
    ];

    prisma.job.findMany.mockResolvedValue(orphanedJobs);

    await service.recoverOrphanedJobs();

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: { in: [JobStatus.PENDING, JobStatus.PROCESSING] },
        },
      }),
    );
  });
});
