<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 font-lexend"
  >
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icon icon="solar:pie-chart-2-bold" class="text-rose-500 text-lg" />
          <span>Xarajatlar Tahlili</span>
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Operatsion, maosh va moddiy ta'minot xarajatlari
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-rose-600 dark:text-rose-400">
          Jami: {{ formatUZS(computedTotal) }}
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="categoryItems.length === 0"
      class="py-8 text-center text-gray-400 dark:text-gray-500 text-xs"
    >
      Ushbu davr uchun xarajatlar mavjud emas
    </div>

    <!-- Category List with Percentage Bars -->
    <div v-else class="space-y-3">
      <div v-for="c in categoryItems" :key="c.name" class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2 truncate">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <span class="font-bold text-gray-800 dark:text-gray-200 truncate">
              {{ c.name }}
            </span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="font-bold text-gray-800 dark:text-gray-100">
              {{ formatUZS(c.amount) }}
            </span>
            <span class="text-xs font-semibold text-gray-400 w-10 text-right">
              {{ c.percent }}%
            </span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-rose-500 rounded-full transition-all duration-300"
            :style="{ width: `${c.percent}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { formatUZS } from "@/helper/formatters";

export default {
  name: "ExpenseCategoriesWidget",
  components: {
    Icon,
  },
  props: {
    expenseCategories: {
      type: Object,
      default: () => ({
        labels: [],
        series: [],
      }),
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    computedTotal() {
      if (this.totalExpenses > 0) return this.totalExpenses;
      const series = this.expenseCategories?.series || [];
      return series.reduce((sum, val) => sum + Number(val || 0), 0);
    },
    categoryItems() {
      const labels = this.expenseCategories?.labels || [];
      const series = this.expenseCategories?.series || [];
      const total = this.computedTotal;

      return labels.map((name, idx) => {
        const amount = Number(series[idx] || 0);
        const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
        return {
          name,
          amount,
          percent,
        };
      });
    },
  },
  methods: {
    formatUZS,
  },
};
</script>
