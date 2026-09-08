<template>
  <AppDateCell v-bind="$attrs" />
</template>
<script>
import AppDateCell from "@/components/common/AppDateCell.vue";
export default { name: "AppDateCellRoot", components: { AppDateCell } };
</script>
