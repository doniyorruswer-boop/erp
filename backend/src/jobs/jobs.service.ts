import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, InvoiceStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateJobDto, QueryJobDto } from './dto/job.dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async addJob(data: CreateJobDto, orgId: string) {
    const runAt = new Date(Date.now() + (data.delayMs || 0));

    const job = await this.prisma.job.create({
      data: {
        organizationId: orgId,
        type: data.type,
        payload: data.payload,
        status: JobStatus.PENDING,
        maxRetries: data.maxRetries || 3,
        runAt,
      },
    });

    // If no delay, trigger execution asynchronously in the background
    if (!data.delayMs || data.delayMs <= 0) {
      setImmediate(() => this.processJob(job.id));
    } else {
      setTimeout(() => this.processJob(job.id), data.delayMs);
    }

    return job;
  }

  async processJob(jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED) {
      return;
    }

    const attempts = job.attempts + 1;
    await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
        attempts,
      },
    });

    this.logger.log(`[JOB START] ID: ${job.id} | Type: ${job.type} | Attempt: ${attempts}/${job.maxRetries}`);

    try {
      let result: any = null;
      const orgId = job.organizationId;
      if (!orgId) {
        throw new Error('Organization context missing for job');
      }

      switch (job.type) {
        case 'NOTIFICATION':
          result = await this.handleNotificationJob(job.payload as any, orgId);
          break;

        case 'SCHEDULED_REMINDER':
          result = await this.handleScheduledReminderJob(job.payload as any, orgId);
          break;

        case 'RECURRING_BILLING':
          result = await this.handleRecurringBillingJob(orgId);
          break;

        case 'REPORT_GENERATION':
          result = await this.handleReportGenerationJob(job.payload as any, orgId);
          break;

        default:
          result = { success: true, message: `Generic job ${job.type} processed successfully` };
      }

      await this.prisma.job.update({
        where: { id: jobId },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
          result: result || {},
          error: null,
        },
      });

      this.logger.log(`[JOB COMPLETED] ID: ${job.id} | Type: ${job.type}`);
    } catch (err: any) {
      this.logger.error(`[JOB ERROR] ID: ${job.id} | Type: ${job.type} | Error: ${err.message}`);

      if (attempts < job.maxRetries) {
        const backoffMs = Math.pow(2, attempts) * 1000;
        const nextRunAt = new Date(Date.now() + backoffMs);

        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: JobStatus.PENDING,
            error: err.message,
            runAt: nextRunAt,
          },
        });

        setTimeout(() => this.processJob(jobId), backoffMs);
      } else {
        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: JobStatus.FAILED,
            completedAt: new Date(),
            error: err.message,
          },
        });
      }
    }
  }

  private async handleNotificationJob(payload: any, orgId: string) {
    if (payload.event) {
      return this.notificationsService.sendEvent(payload, orgId);
    }
    return this.notificationsService.send(payload, orgId);
  }

  private async handleScheduledReminderJob(payload: any, orgId: string) {
    const now = new Date();
    const futureLimit = new Date(now.getTime() + 2 * 60 * 60 * 1000); // next 2 hours

    const upcomingSchedules = await this.prisma.schedule.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        startAt: { gte: now, lte: futureLimit },
      },
      include: {
        instructor: true,
        group: { include: { enrollments: { include: { student: true } } } },
      },
    });

    let count = 0;
    for (const item of upcomingSchedules) {
      if (item.instructor?.phone) {
        await this.notificationsService.send(
          {
            recipient: item.instructor.phone,
            channel: 'IN_APP' as any,
            title: 'Dars eslatmasi',
            body: `${item.title || 'Dars'} ${item.startAt.toLocaleTimeString('uz-UZ')} da boshlanadi`,
          },
          orgId,
        );
        count++;
      }
    }

    return { processedReminders: count, totalUpcoming: upcomingSchedules.length };
  }

  private async handleRecurringBillingJob(orgId: string) {
    const now = new Date();

    // Mark overdue invoices
    const overdueInvoices = await this.prisma.invoice.updateMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] },
        dueDate: { lt: now },
      },
      data: {
        status: InvoiceStatus.OVERDUE,
      },
    });

    return {
      overdueCount: overdueInvoices.count,
      checkedAt: now,
    };
  }

  private async handleReportGenerationJob(payload: any, orgId: string) {
    const [students, revenue, expenses] = await Promise.all([
      this.prisma.student.count({ where: { organizationId: orgId, deletedAt: null } }),
      this.prisma.payment.aggregate({ where: { organizationId: orgId, status: 'PAID' }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { organizationId: orgId, deletedAt: null }, _sum: { amount: true } }),
    ]);

    return {
      reportType: payload?.reportType || 'SUMMARY',
      generatedAt: new Date(),
      metrics: {
        totalStudents: students,
        totalRevenue: Number(revenue._sum.amount || 0),
        totalExpenses: Number(expenses._sum.amount || 0),
        netProfit: Number(revenue._sum.amount || 0) - Number(expenses._sum.amount || 0),
      },
    };
  }

  async findAll(query: QueryJobDto | undefined, orgId: string) {
    return this.prisma.job.findMany({
      where: {
        organizationId: orgId,
        status: query?.status,
        type: query?.type,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findOne(id: string, orgId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!job) throw new NotFoundException('Job topilmadi');
    return job;
  }

  async retryJob(id: string, orgId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!job) throw new NotFoundException('Job topilmadi');

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: JobStatus.PENDING,
        error: null,
        runAt: new Date(),
      },
    });

    setImmediate(() => this.processJob(id));
    return updated;
  }

  async triggerMaintenanceJobs(orgId: string) {
    const reminderJob = await this.addJob({ type: 'SCHEDULED_REMINDER', payload: {} }, orgId);
    const billingJob = await this.addJob({ type: 'RECURRING_BILLING', payload: {} }, orgId);

    return {
      message: 'Maintenance jobs triggered successfully',
      reminderJobId: reminderJob.id,
      billingJobId: billingJob.id,
    };
  }
}
