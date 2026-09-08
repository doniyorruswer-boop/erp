<template>
  <AppStatusBadge v-bind="$attrs" />
</template>
<script>
import AppStatusBadge from "@/components/common/AppStatusBadge.vue";
export default { name: "AppStatusBadgeRoot", components: { AppStatusBadge } };
</script>
