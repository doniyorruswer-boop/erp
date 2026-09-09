<script setup>
import AppButton from "@/components/common/AppButton.vue";
import { useTerminology } from "@/composables/useTerminology";

const { term } = useTerminology();

defineProps({
  statusFilter: {
    type: String,
    default: "",
  },
});

defineEmits(["openWizard", "update:statusFilter"]);
</script>

<template>
  <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
    <div>
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
        {{ term("client", "plural") }}
      </h1>
      <p class="text-sm text-gray-400">
        Barcha {{ term("client", "plural").toLowerCase() }} ro'yxati va holati
      </p>
    </div>

    <div class="flex items-center gap-2.5">
      <AppButton
        variant="primary"
        icon="solar:user-plus-bold"
        icon-class="text-lg"
        @click="$emit('openWizard')"
      >
        Yangi {{ term("client", "singular") }} Qo'shish
      </AppButton>
    </div>
  </div>
</template>
