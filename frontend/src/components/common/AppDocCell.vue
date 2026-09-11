<template>
  <div class="inline-flex flex-col text-xs whitespace-nowrap select-none leading-tight">
    <div class="font-semibold text-gray-800 dark:text-gray-200">
      {{ doc || "—" }}
    </div>
    <div v-if="pinfl" class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 tracking-tight">
      {{ pinfl }}
    </div>
  </div>
</template>

<script>
export default {
  name: "AppDocCell",
  props: {
    doc: {
      type: String,
      default: "",
    },
    pinfl: {
      type: [String, Number],
      default: "",
    },
  },
};
</script>
