<template>
  <div class="space-y-4">
    <!-- Ommaviy jadval amallar paneli -->
    <div
      v-if="isBulkTableMode"
      class="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-2 text-sm"
    >
      <div class="flex items-center gap-3 text-indigo-900 dark:text-indigo-200 font-semibold">
        <input
          type="checkbox"
          :checked="isAllSelected"
          class="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
          @change="$emit('toggle-select-all')"
        />
        <span
          >Barcha o'quvchilarni tanlash ({{ selectedStudentIds.length }} /
          {{ totalStudents }})</span
        >
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="selectedStudentIds.length === 0"
          class="px-3.5 py-1.5 bg-white dark:bg-gray-800 border rounded-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 disabled:opacity-50 text-sm cursor-pointer"
          @click="$emit('bulk-action', 'transfer')"
        >
          Boshqa sinfga ko'chirish
        </button>
        <button
          type="button"
          :disabled="selectedStudentIds.length === 0"
          class="px-3.5 py-1.5 bg-white dark:bg-gray-800 border rounded-lg font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 text-sm cursor-pointer"
          @click="$emit('bulk-action', 'payment-sheet')"
        >
          To'lov varaqasini chiqarish
        </button>
      </div>
    </div>

    <!-- O'quvchilar Jadvali (Universal AppTable) -->
    <AppTable
      :columns="tableColumns"
      :data="students"
      :selectable="isBulkTableMode"
      :model-value="selectedStudentIds"
      :show-index="true"
      index-label="#"
      :per-page="perPage"
      :pagination="false"
      item-label="o'quvchi"
      empty-text="Filtr bo'yicha hech qanday o'quvchi topilmadi."
      empty-description="Iltimos, filtrlarni o'zgartiring yoki tozalash tugmasini bosing."
      row-class="cursor-pointer group hover:bg-primary/[0.03]"
      @row-select="(key) => $emit('toggle-select', key)"
      @select-all="() => $emit('toggle-select-all')"
      @row-click="$emit('student-click', $event)"
    >
      <!-- FISH va ID (Universal AppUserCell - 1-rasm standarti) -->
      <template #cell(fullName)="{ row: st }">
        <AppUserCell :name="st.fullName" :image="st.avatar" :subtitle="'ID: ' + st.studentId" />
      </template>

      <!-- PASPORT / GUVOHNOMA va JSHSHIR (Universal AppDocCell) -->
      <template #cell(passport)="{ row: st }">
        <AppDocCell :doc="st.passport" :pinfl="st.pinfl" />
      </template>

      <!-- TUG'ILGAN SANA va Yoshi (Universal AppDateCell) -->
      <template #cell(birthDate)="{ row: st }">
        <AppDateCell :date="st.birthDate" :show-age="true" :show-icon="true" />
      </template>

      <!-- OTA-ONA / VASIY va Telefon raqami -->
      <template #cell(parentName)="{ row: st }">
        <div class="font-medium text-gray-800 dark:text-gray-200 text-xs truncate max-w-[160px]">
          {{ st.parentName }}
        </div>
        <div class="mt-0.5" @click.stop>
          <AppPhoneCell :phone="st.parentPhone" />
        </div>
      </template>

      <!-- SINF va Holati (Universal AppGroupBadge + AppStatusBadge) -->
      <template #cell(className)="{ row: st }">
        <div class="text-center flex flex-col items-center gap-1">
          <AppGroupBadge :name="st.className" />
          <AppStatusBadge v-if="st.status" :status="st.status" size="xs" />
        </div>
      </template>

      <!-- SINF TURI va Ta'lim tili -->
      <template #cell(classType)="{ row: st }">
        <div class="text-center">
          <div class="text-gray-700 dark:text-gray-300 font-medium text-xs">
            {{ st.classType }}
          </div>
          <div class="mt-1">
            <span
              class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            >
              {{ st.language }}
            </span>
          </div>
        </div>
      </template>

      <!-- SMENA -->
      <template #cell(shift)="{ row: st }">
        <div class="font-semibold text-gray-800 dark:text-gray-200 text-xs">
          {{ st.shift }}
        </div>
        <div class="text-xs text-gray-400 font-medium">
          {{ st.shiftHours }}
        </div>
      </template>

      <!-- QABUL BUYRUG'I va Sanasi -->
      <template #cell(orderNumber)="{ row: st }">
        <div
          class="font-medium text-gray-800 dark:text-gray-200 text-xs truncate max-w-[170px]"
          :title="st.orderNumber"
        >
          {{ st.orderNumber }}
        </div>
        <div class="text-xs text-gray-400 font-medium mt-0.5">
          {{ st.orderDate }}
        </div>
      </template>

      <!-- Amallar (O'ng strelka) -->
      <template #actions>
        <div class="text-center text-gray-400 group-hover:text-primary transition-colors">
          <Icon
            icon="solar:alt-arrow-right-linear"
            class="text-lg transform group-hover:translate-x-0.5 transition-transform"
          />
        </div>
      </template>
    </AppTable>

    <!-- Jadval pastki qatori va Paginatsiya (AppPagination orqali) -->
    <AppPagination
      :model-value="currentPage"
      :total-items="totalStudents"
      :per-page="perPage"
      item-label="o'quvchi"
      @update:model-value="$emit('update:currentPage', $event)"
    />
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import AppPagination from "@/components/common/AppPagination.vue";
import AppTable from "@/components/common/AppTable.vue";

export default {
  name: "SchoolClassStudentsTable",
  components: {
    Icon,
    AppTable,
    AppPagination,
  },
  props: {
    students: {
      type: Array,
      default: () => [],
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    isBulkTableMode: {
      type: Boolean,
      default: false,
    },
    selectedStudentIds: {
      type: Array,
      default: () => [],
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    perPage: {
      type: Number,
      default: 10,
    },
  },
  emits: [
    "toggle-select",
    "toggle-select-all",
    "student-click",
    "update:currentPage",
    "bulk-action",
  ],
  data() {
    return {
      tableColumns: [
        { key: "fullName", label: "FISH", thClass: "py-3.5 px-4 min-w-[210px]" },
        { key: "passport", label: "PASPORT / GUVOHNOMA", thClass: "py-3.5 px-4 min-w-[180px]" },
        { key: "birthDate", label: "TUG'ILGAN SANA", thClass: "py-3.5 px-4 min-w-[140px]" },
        { key: "parentName", label: "OTA-ONA / VASIY", thClass: "py-3.5 px-4 min-w-[180px]" },
        {
          key: "className",
          label: "SINF",
          align: "center",
          thClass: "py-3.5 px-4 text-center min-w-[110px]",
        },
        {
          key: "classType",
          label: "SINF TURI",
          align: "center",
          thClass: "py-3.5 px-4 text-center min-w-[130px]",
        },
        { key: "shift", label: "SMENA", thClass: "py-3.5 px-4 min-w-[150px]" },
        { key: "orderNumber", label: "QABUL BUYRUG'I", thClass: "py-3.5 px-4 min-w-[180px]" },
      ],
    };
  },
  computed: {
    isAllSelected() {
      return this.totalStudents > 0 && this.selectedStudentIds.length === this.totalStudents;
    },
  },
};
</script>
