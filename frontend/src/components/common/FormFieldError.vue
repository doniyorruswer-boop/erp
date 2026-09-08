<template>
  <div
    v-if="error"
    class="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium select-none animate-fade-in"
  >
    <Icon icon="solar:danger-circle-bold" class="w-3.5 h-3.5 shrink-0 text-rose-500" />
    <span>{{ error }}</span>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "FormFieldError",
  components: { Icon },
  props: {
    error: {
      type: String,
      default: "",
    },
  },
};
</script>

<style scoped>
.animate-fade-in {
  animation: errorFadeIn 0.15s ease-out;
}
@keyframes errorFadeIn {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
