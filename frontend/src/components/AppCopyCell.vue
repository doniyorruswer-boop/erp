<template>
  <AppCopyCell v-bind="$attrs" />
</template>
<script>
import AppCopyCell from "@/components/common/AppCopyCell.vue";
export default { name: "AppCopyCellRoot", components: { AppCopyCell } };
</script>
