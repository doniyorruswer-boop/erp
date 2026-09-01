<template>
  <div class="data-table-component bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700 shadow-sm overflow-hidden font-lexend">
    <!-- Toolbar: Search, Filters & Controls -->
    <div
      v-if="searchable || showPerPage || $slots.headerActions || title"
      class="p-4 border-b dark:border-gray-700 flex flex-col md:flex-row gap-3 items-center justify-between flex-wrap"
    >
      <!-- Title or Left Slot -->
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div v-if="title">
          <h3 class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span>{{ title }}</span>
            <span class="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {{ filteredData.length }} ta
            </span>
          </h3>
          <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
        </div>

        <!-- Search Input -->
        <div v-if="searchable" class="relative w-full md:w-72">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon icon="ei:search" class="text-xl" />
          </span>
          <input
            type="text"
            v-model="internalSearch"
            :placeholder="searchPlaceholder"
            class="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 dark:text-gray-200 transition"
          />
          <button
            v-if="internalSearch"
            @click="internalSearch = ''"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
          >
            <Icon icon="mdi:close-circle" class="text-base" />
          </button>
        </div>
      </div>

      <!-- Right Controls: Per Page & Actions -->
      <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        <slot name="headerActions" />

        <div v-if="showPerPage" class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Ko'rsatish:</span>
          <select
            v-model="internalPerPage"
            class="py-1.5 px-2.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
          >
            <option :value="5">5 ta</option>
            <option :value="10">10 ta</option>
            <option :value="25">25 ta</option>
            <option :value="50">50 ta</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table content -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="bg-gray-50 dark:bg-gray-700/60 border-b dark:border-gray-600 text-gray-500 dark:text-gray-300 font-semibold text-xs uppercase tracking-wider">
            <th v-if="showIndex" class="p-3.5 w-12 text-center text-gray-400">№</th>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                col.thClass || 'p-3.5',
                col.sortable ? 'cursor-pointer select-none hover:text-primary transition-colors' : '',
              ]"
              @click="col.sortable && handleSort(col.key)"
            >
              <div class="flex items-center gap-1.5">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable" class="text-xs text-gray-400">
                  <Icon v-if="sortBy === col.key && sortOrder === 'asc'" icon="bi:arrow-up" class="text-primary font-bold" />
                  <Icon v-else-if="sortBy === col.key && sortOrder === 'desc'" icon="bi:arrow-down" class="text-primary font-bold" />
                  <Icon v-else icon="bi:arrow-down-up" class="opacity-40" />
                </span>
              </div>
            </th>
            <th v-if="$slots.actions" class="p-3.5 text-right font-semibold">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <!-- Loading State -->
          <tr v-if="loading">
            <td :colspan="totalColumnsCount" class="p-8 text-center text-gray-400">
              <LoadingSpinner size="sm" text="Ma'lumotlar yuklanmoqda..." />
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="paginatedData.length === 0">
            <td :colspan="totalColumnsCount" class="p-6 text-center">
              <EmptyState
                :title="emptyText || 'Hech qanday ma\'lumot topilmadi'"
                :description="internalSearch ? 'Qidiruv so\'zini o\'zgartirib ko\'ring' : ''"
              />
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-for="(row, idx) in paginatedData"
            :key="row[rowKey] || idx"
            class="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors group"
          >
            <td v-if="showIndex" class="p-3.5 text-center text-xs text-gray-400">
              {{ (currentPage - 1) * internalPerPage + idx + 1 }}
            </td>
            <td
              v-for="col in columns"
              :key="col.key"
              :class="col.tdClass || 'p-3.5'"
            >
              <slot :name="`cell(${col.key})`" :row="row" :value="row[col.key]" :index="idx">
                {{ row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '-' }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="p-3.5 text-right">
              <slot name="actions" :row="row" :index="idx" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div
      v-if="pagination && filteredData.length > 0"
      class="p-3.5 bg-gray-50/50 dark:bg-gray-700/30 border-t dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-gray-500 dark:text-gray-400"
    >
      <div>
        Jami <b class="text-gray-800 dark:text-gray-200">{{ filteredData.length }}</b> ta yozuvdan
        <b class="text-gray-800 dark:text-gray-200">{{ (currentPage - 1) * internalPerPage + 1 }} - {{ Math.min(currentPage * internalPerPage, filteredData.length) }}</b> oralig'i ko'rsatilmoqda
      </div>

      <div v-if="totalPages > 1" class="flex items-center gap-1">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-white dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Oldingi
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          @click="p !== '...' && (currentPage = p)"
          :disabled="p === '...'"
          :class="[
            currentPage === p
              ? 'bg-primary text-white border-primary font-bold shadow-sm'
              : 'border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200',
            p === '...' ? 'cursor-default border-none' : '',
          ]"
          class="w-7 h-7 flex items-center justify-center rounded-md transition text-xs"
        >
          {{ p }}
        </button>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-white dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Keyingi
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import EmptyState from "./EmptyState.vue";

export default {
  name: "DataTable",
  components: { Icon, EmptyState },
  props: {
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    columns: {
      type: Array,
      required: true,
    },
    data: {
      type: Array,
      default: () => [],
    },
    rowKey: {
      type: String,
      default: "id",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    searchable: {
      type: Boolean,
      default: false,
    },
    searchPlaceholder: {
      type: String,
      default: "Qidiruv...",
    },
    emptyText: {
      type: String,
      default: "Hech qanday ma'lumot topilmadi",
    },
    pagination: {
      type: Boolean,
      default: true,
    },
    perPage: {
      type: Number,
      default: 10,
    },
    showPerPage: {
      type: Boolean,
      default: true,
    },
    showIndex: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      internalSearch: "",
      internalPerPage: this.perPage,
      currentPage: 1,
      sortBy: "",
      sortOrder: "asc",
    };
  },
  watch: {
    internalSearch() {
      this.currentPage = 1;
    },
    internalPerPage() {
      this.currentPage = 1;
    },
    data() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = 1;
      }
    },
  },
  computed: {
    totalColumnsCount() {
      return this.columns.length + (this.$slots.actions ? 1 : 0) + (this.showIndex ? 1 : 0);
    },
    filteredData() {
      let result = [...this.data];

      // Live Search across all fields and nested objects
      if (this.internalSearch.trim()) {
        const q = this.internalSearch.toLowerCase().trim();
        result = result.filter((item) => {
          return this.searchObject(item, q);
        });
      }

      // Sort
      if (this.sortBy) {
        result.sort((a, b) => {
          const valA = a[this.sortBy];
          const valB = b[this.sortBy];
          if (valA === valB) return 0;
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (typeof valA === "number" && typeof valB === "number") {
            return this.sortOrder === "asc" ? valA - valB : valB - valA;
          }
          const strA = String(valA).toLowerCase();
          const strB = String(valB).toLowerCase();
          if (this.sortOrder === "asc") {
            return strA.localeCompare(strB);
          } else {
            return strB.localeCompare(strA);
          }
        });
      }

      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.internalPerPage) || 1;
    },
    paginatedData() {
      if (!this.pagination) return this.filteredData;
      const start = (this.currentPage - 1) * this.internalPerPage;
      return this.filteredData.slice(start, start + this.internalPerPage);
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
    handleSort(key) {
      if (this.sortBy === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortBy = key;
        this.sortOrder = "asc";
      }
    },
    searchObject(obj, query) {
      if (!obj) return false;
      return Object.values(obj).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "object") {
          return this.searchObject(val, query);
        }
        return String(val).toLowerCase().includes(query);
      });
    },
  },
};
</script>
