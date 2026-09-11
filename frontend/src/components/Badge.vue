<template>
  <span
    class="badge-component inline-flex items-center gap-1 font-lexend font-medium transition-colors"
    :class="[variantClasses, sizeClasses, rounded ? 'rounded-full' : 'rounded']"
  >
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full" :class="dotClasses"></span>
    <slot />
  </span>
</template>

<script>
export default {
  name: "Badge",
  props: {
    variant: {
      type: String,
      default: "primary", // primary, success, danger, warning, info, neutral
    },
    size: {
      type: String,
      default: "sm", // xs, sm, md
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    dot: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    variantClasses() {
      const map = {
        primary:
          "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
        success:
          "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
        danger:
          "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
        warning:
          "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
        info: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800",
        neutral:
          "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
      };
      return map[this.variant] || map.primary;
    },
    dotClasses() {
      const map = {
        primary: "bg-blue-500",
        success: "bg-green-500",
        danger: "bg-red-500",
        warning: "bg-amber-500",
        info: "bg-cyan-500",
        neutral: "bg-gray-400",
      };
      return map[this.variant] || map.primary;
    },
    sizeClasses() {
      const map = {
        xs: "text-[10px] px-1.5 py-0.5",
        sm: "text-xs px-2.5 py-0.5",
        md: "text-sm px-3 py-1",
      };
      return map[this.size] || map.sm;
    },
  },
};
</script>
