import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JobStatus, InvoiceStatus, Prisma, NotificationChannel } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import {
  SendNotificationDto,
  SendEventNotificationDto,
} from "../notifications/dto/notification.dto";
import { CreateJobDto, QueryJobDto } from "./dto/job.dto";
import Redis from "ioredis";

@Injectable()
export class JobsService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private redis: Redis | null = null;
  private pollerInterval: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async onApplicationBootstrap() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    try {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 100, 3000),
        lazyConnect: true,
      });

      this.redis.on("connect", () => {
        this.logger.log(`[REDIS] Background jobs connected to Redis at ${redisUrl}`);
      });

      this.redis.on("error", (err) => {
        this.logger.warn(`[REDIS] Connection notice: ${err.message}`);
      });

      await this.redis.connect().catch((err) => {
        this.logger.warn(`[REDIS] Initial connect skipped: ${err.message}`);
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`[REDIS] Redis initialization skipped: ${msg}`);
    }

    // Recover any pending or interrupted jobs from previous server run
    await this.recoverOrphanedJobs();

    // Start checking delayed jobs periodically
    this.startDelayedJobPoller();
  }

  async onModuleDestroy() {
    if (this.pollerInterval) {
      clearInterval(this.pollerInterval);
    }
    if (this.redis) {
      await this.redis.quit().catch(() => {});
    }
  }

  async recoverOrphanedJobs() {
    try {
      const orphaned = await this.prisma.job.findMany({
        where: {
          status: { in: [JobStatus.PENDING, JobStatus.PROCESSING] },
        },
        take: 100,
        orderBy: { createdAt: "asc" },
      });

      if (orphaned.length > 0) {
        this.logger.log(
          `[JOB RECOVERY] Found ${orphaned.length} pending/interrupted jobs to re-enqueue.`
        );
        for (const job of orphaned) {
          const delay = Math.max(0, job.runAt.getTime() - Date.now());
          this.scheduleExecution(job.id, delay);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[JOB RECOVERY ERROR]: ${msg}`);
    }
  }

  private scheduleExecution(jobId: string, delayMs: number) {
    if (this.redis && this.redis.status === "ready") {
      const runTimestamp = Date.now() + delayMs;
      this.redis.zadd("eduhub:jobs:delayed", runTimestamp, jobId).catch(() => {});
    }

    if (!delayMs || delayMs <= 0) {
      setImmediate(() => this.processJob(jobId));
    } else {
      setTimeout(() => this.processJob(jobId), Math.min(delayMs, 86400000));
    }
  }

  private startDelayedJobPoller() {
    this.pollerInterval = setInterval(async () => {
      if (!this.redis || this.redis.status !== "ready") return;
      try {
        const now = Date.now();
        const dueJobIds = await this.redis.zrangebyscore("eduhub:jobs:delayed", 0, now);
        if (dueJobIds && dueJobIds.length > 0) {
          await this.redis.zrem("eduhub:jobs:delayed", ...dueJobIds);
          for (const jobId of dueJobIds) {
            this.processJob(jobId);
          }
        }
      } catch {
        // Suppress poller error
      }
    }, 3000);
  }

  async addJob(data: CreateJobDto, orgId: string) {
    const delayMs = data.delayMs || 0;
    const runAt = new Date(Date.now() + delayMs);

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

    this.scheduleExecution(job.id, delayMs);
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

    this.logger.log(
      `[JOB START] ID: ${job.id} | Type: ${job.type} | Attempt: ${attempts}/${job.maxRetries}`
    );

    try {
      let result: Prisma.InputJsonValue = {};
      const orgId = job.organizationId;
      if (!orgId) {
        throw new Error("Organization context missing for job");
      }

      switch (job.type) {
        case "NOTIFICATION":
          result = (await this.handleNotificationJob(
            job.payload as Record<string, unknown>,
            orgId
          )) as unknown as Prisma.InputJsonValue;
          break;

        case "SCHEDULED_REMINDER":
          result = (await this.handleScheduledReminderJob(
            job.payload as Record<string, unknown>,
            orgId
          )) as unknown as Prisma.InputJsonValue;
          break;

        case "RECURRING_BILLING":
          result = (await this.handleRecurringBillingJob(
            orgId
          )) as unknown as Prisma.InputJsonValue;
          break;

        case "REPORT_GENERATION":
          result = (await this.handleReportGenerationJob(
            job.payload as Record<string, unknown>,
            orgId
          )) as unknown as Prisma.InputJsonValue;
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
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[JOB ERROR] ID: ${job.id} | Type: ${job.type} | Error: ${errMsg}`);

      if (attempts < job.maxRetries) {
        const backoffMs = Math.pow(2, attempts) * 1000;
        const nextRunAt = new Date(Date.now() + backoffMs);

        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: JobStatus.PENDING,
            error: errMsg,
            runAt: nextRunAt,
          },
        });

        this.scheduleExecution(jobId, backoffMs);
      } else {
        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: JobStatus.FAILED,
            completedAt: new Date(),
            error: errMsg,
          },
        });
      }
    }
  }

  private async handleNotificationJob(payload: Record<string, unknown>, orgId: string) {
    if (payload.event) {
      return this.notificationsService.sendEvent(
        payload as unknown as SendEventNotificationDto,
        orgId
      );
    }
    return this.notificationsService.send(payload as unknown as SendNotificationDto, orgId);
  }

  private async handleScheduledReminderJob(payload: Record<string, unknown>, orgId: string) {
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
            channel: NotificationChannel.IN_APP,
            title: "Dars eslatmasi",
            body: `${item.title || "Dars"} ${item.startAt.toLocaleTimeString("uz-UZ")} da boshlanadi`,
          },
          orgId
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

  private async handleReportGenerationJob(payload: Record<string, unknown>, orgId: string) {
    const [students, revenue, expenses] = await Promise.all([
      this.prisma.student.count({ where: { organizationId: orgId, deletedAt: null } }),
      this.prisma.payment.aggregate({
        where: { organizationId: orgId, status: "PAID" },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { organizationId: orgId, deletedAt: null },
        _sum: { amount: true },
      }),
    ]);

    return {
      reportType: payload?.reportType || "SUMMARY",
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
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async findOne(id: string, orgId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!job) throw new NotFoundException("Job topilmadi");
    return job;
  }

  async retryJob(id: string, orgId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!job) throw new NotFoundException("Job topilmadi");

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
    const reminderJob = await this.addJob({ type: "SCHEDULED_REMINDER", payload: {} }, orgId);
    const billingJob = await this.addJob({ type: "RECURRING_BILLING", payload: {} }, orgId);

    return {
      message: "Maintenance jobs triggered successfully",
      reminderJobId: reminderJob.id,
      billingJobId: billingJob.id,
    };
  }
}
