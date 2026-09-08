<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="disabled || loading"
    class="app-button inline-flex items-center justify-center font-lexend transition cursor-pointer shadow-2xs select-none disabled:opacity-50 disabled:cursor-not-allowed group"
    :class="[
      variantClasses,
      sizeClasses,
      fullWidth ? 'w-full' : '',
    ]"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <Icon
      v-if="loading"
      icon="eos-icons:loading"
      class="animate-spin shrink-0 text-base"
    />
    <!-- Icon -->
    <Icon
      v-else-if="icon"
      :icon="icon"
      :class="[iconClass || 'text-base', 'shrink-0 transition-colors']"
    />
    <!-- Text / Slot Content -->
    <span v-if="$slots.default" class="truncate">
      <slot />
    </span>
  </component>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AppButton",
  components: { Icon },
  props: {
    type: {
      type: String,
      default: "button",
    },
    to: {
      type: [String, Object],
      default: null,
    },
    variant: {
      type: String,
      default: "outline", // outline (default Kanban style), primary, success, danger, warning, secondary, ghost
    },
    size: {
      type: String,
      default: "md", // sm, md, lg
    },
    icon: {
      type: String,
      default: "",
    },
    iconClass: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click"],
  computed: {
    variantClasses() {
      const map = {
        outline:
          "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 font-semibold",
        primary:
          "bg-primary hover:bg-primary/90 text-white font-bold border border-primary shadow-2xs active:scale-98",
        success:
          "bg-emerald-600 hover:bg-emerald-700 text-white font-bold border border-emerald-600 shadow-2xs active:scale-98",
        danger:
          "bg-red-600 hover:bg-red-700 text-white font-bold border border-red-600 shadow-2xs active:scale-98",
        warning:
          "bg-amber-500 hover:bg-amber-600 text-white font-bold border border-amber-600 shadow-2xs active:scale-98",
        secondary:
          "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold border border-transparent",
        ghost:
          "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent",
      };
      return map[this.variant] || map.outline;
    },
    sizeClasses() {
      const map = {
        sm: "py-1.5 px-2.5 text-xs rounded-md gap-1",
        md: "py-2 px-3.5 text-xs sm:text-sm rounded-md gap-1.5",
        lg: "py-2.5 px-4 text-sm sm:text-base rounded-lg gap-2",
      };
      return map[this.size] || map.md;
    },
  },
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit("click", event);
      }
    },
  },
};
</script>
