<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 font-lexend"
  >
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icon icon="solar:clock-circle-bold" class="text-primary text-lg" />
          <span>Bugungi Dars va Mashg'ulotlar Jadvali</span>
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Auditoriyalar, sinflar va o'qituvchilar bo'yicha bugungi darslar taqvimi
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          {{ schedules.length }} ta dars
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="schedules.length === 0"
      class="py-8 text-center text-gray-400 dark:text-gray-500 text-xs flex flex-col items-center justify-center gap-1.5"
    >
      <Icon icon="solar:calendar-minimalistic-linear" class="text-2xl opacity-60" />
      <span>Bugun uchun rejalashtirilgan mashg'ulotlar mavjud emas</span>
    </div>

    <!-- Schedules Grid/List -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      <div
        v-for="s in schedules"
        :key="s.id"
        class="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/30 border border-gray-200/80 dark:border-gray-700/60 space-y-2 hover:border-primary/40 transition"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-bold text-gray-800 dark:text-gray-100 truncate max-w-[160px]"
            :title="s.groupName || s.title"
          >
            {{ s.groupName || s.title || "Guruh" }}
          </span>
          <span
            class="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0"
          >
            {{ formatTime(s.startAt) }} - {{ formatTime(s.endAt) }}
          </span>
        </div>

        <div
          class="grid grid-cols-2 gap-1 text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200/60 dark:border-gray-700/40"
        >
          <div class="flex items-center gap-1 truncate" :title="s.resourceName">
            <Icon icon="solar:home-2-linear" class="shrink-0 text-gray-400" />
            <span class="truncate">{{ s.resourceName || "Xonasiz" }}</span>
          </div>
          <div
            class="flex items-center gap-1 truncate text-right justify-end"
            :title="s.instructorName"
          >
            <Icon icon="solar:user-linear" class="shrink-0 text-gray-400" />
            <span class="truncate">{{ s.instructorName || "O'qituvchi" }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "TodayScheduleWidget",
  components: {
    Icon,
  },
  props: {
    schedules: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    formatTime(dt) {
      if (!dt) return "--:--";
      try {
        const d = new Date(dt);
        return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
      } catch (e) {
        return "--:--";
      }
    },
  },
};
</script>
