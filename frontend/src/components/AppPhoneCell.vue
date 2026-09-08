<template>
  <AppPhoneCell v-bind="$attrs" />
</template>
<script>
import AppPhoneCell from "@/components/common/AppPhoneCell.vue";
export default { name: "AppPhoneCellRoot", components: { AppPhoneCell } };
</script>
