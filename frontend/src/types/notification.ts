/**
 * Notification domain types and interfaces
 */

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM" | string;
export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}
