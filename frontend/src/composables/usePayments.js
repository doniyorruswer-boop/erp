import { ref } from "vue";

import { paymentService } from "@/services/payment.service";

/**
 * Composable for Student Quick Payments
 */
export function usePayments() {
  const isSubmitting = ref(false);
  const paymentError = ref("");

  const submitStudentPayment = async ({ studentId, amount, method, notes }) => {
    if (!studentId || !amount) {
      paymentError.value = "O'quvchi va summa to'ldirilishi shart";
      return false;
    }
    isSubmitting.value = true;
    paymentError.value = "";
    try {
      await paymentService.create({
        studentId,
        amount: Number(amount),
        method,
        notes: notes || "",
      });
      return true;
    } catch (err) {
      console.error("[usePayments] Payment failed:", err);
      paymentError.value = err.message || "To'lovni amalga oshirishda xatolik";
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    isSubmitting,
    paymentError,
    submitStudentPayment,
  };
}
