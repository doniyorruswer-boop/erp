<script setup>
import { reactive, ref, watch } from "vue";

import AppModal from "@/components/common/AppModal.vue";
import FormFieldError from "@/components/common/FormFieldError.vue";
import { formatPhone } from "@/config/app.config";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  classNamesList: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const modalRef = ref(null);

const studentForm = reactive({
  fullName: "",
  className: "1-A",
  stage: "O'quvchi",
  phone: "+998",
  birthDate: "",
  parentName: "",
  parentPhone: "+998",
  monthlyFee: 4700000,
  debt: 0,
  gender: "Erkak",
});

const errors = reactive({});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      resetForm();
      modalRef.value?.open?.();
    } else {
      modalRef.value?.close?.();
    }
  }
);

function resetForm() {
  studentForm.fullName = "";
  studentForm.className = props.classNamesList[0] || "1-A";
  studentForm.stage = "O'quvchi";
  studentForm.phone = "+998";
  studentForm.birthDate = "";
  studentForm.parentName = "";
  studentForm.parentPhone = "+998";
  studentForm.monthlyFee = 4700000;
  studentForm.debt = 0;
  studentForm.gender = "Erkak";
  Object.keys(errors).forEach((k) => delete errors[k]);
}

function handlePhoneInput(field) {
  studentForm[field] = formatPhone(studentForm[field]);
  delete errors[field];
}

function validate() {
  let valid = true;
  Object.keys(errors).forEach((k) => delete errors[k]);

  if (!studentForm.fullName.trim()) {
    errors.fullName = "F.I.SH kiritilishi shart";
    valid = false;
  }
  if (!studentForm.phone || studentForm.phone.length < 9) {
    errors.phone = "Telefon raqami kiritilishi shart";
    valid = false;
  }
  return valid;
}

function handleSubmit() {
  if (!validate()) return;
  emit("submit", { ...studentForm });
  close();
}

function close() {
  emit("update:modelValue", false);
}
</script>

<template>
  <AppModal
    ref="modalRef"
    title="Yangi o'quvchi qo'shish"
    width="max-w-xl"
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              O'quvchi F.I.SH <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="studentForm.fullName"
              type="text"
              placeholder="Masalan: Abdullayev Bekzod Jasur o'g'li"
              :class="[
                'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                errors.fullName
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary',
              ]"
            />
            <FormFieldError :error="errors.fullName" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Sinf <span class="text-rose-500">*</span>
            </label>
            <select
              v-model="studentForm.className"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
            >
              <option v-for="c in classNamesList" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Bosqich</label>
            <select
              v-model="studentForm.stage"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none"
            >
              <option value="O'quvchi">O'quvchi</option>
              <option value="Sinov">Sinov</option>
              <option value="Lid">Lid</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Telefon raqam <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="studentForm.phone"
              type="text"
              placeholder="+998 (90) 123-45-67"
              :class="[
                'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                errors.phone
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary',
              ]"
              @input="handlePhoneInput('phone')"
            />
            <FormFieldError :error="errors.phone" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1"
              >Ota-onasi F.I.SH</label
            >
            <input
              v-model="studentForm.parentName"
              type="text"
              placeholder="Abdullayev Sobir"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1"
              >Ota-onasi telefoni</label
            >
            <input
              v-model="studentForm.parentPhone"
              type="text"
              placeholder="+998 (90) 064-38-80"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
              @input="handlePhoneInput('parentPhone')"
            />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1"
              >Oylik to'lov (so'm)</label
            >
            <input
              v-model="studentForm.monthlyFee"
              type="number"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
            />
          </div>
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
            class="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition shadow-2xs cursor-pointer active:scale-98"
          >
            Qo'shish
          </button>
        </div>
      </form>
    </template>
  </AppModal>
</template>
