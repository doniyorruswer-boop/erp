<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-lexend">
    <!-- 1. Oylik reja -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-2xs hover:shadow-xs transition flex items-center gap-3.5"
    >
      <!-- Icon on LEFT -->
      <div
        class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-2xl shrink-0"
      >
        <Icon icon="solar:wallet-money-bold" />
      </div>
      <!-- Text on Right -->
      <div class="min-w-0 flex-1">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
          Oylik reja
        </span>
        <h2
          class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white tracking-tight mt-0.5 truncate"
          :title="formatUZS(monthlyPlan)"
        >
          {{ formatUZS(monthlyPlan) }}
        </h2>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Belgilangan daromad rejasi</p>
      </div>
    </div>

    <!-- 2. Oy davomida yig'ildi -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-2xs hover:shadow-xs transition flex items-center gap-3.5"
    >
      <!-- Icon on LEFT -->
      <div
        class="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-2xl shrink-0"
      >
        <Icon icon="solar:dollar-minimalistic-bold" />
      </div>
      <!-- Text on Right -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-1">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
            Oy davomida yig'ildi
          </span>
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary shrink-0"
          >
            {{ planPercentage }}% rejadan
          </span>
        </div>
        <h2
          class="text-lg sm:text-xl font-bold text-primary tracking-tight mt-0.5 truncate"
          :title="formatUZS(collectedThisMonth)"
        >
          {{ formatUZS(collectedThisMonth) }}
        </h2>
        <p class="text-xs text-primary/80 mt-0.5 font-medium">Muvaffaqiyatli tushumlar</p>
      </div>
    </div>

    <!-- 3. Qarzdorlar -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-2xs hover:shadow-xs transition flex items-center gap-3.5"
    >
      <!-- Icon on LEFT -->
      <div
        class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-2xl shrink-0"
      >
        <Icon icon="solar:users-group-two-rounded-bold" />
      </div>
      <!-- Text on Right -->
      <div class="min-w-0 flex-1">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
          Qarzdorlar
        </span>
        <h2 class="text-xl sm:text-2xl font-bold text-amber-500 tracking-tight mt-0.5">
          {{ debtorsCount }} <span class="text-xs font-semibold text-gray-400">ta</span>
        </h2>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Qarzi mavjud o'quvchilar soni</p>
      </div>
    </div>

    <!-- 4. Qarz summasi -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-2xs hover:shadow-xs transition flex items-center gap-3.5"
    >
      <!-- Icon on LEFT -->
      <div
        class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-center text-2xl shrink-0"
      >
        <Icon icon="solar:graph-down-bold" />
      </div>
      <!-- Text on Right -->
      <div class="min-w-0 flex-1">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
          Qarz summasi
        </span>
        <h2
          class="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 tracking-tight mt-0.5 truncate"
          :title="formatUZS(totalDebt)"
        >
          {{ formatUZS(totalDebt) }}
        </h2>
        <p class="text-xs text-rose-500/80 dark:text-rose-400/80 mt-0.5">
          Undirilishi kutilayotgan qarz
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { formatUZS } from "@/helper/formatters";

export default {
  name: "FinancialKpiCards",
  components: { Icon },
  props: {
    monthlyPlan: {
      type: Number,
      default: 0,
    },
    collectedThisMonth: {
      type: Number,
      default: 0,
    },
    planPercentage: {
      type: Number,
      default: 0,
    },
    debtorsCount: {
      type: Number,
      default: 0,
    },
    totalDebt: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    formatUZS,
  },
};
</script>
