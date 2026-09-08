<template>
  <div class="space-y-5">
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 class="font-bold text-lg text-gray-900 dark:text-white">
            {{ classInfo.name }} haftalik dars jadvali
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">1-smena: 08:00 dan 12:10 gacha bo'lgan dars soatlari</p>
        </div>
        <button
          type="button"
          @click="$emit('edit')"
          class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold flex items-center gap-2 border dark:border-gray-600 cursor-pointer transition"
        >
          <Icon icon="solar:pen-bold" class="text-sm" />
          <span>Tahrirlash</span>
        </button>
      </div>

      <!-- Haftalik jadval paneli -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 text-sm">
        <div
          v-for="(day, dIdx) in weekDays"
          :key="dIdx"
          class="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3.5 border border-gray-200 dark:border-gray-700/60 space-y-2.5"
        >
          <div class="font-bold text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700 flex items-center justify-between">
            <span>{{ day.name }}</span>
            <span class="text-xs text-gray-400">{{ day.lessons.length }} soat</span>
          </div>
          <div class="space-y-2">
            <div
              v-for="(ls, lIdx) in day.lessons"
              :key="lIdx"
              class="p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xs"
            >
              <div class="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm truncate">{{ ls.subject }}</div>
              <div class="text-xs text-gray-400 truncate mt-0.5">{{ ls.teacher }}</div>
              <div class="text-xs text-primary font-semibold mt-1">{{ ls.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "SchoolClassTimetableTab",
  components: {
    Icon,
  },
  props: {
    classInfo: {
      type: Object,
      required: true,
    },
    weekDays: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["edit"],
};
</script>
