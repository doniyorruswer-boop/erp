<template>
  <div
    class="attendance-grid-card bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5 shadow-sm"
  >
    <!-- Header & Month Switcher -->
    <div
      class="flex items-center justify-between flex-wrap gap-3 pb-4 mb-4 border-b dark:border-gray-700"
    >
      <div class="flex items-center gap-2">
        <div
          class="p-2 rounded-lg bg-green-500/10 text-green-600 text-xl flex items-center justify-center"
        >
          <Icon icon="fluent:calendar-checkmark-24-filled" />
        </div>
        <div>
          <h3 class="text-base font-bold text-gray-800 dark:text-gray-100">Davomat Tarixi</h3>
          <p class="text-xs text-gray-400">Oylik darslarga qatnashish hisoboti</p>
        </div>
      </div>

      <!-- Month Selector -->
      <div class="flex items-center gap-2">
        <button
          class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition"
          @click="prevMonth"
        >
          <Icon icon="lucide:chevron-left" class="text-lg" />
        </button>
        <span
          class="text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-[130px] text-center capitalize"
        >
          {{ currentMonthName }} {{ currentYear }}
        </span>
        <button
          class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition"
          @click="nextMonth"
        >
          <Icon icon="lucide:chevron-right" class="text-lg" />
        </button>
      </div>
    </div>

    <!-- Stats Summary Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      <div
        class="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 text-center"
      >
        <span class="text-xs text-green-600 dark:text-green-400 font-medium block">Kelgan</span>
        <span class="text-lg font-bold text-green-700 dark:text-green-300"
          >{{ stats.present }} ta</span
        >
      </div>
      <div
        class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-center"
      >
        <span class="text-xs text-red-600 dark:text-red-400 font-medium block">Kelmagan</span>
        <span class="text-lg font-bold text-red-700 dark:text-red-300">{{ stats.absent }} ta</span>
      </div>
      <div
        class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-center"
      >
        <span class="text-xs text-amber-600 dark:text-amber-400 font-medium block">Sababli</span>
        <span class="text-lg font-bold text-amber-700 dark:text-amber-300"
          >{{ stats.excused }} ta</span
        >
      </div>
      <div
        class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 text-center"
      >
        <span class="text-xs text-blue-600 dark:text-blue-400 font-medium block">Davomat %</span>
        <span class="text-lg font-bold text-blue-700 dark:text-blue-300">{{ percentage }}%</span>
      </div>
    </div>

    <!-- Calendar Matrix Grid -->
    <div class="overflow-x-auto">
      <div class="min-w-[500px]">
        <!-- Days Header -->
        <div class="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-gray-400 mb-2">
          <span>Dush</span>
          <span>Sesh</span>
          <span>Chor</span>
          <span>Pay</span>
          <span>Juma</span>
          <span>Shan</span>
          <span>Yak</span>
        </div>

        <!-- Month Days Cells -->
        <div class="grid grid-cols-7 gap-1.5">
          <!-- Leading empty padding -->
          <div
            v-for="blank in leadingBlanks"
            :key="`blank-${blank}`"
            class="h-14 rounded-lg bg-gray-50/50 dark:bg-gray-900/30 border border-dashed border-gray-200 dark:border-gray-800"
          />

          <!-- Day cell -->
          <div
            v-for="day in daysInMonth"
            :key="`day-${day}`"
            :class="[
              'h-14 p-1.5 rounded-lg border flex flex-col justify-between transition text-xs relative group',
              getDayCellClass(day),
            ]"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ day }}</span>
              <span v-if="getDayRecord(day)" class="text-base">
                {{ getStatusIcon(getDayRecord(day).status) }}
              </span>
            </div>

            <div v-if="getDayRecord(day)" class="text-[10px] truncate font-medium">
              <span :class="getStatusTextClass(getDayRecord(day).status)">
                {{ getStatusText(getDayRecord(day).status) }}
              </span>
            </div>
            <div v-else class="text-[10px] text-gray-300 dark:text-gray-600">Dars yo'q</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AttendanceGrid",
  components: { Icon },
  props: {
    records: {
      type: Array,
      default: () => [],
      // Format: [{ date: '2026-08-01', status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE', group: 'IELTS-01' }]
    },
  },
  data() {
    const today = new Date();
    return {
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth(), // 0-indexed
    };
  },
  computed: {
    currentMonthName() {
      const date = new Date(this.currentYear, this.currentMonth, 1);
      return date.toLocaleDateString("uz-UZ", { month: "long" });
    },
    daysInMonth() {
      const numDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
      return Array.from({ length: numDays }, (_, i) => i + 1);
    },
    leadingBlanks() {
      // 0 = Sunday, 1 = Monday ... convert to Monday = 0
      const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
      const mondayOffset = (firstDay + 6) % 7;
      return mondayOffset;
    },
    recordsMap() {
      const map = {};
      this.records.forEach((rec) => {
        if (!rec.date) return;
        const d = new Date(rec.date);
        if (d.getFullYear() === this.currentYear && d.getMonth() === this.currentMonth) {
          map[d.getDate()] = rec;
        }
      });
      return map;
    },
    stats() {
      let present = 0;
      let absent = 0;
      let excused = 0;
      let late = 0;

      Object.values(this.recordsMap).forEach((r) => {
        if (r.status === "PRESENT") present++;
        else if (r.status === "ABSENT") absent++;
        else if (r.status === "EXCUSED") excused++;
        else if (r.status === "LATE") late++;
      });

      return { present, absent, excused, late, total: present + absent + excused + late };
    },
    percentage() {
      if (this.stats.total === 0) return 100;
      return Math.round(((this.stats.present + this.stats.late) / this.stats.total) * 100);
    },
  },
  methods: {
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear -= 1;
      } else {
        this.currentMonth -= 1;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear += 1;
      } else {
        this.currentMonth += 1;
      }
    },
    getDayRecord(day) {
      return this.recordsMap[day] || null;
    },
    getDayCellClass(day) {
      const rec = this.getDayRecord(day);
      if (!rec) return "bg-gray-50/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60";
      if (rec.status === "PRESENT")
        return "bg-green-50/80 dark:bg-green-950/20 border-green-300 dark:border-green-800";
      if (rec.status === "ABSENT")
        return "bg-red-50/80 dark:bg-red-950/20 border-red-300 dark:border-red-800";
      if (rec.status === "EXCUSED")
        return "bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800";
      return "bg-blue-50/80 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800";
    },
    getStatusIcon(status) {
      if (status === "PRESENT") return "✅";
      if (status === "ABSENT") return "❌";
      if (status === "EXCUSED") return "⚠️";
      if (status === "LATE") return "⏰";
      return "";
    },
    getStatusText(status) {
      if (status === "PRESENT") return "Keldi";
      if (status === "ABSENT") return "Kelmadi";
      if (status === "EXCUSED") return "Sababli";
      if (status === "LATE") return "Kechikdi";
      return "";
    },
    getStatusTextClass(status) {
      if (status === "PRESENT") return "text-green-600 dark:text-green-400";
      if (status === "ABSENT") return "text-red-600 dark:text-red-400";
      if (status === "EXCUSED") return "text-amber-600 dark:text-amber-400";
      return "text-blue-600 dark:text-blue-400";
    },
  },
};
</script>
