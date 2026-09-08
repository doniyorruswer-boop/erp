<template>
  <div class="app-table-component bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden font-lexend">
    <!-- 1. Ixtiyoriy Top Toolbar (Faqat title, searchable yoki headerActions berilsa chiziladi) -->
    <div
      v-if="hasTopToolbar"
      class="p-3.5 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-3 items-center justify-between flex-wrap"
    >
      <!-- Title & Search -->
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div v-if="title">
          <h3 class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span>{{ title }}</span>
            <span v-if="processedData" class="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              {{ processedData.length }} ta
            </span>
          </h3>
          <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
        </div>

        <!-- Ichki Qidiruv -->
        <div v-if="searchable" class="relative w-full md:w-72">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon icon="solar:magnifer-linear" class="text-base" />
          </span>
          <input
            type="text"
            v-model="internalSearch"
            :placeholder="searchPlaceholder"
            class="w-full pl-9 pr-8 h-9 sm:h-9.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-800 dark:text-gray-100 placeholder-gray-400 transition shadow-2xs"
          />
          <button
            v-if="internalSearch"
            @click="internalSearch = ''"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <Icon icon="solar:close-circle-bold" class="text-base" />
          </button>
        </div>
      </div>

      <!-- Right Header Actions & Per Page -->
      <div class="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
        <slot name="headerActions" />

        <div v-if="showPerPage" class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span>Ko'rsatish:</span>
          <select
            v-model="internalPerPage"
            class="h-8 sm:h-8.5 px-2.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg outline-none text-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <option :value="5">5 ta</option>
            <option :value="10">10 ta</option>
            <option :value="20">20 ta</option>
            <option :value="50">50 ta</option>
            <option :value="100">100 ta</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 2. Ommaviy tanlov paneli (Selectable yoqilganda va kamida bitta qator tanlanganda) -->
    <div
      v-if="selectable && selectedKeys.length > 0"
      class="bg-primary/5 dark:bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs animate-fade-in"
    >
      <div class="flex items-center gap-2">
        <Icon icon="solar:check-circle-bold" class="text-primary text-base" />
        <span class="font-semibold text-primary">
          {{ selectedKeys.length }} ta {{ itemLabel }} tanlandi
        </span>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <slot
          name="bulkActions"
          :selected="selectedRows"
          :selectedKeys="selectedKeys"
          :clearSelection="clearSelection"
        />
        <button
          type="button"
          @click="clearSelection"
          class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition cursor-pointer px-2 py-1 rounded"
        >
          Bekor qilish
        </button>
      </div>
    </div>

    <!-- 3. Asosiy Jadval -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse font-lexend">
        <thead>
          <tr class="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider select-none">
            <!-- Selectable Checkbox ustuni -->
            <th v-if="selectable" class="py-3.5 px-4 w-10 text-center">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
              />
            </th>

            <!-- Tartib raqami (# / №) -->
            <th v-if="showIndex" class="py-3.5 px-4 w-12 text-center text-gray-400">
              {{ indexLabel }}
            </th>

            <!-- Ustunlar sarlavhasi -->
            <th
              v-for="col in normalizedColumns"
              :key="col.key"
              :class="[
                col.thClass || 'py-3.5 px-4',
                col.sortable ? 'cursor-pointer hover:text-primary transition-colors select-none group/th' : '',
              ]"
              @click="col.sortable && handleSort(col.key)"
            >
              <div class="flex items-center gap-1.5" :class="col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable" class="text-xs text-gray-400 shrink-0">
                  <Icon v-if="sortBy === col.key && sortOrder === 'asc'" icon="solar:arrow-up-linear" class="text-primary font-bold text-sm" />
                  <Icon v-else-if="sortBy === col.key && sortOrder === 'desc'" icon="solar:arrow-down-linear" class="text-primary font-bold text-sm" />
                  <Icon v-else icon="solar:sort-vertical-linear" class="opacity-30 group-hover/th:opacity-80 text-sm transition-opacity" />
                </span>
              </div>
            </th>

            <!-- Amallar ustuni sarlavhasi -->
            <th v-if="$slots.actions" class="py-3.5 px-4 text-right font-bold whitespace-nowrap">
              Amallar
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700 text-xs sm:text-sm">
          <!-- Loading holati -->
          <tr v-if="loading">
            <td :colspan="totalColumnsCount" class="py-12 text-center text-gray-400">
              <slot name="loading">
                <LoadingSpinner size="sm" text="Ma'lumotlar yuklanmoqda..." />
              </slot>
            </td>
          </tr>

          <!-- Bo'sh holat (Empty State) -->
          <tr v-else-if="paginatedData.length === 0">
            <td :colspan="totalColumnsCount" class="py-12 text-center">
              <slot name="empty">
                <div class="max-w-sm mx-auto text-center space-y-2">
                  <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700/60 mx-auto flex items-center justify-center text-gray-400 mb-2">
                    <Icon icon="solar:folder-error-bold" class="text-2xl" />
                  </div>
                  <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {{ emptyText }}
                  </p>
                  <p v-if="emptyDescription || internalSearch" class="text-xs text-gray-400">
                    {{ emptyDescription || (internalSearch ? "Qidiruv so'zini o'zgartirib ko'ring" : '') }}
                  </p>
                </div>
              </slot>
            </td>
          </tr>

          <!-- Qatorlar (Data Rows) -->
          <tr
            v-for="(row, idx) in paginatedData"
            :key="getRowKey(row, idx)"
            :class="[
              'hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors group',
              isRowSelected(row, idx) ? 'bg-primary/5 dark:bg-primary/10' : '',
              typeof rowClass === 'function' ? rowClass(row, idx) : rowClass,
            ]"
            @click="$emit('row-click', row, idx)"
          >
            <!-- Checkbox katakchasi -->
            <td v-if="selectable" class="py-3.5 px-4 text-center" @click.stop>
              <input
                type="checkbox"
                :checked="isRowSelected(row, idx)"
                @change="toggleSelectRow(row, idx)"
                class="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
              />
            </td>

            <!-- Tartib raqami -->
            <td v-if="showIndex" class="py-3.5 px-4 text-center text-xs text-gray-400 font-medium">
              {{ (currentPage - 1) * internalPerPage + idx + 1 }}
            </td>

            <!-- Ustunlar katakchalari (Dinamik Scoped Slot) -->
            <td
              v-for="col in normalizedColumns"
              :key="col.key"
              :class="col.tdClass || 'py-3.5 px-4'"
            >
              <slot :name="`cell(${col.key})`" :row="row" :value="row[col.key]" :index="idx">
                {{ row[col.key] !== undefined && row[col.key] !== null && row[col.key] !== '' ? row[col.key] : '—' }}
              </slot>
            </td>

            <!-- Amallar katakchasi (Right aligned) -->
            <td v-if="$slots.actions" class="py-3.5 px-4 text-right whitespace-nowrap" @click.stop>
              <slot name="actions" :row="row" :index="idx" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 4. Paginatsiya va Hisoblagich -->
    <AppPagination
      v-if="pagination && processedData.length > 0"
      v-model="currentPage"
      :total-items="processedData.length"
      :per-page="internalPerPage"
      :item-label="itemLabel"
      :show-info="showInfo"
      @change="$emit('page-change', $event)"
    />
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import AppPagination from "@/components/AppPagination.vue";

