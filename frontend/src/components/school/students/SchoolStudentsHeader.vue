<script setup>
import AppButton from "@/components/common/AppButton.vue";
import PageTitle from "@/components/common/PageTitle.vue";

defineProps({
  totalCount: {
    type: Number,
    default: undefined,
  },
});

const emit = defineEmits(["export", "create"]);
</script>

<template>
  <div class="flex items-center justify-between flex-wrap gap-4 font-lexend">
    <div class="flex items-center gap-3 flex-wrap">
      <PageTitle size="md"> O'quvchilar </PageTitle>
      <span
        v-if="totalCount !== undefined"
        class="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold"
      >
        {{ totalCount }} ta
      </span>
    </div>

    <!-- Action Buttons (Export va Yangi o'quvchi) -->
    <div class="flex items-center gap-2.5 flex-wrap">
      <AppButton variant="outline" icon="solar:export-linear" @click="emit('export')">
        Export
      </AppButton>

      <AppButton variant="primary" icon="solar:user-plus-bold" @click="emit('create')">
        Yangi o'quvchi
      </AppButton>
    </div>
  </div>
</template>
