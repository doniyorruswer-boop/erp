<template>
  <Vmodal
    :model-value="modelValue"
    title="Darsni tahrirlash"
    subtitle="Mavjud dars ma'lumotlarini yangilash"
    icon="solar:pen-new-square-bold"
    icon-bg-class="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
    width="max-w-xl"
    :hide-button="true"
    @update:model-value="handleClose"
  >
    <template #body>
      <form class="space-y-4 text-left p-1 font-lexend" @submit.prevent="handleSave">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <!-- 1. Dars sanasi (Disabled: dars jadvali katakchasiga qat'iy biriktirilgan) -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Dars sanasi <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <Icon
                icon="solar:calendar-bold"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"
              />
              <input
                :value="form.date"
                type="text"
                disabled
                class="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 outline-none transition font-medium shadow-2xs cursor-not-allowed select-none opacity-80"
              />
            </div>
          </div>

          <!-- 2. Dars soati (Disabled: dars jadvali katakchasiga qat'iy biriktirilgan) -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Dars soati <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <Icon
                icon="solar:clock-circle-bold"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"
              />
              <input
                :value="formattedPeriodTime"
                type="text"
                disabled
                class="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 outline-none transition font-medium shadow-2xs cursor-not-allowed select-none opacity-80"
              />
            </div>
          </div>

          <!-- 3. Auditoriya (Xona) -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Auditoriya
            </label>
            <div class="relative">
              <Icon
                icon="solar:buildings-2-bold"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"
              />
              <select
                v-model="form.room"
                class="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition font-medium shadow-2xs appearance-none cursor-pointer"
              >
                <option value="">Tanlang</option>
                <option v-for="r in roomsList" :key="r.id" :value="r.name">
                  {{ r.name }}
                </option>
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"
              />
            </div>
          </div>

          <!-- 4. Fan nomi -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Fan <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <Icon
                icon="solar:book-bookmark-bold"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"
              />
              <select
                v-model="form.subject"
                required
                class="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition font-medium shadow-2xs appearance-none cursor-pointer"
              >
                <option value="">Tanlang</option>
                <option v-for="s in subjectsList" :key="s.id" :value="s.name">
                  {{ s.name }}
                </option>
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"
              />
            </div>
          </div>

          <!-- 5. Dars turi -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Dars turi
            </label>
            <div class="relative">
              <Icon
                icon="solar:tag-bold"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"
              />
              <select
                v-model="form.lessonType"
                class="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition font-medium shadow-2xs appearance-none cursor-pointer"
              >
                <option value="Asosiy">Asosiy</option>
                <option value="To'garak">To'garak</option>
                <option value="Fakultativ">Fakultativ</option>
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"
              />
            </div>
          </div>

          <!-- 6. O'quv guruhi -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
              O'quv guruhi
            </label>
            <div class="relative">
              <Icon
                icon="solar:users-group-two-rounded-bold"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"
              />
              <select
                v-model="form.group"
                class="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition font-medium shadow-2xs appearance-none cursor-pointer"
              >
                <option value="Umumiy guruh">Umumiy guruh</option>
                <option value="1-guruh">1-guruh</option>
                <option value="2-guruh">2-guruh</option>
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"
              />
            </div>
          </div>

          <!-- 7. O'qituvchi (2 ustun) -->
          <div class="sm:col-span-2 space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
              O'qituvchi
            </label>
            <div class="relative">
              <Icon
                icon="solar:user-bold"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"
              />
              <select
                v-model="form.teacher"
                class="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition font-medium shadow-2xs appearance-none cursor-pointer"
              >
                <option value="">Tanlang</option>
                <option v-for="t in teachersList" :key="t.id" :value="t.name">
                  {{ t.name }} ({{ t.subject }})
                </option>
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"
              />
            </div>
          </div>
        </div>

        <!-- 8. Dars holati (4-rasm) -->
        <div class="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
            Dars holati
          </label>

          <!-- Hozirgi holat nishoni -->
          <div
            class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between"
          >
            <div>
              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
                Hozirgi holat
              </span>
              <span class="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {{ form.status || "Rejalashtirilgan" }}
              </span>
            </div>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <!-- Holat o'zgartirish -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Holat o'zgartirish
            </label>
            <div class="relative">
              <Icon
                icon="solar:check-square-bold"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"
              />
              <select
                v-model="form.status"
                class="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition font-medium shadow-2xs appearance-none cursor-pointer"
              >
                <option value="Rejalashtirilgan">Rejalashtirilgan</option>
                <option value="O'tildi">O'tildi</option>
                <option value="Qoldirildi">Qoldirildi</option>
              </select>
              <Icon
                icon="solar:alt-arrow-down-linear"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"
              />
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex items-center justify-end gap-2.5 w-full">
        <AppButton variant="secondary" @click="handleClose"> Bekor qilish </AppButton>
        <AppButton variant="primary" icon="solar:diskette-bold" @click="handleSave">
          Saqlash
        </AppButton>
      </div>
    </template>
  </Vmodal>
</template>

<script>
import { Icon } from "@iconify/vue";

import AppButton from "@/components/common/AppButton.vue";
import vmodal from "@/components/common/AppModal.vue";

export default {
  name: "ClassLessonEditModal",
  components: {
    Icon,
    vmodal,
    AppButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    day: {
      type: Object,
      default: null,
    },
    period: {
      type: Object,
      default: null,
    },
    lesson: {
      type: Object,
      default: null,
    },
    periodsList: {
      type: Array,
      default: () => [],
    },
    subjectsList: {
      type: Array,
      default: () => [],
    },
    teachersList: {
      type: Array,
      default: () => [],
    },
    roomsList: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue", "save"],
  data() {
    return {
      form: {
        date: "",
        time: "",
        room: "",
        subject: "",
        lessonType: "Asosiy",
        group: "Umumiy guruh",
        teacher: "",
        status: "Rejalashtirilgan",
      },
    };
  },
  computed: {
    formattedPeriodTime() {
      if (this.period) {
        return `${this.period.time} (${this.period.number}-dars)`;
      }
      return this.form.time || "";
    },
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.initForm();
      }
    },
    lesson() {
      if (this.modelValue) {
        this.initForm();
      }
    },
  },
  methods: {
    initForm() {
      this.form = {
        date: this.lesson?.date || this.day?.dateString || "",
        time: this.lesson?.time || this.period?.time || "",
        room: this.lesson?.room || "200-xona",
        subject: this.lesson?.subject || "",
        lessonType: this.lesson?.lessonType || "Asosiy",
        group: this.lesson?.group || "Umumiy guruh",
        teacher: this.lesson?.teacher || "",
        status: this.lesson?.status || "Rejalashtirilgan",
      };
    },
    handleClose() {
      this.$emit("update:modelValue", false);
    },
    handleSave() {
      if (!this.form.subject) return;
      this.$emit("save", {
        day: this.day,
        period: this.period,
        lesson: { ...this.form },
      });
      this.handleClose();
    },
  },
};
</script>
