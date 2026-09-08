<template>
  <div class="inline-flex items-center justify-center whitespace-nowrap select-none">
    <router-link
      v-if="to"
      :to="to"
      class="inline-flex items-center gap-1 font-bold rounded-md border transition-colors cursor-pointer hover:border-primary hover:text-primary"
      :class="[badgeClasses, sizeClasses]"
      @click.stop
    >
      <slot>{{ name }}</slot>
    </router-link>
    <span
      v-else
      class="inline-flex items-center gap-1 font-bold rounded-md border"
      :class="[badgeClasses, sizeClasses]"
    >
      <slot>{{ name }}</slot>
    </span>
  </div>
</template>

<script>
export default {
  name: "AppGroupBadge",
  props: {
    name: {
      type: [String, Number],
      default: ""
    },
    to: {
      type: [String, Object],
      default: null
    },
    variant: {
      type: String,
      default: "blue",
      validator: (v) => ["blue", "purple", "gray", "emerald"].includes(v)
    },
    size: {
      type: String,
      default: "md",
      validator: (v) => ["sm", "md"].includes(v)
    }
  },
  computed: {
    sizeClasses() {
      return this.size === "sm"
        ? "px-2 py-0.5 text-[11px]"
        : "px-2.5 py-1 text-xs";
    },
    badgeClasses() {
      switch (this.variant) {
        case "purple":
          return "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/40";
        case "emerald":
          return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
        case "gray":
          return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
        case "blue":
        default:
          return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      }
    }
  }
};
</script>
