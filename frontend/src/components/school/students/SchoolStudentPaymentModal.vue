<script setup>
import { ref, watch } from "vue";

import AppModal from "@/components/common/AppModal.vue";
import { useFormatters } from "@/composables/useFormatters";
import { getPaymentMethodOptions } from "@/config/paymentMethods";
import { PAYMENT_METHODS } from "@/constants/payments.constants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  student: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "paid"]);

const { formatMoney } = useFormatters();
const modalRef = ref(null);

const paymentMethods = getPaymentMethodOptions();
const paymentAmount = ref(0);
const paymentType = ref(PAYMENT_METHODS.CASH);
const error = ref("");

watch(
  () => props.student,
  (st) => {
    if (st) {
      paymentAmount.value = st.debt > 0 ? st.debt : st.monthlyFee;
      paymentType.value = PAYMENT_METHODS.CASH;
      error.value = "";
    }
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      modalRef.value?.open?.();
    } else {
      modalRef.value?.close?.();
    }
  }
);

function handleSubmit() {
  if (!paymentAmount.value || paymentAmount.value <= 0) {
    error.value = "To'lov summasini kiriting";
    return;
  }
  if (!props.student) return;

  emit("paid", {
    studentId: props.student.id,
    amount: paymentAmount.value,
    paymentType: paymentType.value,
  });
  close();
}

function close() {
  emit("update:modelValue", false);
}
</script>

<template>
  <AppModal
    ref="modalRef"
    title="To'lov qabul qilish"
    width="max-w-md"
    hide-button
    hide-footer
    @close="close"
  >
    <template #body>
      <form
        novalidate
        class="space-y-4 text-left text-xs sm:text-sm font-lexend"
        @submit.prevent="handleSubmit"
      >
        <div v-if="student" class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
          <p class="font-bold text-gray-800 dark:text-gray-100">{{ student.fullName }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Sinf: <b>{{ student.className }}</b> | Qarzdorlik:
            <b :class="student.debt > 0 ? 'text-rose-600' : 'text-emerald-600'">
              {{ formatMoney(student.debt) }}
            </b>
          </p>
        </div>

        <div>
          <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            To'lov summasi (so'm) <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="paymentAmount"
            type="number"
            placeholder="0"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition font-bold"
          />
          <p v-if="error" class="text-xs text-rose-500 mt-1">{{ error }}</p>
        </div>

        <div>
          <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">To'lov usuli</label>
          <select
            v-model="paymentType"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
          >
            <option v-for="m in paymentMethods" :key="m.value" :value="m.value">
              {{ m.label }}
            </option>
          </select>
        </div>

        <div
          class="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700"
        >
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition cursor-pointer"
            @click="close"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-2xs cursor-pointer active:scale-98"
          >
            To'lovni tasdiqlash
          </button>
        </div>
      </form>
    </template>
  </AppModal>
</template>
