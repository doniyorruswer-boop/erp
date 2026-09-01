import { NotificationChannel } from '@prisma/client';

export interface SendResult {
  success: boolean;
  messageId?: string;
  response?: any;
  error?: string;
}

export interface NotificationPayload {
  recipient: string; // userId, email, phone, or telegram chatId
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

export interface NotificationProvider {
  readonly channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<SendResult>;
}
