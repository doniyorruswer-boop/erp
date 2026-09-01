import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { NotificationProvider, NotificationPayload, SendResult } from './notification-provider.interface';

@Injectable()
export class InAppProvider implements NotificationProvider {
  readonly channel = NotificationChannel.IN_APP;
  private readonly logger = new Logger(InAppProvider.name);

  async send(payload: NotificationPayload): Promise<SendResult> {
    this.logger.log(`[IN_APP] Bildirishnoma saqlandi: ${payload.recipient} - ${payload.title}`);
    return {
      success: true,
      messageId: `inapp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      response: { deliveredAt: new Date() },
    };
  }
}
