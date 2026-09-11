<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 font-lexend flex flex-col justify-between"
  >
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Icon icon="solar:danger-triangle-bold" class="text-rose-500 text-lg" />
            <span>Top-5 qarzdorlik bo'yicha</span>
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Eng katta muddati o'tgan to'lovlar
          </p>
        </div>
        <RouterLink
          to="/finance"
          class="text-xs sm:text-sm font-semibold text-primary hover:opacity-80 flex items-center gap-1 shrink-0"
        >
          <span>Barchasi</span>
          <Icon icon="solar:alt-arrow-right-bold" class="text-xs" />
        </RouterLink>
      </div>

      <!-- Debtors List with Sleek Proportion Bars -->
      <div
        v-if="debtorsList.length === 0"
        class="py-8 text-center text-gray-400 dark:text-gray-500 text-xs"
      >
        Hozirda qarzdor o'quvchilar mavjud emas
      </div>
      <div v-else class="space-y-3 pt-3">
        <div v-for="(d, idx) in debtorsList" :key="idx" class="group space-y-1">
          <div class="flex items-center justify-between text-sm">
            <div class="min-w-0 pr-2">
              <span
                class="font-semibold text-gray-800 dark:text-gray-200 block truncate group-hover:text-rose-600 transition"
              >
                {{ d.name }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 block truncate">
                {{ d.className }} <span v-if="d.phone">· {{ d.phone }}</span>
              </span>
            </div>
            <div class="text-right shrink-0">
              <span class="font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base">
                -{{ formatUZS(d.amount) }}
              </span>
            </div>
          </div>

          <!-- Horizontal Visual Bar (Clean & Sleek) -->
          <div class="h-2 w-full bg-gray-100 dark:bg-gray-700/60 rounded-full overflow-hidden">
            <div
              class="h-full bg-rose-500 rounded-full transition-all duration-500"
              :style="{
                width: `${Math.min(100, Math.max(8, Math.round((d.amount / maxDebt) * 100)))}%`,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action / Summary Footer -->
    <div
      class="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs sm:text-sm"
    >
      <span class="text-gray-600 dark:text-gray-400 font-medium">Jami Top-5 qarz:</span>
      <span class="font-bold text-rose-600 text-sm sm:text-base">
        -{{ formatUZS(totalTopDebt) }}
      </span>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { formatUZS } from "@/helper/formatters";

export default {
  name: "TopDebtorsWidget",
  components: { Icon },
  props: {
    debtors: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    debtorsList() {
      return this.debtors && this.debtors.length > 0 ? this.debtors.slice(0, 5) : [];
    },
    maxDebt() {
      if (!this.debtorsList.length) return 1;
      return Math.max(...this.debtorsList.map((d) => d.amount || 0));
    },
    totalTopDebt() {
      return this.debtorsList.reduce((acc, d) => acc + (d.amount || 0), 0);
    },
  },
  methods: {
    formatUZS,
  },
};
</script>
