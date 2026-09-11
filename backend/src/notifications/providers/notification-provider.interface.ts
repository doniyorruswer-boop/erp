import { NotificationChannel } from "@prisma/client";

export interface SendResult {
  success: boolean;
  messageId?: string;
  response?: Record<string, unknown> | unknown;
  error?: string;
}

export interface NotificationPayload {
  recipient: string; // userId, email, phone, or telegram chatId
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationProvider {
  readonly channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<SendResult>;
}
