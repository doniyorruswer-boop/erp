import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { NotificationProvider, NotificationPayload, SendResult } from './notification-provider.interface';

@Injectable()
export class EmailProvider implements NotificationProvider {
  readonly channel = NotificationChannel.EMAIL;
  private readonly logger = new Logger(EmailProvider.name);

  async send(payload: NotificationPayload): Promise<SendResult> {
    const email = payload.recipient;
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Noto\'g\'ri email manzili' };
    }

    // SMTP / SendGrid / Mailgun integration or local dev simulation
    this.logger.log(`[EMAIL DISPATCH] To: ${email} | Subject: ${payload.title}`);
    return {
      success: true,
      messageId: `email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      response: { recipient: email, title: payload.title, sentAt: new Date() },
    };
  }
}
