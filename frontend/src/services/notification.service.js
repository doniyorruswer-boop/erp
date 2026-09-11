/**
 * Notification Business & API Service
 */
import { notificationsApi } from "@/api/services";

export const notificationService = {
  async getAll(params = {}) {
    try {
      const data = await notificationsApi.getAll(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[NotificationService.getAll] Error fetching notifications:", err);
      return [];
    }
  },

  async markAsRead(id) {
    return notificationsApi.markAsRead(id);
  },

  async markAllAsRead() {
    return notificationsApi.markAllAsRead();
  },

  async create(payload) {
    return notificationsApi.create(payload);
  },
};
