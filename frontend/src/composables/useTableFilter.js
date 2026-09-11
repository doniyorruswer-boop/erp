import { computed, ref } from "vue";

/**
 * Reusable table filter composable adhering to AGENTS.md
 * @param {import('vue').Ref<Array>|import('vue').ComputedRef<Array>} itemsSource
 * @param {Object} [options]
 * @param {string[]} [options.searchFields]
 * @param {string} [options.initialSortKey]
 * @param {'asc'|'desc'} [options.initialSortOrder]
 */
export function useTableFilter(itemsSource, options = {}) {
  const {
    searchFields = ["fullName", "name", "phone"],
    initialSortKey = "",
    initialSortOrder = "asc",
  } = options;

  const searchQuery = ref("");
  const filters = ref({});
  const sortKey = ref(initialSortKey);
  const sortOrder = ref(initialSortOrder);

  const filteredItems = computed(() => {
    if (!itemsSource.value) return [];
    let list = [...itemsSource.value];

    // 1. Search query filter
    const query = searchQuery.value.trim().toLowerCase();
    if (query) {
      list = list.filter((item) => {
        return searchFields.some((field) => {
          const val = item[field];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
      });
    }

    // 2. Exact match filters
    Object.entries(filters.value).forEach(([key, filterVal]) => {
      if (
        filterVal !== null &&
        filterVal !== undefined &&
        filterVal !== "" &&
        filterVal !== "ALL"
      ) {
        list = list.filter((item) => String(item[key]) === String(filterVal));
      }
    });

    // 3. Sorting
    if (sortKey.value) {
      const key = sortKey.value;
      const orderMultiplier = sortOrder.value === "asc" ? 1 : -1;

      list.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * orderMultiplier;
        }

        return String(valA).localeCompare(String(valB)) * orderMultiplier;
      });
    }

    return list;
  });

  function setFilter(key, value) {
    filters.value[key] = value;
  }

  function resetFilters() {
    searchQuery.value = "";
    filters.value = {};
  }

  function toggleSort(key) {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      sortKey.value = key;
      sortOrder.value = "asc";
    }
  }

  return {
    searchQuery,
    filters,
    sortKey,
    sortOrder,
    filteredItems,
    setFilter,
    resetFilters,
    toggleSort,
  };
}

export default useTableFilter;
