import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import { InAppProvider } from './providers/in-app.provider';
import { TelegramProvider } from './providers/telegram.provider';
import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';
import { NotificationProvider } from './providers/notification-provider.interface';
import {
  SendNotificationDto,
  SendEventNotificationDto,
  QueryNotificationDto,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private providers: Map<NotificationChannel, NotificationProvider>;

  constructor(
    private prisma: PrismaService,
    private inAppProvider: InAppProvider,
    private telegramProvider: TelegramProvider,
    private emailProvider: EmailProvider,
    private smsProvider: SmsProvider,
  ) {
    this.providers = new Map<NotificationChannel, NotificationProvider>([
      [NotificationChannel.IN_APP, inAppProvider],
      [NotificationChannel.TELEGRAM, telegramProvider],
      [NotificationChannel.EMAIL, emailProvider],
      [NotificationChannel.SMS, smsProvider],
    ]);
  }

  private interpolate(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables || {})) {
      result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
    }
    return result;
  }

  private getDefaultTemplate(event: string, channel: NotificationChannel) {
    const defaults: Record<string, { title: string; body: string }> = {
      PAYMENT_RECEIVED: {
        title: "To'lov qabul qilindi",
        body: "Hurmatli {{studentName}}, sizning {{amount}} so'm miqdoridagi to'lovingiz qabul qilindi. Chek raqami: {{receiptNumber}}.",
      },
      INVOICE_OVERDUE: {
        title: "To'lov muddati eslatmasi",
        body: "Hurmatli {{studentName}}, sizning {{amount}} so'm miqdoridagi to'lovingiz muddati yetib keldi. Iltimos, o'z vaqtida to'lovni amalga oshiring.",
      },
      ATTENDANCE_ABSENT: {
        title: "Dars qoldirildi",
        body: "Hurmatli ota-ona, farzandingiz {{studentName}} bugun {{groupName}} guruhidagi darsda qatnashmadi.",
      },
      LESSON_REMINDER: {
        title: "Dars eslatmasi",
        body: "{{groupName}} guruhi uchun dars bugun soat {{startTime}} da boshlanadi. Xona: {{roomName}}.",
      },
      EXAM_REMINDER: {
        title: "Imtihon eslatmasi",
        body: "{{groupName}} guruhida {{examTitle}} imtihoni {{date}} kuni bo'lib o'tadi.",
      },
    };

    return defaults[event] || {
      title: 'Tizim bildirishnomasi',
      body: 'Siz uchun yangi bildirishnoma mavjud.',
    };
  }

  async send(data: SendNotificationDto, orgId: string) {
    const channel = data.channel || NotificationChannel.IN_APP;
    const provider = this.providers.get(channel);

    if (!provider) {
      throw new NotFoundException(`Xabarnoma provayderi topilmadi: ${channel}`);
    }

    // Cross-tenant checks
    if (data.userId) {
      const user = await this.prisma.user.findFirst({
        where: { id: data.userId, organizationId: orgId, deletedAt: null },
      });
      if (!user) throw new BadRequestException('Foydalanuvchi topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    if (data.studentId) {
      const student = await this.prisma.student.findFirst({
        where: { id: data.studentId, organizationId: orgId, deletedAt: null },
      });
      if (!student) throw new BadRequestException('Talaba topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    if (data.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: data.customerId, organizationId: orgId, deletedAt: null },
      });
      if (!customer) throw new BadRequestException('Mijoz topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    // 1. Create Notification record
    const notification = await this.prisma.notification.create({
      data: {
        organizationId: orgId,
        userId: data.userId || null,
        studentId: data.studentId || null,
        customerId: data.customerId || null,
        title: data.title,
        body: data.body,
        channel,
        event: data.event || null,
        metadata: data.metadata || undefined,
        status: NotificationStatus.PENDING,
      },
    });

    // 2. Dispatch via Provider
    const result = await provider.send({
      recipient: data.recipient,
      title: data.title,
      body: data.body,
      metadata: data.metadata,
    });

    const status = result.success ? NotificationStatus.SENT : NotificationStatus.FAILED;

    // 3. Update Notification status & record log
    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status,
        sentAt: result.success ? new Date() : null,
        error: result.error || null,
      },
    });

    await this.prisma.notificationLog.create({
      data: {
        notificationId: notification.id,
        channel,
        status,
        recipient: data.recipient,
        payload: { title: data.title, body: data.body, metadata: data.metadata } as any,
        response: result.response as any,
        error: result.error || null,
      },
    });

    return updated;
  }

  async sendEvent(data: SendEventNotificationDto, orgId: string) {
    const channels = data.channels && data.channels.length > 0
      ? data.channels
      : [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM];

    const results = [];

    for (const channel of channels) {
      // 1. Try to find configured template
      const template = await this.prisma.notificationTemplate.findFirst({
        where: {
          code: data.event,
          channel,
          isActive: true,
          deletedAt: null,
          organizationId: orgId,
        },
      });

      const fallback = this.getDefaultTemplate(data.event, channel);
      const titleTemplate = template ? template.titleTemplate : fallback.title;
      const bodyTemplate = template ? template.bodyTemplate : fallback.body;

      const title = this.interpolate(titleTemplate, data.variables || {});
      const body = this.interpolate(bodyTemplate, data.variables || {});

      const sendRes = await this.send(
        {
          recipient: data.recipient,
          title,
          body,
          channel,
          event: data.event,
          userId: data.userId,
          studentId: data.studentId,
          customerId: data.customerId,
          metadata: data.variables,
        },
        orgId,
      );

      results.push(sendRes);
    }

    return {
      event: data.event,
      sentCount: results.length,
      notifications: results,
    };
  }

  async findAll(query: QueryNotificationDto | undefined, orgId: string) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          organizationId: orgId,
          deletedAt: null,
          channel: query?.channel,
          status: query?.status,
          userId: query?.userId,
          studentId: query?.studentId,
        },
        include: {
          logs: { take: 1, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({
        where: {
          organizationId: orgId,
          deletedAt: null,
          readAt: null,
          channel: query?.channel || NotificationChannel.IN_APP,
          userId: query?.userId,
        },
      }),
    ]);

    return {
      unreadCount,
      items,
    };
  }

  async markAsRead(id: string, orgId: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!notif) throw new NotFoundException('Bildirishnoma topilmadi');

    return this.prisma.notification.update({
      where: { id },
      data: {
        readAt: new Date(),
        status: NotificationStatus.READ,
      },
    });
  }

  async markAllAsRead(userId: string | undefined, orgId: string) {
    return this.prisma.notification.updateMany({
      where: {
        organizationId: orgId,
        userId: userId || undefined,
        readAt: null,
        channel: NotificationChannel.IN_APP,
      },
      data: {
        readAt: new Date(),
        status: NotificationStatus.READ,
      },
    });
  }

  // Template Management
  async getTemplates(orgId: string) {
    return this.prisma.notificationTemplate.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { code: 'asc' },
    });
  }

  async createTemplate(data: CreateNotificationTemplateDto, orgId: string) {
    return this.prisma.notificationTemplate.create({
      data: {
        ...data,
        channel: data.channel || NotificationChannel.IN_APP,
        organizationId: orgId,
      },
    });
  }

  async updateTemplate(id: string, data: UpdateNotificationTemplateDto, orgId: string) {
    const existing = await this.prisma.notificationTemplate.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) throw new NotFoundException('Shablon topilmadi');

    return this.prisma.notificationTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteTemplate(id: string, orgId: string) {
    const existing = await this.prisma.notificationTemplate.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) throw new NotFoundException('Shablon topilmadi');

    return this.prisma.notificationTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
