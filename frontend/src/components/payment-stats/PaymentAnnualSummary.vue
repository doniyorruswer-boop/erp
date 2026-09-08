<template>
  <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
    <!-- Chap qism: Belgisi va Ta'rif -->
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 text-xl shrink-0">
        <Icon icon="solar:chart-2-bold" />
      </div>
      <div>
        <h4 class="text-sm font-bold text-gray-800 dark:text-gray-100">
          O'quv yili bo'yicha jami to'lovlar
        </h4>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          10 oylik reja va amaldagi tushum nisbati
        </p>
      </div>
    </div>

    <!-- O'ng qism: 4 ta asosiy ko'rsatkichlar (responsive grid) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-sm">
      <div>
        <span class="text-gray-500 dark:text-gray-400 text-xs block">Yillik reja:</span>
        <span class="font-bold text-gray-900 dark:text-white tracking-tight">{{ formatUZS(summary.totalPlan) }}</span>
      </div>
      <div>
        <span class="text-gray-500 dark:text-gray-400 text-xs block">Amalda yig'ilgan:</span>
        <span class="font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{{ formatUZS(summary.totalFact) }}</span>
      </div>
      <div>
        <span class="text-gray-500 dark:text-gray-400 text-xs block">Umumiy ijro:</span>
        <span :class="['font-bold', percentTextColor]">{{ summary.overallPercent }}%</span>
      </div>
      <div>
        <span class="text-gray-500 dark:text-gray-400 text-xs block">Mavjud qarzdorlik:</span>
        <span :class="['font-bold tracking-tight', summary.totalDebt > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400']">
          {{ formatUZS(summary.totalDebt) }}
          <span v-if="summary.debtorsCount > 0" class="text-xs font-normal">({{ summary.debtorsCount }} nafar)</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "PaymentAnnualSummary",
  components: {
    Icon,
  },
  props: {
    summary: {
      type: Object,
      required: true,
    },
  },
  computed: {
    percentTextColor() {
      if (this.summary.overallPercent >= 80) return "text-emerald-500 dark:text-emerald-400";
      if (this.summary.overallPercent >= 50) return "text-amber-500 dark:text-amber-400";
      return "text-red-500 dark:text-red-400";
    },
  },
  methods: {
    formatUZS(val) {
      if (!val) return "0 so'm";
      return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
    },
  },
};
</script>
