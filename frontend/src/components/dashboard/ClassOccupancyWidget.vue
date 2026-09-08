<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 font-lexend">
    <!-- Header with 4 Summary Pills -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100">
          Sinflar / Xonalar to'lganligi
        </h3>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Sinflar va auditoriyalar to'lganlik darajasi hamda bo'sh o'rinlar hisobi
        </p>
      </div>

      <!-- 4 Top KPI Badges in Uzbek (Dynamic from real classes) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div class="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/60">
          <span class="text-xs text-gray-500 dark:text-gray-400 block font-medium">Jami o'quvchilar</span>
          <span class="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">{{ totalStudents }} ta</span>
        </div>
        <div class="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/60">
          <span class="text-xs text-gray-500 dark:text-gray-400 block font-medium">Sinflar sig'imi</span>
          <span class="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">{{ totalStudents }}/{{ totalCapacity }}</span>
        </div>
        <div class="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/60">
          <span class="text-xs text-gray-500 dark:text-gray-400 block font-medium">Bo'sh o'rinlar</span>
          <span class="font-bold text-primary text-sm sm:text-base">{{ freeSeats }} ta</span>
        </div>
        <div class="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/60">
          <span class="text-xs text-gray-500 dark:text-gray-400 block font-medium">Filial quvvati</span>
          <span class="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">{{ totalStudents }}/{{ totalCapacity }} <span class="text-xs text-gray-400 font-normal">(+{{ freeSeats }})</span></span>
        </div>
      </div>
    </div>

    <!-- Empty state if no groups -->
    <div v-if="classes.length === 0" class="py-8 text-center text-gray-400 dark:text-gray-500 text-xs">
      Hozircha guruhlar ro'yxati mavjud emas
    </div>

    <!-- Class Cards Grid (Responsive up to 6 columns) -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
      <div
        v-for="c in classes"
        :key="c.id || c.name"
        class="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/30 border border-gray-200/80 dark:border-gray-700/60 space-y-1.5 hover:border-primary/50 transition"
      >
        <div class="flex items-center justify-between text-sm font-semibold">
          <span class="text-gray-800 dark:text-gray-100 truncate" :title="c.name">{{ c.name }}</span>
          <span
            :class="[
              'text-xs sm:text-sm font-bold shrink-0 ml-1',
              c.count > c.capacity ? 'text-primary' : c.count === 0 ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
            ]"
          >
            {{ c.count }}/{{ c.capacity }}
          </span>
        </div>
        <!-- Colored Progress Line underneath -->
        <div class="h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="c.color || 'bg-primary'"
            :style="{ width: `${c.capacity > 0 ? Math.min(100, Math.round((c.count / c.capacity) * 100)) : 0}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClassOccupancyWidget",
  props: {
    classes: {
      type: Array,
      default: () => [],
    },
    summary: {
      type: Object,
      default: () => null,
    },
  },
  computed: {
    totalStudents() {
      if (this.summary?.totalStudents !== undefined) return this.summary.totalStudents;
      return this.classes.reduce((acc, c) => acc + (c.count || 0), 0);
    },
    totalCapacity() {
      if (this.summary?.totalCapacity !== undefined) return this.summary.totalCapacity;
      return this.classes.reduce((acc, c) => acc + (c.capacity || 0), 0);
    },
    freeSeats() {
      if (this.summary?.freeSeats !== undefined) return this.summary.freeSeats;
      return Math.max(0, this.totalCapacity - this.totalStudents);
    },
  },
};
</script>
