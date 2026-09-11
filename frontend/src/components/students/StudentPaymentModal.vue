<script setup>
import { reactive, ref } from "vue";

import AppButton from "@/components/common/AppButton.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import { usePayments } from "@/composables/usePayments";
import { getPaymentMethodOptions } from "@/config/paymentMethods";
import { PAYMENT_METHODS } from "@/constants/payments.constants";

const props = defineProps({
  student: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["saved"]);

const modalRef = ref(null);
const { isSubmitting, submitStudentPayment } = usePayments();

const form = reactive({
  amount: 650000,
  method: PAYMENT_METHODS.CASH,
  notes: "",
});

const paymentMethods = getPaymentMethodOptions();

const open = () => {
  form.amount = 650000;
  form.method = "CASH";
  form.notes = "";
  if (modalRef.value) {
    modalRef.value.isOpen = true;
  }
};

const close = () => {
  if (modalRef.value) {
    modalRef.value.isOpen = false;
  }
};

const handleSubmit = async () => {
  if (!props.student?.id) return;
  const success = await submitStudentPayment({
    studentId: props.student.id,
    amount: form.amount,
    method: form.method,
    notes: form.notes,
  });

  if (success) {
    close();
    emit("saved");
  }
};

defineExpose({
  open,
  close,
});
</script>

<template>
  <Vmodal ref="modalRef" title="To'lov Qabul Qilish">
    <template #body>
      <div class="space-y-4 font-lexend">
        <div v-if="student" class="text-xs text-gray-500">
          O'quvchi:
          <span class="font-bold text-gray-800 dark:text-gray-200">
            {{ student.firstName }} {{ student.lastName }}
          </span>
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
            Summa (so'm)
          </label>
          <FormInput v-model.number="form.amount" type="number" step="10000" />
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
            To'lov Usuli
          </label>
          <FormSelect v-model="form.method" :options="paymentMethods" />
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
            Izoh
          </label>
          <FormInput v-model="form.notes" placeholder="Qo'shimcha ma'lumot..." />
        </div>
        <AppButton
          variant="primary"
          class="w-full mt-2"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          Tasdiqlash
        </AppButton>
      </div>
    </template>
  </Vmodal>
</template>
