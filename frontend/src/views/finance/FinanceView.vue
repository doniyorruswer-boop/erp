<script setup>
import { Icon } from "@iconify/vue";
import { ref } from "vue";

import Alert from "@/components/Alert.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";
import DataTable from "@/components/common/AppTable.vue";
import FinancePaymentModal from "@/components/finance/FinancePaymentModal.vue";
import FinanceStatsCards from "@/components/finance/FinanceStatsCards.vue";
import { useFinance } from "@/composables/useFinance";
import {
  getPaymentMethodBadgeClass,
  getPaymentMethodIcon,
  getPaymentMethodName,
} from "@/config/paymentMethods";
import { formatDate } from "@/helper/formatters";

const { payments, summary, studentOptions, loading, alertMessage, submitPayment } = useFinance();

const paymentModal = ref(null);

const columns = [
  { key: "receiptNumber", label: "Chek №", sortable: true },
  { key: "student", label: "O'quvchi", sortable: false },
  { key: "amount", label: "Summa", sortable: true },
  { key: "method", label: "To'lov Usuli", sortable: false },
  { key: "notes", label: "Izoh", sortable: false },
  { key: "paymentDate", label: "Sana", sortable: true },
];

const formatUZS = (val) => {
  if (val === undefined || val === null) return "0 so'm";
  return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
};

const handleCreatePayment = (payload) => {
  submitPayment(payload);
};
</script>

<template>
  <div class="finance-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Moliya & Kassa' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Moliya & Kassa</h1>
        <p class="text-sm text-gray-400">O'quv markazining barcha to'lovlari va kassa hisoboti</p>
      </div>

      <AppButton
        v-permission="'payments.create'"
        variant="success"
        icon="solar:wallet-money-bold"
        icon-class="text-lg"
        @click="paymentModal?.open()"
      >
        Yangi To'lov
      </AppButton>
    </div>

    <!-- Floating Alert Toast -->
    <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

    <!-- Stats Cards -->
    <FinanceStatsCards
      :total-income="summary.totalIncome"
      :monthly-income="summary.monthlyIncome"
      :debtors-count="summary.debtorsCount"
    />

    <!-- Payments DataTable -->
    <DataTable
      title="To'lovlar Tarixi"
      subtitle="Barcha qabul qilingan to'lovlar va cheklar"
      :columns="columns"
      :data="payments"
      :loading="loading"
      :searchable="true"
      :show-index="true"
      :show-per-page="true"
      search-placeholder="Chek raqami, o'quvchi yoki to'lov turi..."
      row-key="id"
    >
      <template #cell(receiptNumber)="{ row }">
        <span class="font-mono text-xs text-gray-500 font-semibold">
          {{ row.receiptNumber || "-" }}
        </span>
      </template>

      <template #cell(student)="{ row }">
        <div class="font-medium text-gray-800 dark:text-gray-100">
          {{ row.student?.firstName }} {{ row.student?.lastName }}
        </div>
        <div class="text-xs text-gray-400">{{ row.student?.phone }}</div>
      </template>

      <template #cell(amount)="{ row }">
        <span class="font-bold text-green-600"> +{{ formatUZS(row.amount) }} </span>
      </template>

      <template #cell(method)="{ row }">
        <span
          :class="[
            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
            getPaymentMethodBadgeClass(row.method),
          ]"
        >
          <Icon :icon="getPaymentMethodIcon(row.method)" class="text-xs" />
          <span>{{ getPaymentMethodName(row.method) }}</span>
        </span>
      </template>

      <template #cell(paymentDate)="{ row }">
        <span class="text-xs text-gray-500">{{ formatDate(row.paymentDate) }}</span>
      </template>
    </DataTable>

    <!-- Payment Modal Component -->
    <FinancePaymentModal
      ref="paymentModal"
      :student-options="studentOptions"
      @submit="handleCreatePayment"
    />
  </div>
</template>
