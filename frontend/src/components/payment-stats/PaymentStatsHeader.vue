<template>
  <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
    <!-- Chap tomon: Faqat Sarlavha -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">To'lovlar statistikasi</h1>
    </div>

    <!-- O'ng tomon: Dropdown komponenti & Kanban uslubidagi Tab switcher -->
    <div class="flex items-center gap-2.5 flex-wrap">
      <!-- 3-rasm: Standart Dropdown komponenti (kengligi moslashgan, qatorga sig'adigan) -->
      <Dropdown placement="right" width="w-64 min-w-max">
        <template #button>
          <div
            class="py-2 px-3.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 hover:border-primary flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <span>{{ selectedYearLabel }}</span>
            <Icon icon="solar:alt-arrow-down-linear" class="text-xs text-gray-400" />
          </div>
        </template>
        <template #content>
          <div class="py-1 min-w-[240px]">
            <div
              v-for="opt in yearOptions"
              :key="opt.value"
              :class="[
                'px-4 py-2.5 text-xs sm:text-sm cursor-pointer flex items-center justify-between gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition whitespace-nowrap',
                year === opt.value
                  ? 'text-primary font-bold bg-primary/5'
                  : 'text-gray-700 dark:text-gray-200',
              ]"
              @click="onYearChange(opt.value)"
            >
              <span>{{ opt.label }}</span>
              <Icon
                v-if="year === opt.value"
                icon="solar:check-circle-bold"
                class="text-primary text-sm shrink-0"
              />
            </div>
          </div>
        </template>
      </Dropdown>

      <!-- 1 & 2-rasm: Kanbandagi bir xil ko'rinishdagi Tab Switcher komponenti -->
      <div
        class="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-md border dark:border-gray-700 text-xs"
      >
        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5',
            tab === 'months'
              ? 'bg-white dark:bg-gray-700 text-primary shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-300',
          ]"
          @click="$emit('update:tab', 'months')"
        >
          <Icon icon="solar:calendar-bold" class="text-sm" />
          <span>Oylar bo'yicha</span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5',
            tab === 'classes'
              ? 'bg-white dark:bg-gray-700 text-primary shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-300',
          ]"
          @click="$emit('update:tab', 'classes')"
        >
          <Icon
            :icon="isSchool ? 'solar:buildings-3-bold' : 'solar:users-group-two-rounded-bold'"
            class="text-sm"
          />
          <span>{{ isSchool ? "Sinflar bo'yicha" : "Guruhlar bo'yicha" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import Dropdown from "@/components/Dropdown.vue";

export default {
  name: "PaymentStatsHeader",
  components: {
    Icon,
    Dropdown,
  },
  props: {
    tab: {
      type: String,
      default: "months",
    },
    year: {
      type: String,
      required: true,
    },
    yearOptions: {
      type: Array,
      default: () => [],
    },
    isSchool: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:tab", "update:year", "change-year"],
  computed: {
    selectedYearLabel() {
      const found = this.yearOptions.find((opt) => opt.value === this.year);
      return found ? found.label : this.year;
    },
  },
  methods: {
    onYearChange(val) {
      this.$emit("update:year", val);
      this.$emit("change-year", val);
    },
  },
};
</script>
