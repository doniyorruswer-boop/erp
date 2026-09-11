<template>
  <div
    class="info-grid bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5 shadow-sm"
  >
    <div
      v-if="title || $slots.headerAction"
      class="flex items-center justify-between pb-4 mb-4 border-b dark:border-gray-700"
    >
      <div class="flex items-center gap-2.5">
        <div
          v-if="icon"
          class="p-2 rounded-lg bg-primary/10 text-primary text-xl flex items-center justify-center"
        >
          <Icon :icon="icon" />
        </div>
        <div>
          <h3 class="text-base font-bold text-gray-800 dark:text-gray-100">{{ title }}</h3>
          <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
        </div>
      </div>
      <slot name="headerAction" />
    </div>

    <!-- Items Grid -->
    <div :class="['grid gap-4', gridColsClass]">
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="flex flex-col space-y-1 p-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
      >
        <span class="text-xs font-medium text-gray-400 flex items-center gap-1.5">
          <Icon v-if="item.icon" :icon="item.icon" class="text-sm" />
          {{ item.label }}
        </span>
        <span class="text-sm font-semibold text-gray-800 dark:text-gray-100 break-words">
          <slot :name="`item-${item.key}`" :item="item">
            {{ item.value || "-" }}
          </slot>
        </span>
      </div>
    </div>

    <slot name="footer" />
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "InfoGrid",
  components: { Icon },
  props: {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    icon: { type: String, default: "" },
    items: {
      type: Array,
      default: () => [],
      // Format: [{ key: 'phone', label: 'Telefon', value: '+99890...', icon: '...' }]
    },
    cols: {
      type: [Number, String],
      default: 2,
    },
  },
  computed: {
    gridColsClass() {
      const c = Number(this.cols);
      if (c === 1) return "grid-cols-1";
      if (c === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      if (c === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      return "grid-cols-1 sm:grid-cols-2";
    },
  },
};
</script>
