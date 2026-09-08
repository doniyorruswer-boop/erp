<template>
  <div
    v-if="totalItems > 0 && (!hideOnSinglePage || totalPages > 1)"
    class="flex items-center justify-between flex-wrap gap-3 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-xs text-gray-500 dark:text-gray-400 font-medium font-lexend"
  >
    <!-- Left Info -->
    <div v-if="showInfo" class="text-xs">
      <span>{{ startItem }}-{{ endItem }} / Jami: {{ totalItems }} ta {{ itemLabel }}</span>
    </div>

    <!-- Right Controls -->
    <div v-if="totalPages > 1" class="flex items-center gap-1.5 ml-auto">
      <!-- Prev Button -->
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
        class="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-sm"
        title="Oldingi sahifa"
      >
        <Icon icon="solar:alt-arrow-left-linear" class="text-sm" />
      </button>

      <!-- Page Numbers -->
      <button
        v-for="(page, idx) in visiblePages"
        :key="idx"
        type="button"
        :disabled="page === '...'"
        @click="page !== '...' && goToPage(page)"
        :class="[
          'w-9 h-9 rounded-lg text-sm font-bold transition flex items-center justify-center',
          page === '...'
            ? 'cursor-default border-none text-gray-400 font-normal'
            : currentPage === page
            ? 'bg-primary text-white shadow-2xs cursor-default'
            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
        ]"
      >
        {{ page }}
      </button>

      <!-- Next Button -->
      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
        class="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-sm"
        title="Keyingi sahifa"
      >
        <Icon icon="solar:alt-arrow-right-linear" class="text-sm" />
      </button>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AppPagination",
  components: { Icon },
  props: {
    modelValue: {
      type: Number,
      default: 1,
    },
    totalItems: {
      type: Number,
      required: true,
      default: 0,
    },
    perPage: {
      type: Number,
      default: 10,
    },
    itemLabel: {
      type: String,
      default: "yozuv",
    },
    showInfo: {
      type: Boolean,
      default: true,
    },
    hideOnSinglePage: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "change"],
  computed: {
    currentPage() {
      return this.modelValue || 1;
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.totalItems / this.perPage));
    },
    startItem() {
      if (this.totalItems === 0) return 0;
      return (this.currentPage - 1) * this.perPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.perPage, this.totalItems);
    },
    visiblePages() {
      const total = this.totalPages;
      const current = this.currentPage;

      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      if (current <= 4) {
        return [1, 2, 3, 4, 5, "...", total];
      }

      if (current >= total - 3) {
        return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
      }

      return [1, "...", current - 1, current, current + 1, "...", total];
    },
  },
  methods: {
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.$emit("update:modelValue", page);
        this.$emit("change", page);
      }
    },
  },
};
</script>
