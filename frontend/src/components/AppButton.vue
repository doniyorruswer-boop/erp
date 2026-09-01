<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="app-button inline-flex items-center justify-center gap-2 font-lexend font-medium transition-all rounded-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      variantClasses,
      sizeClasses,
      fullWidth ? 'w-full' : '',
    ]"
    @click="$emit('click', $event)"
  >
    <Icon
      v-if="loading"
      icon="eos-icons:loading"
      class="animate-spin text-base"
    />
    <Icon
      v-else-if="icon"
      :icon="icon"
      :class="iconClass"
    />
    <slot />
  </button>
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
    variant: {
      type: String,
      default: "primary", // primary, success, danger, warning, secondary, outline, ghost
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
      default: "text-base",
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
  computed: {
    variantClasses() {
      const map = {
        primary: "bg-primary text-white hover:bg-opacity-90 shadow-sm",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
        secondary: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600",
        outline: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
        ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
      };
      return map[this.variant] || map.primary;
    },
    sizeClasses() {
      const map = {
        sm: "text-xs px-3 py-1.5",
        md: "text-sm px-4 py-2.5",
        lg: "text-base px-6 py-3",
      };
      return map[this.size] || map.md;
    },
  },
};
</script>
