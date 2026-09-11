<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 font-lexend"
  >
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icon icon="solar:chart-2-bold" class="text-primary text-lg" />
          <span>Oylar kesimida kutilayotgan to'lovlar</span>
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Belgilangan reja va haqiqatda qabul qilingan o'quv to'lovlari taqqoslanmasi
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
        >
          {{ academicYear }}
        </span>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="relative pt-2">
      <!-- Y-Axis Labels & Grid Lines -->
      <div
        class="absolute inset-x-0 top-2 bottom-8 flex flex-col justify-between pointer-events-none"
      >
        <div
          v-for="(level, idx) in yLevels"
          :key="idx"
          class="flex items-center gap-2 w-full text-xs font-medium text-gray-400"
        >
          <span class="w-14 text-right shrink-0">{{ level.label }}</span>
          <div class="w-full border-b border-gray-100 dark:border-gray-700/60"></div>
        </div>
      </div>

      <!-- Bars Area -->
      <div class="pl-16 pr-3 h-52 flex items-end justify-between gap-1.5 sm:gap-3 relative z-10">
        <div
          v-for="item in chartList"
          :key="item.month"
          class="flex-1 flex flex-col items-center gap-1.5 group relative cursor-pointer"
          @mouseenter="hoveredMonth = item"
          @mouseleave="hoveredMonth = null"
        >
          <!-- Hover Tooltip -->
          <div
            v-if="hoveredMonth && hoveredMonth.month === item.month"
            class="absolute -top-24 left-1/2 -translate-x-1/2 z-30 bg-gray-900/95 text-white text-xs rounded-lg p-2.5 shadow-lg border border-gray-700 pointer-events-none min-w-[160px]"
          >
            <div
              class="font-bold text-amber-400 border-b border-gray-700/80 pb-1 mb-1.5 flex items-center justify-between"
            >
              <span>{{ item.fullMonth }}</span>
              <span class="text-[10px] text-gray-300 font-normal">{{ academicYear }}</span>
            </div>
            <div class="space-y-1 text-xs">
              <div class="flex items-center justify-between gap-3 text-slate-300">
                <span>Reja:</span>
                <span class="font-bold">{{ formatUZS(item.expected) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3 text-primary">
                <span>Yig'ildi:</span>
                <span class="font-bold">{{ formatUZS(item.collected) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3 text-rose-400">
                <span>Qarzdorlar:</span>
                <span class="font-bold">{{ item.debtors }} ta</span>
              </div>
            </div>
            <div
              class="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"
            ></div>
          </div>

          <!-- Double Bar Pair -->
          <div
            class="w-full flex items-end justify-center gap-1 h-40 bg-gray-50/70 dark:bg-gray-700/20 rounded-md p-1 group-hover:bg-gray-100/80 dark:group-hover:bg-gray-700/40 transition"
          >
            <!-- Expected / Plan Bar (Slate) -->
            <div
              class="w-1/2 max-w-[11px] bg-slate-400 dark:bg-slate-500 rounded-t-xs transition-all duration-300 group-hover:brightness-110"
              :style="{ height: `${Math.min(100, Math.max(8, (item.expected / maxVal) * 100))}%` }"
              :title="`Reja: ${formatUZS(item.expected)}`"
            ></div>

            <!-- Collected / Fact Bar (Project Primary Theme Color) -->
            <div
              class="w-1/2 max-w-[11px] bg-primary rounded-t-xs transition-all duration-300 group-hover:brightness-110"
              :style="{ height: `${Math.min(100, Math.max(6, (item.collected / maxVal) * 100))}%` }"
              :title="`Yig'ildi: ${formatUZS(item.collected)}`"
            ></div>
          </div>

          <!-- Debtors Indicator Dot -->
          <div class="flex items-center justify-center">
            <span
              class="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125"
              :class="item.debtors > 100 ? 'bg-rose-500' : 'bg-amber-500'"
              :title="`Qarzdorlar: ${item.debtors} ta`"
            ></span>
          </div>

          <!-- Month Label -->
          <span
            :class="[
              'text-xs sm:text-sm font-semibold transition block',
              item.isCurrent
                ? 'text-primary font-bold'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white',
            ]"
          >
            {{ item.month }}
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom Legend -->
    <div
      class="flex items-center justify-center gap-5 pt-3 border-t border-gray-100 dark:border-gray-700/60 text-xs sm:text-sm font-medium flex-wrap"
    >
      <div class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
        <span class="w-2.5 h-2.5 rounded-xs bg-slate-400"></span>
        <span>Kutilmoqda (Reja)</span>
      </div>
      <div class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
        <span class="w-2.5 h-2.5 rounded-xs bg-primary"></span>
        <span>Haqiqatda yig'ildi (Fakt)</span>
      </div>
      <div class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
        <span class="w-2 h-2 rounded-full bg-rose-500"></span>
        <span>Qarzdorlar soni</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { formatUZS } from "@/helper/formatters";

export default {
  name: "MonthlyRevenueChartWidget",
  components: { Icon },
  props: {
    academicYear: {
      type: String,
      default: "2025-2026",
    },
    monthlyData: {
      type: Array,
      default: () => [
        {
          month: "Avg",
          fullMonth: "Avgust",
          expected: 59700400,
          collected: 4700000,
          debtors: 4,
          isCurrent: false,
        },
        {
          month: "Sen",
          fullMonth: "Sentabr",
          expected: 1523280400,
          collected: 1242116000,
          debtors: 85,
          isCurrent: false,
        },
        {
          month: "Okt",
          fullMonth: "Oktabr",
          expected: 1619165400,
          collected: 1301618000,
          debtors: 120,
          isCurrent: true,
        },
        {
          month: "Noy",
          fullMonth: "Noyabr",
          expected: 1678855400,
          collected: 1366619000,
          debtors: 162,
          isCurrent: false,
        },
        {
          month: "Dek",
          fullMonth: "Dekabr",
          expected: 1766745400,
          collected: 1370003000,
          debtors: 110,
          isCurrent: false,
        },
        {
          month: "Yan",
          fullMonth: "Yanvar",
          expected: 1835835400,
          collected: 1450561000,
          debtors: 130,
          isCurrent: false,
        },
        {
          month: "Fev",
          fullMonth: "Fevral",
          expected: 1927720400,
          collected: 1503483000,
          debtors: 140,
          isCurrent: false,
        },
        {
          month: "Mar",
          fullMonth: "Mart",
          expected: 2015610400,
          collected: 1627093000,
          debtors: 125,
          isCurrent: false,
        },
        {
          month: "Apr",
          fullMonth: "Aprel",
          expected: 2102795400,
          collected: 1640488000,
          debtors: 115,
          isCurrent: false,
        },
        {
          month: "May",
          fullMonth: "May",
          expected: 2204785400,
          collected: 1687741000,
          debtors: 95,
          isCurrent: false,
        },
      ],
    },
  },
  data() {
    return {
      hoveredMonth: null,
      maxVal: 2400000000,
      yLevels: [
        { label: "2.4 mlrd" },
        { label: "1.8 mlrd" },
        { label: "1.2 mlrd" },
        { label: "600 mln" },
        { label: "0 UZS" },
      ],
    };
  },
  computed: {
    chartList() {
      return this.monthlyData.map((d) => ({
        ...d,
        fullMonth: d.fullMonth || d.month,
      }));
    },
  },
  methods: {
    formatUZS,
  },
};
</script>
