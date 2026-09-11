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
  totalEnrolled: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
    <StatsCard
      title="Jami Guruhlar"
      :value="`${totalCount} ta`"
      icon="ri:team-fill"
      variant="primary"
    />
    <StatsCard
      title="Faol Guruhlar"
      :value="`${activeCount} ta`"
      icon="solar:check-circle-bold"
      variant="success"
      value-class="text-green-600 dark:text-green-400"
    />
    <StatsCard
      title="Yozilgan O'quvchilar"
      :value="`${totalEnrolled} ta`"
      icon="ph:student-fill"
      variant="purple"
      value-class="text-primary"
    />
  </div>
</template>
