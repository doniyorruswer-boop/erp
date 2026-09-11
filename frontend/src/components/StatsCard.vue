<template>
  <div
    class="stats-card-component card bg-white dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700 shadow-sm flex items-center justify-between font-lexend"
  >
    <div>
      <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">{{ title }}</p>
      <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1" :class="valueClass">
        {{ value }}
      </h3>
      <p v-if="subtext" class="text-[11px] text-gray-400 mt-0.5">{{ subtext }}</p>
    </div>
    <div v-if="icon" class="p-3 rounded-full text-2xl shrink-0" :class="iconBgColor">
      <Icon :icon="icon" />
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "StatsCard",
  components: { Icon },
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    subtext: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    variant: {
      type: String,
      default: "primary", // primary, success, danger, warning, purple, info
    },
    valueClass: {
      type: String,
      default: "",
    },
  },
  computed: {
    iconBgColor() {
      const map = {
        primary: "bg-blue-50 dark:bg-gray-700 text-primary",
        success: "bg-green-50 dark:bg-gray-700 text-green-600",
        danger: "bg-red-50 dark:bg-gray-700 text-red-600",
        warning: "bg-amber-50 dark:bg-gray-700 text-amber-600",
        purple: "bg-purple-50 dark:bg-gray-700 text-purple-600",
        info: "bg-cyan-50 dark:bg-gray-700 text-cyan-600",
      };
      return map[this.variant] || map.primary;
    },
  },
};
</script>
