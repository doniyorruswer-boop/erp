<script setup>
import { Icon } from "@iconify/vue";
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";

import Alert from "@/components/Alert.vue";
import Badge from "@/components/Badge.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";
import DataTable from "@/components/common/AppTable.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import StudentFilterBar from "@/components/students/StudentFilterBar.vue";
import StudentPaymentModal from "@/components/students/StudentPaymentModal.vue";
import StudentStatsCards from "@/components/students/StudentStatsCards.vue";
import StudentWizardModal from "@/components/students/StudentWizardModal.vue";
import { useStudents } from "@/composables/useStudents";
import { useTerminology } from "@/composables/useTerminology";
import { usePermission } from "@/core/security";

const { hasPermission } = usePermission();
const { term, termLower } = useTerminology();

const {
  loading,
  alertMessage,
  statusFilter,
  activeStudent,
  studentToDelete,
  filteredStudents,
  students,
  activeCount,
  debtorsCount,
  totalBalance,
  fetchStudents,
  confirmDelete,
  executeDeleteStudent,
  onStudentWizardSaved,
} = useStudents();

const studentWizard = ref(null);
const paymentModal = ref(null);
const confirmDeleteModal = ref(null);

const columns = computed(() => [
  { key: "firstName", label: term("client", "singular"), sortable: true },
  { key: "phone", label: "Telefon", sortable: false },
  { key: "parentName", label: "Ota-onasi", sortable: false },
  { key: "enrollments", label: term("group", "plural"), sortable: false },
  { key: "balance", label: "Balans", sortable: true },
  { key: "status", label: "Holat", sortable: true },
]);

const formatUZS = (val) => {
  if (val === undefined || val === null) return "0 so'm";
  return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
};

const handleOpenPayment = (student) => {
  activeStudent.value = student;
  paymentModal.value?.open();
};

const handleConfirmDelete = (student) => {
  if (!hasPermission("students.delete")) return;
  confirmDelete(student);
  confirmDeleteModal.value?.open();
};

const handlePaymentSaved = async () => {
  alertMessage.value = "To'lov muvaffaqiyatli qabul qilindi!";
  await fetchStudents();
};
</script>

<template>
  <div class="students-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: term('client', 'plural') }]" />

    <!-- Header Section -->
    <StudentFilterBar v-model:status-filter="statusFilter" @open-wizard="studentWizard?.open()" />

    <!-- Floating Alert Toast -->
    <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

    <!-- 4 Stats Cards -->
    <StudentStatsCards
      :total-count="students.length"
      :active-count="activeCount"
      :debtors-count="debtorsCount"
      :total-balance="totalBalance"
    />

    <!-- Data Table Component -->
    <DataTable
      title="Barcha O'quvchilar"
      subtitle="O'quvchilar ro'yxati va to'lov holati"
      :columns="columns"
      :data="filteredStudents"
      :loading="loading"
      :searchable="true"
      :show-index="true"
      :show-per-page="true"
      search-placeholder="Ism, telefon yoki manzil..."
      row-key="id"
    >
      <!-- Header Actions: Status Filter -->
      <template #headerActions>
        <select
          v-model="statusFilter"
          class="py-1.5 px-3 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
        >
          <option value="">Barcha holatlar</option>
          <option value="ACTIVE">Faol o'quvchilar</option>
          <option value="FROZEN">Muzlatilganlar</option>
          <option value="INACTIVE">Nofaollar</option>
        </select>
      </template>

      <!-- Custom Student Cell -->
      <template #cell(firstName)="{ row }">
        <RouterLink
          :to="`/students/${row.id}`"
          class="font-semibold text-gray-800 dark:text-gray-100 hover:text-primary transition flex items-center gap-1.5"
        >
          <span>{{ row.firstName }} {{ row.lastName }}</span>
          <Icon
            icon="solar:arrow-right-up-linear"
            class="text-xs opacity-0 group-hover:opacity-100 text-primary"
          />
        </RouterLink>
        <div class="text-xs text-gray-400">
          {{ row.address || "Manzil yo'q" }}
        </div>
      </template>

      <!-- Custom Parent Cell -->
      <template #cell(parentName)="{ row }">
        <div class="text-gray-800 dark:text-gray-200">
          {{ row.parentName || "-" }}
        </div>
        <div class="text-xs text-gray-400">{{ row.parentPhone || "" }}</div>
      </template>

      <!-- Custom Enrollments Cell -->
      <template #cell(enrollments)="{ row }">
        <div class="flex flex-wrap gap-1">
          <Badge v-for="en in row.enrollments" :key="en.id" variant="primary" size="xs">
            {{ en.group?.name }}
          </Badge>
          <span
            v-if="!row.enrollments || row.enrollments.length === 0"
            class="text-xs text-gray-400"
          >
            Guruhsiz
          </span>
        </div>
      </template>

      <!-- Custom Balance Cell -->
      <template #cell(balance)="{ row }">
        <span
          :class="row.balance >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'"
        >
          {{ formatUZS(row.balance) }}
        </span>
      </template>

      <!-- Custom Status Cell -->
      <template #cell(status)="{ row }">
        <Badge
          :variant="
            row.status === 'ACTIVE' ? 'success' : row.status === 'FROZEN' ? 'warning' : 'danger'
          "
          :dot="true"
          size="sm"
        >
          {{
            row.status === "ACTIVE" ? "Faol" : row.status === "FROZEN" ? "Muzlatilgan" : "Nofaol"
          }}
        </Badge>
      </template>

      <!-- Actions Slot -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <RouterLink :to="`/students/${row.id}`">
            <AppButton variant="outline" size="sm" icon="solar:user-id-linear"> Profil </AppButton>
          </RouterLink>
          <AppButton
            v-permission="'payments.create'"
            variant="success"
            size="sm"
            icon="solar:wallet-money-bold"
            @click="handleOpenPayment(row)"
          >
            To'lov
          </AppButton>
          <AppButton
            v-permission="'students.delete'"
            variant="outline"
            size="sm"
            icon="solar:trash-bin-trash-linear"
            class="text-red-600 border-red-200 hover:bg-red-50"
            @click="handleConfirmDelete(row)"
          >
            O'chirish
          </AppButton>
        </div>
      </template>
    </DataTable>

    <!-- Payment Modal Component -->
    <StudentPaymentModal ref="paymentModal" :student="activeStudent" @saved="handlePaymentSaved" />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      ref="confirmDeleteModal"
      :title="`${term('client', 'singular')}ni o'chirish`"
      :message="`Haqiqatan ham ${studentToDelete?.firstName} ${studentToDelete?.lastName} ${termLower('client', 'singular')}ni o'chirmoqchimisiz?`"
      confirm-text="Ha, o'chirish"
      @confirm="executeDeleteStudent"
    />

    <!-- Multi-Step Student Wizard Modal -->
    <StudentWizardModal ref="studentWizard" @saved="onStudentWizardSaved" />
  </div>
</template>
