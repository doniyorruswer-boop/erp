/**
 * Finance Business & API Service
 */
import { paymentsApi, studentsApi } from "@/api/services";

export const financeService = {
  async getPayments(params = {}) {
    try {
      const data = await paymentsApi.getAll(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[FinanceService.getPayments] Error:", err);
      return [];
    }
  },

  async getSummary() {
    try {
      const [summary, students] = await Promise.all([
        paymentsApi.getSummary().catch(() => null),
        studentsApi.getAll().catch(() => []),
      ]);

      const debtorsCount = Array.isArray(students)
        ? students.filter((s) => (s.balance || 0) < 0).length
        : 0;

      return {
        totalIncome: summary?.totalRevenue || 0,
        monthlyIncome: summary?.monthRevenue || 0,
        debtorsCount,
      };
    } catch (err) {
      console.error("[FinanceService.getSummary] Error:", err);
      return { totalIncome: 0, monthlyIncome: 0, debtorsCount: 0 };
    }
  },

  async getStudentOptions() {
    try {
      const students = await studentsApi.getAll();
      return Array.isArray(students)
        ? students.map((s) => ({
            value: s.id,
            label: `${s.firstName || ""} ${s.lastName || ""} (${s.phone || ""})`.trim(),
          }))
        : [];
    } catch (err) {
      console.error("[FinanceService.getStudentOptions] Error:", err);
      return [];
    }
  },

  async createPayment(payload) {
    return paymentsApi.create(payload);
  },
};
