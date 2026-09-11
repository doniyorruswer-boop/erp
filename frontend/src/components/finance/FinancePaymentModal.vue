<script setup>
import { reactive, ref } from "vue";

import AppButton from "@/components/common/AppButton.vue";
import FormCurrencyInput from "@/components/FormCurrencyInput.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import { getPaymentMethodOptions } from "@/config/paymentMethods";
import { PAYMENT_METHODS } from "@/constants/payments.constants";

defineProps({
  studentOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["submit"]);

const modalRef = ref(null);
const paymentMethodOptions = getPaymentMethodOptions();

const form = reactive({
  studentId: "",
  amount: null,
  method: PAYMENT_METHODS.CASH,
  notes: "",
});

const open = () => {
  form.studentId = "";
  form.amount = null;
  form.method = PAYMENT_METHODS.CASH;
  form.notes = "";
  if (modalRef.value) modalRef.value.isOpen = true;
};

const close = () => {
  if (modalRef.value) modalRef.value.isOpen = false;
};

const handleSubmit = () => {
  if (!form.studentId || !form.amount) return;
  emit("submit", { ...form });
  close();
};

defineExpose({
  open,
  close,
});
</script>

<template>
  <Vmodal
    ref="modalRef"
    title="Yangi To'lov Qabul Qilish"
    subtitle="O'quvchining to'lov summasi va turini tanlang"
  >
    <template #body>
      <div class="space-y-3 text-sm text-left font-lexend">
        <FormSelect
          v-model="form.studentId"
          label="O'quvchini tanlang"
          required
          placeholder="O'quvchini tanlang..."
          :options="studentOptions"
        />
        <FormCurrencyInput
          v-model="form.amount"
          label="To'lov summasi"
          required
          placeholder="Masalan: 450 000"
        />
        <FormSelect v-model="form.method" label="To'lov usuli" :options="paymentMethodOptions" />
        <FormInput v-model="form.notes" label="Izoh" placeholder="Masalan: Mart oyi to'lovi" />
        <AppButton variant="primary" class="w-full mt-2" @click="handleSubmit">
          To'lovni Tasdiqlash
        </AppButton>
      </div>
    </template>
  </Vmodal>
</template>
