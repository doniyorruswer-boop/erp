<template>
  <vmodal
    :model-value="modelValue"
    @update:model-value="handleClose"
    :title="modalTitle"
    :subtitle="modalSubtitle"
    :icon="modalIcon"
    icon-bg-class="bg-primary/10 text-primary"
    width="max-w-lg"
    :hide-button="true"
    
  >
    <template #body>
      <form @submit.prevent="handleSubmit" novalidate class="space-y-4 text-left p-1">
        <!-- 1. Sinf / Guruh nomi -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
            {{ tenantStore.classLabel }} nomi <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <Icon
              :icon="tenantStore.isSchool ? 'solar:square-academic-cap-bold' : 'solar:users-group-two-rounded-bold'"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base"
            />
            <input
              v-model="form.name"
              type="text"
              :placeholder="namePlaceholder"
              @input="clearFieldError('name')"
              :class="[
                'w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none transition shadow-2xs font-medium',
                formErrors.name ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20'
              ]"
            />
          </div>
          <FormFieldError :error="formErrors.name" />
        </div>

        <!-- 2. Parallel / Yosh guruhi va Sig'imi (2 ustun) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <!-- Parallel / Bosqich / Yosh toifasi -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {{ stageFieldLabel }} <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <Icon icon="solar:layers-minimalistic-bold" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
              
              <!-- Maktab bosqichlari -->
              <select
                v-if="tenantStore.isSchool"
                v-model="form.parallel"
                @change="clearFieldError('parallel')"
                :class="[
                  'w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition shadow-2xs appearance-none cursor-pointer font-medium',
                  formErrors.parallel ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20'
                ]"
              >
                <option v-for="p in 11" :key="p" :value="String(p)">{{ p }}-bosqich ({{ p }}-sinf)</option>
              </select>

              <!-- Bog'cha yosh toifalari -->
              <select
                v-else-if="tenantStore.isKindergarten"
                v-model="form.parallel"
                @change="clearFieldError('parallel')"
                :class="[
                  'w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition shadow-2xs appearance-none cursor-pointer font-medium',
                  formErrors.parallel ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20'
                ]"
              >
                <option value="Yasli">Yasli (2-3 yosh)</option>
                <option value="Kichik guruh">Kichik guruh (3-4 yosh)</option>
                <option value="O'rta guruh">O'rta guruh (4-5 yosh)</option>
                <option value="Katta guruh">Katta guruh (5-6 yosh)</option>
                <option value="Tayyorlov">Tayyorlov guruhi (6-7 yosh)</option>
              </select>

              <!-- O'quv markazi yo'nalishi -->
              <input
                v-else
                v-model="form.parallel"
                type="text"
                placeholder="Masalan: Web Dasturlash"
                @input="clearFieldError('parallel')"
                :class="[
                  'w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none transition shadow-2xs font-medium',
                  formErrors.parallel ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20'
                ]"
              />

              <Icon
                v-if="tenantStore.isSchool || tenantStore.isKindergarten"
                icon="solar:alt-arrow-down-linear"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"
              />
            </div>
            <FormFieldError :error="formErrors.parallel" />
          </div>

          <!-- Sig'im -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {{ tenantStore.classLabel }} sig'imi <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <Icon icon="solar:users-group-rounded-bold" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                v-model.number="form.capacity"
                type="number"
                min="1"
                max="100"
                placeholder="25"
                @input="clearFieldError('capacity')"
                :class="[
                  'w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none transition shadow-2xs font-medium',
                  formErrors.capacity ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20'
                ]"
              />
            </div>
            <FormFieldError :error="formErrors.capacity" />
          </div>
        </div>

        <!-- 3. Mas'ul xodim (Sinf rahbari / Tarbiyachi / Ustoz) -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
            {{ tenantStore.teacherRoleLabel }}
          </label>
          <div class="relative">
            <Icon icon="solar:user-bold" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              v-model="form.teacherName"
              type="text"
              placeholder="Masalan: Nilufar Qosimova"
              @input="clearFieldError('teacherName')"
              :class="[
                'w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none transition shadow-2xs font-medium',
                formErrors.teacherName ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20'
              ]"
            />
          </div>
          <FormFieldError :error="formErrors.teacherName" />
        </div>

        <!-- 4. Reja summasi (UZS) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {{ tenantStore.isSchool ? "Yillik to'lov rejasi (UZS)" : "Reja summasi (UZS)" }}
            </label>
            <span class="text-[11px] font-semibold text-primary">
              {{ formatMoney(form.plan) }}
            </span>
          </div>
          <div class="relative">
            <Icon icon="solar:wallet-money-bold" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              v-model.number="form.plan"
              type="number"
              min="0"
              step="100000"
              @input="clearFieldError('plan')"
              :class="[
                'w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none transition shadow-2xs font-medium',
                formErrors.plan ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20'
              ]"
            />
          </div>
          <FormFieldError :error="formErrors.plan" />
        </div>
      </form>
    </template>

    <!-- Footer Slot: EduHub Standard Buttons -->
    <template #footer>
      <div class="flex items-center justify-end gap-2.5 w-full">
        <button
          type="button"
          @click="handleClose"
          class="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer shadow-2xs"
        >
          Bekor qilish
        </button>
        <button
          type="button"
          @click="handleSubmit"
          class="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-98"
        >
          <Icon icon="solar:check-circle-bold" class="text-base" />
          <span>Saqlash</span>
        </button>
      </div>
    </template>
  </vmodal>
