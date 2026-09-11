<template>
  <div class="kanban-board-component font-lexend">
    <!-- Top Filter & Search Bar -->
    <div
      v-if="searchable || $slots.headerActions || title"
      class="flex flex-col md:flex-row gap-3 items-center justify-between mb-5 flex-wrap bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm"
    >
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div v-if="title">
          <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span>{{ title }}</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {{ totalItemsCount }} ta
            </span>
          </h2>
          <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
        </div>

        <div v-if="searchable" class="relative w-full md:w-72">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon icon="ei:search" class="text-xl" />
          </span>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 dark:text-gray-200 transition"
          />
          <button
            v-if="searchQuery"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
            @click="searchQuery = ''"
          >
            <Icon icon="mdi:close-circle" class="text-base" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2.5 w-full md:w-auto justify-end">
        <slot name="headerActions" />
      </div>
    </div>

    <!-- Responsive Full-Width Kanban Board Grid -->
    <div class="w-full">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start w-full">
        <!-- Column -->
        <div
          v-for="col in columns"
          :key="col.id"
          :class="[
            'kanban-column w-full flex flex-col bg-gray-50/95 dark:bg-gray-800/70 rounded-xl border dark:border-gray-700 min-h-[520px] max-h-[780px] transition-all shadow-xs',
            dragOverColId === col.id
              ? 'ring-2 ring-primary border-primary bg-primary/5 dark:bg-primary/10'
              : '',
          ]"
          @dragover.prevent="onDragOver(col.id)"
          @dragleave="onDragLeave(col.id)"
          @drop="onDrop(col.id)"
        >
          <!-- Column Header -->
          <div
            class="p-3.5 px-4 border-b dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-xl"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-full shrink-0" :class="col.badgeColor || 'bg-primary'" />
              <h3 class="font-bold text-sm text-gray-800 dark:text-gray-100">{{ col.title }}</h3>
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {{ getColumnItems(col.id).length }}
              </span>
            </div>

            <button
              v-if="col.allowQuickAdd !== false"
              class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
              title="Yangi qo'shish"
              @click="$emit('quickAdd', col.id)"
            >
              <Icon icon="ic:round-add" class="text-lg" />
            </button>
          </div>

          <!-- Cards Drop Zone List -->
          <div class="cards-list p-3 space-y-3 overflow-y-auto flex-1 min-h-[160px]">
            <!-- Card Item -->
            <div
              v-for="item in getColumnItems(col.id)"
              :key="item[itemKey]"
              draggable="true"
              class="kanban-card bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition hover:border-primary/60 group select-none"
              @dragstart="onDragStart(item, col.id)"
              @click="$emit('cardClick', item)"
            >
              <slot name="card" :item="item" :column="col">
                <!-- Default Card Layout -->
                <div class="flex items-start justify-between gap-2">
                  <h4
                    class="font-semibold text-sm text-gray-800 dark:text-gray-100 group-hover:text-primary transition"
                  >
                    {{ item.title || item.name || item.fullName }}
                  </h4>
                  <span
                    v-if="item.badge"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {{ item.badge }}
                  </span>
                </div>

                <p v-if="item.subtitle || item.phone" class="text-xs text-gray-400 mt-1">
                  {{ item.subtitle || item.phone }}
                </p>

                <div
                  v-if="item.amount"
                  class="mt-2.5 font-bold text-xs text-green-600 dark:text-green-400"
                >
                  {{ item.amount }}
                </div>
              </slot>
            </div>

            <!-- Empty Drop Zone Placeholder -->
            <div
              v-if="getColumnItems(col.id).length === 0"
              class="h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400 text-xs gap-1"
            >
              <Icon icon="solar:box-minimalistic-linear" class="text-xl" />
              <span>Hozircha bo'sh</span>
            </div>
          </div>

          <!-- Column Footer Summary -->
          <div
            v-if="col.showFooterSum !== false && getColumnTotalSum(col.id) > 0"
            class="p-2.5 bg-gray-100/70 dark:bg-gray-800/90 border-t dark:border-gray-700 rounded-b-xl text-center text-xs text-gray-500 dark:text-gray-400 font-medium"
          >
            Jami:
            <span class="font-bold text-gray-800 dark:text-gray-200">{{
              formatUZS(getColumnTotalSum(col.id))
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { formatUZS } from "@/helper/formatters";

export default {
  name: "KanbanBoard",
  components: { Icon },
  props: {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    columns: {
      type: Array,
      required: true,
      // Format: [{ id: 'NEW', title: 'Yangi', badgeColor: 'bg-blue-500' }]
    },
    items: {
      type: Array,
      required: true,
      // Format: [{ id: '1', stage: 'NEW', title: '...', amount: 500000 }]
    },
    itemKey: { type: String, default: "id" },
    stageKey: { type: String, default: "stage" },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: { type: String, default: "Qidirish..." },
  },
  emits: ["cardMoved", "cardClick", "quickAdd"],
  data() {
    return {
      searchQuery: "",
      draggedItem: null,
      draggedFromColId: null,
      dragOverColId: null,
    };
  },
  computed: {
    totalItemsCount() {
      return this.filteredItems.length;
    },
    filteredItems() {
      if (!this.searchQuery.trim()) return this.items;
      const q = this.searchQuery.toLowerCase();
      return this.items.filter((item) => {
        const courseStr =
          typeof item.course === "object" && item.course !== null
            ? item.course.name || item.course.title || ""
            : item.course || item.courseName || "";
        const text =
          `${item.title || ""} ${item.name || ""} ${item.fullName || ""} ${item.phone || ""} ${item.source || ""} ${courseStr}`.toLowerCase();
        return text.includes(q);
      });
    },
  },
  methods: {
    formatUZS,
    getColumnItems(colId) {
      return this.filteredItems.filter((item) => item[this.stageKey] === colId);
    },
    getColumnTotalSum(colId) {
      const items = this.getColumnItems(colId);
      return items.reduce((acc, item) => acc + (Number(item.amount) || Number(item.price) || 0), 0);
    },
    onDragStart(item, colId) {
      this.draggedItem = item;
      this.draggedFromColId = colId;
    },
    onDragOver(colId) {
      this.dragOverColId = colId;
    },
    onDragLeave(colId) {
      if (this.dragOverColId === colId) {
        this.dragOverColId = null;
      }
    },
    onDrop(toColId) {
      if (this.draggedItem && this.draggedFromColId !== toColId) {
        this.$emit("cardMoved", {
          item: this.draggedItem,
          fromStage: this.draggedFromColId,
          toStage: toColId,
        });
      }
      this.draggedItem = null;
      this.draggedFromColId = null;
      this.dragOverColId = null;
    },
  },
};
</script>
