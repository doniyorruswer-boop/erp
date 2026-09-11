<script setup>
import { reactive, ref } from "vue";

import AppButton from "@/components/common/AppButton.vue";
import FormInput from "@/components/FormInput.vue";

const emit = defineEmits(["save"]);

const modalRef = ref(null);

const form = reactive({
  name: "",
  price: 650000,
  duration: 6,
  lessonCount: 12,
  description: "",
});

const open = () => {
  form.name = "";
  form.price = 650000;
  form.duration = 6;
  form.lessonCount = 12;
  form.description = "";
  if (modalRef.value) {
    modalRef.value.isOpen = true;
  }
};

const close = () => {
  if (modalRef.value) {
    modalRef.value.isOpen = false;
  }
};

const handleSave = () => {
  if (!form.name) return;
  emit("save", { ...form });
  close();
};

defineExpose({
  open,
  close,
});
</script>

<template>
  <Vmodal ref="modalRef" title="Yangi Kurs Qo'shish">
    <template #body>
      <div class="space-y-4 font-lexend">
        <div>
          <label class="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
            Kurs Nomi
          </label>
          <FormInput v-model="form.name" placeholder="Masalan: Frontend Dasturlash" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Narxi (so'm)
            </label>
            <FormInput v-model.number="form.price" type="number" step="10000" />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Davomiyligi (oy)
            </label>
            <FormInput v-model.number="form.duration" type="number" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
            Oylik Darslar Soni
          </label>
          <FormInput v-model.number="form.lessonCount" type="number" />
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
            Tavsif
          </label>
          <FormInput v-model="form.description" placeholder="Kurs haqida qisqacha..." />
        </div>
        <AppButton variant="primary" class="w-full mt-2" @click="handleSave"> Saqlash </AppButton>
      </div>
    </template>
  </Vmodal>
</template>
