<script setup>
import StatsCard from "@/components/StatsCard.vue";

defineProps({
  totalCount: {
    type: Number,
    default: 0,
  },
  averagePrice: {
    type: Number,
    default: 0,
  },
});

const formatUZS = (val) => {
  if (!val) return "0 so'm";
  return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
};
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
    <StatsCard
      title="Jami Kurslar"
      :value="`${totalCount} ta`"
      icon="solar:book-bookmark-bold"
      variant="primary"
    />
    <StatsCard
      title="O'rtacha Narx"
      :value="formatUZS(averagePrice)"
      icon="solar:wallet-money-bold"
      variant="success"
      value-class="text-green-600 dark:text-green-400"
    />
    <StatsCard
      title="Faol Kurslar"
      :value="`${totalCount} ta`"
      icon="solar:check-circle-bold"
      variant="purple"
      value-class="text-primary"
    />
  </div>
</template>