export default {
  name: "AppTable",
  components: {
    Icon,
    LoadingSpinner,
    AppPagination,
  },
  props: {
    columns: {
      type: Array,
      required: true,
      // [{ key, label, sortable, thClass, tdClass, align }]
    },
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    searchable: {
      type: Boolean,
      default: false,
    },
    searchPlaceholder: {
      type: String,
      default: "Qidirish...",
    },
    showIndex: {
      type: Boolean,
      default: false,
    },
    indexLabel: {
      type: String,
      default: "№",
    },
    showPerPage: {
      type: Boolean,
      default: false,
    },
    perPage: {
      type: Number,
      default: 10,
    },
    pagination: {
      type: Boolean,
      default: true,
    },
    showInfo: {
      type: Boolean,
      default: true,
    },
    rowKey: {
      type: String,
      default: "id",
    },
    emptyText: {
      type: String,
      default: "Hech qanday ma'lumot topilmadi",
    },
    emptyDescription: {
      type: String,
      default: "",
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    itemLabel: {
      type: String,
      default: "yozuv",
    },
    clientSideSort: {
      type: Boolean,
      default: true,
    },
    clientSidePagination: {
      type: Boolean,
      default: true,
    },
    autoSortable: {
      type: Boolean,
      default: true,
    },
    page: {
      type: Number,
      default: null,
    },
    rowClass: {
      type: [String, Function],
      default: "",
    },
  },
  emits: ["update:modelValue", "update:page", "page-change", "selection-change", "sort", "row-click"],
  data() {
    return {
      internalSearch: "",
      internalPerPage: this.perPage,
      currentPage: this.page && this.page > 0 ? this.page : 1,
      sortBy: "",
      sortOrder: "asc", // 'asc' | 'desc'
      selectedKeys: [...this.modelValue],
    };
  },
  watch: {
    page(val) {
      if (typeof val === "number" && val > 0 && val !== this.currentPage) {
        this.currentPage = val;
      }
    },
    currentPage(val) {
      this.$emit("update:page", val);
      this.$emit("page-change", val);
    },
    perPage(val) {
      this.internalPerPage = val;
    },
    internalPerPage() {
      this.currentPage = 1;
    },
    modelValue(val) {
      this.selectedKeys = [...(val || [])];
    },
    data() {
      // Yangi data kelganda sahifani tekshirish
      if (this.currentPage > this.totalPages) {
        this.currentPage = Math.max(1, this.totalPages);
      }
    },
  },
  computed: {
    hasTopToolbar() {
      return (
        this.searchable ||
        this.showPerPage ||
        !!this.$slots.headerActions ||
        !!this.title
      );
    },
    normalizedColumns() {
      const nonSortableKeys = [
        "actions",
        "action",
        "amallar",
        "operations",
        "selection",
        "checkbox",
        "menu",
        "avatar",
      ];
      return (this.columns || []).map((col) => {
        // Agar col.sortable aniq berilgan bo'lsa (true yoki false)
        if (typeof col.sortable === "boolean") {
          return col;
        }
        // Maxsus amallar yoki tugmalar bo'lsa
        if (nonSortableKeys.includes(col.key)) {
          return { ...col, sortable: false };
        }
        // autoSortable bo'lsa barcha ma'lumot ustunlari avtomatik sortable bo'ladi
        return {
          ...col,
          sortable: this.autoSortable !== false,
        };
      });
    },
    totalColumnsCount() {
      let count = this.normalizedColumns.length;
      if (this.selectable) count++;
      if (this.showIndex) count++;
      if (this.$slots.actions) count++;
      return count;
    },
    processedData() {
      let result = [...(this.data || [])];

      // Client-side search (faqat searchable yoqilgan bo'lsa)
      if (this.searchable && this.internalSearch.trim()) {
        const query = this.internalSearch.toLowerCase().trim();
        result = result.filter((item) => {
          return this.normalizedColumns.some((col) => {
            const val = item[col.key];
            return (
              val !== undefined &&
              val !== null &&
              String(val).toLowerCase().includes(query)
            );
          });
        });
      }

      // Client-side smart sort (Raqamlar, sanalar va matnlarni to'g'ri saralash)
      if (this.clientSideSort && this.sortBy) {
        result.sort((a, b) => {
          let valA = a[this.sortBy];
          let valB = b[this.sortBy];
          if (valA === valB) return 0;
          if (valA === null || valA === undefined || valA === "") return 1;
          if (valB === null || valB === undefined || valB === "") return -1;

          // Sonlar yoki valyuta qiymatlarini solishtirish (masalan: 4000000 yoki "4 700 000 so'm")
          const numA = typeof valA === "number" ? valA : parseFloat(String(valA).replace(/\s/g, "").replace(/,/g, "."));
          const numB = typeof valB === "number" ? valB : parseFloat(String(valB).replace(/\s/g, "").replace(/,/g, "."));
          if (!isNaN(numA) && !isNaN(numB) && typeof valA !== "boolean" && !/^\+?\d{9,13}$/.test(String(valA).trim())) {
            return this.sortOrder === "asc" ? numA - numB : numB - numA;
          }

          // Sanalar solishtirish (DD.MM.YYYY yoki DD/MM/YYYY)
          if (typeof valA === "string" && /^\d{2}[./-]\d{2}[./-]\d{4}/.test(valA)) {
            const partsA = valA.split(/[./-]/);
            const partsB = String(valB).split(/[./-]/);
            if (partsA.length === 3 && partsB.length === 3) {
              const timeA = new Date(`${partsA[2]}-${partsA[1]}-${partsA[0]}`).getTime();
              const timeB = new Date(`${partsB[2]}-${partsB[1]}-${partsB[0]}`).getTime();
              if (!isNaN(timeA) && !isNaN(timeB)) {
                return this.sortOrder === "asc" ? timeA - timeB : timeB - timeA;
              }
            }
          }

          // Matnlar (o'zbek va lotin alifbosi bo'yicha)
          const comparison = String(valA).localeCompare(String(valB), "uz", {
            numeric: true,
            sensitivity: "base",
          });
          return this.sortOrder === "asc" ? comparison : -comparison;
        });
      }

      return result;
    },
    paginatedData() {
      if (!this.pagination || !this.clientSidePagination) {
        return this.processedData;
      }
      const start = (this.currentPage - 1) * this.internalPerPage;
      return this.processedData.slice(start, start + this.internalPerPage);
    },
    totalPages() {
      return Math.ceil(this.processedData.length / this.internalPerPage) || 1;
    },
    paginationStart() {
      if (this.processedData.length === 0) return 0;
      return (this.currentPage - 1) * this.internalPerPage + 1;
    },
    paginationEnd() {
      return Math.min(
        this.currentPage * this.internalPerPage,
        this.processedData.length
      );
    },
    isAllSelected() {
      if (this.paginatedData.length === 0) return false;
      return this.paginatedData.every((row, idx) =>
        this.selectedKeys.includes(this.getRowKey(row, idx))
      );
    },
    selectedRows() {
      return (this.data || []).filter((row, idx) =>
        this.selectedKeys.includes(this.getRowKey(row, idx))
      );
    },
  },
  methods: {
    getRowKey(row, idx) {
      return row && row[this.rowKey] !== undefined ? row[this.rowKey] : idx;
    },
    isRowSelected(row, idx) {
      return this.selectedKeys.includes(this.getRowKey(row, idx));
    },
    toggleSelectRow(row, idx) {
      const key = this.getRowKey(row, idx);
      const pos = this.selectedKeys.indexOf(key);
      if (pos === -1) {
        this.selectedKeys.push(key);
      } else {
        this.selectedKeys.splice(pos, 1);
      }
      this.$emit("update:modelValue", this.selectedKeys);
      this.$emit("selection-change", this.selectedRows);
      this.$emit("row-select", key, row);
    },
    toggleSelectAll() {
      if (this.isAllSelected) {
        const pageKeys = this.paginatedData.map((row, idx) =>
          this.getRowKey(row, idx)
        );
        this.selectedKeys = this.selectedKeys.filter(
          (k) => !pageKeys.includes(k)
        );
      } else {
        const pageKeys = this.paginatedData.map((row, idx) =>
          this.getRowKey(row, idx)
        );
        this.selectedKeys = Array.from(
          new Set([...this.selectedKeys, ...pageKeys])
        );
      }
      this.$emit("update:modelValue", this.selectedKeys);
      this.$emit("selection-change", this.selectedRows);
      this.$emit("select-all", this.isAllSelected);
    },
    clearSelection() {
      this.selectedKeys = [];
      this.$emit("update:modelValue", []);
      this.$emit("selection-change", []);
    },
    handleSort(key) {
      if (this.sortBy === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortBy = key;
        this.sortOrder = "asc";
      }
      this.$emit("sort", { key: this.sortBy, order: this.sortOrder });
    },
  },
};
</script>
