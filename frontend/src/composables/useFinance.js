import { onMounted, ref } from "vue";

import { financeService } from "@/services/finance.service";

export function useFinance() {
  const payments = ref([]);
  const summary = ref({
    totalIncome: 0,
    monthlyIncome: 0,
    debtorsCount: 0,
  });
  const studentOptions = ref([]);
  const loading = ref(false);
  const alertMessage = ref("");

  const paymentForm = ref({
    studentId: "",
    amount: null,
    method: "CASH",
    notes: "",
  });

  const fetchFinanceData = async () => {
    loading.value = true;
    try {
      const [paymentsData, summaryData, studentsList] = await Promise.all([
        financeService.getPayments(),
        financeService.getSummary(),
        financeService.getStudentOptions(),
      ]);
      payments.value = paymentsData;
      summary.value = summaryData;
      studentOptions.value = studentsList;
    } catch (err) {
      console.error("[useFinance] Error loading data:", err);
    } finally {
      loading.value = false;
    }
  };

  const submitPayment = async (payload) => {
    try {
      const data = payload || paymentForm.value;
      await financeService.createPayment(data);
      alertMessage.value = "To'lov muvaffaqiyatli qabul qilindi!";
      paymentForm.value = {
        studentId: "",
        amount: null,
        method: "CASH",
        notes: "",
      };
      await fetchFinanceData();
      return true;
    } catch (err) {
      alert(err.message || "To'lovni kiritishda xatolik yuz berdi");
      return false;
    }
  };

  onMounted(() => {
    fetchFinanceData();
  });

  return {
    payments,
    summary,
    studentOptions,
    loading,
    alertMessage,
    paymentForm,
    fetchFinanceData,
    submitPayment,
  };
}
