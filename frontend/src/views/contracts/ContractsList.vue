<template>
  <div class="contracts-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'O\'quv Shartnomalari' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Shartnomalar Boshqaruvi</h1>
        <p class="text-sm text-gray-400">O'quv yili shartnomalari, to'lov grafiklari va shartnoma cheklari</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="openNewContractModal"
          class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/90 rounded py-2.5 px-4 font-medium shadow-sm transition cursor-pointer"
        >
          <Icon icon="solar:document-add-bold" class="text-lg" />
          <span>Yangi Shartnoma</span>
        </button>
      </div>
    </div>

    <!-- 3 Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatsCard title="Jami Shartnomalar" :value="`${contracts.length} ta`" icon="solar:document-text-bold" variant="primary" />
      <StatsCard title="Umumiy Shartnoma Qiymati" :value="formatUZS(totalContractSum)" icon="solar:wallet-money-bold" variant="success" valueClass="text-green-600 dark:text-green-400" />
      <StatsCard title="Faol Shartnomalar" :value="`${activeContractsCount} ta`" icon="solar:check-circle-bold" variant="purple" />
    </div>

    <!-- DataTable -->
    <DataTable
      title="Barcha Shartnomalar"
      subtitle="O'quvchilar bilan tuzilgan rasmiy ta'lim shartnomalari"
      :columns="columns"
      :data="contracts"
      :loading="loading"
      :searchable="true"
      :showIndex="true"
      :showPerPage="true"
      searchPlaceholder="Shartnoma raqami yoki o'quvchi..."
      rowKey="id"
    >
      <template #cell(contractNumber)="{ row }">
        <span class="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-1 rounded">
          № {{ row.contractNumber }}
        </span>
      </template>

      <template #cell(totalAmount)="{ row }">
        <span class="font-semibold text-gray-800 dark:text-gray-200">
          {{ formatUZS(row.totalAmount) }}
        </span>
      </template>

      <template #cell(status)="{ row }">
        <span
          class="px-2.5 py-1 rounded-full text-xs font-semibold"
          :class="row.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-gray-100 text-gray-600'"
        >
          {{ row.status === 'ACTIVE' ? 'Faol' : 'Yopilgan' }}
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import StatsCard from "@/components/StatsCard.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  name: "ContractsList",
  components: {
    Icon,
    Breadcrumb,
    StatsCard,
    DataTable,
  },
  data() {
    return {
      loading: false,
      contracts: [
        { id: "1", contractNumber: "EDU-2026-001", studentName: "Bobur Mirzayev", totalAmount: 7800000, discountAmount: 500000, startDate: "2026-09-01", status: "ACTIVE" },
        { id: "2", contractNumber: "EDU-2026-002", studentName: "Madina Aliyeva", totalAmount: 18500000, discountAmount: 0, startDate: "2026-09-01", status: "ACTIVE" },
        { id: "3", contractNumber: "EDU-2026-003", studentName: "Jasur Saidov", totalAmount: 6500000, discountAmount: 0, startDate: "2026-09-05", status: "ACTIVE" },
        { id: "4", contractNumber: "EDU-2026-004", studentName: "Sardorbek Rahimov", totalAmount: 22000000, discountAmount: 1000000, startDate: "2026-09-01", status: "ACTIVE" },
      ],
      columns: [
        { key: "contractNumber", label: "Shartnoma №", sortable: true },
        { key: "studentName", label: "O'quvchi", sortable: true },
        { key: "totalAmount", label: "Shartnoma Summasi", sortable: true },
        { key: "startDate", label: "Boshlanish Sanasi", sortable: true },
        { key: "status", label: "Holati", sortable: true },
      ],
    };
  },
  computed: {
    totalContractSum() {
      return this.contracts.reduce((acc, c) => acc + (c.totalAmount || 0), 0);
    },
    activeContractsCount() {
      return this.contracts.filter((c) => c.status === "ACTIVE").length;
    },
  },
  methods: {
    formatUZS(val) {
      if (!val) return "0 so'm";
      return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
    },
    openNewContractModal() {
      alert("Yangi shartnoma yaratish oynasi");
    },
  },
};
</script>
