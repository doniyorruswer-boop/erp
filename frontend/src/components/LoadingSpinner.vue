<template>
  <LoadingSpinner v-bind="$props">
    <slot />
  </LoadingSpinner>
</template>

<script>
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";

export default {
  name: "Spinner",
  components: { LoadingSpinner },
  props: {
    size: { type: String, default: "md" },
    text: { type: String, default: "Yuklanmoqda..." },
    fullPage: { type: Boolean, default: false },
  },
};
</script>
