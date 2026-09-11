/**
 * Payment & Financial Business & API Service
 */
import { paymentsApi } from "@/api/services";
import {
  getActivePaymentMethods,
  getPaymentMethodBadgeClass,
  getPaymentMethodIcon,
  getPaymentMethodName,
  getPaymentMethodOptions,
} from "@/config/paymentMethods";
import {
  PAYMENT_CATEGORIES,
  PAYMENT_CATEGORY_LABELS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
} from "@/constants/payments.constants";

export const paymentService = {
  async getAll(params = {}) {
    try {
      const data = await paymentsApi.getAll(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[PaymentService.getAll] Error fetching payments:", err);
      return [];
    }
  },

  async getById(id) {
    return paymentsApi.getOne(id);
  },

  async getSummary() {
    try {
      return await paymentsApi.getSummary();
    } catch (err) {
      console.error("[PaymentService.getSummary] Error fetching summary:", err);
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        todayRevenue: 0,
        monthRevenue: 0,
      };
    }
  },

  async create(payload) {
    return paymentsApi.create(payload);
  },

  async update(id, payload) {
    return paymentsApi.update(id, payload);
  },

  async delete(id) {
    return paymentsApi.delete(id);
  },

  async void(id, reason) {
    return paymentsApi.void(id, reason);
  },

  async refund(id, reason) {
    return paymentsApi.refund(id, reason);
  },

  /**
   * Get dynamic and active payment methods (from configuration or DB)
   */
  getMethods() {
    return getActivePaymentMethods();
  },

  /**
   * Get payment methods formatted for select dropdowns
   */
  getMethodOptions() {
    return getPaymentMethodOptions();
  },

  /**
   * Formatters and helpers
   */
  getMethodName(code) {
    return getPaymentMethodName(code);
  },

  getMethodIcon(code) {
    return getPaymentMethodIcon(code);
  },

  getMethodBadgeClass(code) {
    return getPaymentMethodBadgeClass(code);
  },

  constants: {
    METHODS: PAYMENT_METHODS,
    CATEGORIES: PAYMENT_CATEGORIES,
    CATEGORY_LABELS: PAYMENT_CATEGORY_LABELS,
    STATUS: PAYMENT_STATUS,
  },
};
