<script setup>
import StatsCard from "@/components/StatsCard.vue";

defineProps({
  totalIncome: {
    type: Number,
    default: 0,
  },
  monthlyIncome: {
    type: Number,
    default: 0,
  },
  debtorsCount: {
    type: Number,
    default: 0,
  },
});

const formatUZS = (val) => {
  if (val === undefined || val === null) return "0 so'm";
  return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
};
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
    <StatsCard
      title="Jami Kassa Tushumi"
      :value="formatUZS(totalIncome)"
      icon="solar:wallet-money-bold"
      variant="primary"
    />
    <StatsCard
      title="Joriy Oy Tushumi"
      :value="formatUZS(monthlyIncome)"
      icon="solar:chart-2-bold"
      variant="success"
      value-class="text-green-600 dark:text-green-400"
    />
    <StatsCard
      title="Qarzdor O'quvchilar"
      :value="`${debtorsCount} ta`"
      icon="solar:danger-triangle-bold"
      variant="danger"
      value-class="text-red-600 dark:text-red-400"
    />
  </div>
</template>
