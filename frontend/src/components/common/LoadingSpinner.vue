<template>
  <div
    :class="[
      'flex flex-col items-center justify-center font-lexend transition-all duration-300',
      fullPage ? 'py-24 w-full' : 'py-8',
    ]"
  >
    <!-- Smooth SVG Ring Spinner -->
    <div class="relative flex items-center justify-center">
      <!-- Background Track Ring -->
      <svg
        :class="[sizeClass, 'text-primary/20']"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="25" cy="25" r="20" stroke="currentColor" :stroke-width="strokeWidth" />
      </svg>

      <!-- Animated Rotating Gradient Arc -->
      <svg
        :class="[sizeClass, 'absolute inset-0 text-primary animate-spin']"
        style="animation-duration: 0.85s; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1)"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          stroke-dasharray="80"
          stroke-dashoffset="60"
        />
      </svg>

      <!-- Inner Pulsing Glowing Center Dot -->
      <div :class="['absolute rounded-full bg-primary/80 animate-pulse', dotSizeClass]" />
    </div>

    <!-- Optional Label / Text -->
    <div v-if="text || $slots.default" class="mt-3.5 text-center">
      <p
        class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse tracking-wide"
      >
        <slot>{{ text }}</slot>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoadingSpinner",
  props: {
    size: {
      type: String,
      default: "md", // sm, md, lg, xl
    },
    text: {
      type: String,
      default: "Yuklanmoqda...",
    },
    fullPage: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    sizeClass() {
      const map = {
        xs: "w-5 h-5",
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-20 h-20",
      };
      return map[this.size] || map.md;
    },
    dotSizeClass() {
      const map = {
        xs: "w-1 h-1",
        sm: "w-1.5 h-1.5",
        md: "w-2 h-2",
        lg: "w-3 h-3",
        xl: "w-4 h-4",
      };
      return map[this.size] || map.md;
    },
    strokeWidth() {
      if (this.size === "xs" || this.size === "sm") return "4";
      if (this.size === "lg" || this.size === "xl") return "3.5";
      return "4";
    },
  },
};
</script>
