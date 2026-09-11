<script setup>
import { Icon } from "@iconify/vue";

import AppDateRangePicker from "@/components/common/AppDateRangePicker.vue";
import AppFilterDropdown from "@/components/common/AppFilterDropdown.vue";

defineProps({
  searchQuery: { type: String, default: "" },
  selectedClass: { type: String, default: "ALL" },
  selectedStage: { type: String, default: "ALL" },
  selectedDebtFilter: { type: String, default: "ALL" },
  classOptions: { type: Array, default: () => [] },
  stageOptions: { type: Array, default: () => [] },
  debtOptions: { type: Array, default: () => [] },
  dateChips: { type: Array, default: () => [] },
  activeDateChip: { type: String, default: "ALL" },
  customDateFrom: { type: String, default: null },
  customDateTo: { type: String, default: null },
  isFiltered: { type: Boolean, default: false },
  paidCount: { type: Number, default: 0 },
  debtCount: { type: Number, default: 0 },
});

const emit = defineEmits([
  "update:searchQuery",
  "update:selectedClass",
  "update:selectedStage",
  "update:selectedDebtFilter",
  "update:customDateFrom",
  "update:customDateTo",
  "selectDateChip",
  "dateRangeChange",
  "reset",
]);
</script>

<template>
  <div class="space-y-3 font-lexend">
    <!-- 1. Sana filtri paneli -->
    <div
      class="bg-white dark:bg-gray-800 p-3 sm:p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between flex-wrap gap-3"
    >
      <div class="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
        <span class="text-gray-500 dark:text-gray-400 font-semibold mr-1">Qo'shilgan:</span>
        <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700/60 p-1">
          <button
            v-for="chip in dateChips"
            :key="chip.id"
            type="button"
            :class="[
              'px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer select-none',
              activeDateChip === chip.id
                ? 'bg-white dark:bg-gray-800 text-primary shadow-2xs font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
            ]"
            @click="emit('selectDateChip', chip.id)"
          >
            {{ chip.label }}
          </button>
        </div>
      </div>

      <AppDateRangePicker
        :start-date="customDateFrom"
        :end-date="customDateTo"
        align="right"
        @update:start-date="(val) => emit('update:customDateFrom', val)"
        @update:end-date="(val) => emit('update:customDateTo', val)"
        @change="(payload) => emit('dateRangeChange', payload)"
      />
    </div>

    <!-- 2. Qidiruv va Filtrlar paneli -->
    <div
      class="bg-white dark:bg-gray-800 p-3 sm:p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between flex-wrap gap-3"
    >
      <div class="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
        <!-- Qidiruv maydoni -->
        <div class="relative w-full sm:w-72">
          <Icon
            icon="solar:magnifer-linear"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
          />
          <input
            type="text"
            :value="searchQuery"
            placeholder="F.I.SH, telefon bo'yicha qidirish..."
            class="w-full pl-9 pr-3.5 h-9 sm:h-9.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-2xs"
            @input="emit('update:searchQuery', $event.target.value)"
          />
        </div>

        <!-- Sinf Dropdown -->
        <AppFilterDropdown
          :model-value="selectedClass"
          :options="classOptions"
          label="Sinf"
          all-label="Barcha sinflar"
          all-value="ALL"
          icon="solar:users-group-rounded-bold"
          min-width="min-w-[190px]"
          @update:model-value="(val) => emit('update:selectedClass', val)"
        />

        <!-- Bosqich Dropdown -->
        <AppFilterDropdown
          :model-value="selectedStage"
          :options="stageOptions"
          label="Bosqich"
          all-label="Barchasi"
          all-value="ALL"
          icon="solar:user-bold"
          min-width="min-w-[180px]"
          @update:model-value="(val) => emit('update:selectedStage', val)"
        />

        <!-- To'lov holati Dropdown -->
        <AppFilterDropdown
          :model-value="selectedDebtFilter"
          :options="debtOptions"
          label="To'lov"
          all-label="Barchasi"
          all-value="ALL"
          icon="solar:wallet-money-bold"
          min-width="min-w-[190px]"
          @update:model-value="(val) => emit('update:selectedDebtFilter', val)"
        />

        <!-- Tozalash tugmasi -->
        <button
          v-if="isFiltered"
          type="button"
          class="h-9 sm:h-9.5 px-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5 transition cursor-pointer"
          title="Filtrlarni tozalash"
          @click="emit('reset')"
        >
          <Icon icon="solar:restart-linear" class="text-sm" />
          <span>Tozalash</span>
        </button>
      </div>

      <!-- Tezkor ko'rsatkichlar -->
      <div class="flex items-center gap-2 text-xs">
        <span
          class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
        >
          Qarzsiz: <b>{{ paidCount }}</b>
        </span>
        <span
          class="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800"
        >
          Qarzdorlar: <b>{{ debtCount }}</b>
        </span>
      </div>
    </div>
  </div>
</template>
