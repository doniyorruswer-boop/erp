<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 font-lexend"
  >
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icon icon="solar:card-transfer-bold" class="text-primary text-lg" />
          <span>To'lov Usullari Taqsimoti</span>
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Tushumlarning to'lov tizimlari va vositalari bo'yicha ulushi
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-700 dark:text-gray-300">
          Jami: {{ formatUZS(totalAmount) }}
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="methodItems.length === 0"
      class="py-8 text-center text-gray-400 dark:text-gray-500 text-xs"
    >
      To'lov usullari bo'yicha ma'lumotlar mavjud emas
    </div>

    <!-- Methods List with Visual Bars -->
    <div v-else class="space-y-3">
      <div v-for="m in methodItems" :key="m.label" class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="m.colorDot"></span>
            <span class="font-bold text-gray-800 dark:text-gray-200">
              {{ m.name }}
            </span>
            <span class="text-gray-400 dark:text-gray-500 text-[11px]">
              ({{ m.count }} ta tranzaksiya)
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-gray-800 dark:text-gray-100">
              {{ formatUZS(m.amount) }}
            </span>
            <span class="text-xs font-semibold text-gray-400 w-10 text-right">
              {{ m.percent }}%
            </span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="m.colorBar"
            :style="{ width: `${m.percent}%` }"
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
  name: "PaymentMethodsWidget",
  components: {
    Icon,
  },
  props: {
    paymentMethods: {
      type: Object,
      default: () => ({
        labels: [],
        series: [],
        counts: [],
      }),
    },
  },
  computed: {
    totalAmount() {
      const series = this.paymentMethods?.series || [];
      return series.reduce((sum, val) => sum + Number(val || 0), 0);
    },
    methodItems() {
      const labels = this.paymentMethods?.labels || [];
      const series = this.paymentMethods?.series || [];
      const counts = this.paymentMethods?.counts || [];
      const total = this.totalAmount;

      const methodNames = {
        CASH: "Naqd pul",
        CARD: "Karta (Terminal)",
        PAYME: "Payme",
        CLICK: "Click",
        BANK: "Bank o'tkazmasi",
        UZUM: "Uzum Bank",
      };

      const methodColors = {
        CASH: { dot: "bg-emerald-500", bar: "bg-emerald-500" },
        CARD: { dot: "bg-blue-600", bar: "bg-blue-600" },
        PAYME: { dot: "bg-cyan-500", bar: "bg-cyan-500" },
        CLICK: { dot: "bg-indigo-600", bar: "bg-indigo-600" },
        BANK: { dot: "bg-amber-500", bar: "bg-amber-500" },
      };

      return labels.map((label, idx) => {
        const amount = Number(series[idx] || 0);
        const count = Number(counts[idx] || 0);
        const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
        const color = methodColors[label] || { dot: "bg-primary", bar: "bg-primary" };

        return {
          label,
          name: methodNames[label] || label,
          amount,
          count,
          percent,
          colorDot: color.dot,
          colorBar: color.bar,
        };
      });
    },
  },
  methods: {
    formatUZS,
  },
};
</script>
