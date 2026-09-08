<template>
  <AppMoneyCell v-bind="$attrs" />
</template>
<script>
import AppMoneyCell from "@/components/common/AppMoneyCell.vue";
export default { name: "AppMoneyCellRoot", components: { AppMoneyCell } };
</script>
