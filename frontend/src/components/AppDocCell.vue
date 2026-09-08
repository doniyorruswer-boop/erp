<template>
  <AppDocCell v-bind="$attrs" />
</template>
<script>
import AppDocCell from "@/components/common/AppDocCell.vue";
export default { name: "AppDocCellRoot", components: { AppDocCell } };
</script>
