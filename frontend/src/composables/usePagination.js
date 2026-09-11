import { computed, ref } from "vue";

/**
 * Reusable pagination composable adhering to AGENTS.md
 * @param {import('vue').Ref<Array>|import('vue').ComputedRef<Array>} itemsSource
 * @param {Object} [options]
 * @param {number} [options.initialPage=1]
 * @param {number} [options.initialPerPage=10]
 * @param {number} [options.maxVisibleButtons=5]
 */
export function usePagination(itemsSource, options = {}) {
  const { initialPage = 1, initialPerPage = 10, maxVisibleButtons = 5 } = options;

  const currentPage = ref(initialPage);
  const itemsPerPage = ref(initialPerPage);

  const totalItems = computed(() => (itemsSource.value ? itemsSource.value.length : 0));

  const totalPages = computed(() => {
    if (totalItems.value === 0) return 1;
    return Math.ceil(totalItems.value / itemsPerPage.value);
  });

  const startItem = computed(() => {
    if (totalItems.value === 0) return 0;
    return (currentPage.value - 1) * itemsPerPage.value + 1;
  });

  const endItem = computed(() => {
    return Math.min(currentPage.value * itemsPerPage.value, totalItems.value);
  });

  const paginatedItems = computed(() => {
    if (!itemsSource.value) return [];
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return itemsSource.value.slice(start, start + itemsPerPage.value);
  });

  const visiblePages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;

    if (total <= maxVisibleButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    const sideCount = Math.floor((maxVisibleButtons - 3) / 2);
    let start = Math.max(2, current - sideCount);
    let end = Math.min(total - 1, current + sideCount);

    if (current <= 3) {
      start = 2;
      end = 4;
    } else if (current >= total - 2) {
      start = total - 3;
      end = total - 1;
    }

    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < total - 1) pages.push("...");
    pages.push(total);

    return pages;
  });

  function goToPage(page) {
    const p = typeof page === "string" ? parseInt(page, 10) : page;
    if (!isNaN(p) && p >= 1 && p <= totalPages.value) {
      currentPage.value = p;
    }
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  }

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  function resetPage() {
    currentPage.value = 1;
  }

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    startItem,
    endItem,
    visiblePages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
  };
}

export default usePagination;
