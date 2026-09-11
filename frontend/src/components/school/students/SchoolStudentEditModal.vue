<script setup>
import { reactive, ref, watch } from "vue";

import AppModal from "@/components/common/AppModal.vue";
import FormFieldError from "@/components/common/FormFieldError.vue";
import { formatPhone } from "@/config/app.config";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  student: { type: Object, default: null },
  classNamesList: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const modalRef = ref(null);

const editForm = reactive({
  id: "",
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
  () => props.student,
  (st) => {
    if (st) {
      editForm.id = st.id;
      editForm.fullName = st.fullName || "";
      editForm.className = st.className || props.classNamesList[0] || "1-A";
      editForm.stage = st.stage || "O'quvchi";
      editForm.phone = st.phone || "+998";
      editForm.birthDate = st.birthDate || "";
      editForm.parentName = st.parentName || "";
      editForm.parentPhone = st.parentPhone || "+998";
      editForm.monthlyFee = st.monthlyFee || 4700000;
      editForm.debt = st.debt || 0;
      editForm.gender = st.gender || "Erkak";
      Object.keys(errors).forEach((k) => delete errors[k]);
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

function handlePhoneInput(field) {
  editForm[field] = formatPhone(editForm[field]);
  delete errors[field];
}

function validate() {
  let valid = true;
  Object.keys(errors).forEach((k) => delete errors[k]);

  if (!editForm.fullName?.trim()) {
    errors.fullName = "F.I.SH kiritilishi shart";
    valid = false;
  }
  if (!editForm.phone || editForm.phone.length < 9) {
    errors.phone = "Telefon raqami kiritilishi shart";
    valid = false;
  }
  return valid;
}

function handleSubmit() {
  if (!validate()) return;
  emit("submit", { ...editForm });
  close();
}

function close() {
  emit("update:modelValue", false);
}
</script>

<template>
  <AppModal
    ref="modalRef"
    title="O'quvchi ma'lumotlarini tahrirlash"
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
              v-model="editForm.fullName"
              type="text"
              placeholder="F.I.SH"
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
              v-model="editForm.className"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
            >
              <option v-for="c in classNamesList" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Bosqich</label>
            <select
              v-model="editForm.stage"
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
              v-model="editForm.phone"
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
              v-model="editForm.parentName"
              type="text"
              placeholder="Ota-onasi F.I.SH"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1"
              >Ota-onasi telefoni</label
            >
            <input
              v-model="editForm.parentPhone"
              type="text"
              placeholder="+998 (90) 000-00-00"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
              @input="handlePhoneInput('parentPhone')"
            />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1"
              >Qarzdorlik (so'm)</label
            >
            <input
              v-model="editForm.debt"
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
            Saqlash
          </button>
        </div>
      </form>
    </template>
  </AppModal>
</template>