</template>

<script>
import { Icon } from "@iconify/vue";
import vmodal from "@/components/modal.vue";
import { useTenantStore } from "@/store/tenant";
import { validateForm, classValidationRules } from "@/utils/validators";
import { toast } from "@/utils/toast";

export default {
  name: "CreateClassModal",
  components: {
    Icon,
    vmodal,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "created"],
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      formErrors: {},
      form: {
        name: "",
        parallel: "1",
        teacherName: "",
        capacity: 25,
        plan: 1000000000,
      },
    };
  },
  computed: {
    modalTitle() {
      return `Yangi ${this.tenantStore.classLabel.toLowerCase()} ochish`;
    },
    modalSubtitle() {
      if (this.tenantStore.isSchool) {
        return "Maktab o'quvchilari uchun yangi sinf va sinf rahbarini shakllantirish";
      }
      if (this.tenantStore.isKindergarten) {
        return "Bog'cha uchun yangi tarbiyalanuvchilar guruhini tashkil qilish";
      }
      return "O'quv markazi uchun yangi kurs guruhi va o'qituvchini biriktirish";
    },
    modalIcon() {
      if (this.tenantStore.isSchool) return "solar:square-academic-cap-bold";
      if (this.tenantStore.isKindergarten) return "solar:users-group-two-rounded-bold";
      return "solar:folder-with-files-bold";
    },
    namePlaceholder() {
      if (this.tenantStore.isSchool) return "Masalan: 1-D yoki 7-B";
      if (this.tenantStore.isKindergarten) return "Masalan: Erkatoy guruhi";
      return "Masalan: Frontend Bootcamp #2";
    },
    stageFieldLabel() {
      if (this.tenantStore.isSchool) return "Parallel / Bosqich";
      if (this.tenantStore.isKindergarten) return "Yosh guruhi";
      return "Yo'nalish / Modul";
    },
  },
  watch: {
    modelValue(isOpen) {
      if (isOpen) {
        this.resetDefaults();
      }
    },
  },
  methods: {
    clearFieldError(field) {
      if (this.formErrors && this.formErrors[field]) {
        delete this.formErrors[field];
      }
    },
    resetDefaults() {
      this.formErrors = {};
      if (this.tenantStore.isSchool) {
        this.form = {
          name: "",
          parallel: "1",
          teacherName: "",
          capacity: 25,
          plan: 1000000000,
        };
      } else if (this.tenantStore.isKindergarten) {
        this.form = {
          name: "",
          parallel: "Kichik guruh",
          teacherName: "",
          capacity: 20,
          plan: 60000000,
        };
      } else {
        this.form = {
          name: "",
          parallel: "Dasturlash",
          teacherName: "",
          capacity: 18,
          plan: 36000000,
        };
      }
    },
    formatMoney(val) {
      if (!val) return "0 UZS";
      return new Intl.NumberFormat("uz-UZ").format(val) + " UZS";
    },
    handleClose() {
      this.formErrors = {};
      this.$emit("update:modelValue", false);
    },
    handleSubmit() {
      const validation = validateForm(this.form, classValidationRules);
      if (!validation.isValid) {
        this.formErrors = validation.errors;
        toast.error(validation.firstError || `Iltimos, ${this.tenantStore.classLabel.toLowerCase()} ma'lumotlarini to'g'ri to'ldiring`);
        return;
      }
      this.formErrors = {};

      const slugId = this.form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      let stageLabel = this.form.parallel;
      if (this.tenantStore.isSchool) {
        stageLabel = `${this.form.parallel}-bosqich`;
      } else if (this.tenantStore.isKindergarten) {
        const ages = {
          "Yasli": "2-3 yosh",
          "Kichik guruh": "3-4 yosh",
          "O'rta guruh": "4-5 yosh",
          "Katta guruh": "5-6 yosh",
          "Tayyorlov": "6-7 yosh",
        };
        const ageTxt = ages[this.form.parallel] ? ` (${ages[this.form.parallel]})` : "";
        stageLabel = `${this.form.parallel}${ageTxt}`;
      }

      const newCls = {
        id: slugId || `cls-${Date.now()}`,
        name: this.form.name.trim(),
        academicYear: "2025-2026",
        parallel: String(this.form.parallel || "1"),
        stageLabel: stageLabel,
        studentsCount: 0,
        capacity: Number(this.form.capacity) || 20,
        plan: Number(this.form.plan) || 0,
        fact: 0,
        teacherName: (this.form.teacherName || "").trim(),
      };

      this.$emit("created", newCls);
      this.handleClose();
    },
  },
};
</script>
