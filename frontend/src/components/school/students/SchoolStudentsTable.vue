<script setup>
import { Icon } from "@iconify/vue";

import AppGroupBadge from "@/components/common/AppGroupBadge.vue";
import AppMoneyCell from "@/components/common/AppMoneyCell.vue";
import AppPhoneCell from "@/components/common/AppPhoneCell.vue";
import AppStatusBadge from "@/components/common/AppStatusBadge.vue";
import AppTable from "@/components/common/AppTable.vue";
import AppUserCell from "@/components/common/AppUserCell.vue";
import { useFormatters } from "@/composables/useFormatters";

defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  selectedIds: { type: Array, default: () => [] },
  startItem: { type: Number, default: 0 },
  endItem: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  visiblePages: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "update:selectedIds",
  "pageChange",
  "prevPage",
  "nextPage",
  "payment",
  "edit",
  "delete",
]);

const { formatMoney } = useFormatters();
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden font-lexend"
  >
    <AppTable
      :columns="columns"
      :rows="rows"
      :model-value="selectedIds"
      selectable
      empty-text="O'quvchilar topilmadi"
      @update:model-value="(val) => emit('update:selectedIds', val)"
    >
      <!-- F.I.SH -->
      <template #cell(fullName)="{ row }">
        <AppUserCell :name="row.fullName" :subtext="'ID: ' + row.studentId" />
      </template>

      <!-- Sinf -->
      <template #cell(className)="{ row }">
        <AppGroupBadge :name="row.className" />
      </template>

      <!-- Bosqich -->
      <template #cell(stage)="{ row }">
        <span
          :class="[
            'px-2 py-0.5 rounded-md text-xs font-semibold',
            row.stage === 'O\'quvchi'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
              : row.stage === 'Sinov'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          ]"
        >
          {{ row.stage }}
        </span>
      </template>

      <!-- Telefon -->
      <template #cell(phone)="{ row }">
        <AppPhoneCell :phone="row.phone" />
      </template>

      <!-- To'lov summasi -->
      <template #cell(monthlyFee)="{ row }">
        <AppMoneyCell :amount="row.monthlyFee" />
      </template>

      <!-- Qarzdorlik -->
      <template #cell(debt)="{ row }">
        <div class="text-right">
          <span
            v-if="row.debt > 0"
            class="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-md text-xs"
          >
            {{ formatMoney(row.debt) }}
          </span>
          <span v-else class="text-emerald-600 dark:text-emerald-400 font-medium text-xs">
            0 so'm
          </span>
        </div>
      </template>

      <!-- Holati -->
      <template #cell(status)="{ row }">
        <AppStatusBadge
          :status="row.status === 'Faol' || row.status === 'ACTIVE' ? 'active' : 'inactive'"
        />
      </template>

      <!-- Amallar -->
      <template #cell(actions)="{ row }">
        <div class="flex items-center justify-end gap-1.5">
          <button
            type="button"
            class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
            title="To'lov qabul qilish"
            @click="emit('payment', row)"
          >
            <Icon icon="solar:wallet-money-bold" class="text-base" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            title="Tahrirlash"
            @click="emit('edit', row)"
          >
            <Icon icon="solar:pen-linear" class="text-base" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title="O'chirish"
            @click="emit('delete', row)"
          >
            <Icon icon="solar:trash-bin-trash-linear" class="text-base" />
          </button>
        </div>
      </template>
    </AppTable>

    <!-- Pagination bar -->
    <div
      v-if="rows.length > 0"
      class="flex items-center justify-between flex-wrap gap-3 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-xs text-gray-500 font-medium"
    >
      <span> {{ startItem }}-{{ endItem }} / Jami: {{ totalItems }} ta </span>
      <div v-if="totalPages > 1" class="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          :disabled="currentPage <= 1"
          class="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition cursor-pointer"
          @click="emit('prevPage')"
        >
          <Icon icon="solar:alt-arrow-left-linear" />
        </button>
        <button
          v-for="(page, idx) in visiblePages"
          :key="idx"
          type="button"
          :class="[
            'w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer',
            currentPage === page
              ? 'bg-primary text-white shadow-2xs cursor-default'
              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
          ]"
          @click="typeof page === 'number' && emit('pageChange', page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          :disabled="currentPage >= totalPages"
          class="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition cursor-pointer"
          @click="emit('nextPage')"
        >
          <Icon icon="solar:alt-arrow-right-linear" />
        </button>
      </div>
    </div>
  </div>
</template>
