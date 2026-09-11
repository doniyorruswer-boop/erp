<script setup>
import StatsCard from "@/components/StatsCard.vue";

defineProps({
  totalCount: {
    type: Number,
    default: 0,
  },
  activeCount: {
    type: Number,
    default: 0,
  },
  debtorsCount: {
    type: Number,
    default: 0,
  },
  totalBalance: {
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
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
    <StatsCard
      title="Jami O'quvchilar"
      :value="`${totalCount} ta`"
      icon="ph:student-fill"
      variant="primary"
    />
    <StatsCard
      title="Faol O'quvchilar"
      :value="`${activeCount} ta`"
      icon="ri:user-follow-fill"
      variant="success"
      value-class="text-green-600 dark:text-green-400"
    />
    <StatsCard
      title="Qarzdorlar"
      :value="`${debtorsCount} ta`"
      icon="solar:danger-triangle-bold"
      variant="danger"
      value-class="text-red-600 dark:text-red-400"
    />
    <StatsCard
      title="Umumiy Balans"
      :value="formatUZS(totalBalance)"
      icon="solar:wallet-money-bold"
      variant="purple"
      value-class="text-primary"
    />
  </div>
</template>
