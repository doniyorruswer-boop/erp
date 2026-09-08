<template>
  <AppGroupBadge v-bind="$attrs">
    <slot />
  </AppGroupBadge>
</template>
<script>
import AppGroupBadge from "@/components/common/AppGroupBadge.vue";
export default { name: "AppGroupBadgeRoot", components: { AppGroupBadge } };
</script>
