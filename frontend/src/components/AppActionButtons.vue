<template>
  <AppActionButtons v-bind="$attrs">
    <slot />
  </AppActionButtons>
</template>
<script>
import AppActionButtons from "@/components/common/AppActionButtons.vue";
export default { name: "AppActionButtonsRoot", components: { AppActionButtons } };
</script>
