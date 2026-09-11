<script setup>
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppConfirmModal from "@/components/common/AppConfirmModal.vue";
import {
  CLASS_NAMES_LIST,
  DATE_CHIPS,
  DEBT_OPTIONS,
  STAGE_OPTIONS,
  TABLE_COLUMNS,
} from "@/components/school/students/constants";
import SchoolStudentCreateModal from "@/components/school/students/SchoolStudentCreateModal.vue";
import SchoolStudentEditModal from "@/components/school/students/SchoolStudentEditModal.vue";
import SchoolStudentPaymentModal from "@/components/school/students/SchoolStudentPaymentModal.vue";
import SchoolStudentsFilterBar from "@/components/school/students/SchoolStudentsFilterBar.vue";
import SchoolStudentsHeader from "@/components/school/students/SchoolStudentsHeader.vue";
import SchoolStudentsTable from "@/components/school/students/SchoolStudentsTable.vue";
import { useSchoolStudents } from "@/composables/useSchoolStudents";

const {
  selectedStudentIds,
  searchQuery,
  selectedClass,
  selectedStage,
  selectedDebtFilter,
  activeDateChip,
  customDateFrom,
  customDateTo,
  showCreateModal,
  showEditModal,
  showPaymentModal,
  editingStudent,
  payingStudent,
  deleteModal,
  bulkDeleteModal,
  classOptions,
  filteredStudents,
  pagination,
  paidCount,
  debtCount,
  isFiltered,
  handleCreateStudent,
  handleEditStudent,
  handlePaymentConfirm,
  openEditModal,
  openPaymentModal,
  confirmDelete,
  executeDelete,
  executeBulkDelete,
  resetAllFilters,
  handleDateRangeChange,
  exportToExcel,
} = useSchoolStudents();
</script>

<template>
  <div class="school-students-page p-4 font-lexend space-y-5">
    <!-- 1. Breadcrumb -->
    <Breadcrumb
      :items="[
        { title: 'Bosh sahifa', to: '/' },
        { title: 'Ta\'lim', to: '/school/classes' },
        { title: 'O\'quvchilar' },
      ]"
    />

    <!-- 2. Header & Action Buttons -->
    <SchoolStudentsHeader
      :total-count="filteredStudents.length"
      @create="showCreateModal = true"
      @export="exportToExcel"
    />

    <!-- 3. Filtrlar va Qidiruv Paneli -->
    <SchoolStudentsFilterBar
      v-model:search-query="searchQuery"
      v-model:selected-class="selectedClass"
      v-model:selected-stage="selectedStage"
      v-model:selected-debt-filter="selectedDebtFilter"
      v-model:custom-date-from="customDateFrom"
      v-model:custom-date-to="customDateTo"
      :active-date-chip="activeDateChip"
      :class-options="classOptions"
      :stage-options="STAGE_OPTIONS"
      :debt-options="DEBT_OPTIONS"
      :date-chips="DATE_CHIPS"
      :is-filtered="isFiltered"
      :paid-count="paidCount"
      :debt-count="debtCount"
      @select-date-chip="(id) => (activeDateChip = id)"
      @date-range-change="handleDateRangeChange"
      @reset="resetAllFilters"
    />

    <!-- 4. Asosiy Jadval (Sub-component) -->
    <SchoolStudentsTable
      v-model:selected-ids="selectedStudentIds"
      :columns="TABLE_COLUMNS"
      :rows="pagination.paginatedItems.value"
      :start-item="pagination.startItem.value"
      :end-item="pagination.endItem.value"
      :total-items="pagination.totalItems.value"
      :current-page="pagination.currentPage.value"
      :total-pages="pagination.totalPages.value"
      :visible-pages="pagination.visiblePages.value"
      @prev-page="pagination.prevPage"
      @next-page="pagination.nextPage"
      @page-change="(p) => pagination.goToPage(p)"
      @payment="openPaymentModal"
      @edit="openEditModal"
      @delete="confirmDelete"
    />

    <!-- 5. Ommaviy harakatlar paneli -->
    <Transition name="slide-up">
      <div
        v-if="selectedStudentIds.length > 0"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-xs sm:text-sm animate-scale-up"
      >
        <span
          >Tanlandi: <b>{{ selectedStudentIds.length }}</b> ta o'quvchi</span
        >
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer"
          @click="bulkDeleteModal.open(selectedStudentIds)"
        >
          O'chirish
        </button>
        <button
          type="button"
          class="text-gray-400 hover:text-white transition cursor-pointer"
          @click="selectedStudentIds = []"
        >
          Bekor qilish
        </button>
      </div>
    </Transition>

    <!-- 6. Modallar -->
    <SchoolStudentCreateModal
      v-model="showCreateModal"
      :class-names-list="CLASS_NAMES_LIST"
      @submit="handleCreateStudent"
    />

    <SchoolStudentEditModal
      v-model="showEditModal"
      :student="editingStudent"
      :class-names-list="CLASS_NAMES_LIST"
      @submit="handleEditStudent"
    />

    <SchoolStudentPaymentModal
      v-model="showPaymentModal"
      :student="payingStudent"
      @paid="handlePaymentConfirm"
    />

    <AppConfirmModal
      :model-value="deleteModal.isOpen.value"
      title="O'quvchini o'chirish"
      :message="
        deleteModal.targetItem.value
          ? `${deleteModal.targetItem.value.fullName} ni tizimdan o'chirishni tasdiqlaysizmi?`
          : ''
      "
      variant="danger"
      @update:model-value="(val) => (deleteModal.isOpen.value = val)"
      @confirm="executeDelete"
    />

    <AppConfirmModal
      :model-value="bulkDeleteModal.isOpen.value"
      title="Ommaviy o'chirish"
      :message="`${selectedStudentIds.length} ta tanlangan o'quvchini o'chirishni tasdiqlaysizmi?`"
      variant="danger"
      @update:model-value="(val) => (bulkDeleteModal.isOpen.value = val)"
      @confirm="executeBulkDelete"
    />
  </div>
</template>
