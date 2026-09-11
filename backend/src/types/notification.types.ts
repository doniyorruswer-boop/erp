export type NotificationChannel = "SMS" | "TELEGRAM" | "EMAIL" | "IN_APP";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "DELIVERED";

export interface ProviderSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  response?: Record<string, unknown>;
}

export interface NotificationMessagePayload {
  to: string;
  subject?: string;
  message: string;
  channel: NotificationChannel;
  metadata?: Record<string, unknown>;
}
