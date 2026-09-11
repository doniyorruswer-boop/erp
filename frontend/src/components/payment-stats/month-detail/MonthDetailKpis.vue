<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- KPI 1: Oylik Reja -->
    <div
      class="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between"
    >
      <div>
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block"
          >Oylik Reja</span
        >
        <span class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
          {{ formatUZS(metrics.plan) }}
        </span>
        <span class="text-xs text-gray-400 mt-1 block">Kutilayotgan umumiy reja</span>
      </div>
      <div
        class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shrink-0"
      >
        <Icon icon="solar:calendar-date-bold" />
      </div>
    </div>

    <!-- KPI 2: Faktik Tushum -->
    <div
      class="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between"
    >
      <div>
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block"
          >Faktik Tushum</span
        >
        <span
          class="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block"
        >
          {{ formatUZS(metrics.fact) }}
        </span>
        <div class="flex items-center gap-1.5 mt-1">
          <span
            class="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          >
            {{ metrics.percent }}% bajarildi
          </span>
        </div>
      </div>
      <div
        class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0"
      >
        <Icon icon="solar:wallet-money-bold" />
      </div>
    </div>

    <!-- KPI 3: Qarzdorlik -->
    <div
      class="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between"
    >
      <div>
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block"
          >Qarzdorlik</span
        >
        <span class="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
          {{ formatUZS(metrics.debt) }}
        </span>
        <span class="text-xs text-rose-500 font-medium mt-1 block">
          {{ debtorsCount }} ta o'quvchi to'lamagan
        </span>
      </div>
      <div
        class="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl shrink-0"
      >
        <Icon icon="solar:danger-triangle-bold" />
      </div>
    </div>

    <!-- KPI 4: Tranzaksiyalar soni -->
    <div
      class="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between"
    >
      <div>
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block"
          >Tranzaksiyalar soni</span
        >
        <span class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
          {{ transactionsCount }} ta to'lov
        </span>
        <span class="text-xs text-gray-400 mt-1 block">
          O'rtacha: {{ formatUZS(metrics.avgAmount) }}
        </span>
      </div>
      <div
        class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl shrink-0"
      >
        <Icon icon="solar:card-recive-bold" />
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { formatUZS } from "@/helper/formatters";

export default {
  name: "MonthDetailKpis",
  components: { Icon },
  props: {
    metrics: {
      type: Object,
      required: true,
    },
    debtorsCount: {
      type: Number,
      default: 0,
    },
    transactionsCount: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    formatUZS,
  },
};
</script>
