<template>
  <div
    class="stat-card bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition font-lexend"
  >
    <!-- Left Icon -->
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
      :class="computedIconClass"
    >
      <Icon :icon="icon" />
    </div>

    <!-- Right Content -->
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-1">
        <span class="text-xs font-medium text-gray-400 uppercase tracking-wider block truncate">
          {{ title }}
        </span>
        <span
          v-if="badge"
          class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary"
        >
          {{ badge }}
        </span>
      </div>

      <h2
        class="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mt-0.5 leading-tight truncate"
        :title="String(value)"
      >
        {{ value }}
      </h2>

      <!-- Bottom Delta / Subtext line -->
      <div class="flex items-center gap-1 text-[11px] mt-0.5 truncate font-medium">
        <!-- Delta Badge (▲ / ▼ / +) -->
        <span v-if="delta" :class="computedDeltaClass">
          {{ delta }}
        </span>

        <!-- Delta Description or Subtext -->
        <span v-if="deltaLabel" class="text-gray-400 truncate">
          {{ deltaLabel }}
        </span>

        <!-- Alternative subtext with custom icon -->
        <div
          v-else-if="subtext"
          class="flex items-center gap-1 text-gray-500 dark:text-gray-400 truncate"
        >
          <Icon v-if="subicon" :icon="subicon" class="text-xs shrink-0" />
          <span class="truncate">{{ subtext }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "StatCard",
  components: {
    Icon,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    icon: {
      type: String,
      default: "solar:chart-2-bold",
    },
    variant: {
      type: String,
      default: "primary", // 'primary' | 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'pink'
    },
    iconClass: {
      type: String,
      default: "",
    },
    delta: {
      type: String,
      default: "",
    },
    deltaType: {
      type: String,
      default: "neutral", // 'up' | 'down' | 'success' | 'danger' | 'neutral'
    },
    deltaLabel: {
      type: String,
      default: "",
    },
    subtext: {
      type: String,
      default: "",
    },
    subicon: {
      type: String,
      default: "",
    },
    badge: {
      type: String,
      default: "",
    },
  },
  computed: {
    computedIconClass() {
      if (this.iconClass) return this.iconClass;

      const map = {
        primary: "bg-primary/10 text-primary",
        blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
        amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
        rose: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
        indigo: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
        purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
        pink: "bg-pink-50 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400",
      };

      return map[this.variant] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    },
    computedDeltaClass() {
      if (this.deltaType === "up" || this.deltaType === "success") {
        return "text-emerald-600 dark:text-emerald-400 font-bold";
      }
      if (this.deltaType === "down" || this.deltaType === "danger") {
        return "text-rose-600 dark:text-rose-400 font-bold";
      }
      if (this.delta.startsWith("▲")) {
        return "text-rose-600 dark:text-rose-400 font-bold"; // For debt increasing
      }
      if (this.delta.startsWith("▼")) {
        return "text-rose-500 dark:text-rose-400 font-bold";
      }
      if (this.delta.startsWith("+")) {
        return "text-emerald-600 dark:text-emerald-400 font-bold";
      }
      return "text-gray-500 dark:text-gray-400 font-bold";
    },
  },
};
</script>
