<template>
  <component
    :is="tag"
    class="page-title font-lexend font-bold text-gray-800 dark:text-gray-100 tracking-tight"
    :class="sizeClasses"
  >
    <slot />
  </component>
</template>

<script>
export default {
  name: "PageTitle",
  props: {
    tag: {
      type: String,
      default: "h1",
    },
    size: {
      type: String,
      default: "base",
    },
  },
  computed: {
    sizeClasses() {
      const map = {
        sm: "text-lg sm:text-xl",
        base: "text-2xl",
        md: "text-2xl",
        medium: "text-2xl",
        lg: "text-2xl sm:text-3xl",
        large: "text-2xl sm:text-3xl",
      };
      return map[this.size] || map.base;
    },
  },
};
</script>
