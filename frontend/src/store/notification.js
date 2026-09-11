import { defineStore } from "pinia";

import { notificationService } from "@/services/notification.service";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    notifications: [],
    loading: false,
    pollIntervalId: null,
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter((n) => !n.isRead && !n.read).length,
    recentNotifications: (state) => state.notifications.slice(0, 5),
  },

  actions: {
    async fetchNotifications() {
      this.loading = true;
      try {
        const data = await notificationService.getAll();
        this.notifications = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("[NotificationStore] Failed to fetch notifications:", err);
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id) {
      try {
        await notificationService.markAsRead(id);
        const item = this.notifications.find((n) => n.id === id);
        if (item) {
          item.isRead = true;
          item.read = true;
        }
      } catch (err) {
        console.error(`[NotificationStore] Failed to mark ${id} as read:`, err);
      }
    },

    async markAllAsRead() {
      try {
        await notificationService.markAllAsRead();
        this.notifications.forEach((n) => {
          n.isRead = true;
          n.read = true;
        });
      } catch (err) {
        console.error("[NotificationStore] Failed to mark all as read:", err);
      }
    },

    startPolling(intervalMs = 60000) {
      if (this.pollIntervalId) return;
      this.fetchNotifications();
      this.pollIntervalId = setInterval(() => {
        this.fetchNotifications();
      }, intervalMs);
    },

    stopPolling() {
      if (this.pollIntervalId) {
        clearInterval(this.pollIntervalId);
        this.pollIntervalId = null;
      }
    },
  },
});
