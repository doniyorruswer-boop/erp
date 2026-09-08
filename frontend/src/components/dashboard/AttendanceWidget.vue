<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 font-lexend">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icon icon="solar:calendar-mark-bold" class="text-primary text-lg" />
          <span>Bugungi Davomat Tahlili</span>
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          O'quvchilar va tarbiyalanuvchilarning darslarga qatnashish darajasi
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="px-2.5 py-1 rounded-full text-xs font-bold"
          :class="rateBadgeClass"
        >
          {{ attendanceRate }}% Qatnashish
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <!-- Big Rate Box -->
      <div class="p-3.5 rounded-xl bg-gray-50/90 dark:bg-gray-700/40 border border-gray-200/80 dark:border-gray-700/60 flex flex-col justify-between">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          Umumiy ko'rsatkich
        </div>
        <div class="my-1.5 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-black text-gray-800 dark:text-gray-100">
            {{ attendanceRate }}%
          </span>
          <span class="text-xs text-gray-400 font-normal">
            ({{ summary.total || 0 }} ta yozuv)
          </span>
        </div>
        <!-- Mini progress bar -->
        <div class="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary rounded-full transition-all duration-500"
            :style="{ width: `${attendanceRate}%` }"
          ></div>
        </div>
      </div>

      <!-- Kelganlar (Present) -->
      <div class="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Kelganlar</span>
          <Icon icon="solar:check-circle-bold" class="text-emerald-500 text-base" />
        </div>
        <div class="mt-2 text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
          {{ summary.present || 0 }}
          <span class="text-xs font-normal text-emerald-600/80">ta o'quvchi</span>
        </div>
        <div class="text-[11px] text-emerald-600/90 dark:text-emerald-400/80 mt-1 font-medium">
          {{ calculatePercent(summary.present) }}% qatnashgan
        </div>
      </div>

      <!-- Kechikkanlar (Late) -->
      <div class="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-amber-800 dark:text-amber-300">Kechikkanlar</span>
          <Icon icon="solar:clock-circle-bold" class="text-amber-500 text-base" />
        </div>
        <div class="mt-2 text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400">
          {{ summary.late || 0 }}
          <span class="text-xs font-normal text-amber-600/80">ta o'quvchi</span>
        </div>
        <div class="text-[11px] text-amber-600/90 dark:text-amber-400/80 mt-1 font-medium">
          {{ calculatePercent(summary.late) }}% darsga kechikkan
        </div>
      </div>

      <!-- Kelmaganlar (Absent) -->
      <div class="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/50 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-rose-800 dark:text-rose-300">Kelmaganlar</span>
          <Icon icon="solar:close-circle-bold" class="text-rose-500 text-base" />
        </div>
        <div class="mt-2 text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400">
          {{ summary.absent || 0 }}
          <span class="text-xs font-normal text-rose-600/80">ta o'quvchi</span>
        </div>
        <div class="text-[11px] text-rose-600/90 dark:text-rose-400/80 mt-1 font-medium">
          {{ calculatePercent(summary.absent) }}% darsda qatnashmadi
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AttendanceWidget",
  components: {
    Icon,
  },
  props: {
    summary: {
      type: Object,
      default: () => ({
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        rate: 0,
      }),
    },
  },
  computed: {
    attendanceRate() {
      if (this.summary?.rate !== undefined && this.summary.rate !== null) {
        return Number(this.summary.rate);
      }
      const total = this.summary?.total || 0;
      if (total === 0) return 0;
      const present = (this.summary?.present || 0) + (this.summary?.late || 0);
      return Math.round((present / total) * 100);
    },
    rateBadgeClass() {
      const rate = this.attendanceRate;
      if (rate >= 90) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
      if (rate >= 75) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
    },
  },
  methods: {
    calculatePercent(count) {
      const total = this.summary?.total || 0;
      if (!total || !count) return 0;
      return Math.round((count / total) * 100);
    },
  },
};
</script>
