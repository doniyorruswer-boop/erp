import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { NotificationProvider, NotificationPayload, SendResult } from './notification-provider.interface';

@Injectable()
export class SmsProvider implements NotificationProvider {
  readonly channel = NotificationChannel.SMS;
  private readonly logger = new Logger(SmsProvider.name);

  async send(payload: NotificationPayload): Promise<SendResult> {
    const phone = payload.recipient;
    if (!phone) {
      return { success: false, error: 'Telefon raqam ko\'rsatilmadi' };
    }

    // Eskiz / PlayMobile / Twilio API integration or local dev simulation
    this.logger.log(`[SMS DISPATCH] To: ${phone} | Text: ${payload.body}`);
    return {
      success: true,
      messageId: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      response: { recipient: phone, body: payload.body, sentAt: new Date() },
    };
  }
}
