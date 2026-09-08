<template>
  <AppUserCell v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData" />
    </template>
  </AppUserCell>
</template>

<script>
import AppUserCell from "@/components/common/AppUserCell.vue";

export default {
  name: "AppUserCellRoot",
  components: {
    AppUserCell
  }
};
</script>
