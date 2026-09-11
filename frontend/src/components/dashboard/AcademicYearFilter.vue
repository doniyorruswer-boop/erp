<template>
  <div
    v-click-outside="closeDropdown"
    class="academic-year-filter relative inline-block font-lexend"
  >
    <!-- Trigger Button (Matches User Screenshot) -->
    <button
      type="button"
      class="flex items-center justify-between gap-3 px-3.5 py-1.5 sm:py-2 rounded-lg border-2 border-teal-600 dark:border-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition cursor-pointer shadow-2xs min-w-[130px]"
      title="O'quv yili / Davrni tanlash"
      @click="isOpen = !isOpen"
    >
      <span class="tracking-wide">{{ modelValue }}</span>
      <Icon
        :icon="isOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'"
        class="text-xs text-gray-500 dark:text-gray-400 transition-transform duration-200"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-1.5 z-50 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 py-1 overflow-hidden"
      >
        <button
          v-for="year in years"
          :key="year"
          type="button"
          :class="[
            'w-full text-left px-3.5 py-2 text-xs sm:text-sm font-semibold transition flex items-center justify-between cursor-pointer',
            modelValue === year
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50',
          ]"
          @click="selectYear(year)"
        >
          <span>{{ year }}</span>
          <Icon
            v-if="modelValue === year"
            icon="solar:check-circle-bold"
            class="text-xs text-blue-600 dark:text-blue-400"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AcademicYearFilter",
  components: {
    Icon,
  },
  props: {
    modelValue: {
      type: String,
      default: "2025-2026",
    },
    years: {
      type: Array,
      default: () => ["2025-2026", "2028-2029", "2026-2027", "2024-2025", "2023-2024"],
    },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    closeDropdown() {
      this.isOpen = false;
    },
    selectYear(year) {
      this.$emit("update:modelValue", year);
      this.$emit("change", year);
      this.isOpen = false;
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
