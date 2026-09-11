<script setup>
import { reactive, ref } from "vue";

import AppButton from "@/components/common/AppButton.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";

defineProps({
  courseOptions: {
    type: Array,
    default: () => [],
  },
  teacherOptions: {
    type: Array,
    default: () => [],
  },
  roomOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["submit"]);

const modalRef = ref(null);

const form = reactive({
  name: "",
  courseId: "",
  days: "ODD_DAYS",
  teacherId: "",
  roomId: "",
  startTime: "14:00",
  endTime: "16:00",
  startDate: "",
  endDate: "",
});

const dayOptions = [
  { value: "ODD_DAYS", label: "Dushanba - Chorshanba - Juma (Toq kunlar)" },
  { value: "EVEN_DAYS", label: "Seshanba - Payshanba - Shanba (Juft kunlar)" },
  { value: "EVERYDAY", label: "Har kuni" },
  { value: "WEEKEND", label: "Shanba - Yakshanba" },
];

const open = () => {
  form.name = "";
  form.courseId = "";
  form.days = "ODD_DAYS";
  form.teacherId = "";
  form.roomId = "";
  form.startTime = "14:00";
  form.endTime = "16:00";
  form.startDate = "";
  form.endDate = "";
  if (modalRef.value) modalRef.value.isOpen = true;
};

const close = () => {
  if (modalRef.value) modalRef.value.isOpen = false;
};

const handleSubmit = () => {
  if (!form.name || !form.courseId) return;
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
    title="Yangi Guruh Ochish"
    subtitle="Guruh nomi, kursi va dars vaqtlarini tanlang"
  >
    <template #body>
      <div class="space-y-3 text-sm text-left font-lexend">
        <FormInput
          v-model="form.name"
          label="Guruh nomi"
          required
          placeholder="IELTS-Target-01"
          icon="ri:team-line"
        />
        <FormSelect v-model="form.courseId" label="Kurs" required :options="courseOptions" />
        <FormSelect v-model="form.days" label="Dars kunlari" :options="dayOptions" />
        <div class="grid grid-cols-2 gap-3">
          <FormSelect v-model="form.teacherId" label="O'qituvchi" :options="teacherOptions" />
          <FormSelect v-model="form.roomId" label="Xona" :options="roomOptions" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <FormInput
            v-model="form.startTime"
            label="Boshlanish vaqti"
            required
            placeholder="14:00"
            icon="solar:clock-circle-linear"
          />
          <FormInput
            v-model="form.endTime"
            label="Tugash vaqti"
            required
            placeholder="16:00"
            icon="solar:clock-circle-linear"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <FormInput
            v-model="form.startDate"
            type="date"
            label="Boshlanish sanasi"
            placeholder="2026-09-01"
            icon="solar:calendar-date-linear"
          />
          <FormInput
            v-model="form.endDate"
            type="date"
            label="Tugash sanasi"
            placeholder="2026-11-30"
            icon="solar:calendar-date-linear"
          />
        </div>
        <AppButton variant="primary" class="w-full mt-2" @click="handleSubmit"> Saqlash </AppButton>
      </div>
    </template>
  </Vmodal>
</template>
