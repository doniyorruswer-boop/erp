<template>
  <div class="tabs-nav border-b dark:border-gray-700 mb-5 overflow-x-auto scrollbar-none">
    <div class="flex items-center space-x-1 sm:space-x-2 min-w-max pb-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        @click="$emit('update:modelValue', tab.id)"
        :class="[
          'flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all',
          modelValue === tab.id
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50'
        ]"
      >
        <Icon v-if="tab.icon" :icon="tab.icon" class="text-lg" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.count !== undefined"
          :class="[
            'text-xs px-2 py-0.5 rounded-full font-semibold',
            modelValue === tab.id
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          ]"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "TabsNav",
  components: { Icon },
  props: {
    modelValue: {
      type: [String, Number],
      required: true,
    },
    tabs: {
      type: Array,
      required: true,
      // Format: [{ id: 'overview', label: 'Umumiy', icon: '...', count: 12 }]
    },
  },
  emits: ["update:modelValue"],
};
</script>
