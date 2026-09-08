<template>
  <div class="audit-logs-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Xavfsizlik Jurnali (Audit)' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Tizim Xavfsizlik Jurnali (Audit Log)</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          Barcha muhim harakatlar, to'lovlar, o'quvchilar va sozlamalar o'zgarishlari xronologiyasi
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="fetchData"
          class="border flex items-center text-sm gap-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700 rounded-md py-2 px-4 font-medium shadow-sm transition cursor-pointer"
        >
          <Icon icon="solar:restart-bold" class="text-base" />
          <span>Yangilash</span>
        </button>
      </div>
    </div>

    <!-- Alert Message -->
    <Alert v-if="alertMessage" :message="alertMessage" :type="alertType" @close="alertMessage = ''" />

    <!-- 4 Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Jami Yozuvlar"
        :value="`${totalLogs} ta`"
        icon="solar:history-bold"
        variant="primary"
      />
      <StatsCard
        title="Yaratish (CREATE)"
        :value="`${createCount} ta`"
        icon="solar:add-circle-bold"
        variant="success"
        valueClass="text-green-600 dark:text-green-400"
      />
      <StatsCard
        title="O'zgartirish (UPDATE)"
        :value="`${updateCount} ta`"
        icon="solar:pen-new-square-bold"
        variant="info"
        valueClass="text-blue-600 dark:text-blue-400"
      />
      <StatsCard
        title="O'chirish (DELETE)"
        :value="`${deleteCount} ta`"
        icon="solar:trash-bin-trash-bold"
        variant="danger"
        valueClass="text-red-600 dark:text-red-400"
      />
    </div>

    <!-- Data Table Component -->
    <DataTable
      title="Audit Yozuvlari"
      subtitle="Foydalanuvchilar tomonidan bajarilgan amallar jurnali"
      :columns="columns"
      :data="filteredLogs"
      :loading="loading"
      :searchable="true"
      :showIndex="true"
      :showPerPage="true"
      searchPlaceholder="Modul, ID yoki harakat..."
      rowKey="id"
    >
      <!-- Header Actions: Action & Entity Filters -->
      <template #headerActions>
        <div class="flex items-center gap-2">
          <select
            v-model="selectedAction"
            @change="fetchData"
            class="py-1.5 px-3 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
          >
            <option value="">Barcha amallar</option>
            <option value="CREATE">CREATE (Yaratish)</option>
            <option value="UPDATE">UPDATE (Tahrirlash)</option>
            <option value="DELETE">DELETE (O'chirish)</option>
            <option value="PAYMENT">PAYMENT (To'lov)</option>
            <option value="REFUND">REFUND (Qaytarish)</option>
            <option value="LOGIN">LOGIN (Kirish)</option>
          </select>
        </div>
      </template>

      <!-- Custom Action Cell -->
      <template #cell(action)="{ row }">
        <Badge :variant="getActionBadgeVariant(row.action)" :dot="true" size="sm">
          {{ row.action }}
        </Badge>
      </template>

      <!-- Custom Entity Cell -->
      <template #cell(entity)="{ row }">
        <div>
          <span class="font-semibold text-gray-800 dark:text-gray-100 uppercase text-xs">
            {{ row.entityType || 'TIZIM' }}
          </span>
          <div class="text-[11px] font-mono text-gray-400 truncate max-w-[140px]">
            ID: {{ row.entityId ? row.entityId.slice(0, 12) + '...' : '-' }}
          </div>
        </div>
      </template>

      <!-- Custom User Cell -->
      <template #cell(user)="{ row }">
        <div v-if="row.user">
          <div class="text-xs font-medium text-gray-800 dark:text-gray-200">
            {{ row.user.firstName }} {{ row.user.lastName }}
          </div>
          <div class="text-[11px] text-gray-400 font-mono">{{ row.user.phone || row.user.role }}</div>
        </div>
        <div v-else class="text-xs text-gray-400 italic">
          Tizim (Avtomatik)
        </div>
      </template>

      <!-- Custom Date Cell -->
      <template #cell(date)="{ row }">
        <div class="text-xs text-gray-600 dark:text-gray-300">
          {{ formatDateTime(row.createdAt) }}
        </div>
        <div v-if="row.ip" class="text-[10px] text-gray-400 font-mono">
          IP: {{ row.ip }}
        </div>
      </template>

      <!-- Actions Slot: View JSON Details -->
      <template #actions="{ row }">
        <button
          type="button"
          @click="openDetailsModal(row)"
          title="Tafsilotlar (JSON)"
          class="p-1.5 text-xs text-primary hover:bg-primary/10 rounded transition cursor-pointer flex items-center gap-1 font-medium"
        >
          <Icon icon="solar:eye-linear" class="text-base" />
          <span>Ko'rish</span>
        </button>
      </template>
    </DataTable>

    <!-- Details Modal -->
    <vmodal
      :model-value="showDetailsModal"
      @update:model-value="showDetailsModal = $event"
      title="Audit Tafsilotlari"
      :subtitle="selectedLog ? `${selectedLog.action} - ${selectedLog.entityType} (${formatDateTime(selectedLog.createdAt)})` : ''"
      width="max-w-xl"
      :hide-button="true"
    >
      <div v-if="selectedLog" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
          <div>
            <span class="text-gray-400">Bajaruvchi:</span>
            <div class="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
              {{ selectedLog.user ? `${selectedLog.user.firstName} ${selectedLog.user.lastName} (${selectedLog.user.role})` : 'Tizim' }}
            </div>
          </div>
          <div>
            <span class="text-gray-400">IP & User Agent:</span>
            <div class="font-mono text-gray-800 dark:text-gray-200 mt-0.5 truncate" :title="selectedLog.userAgent">
              {{ selectedLog.ip || 'Lokal' }}
            </div>
          </div>
        </div>

        <div v-if="selectedLog.before">
          <p class="font-semibold text-gray-700 dark:text-gray-300 mb-1">Oldingi Holat (Before):</p>
          <pre class="p-3 bg-gray-900 text-emerald-400 rounded-md font-mono text-[11px] overflow-x-auto max-h-44">{{ JSON.stringify(selectedLog.before, null, 2) }}</pre>
        </div>

        <div v-if="selectedLog.after">
          <p class="font-semibold text-gray-700 dark:text-gray-300 mb-1">Keyingi Holat (After):</p>
          <pre class="p-3 bg-gray-900 text-sky-400 rounded-md font-mono text-[11px] overflow-x-auto max-h-44">{{ JSON.stringify(selectedLog.after, null, 2) }}</pre>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="button"
            @click="showDetailsModal = false"
            class="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </vmodal>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import StatsCard from "@/components/StatsCard.vue";
import DataTable from "@/components/DataTable.vue";
import Badge from "@/components/Badge.vue";
import Alert from "@/components/Alert.vue";
import vmodal from "@/components/modal.vue";
import { auditApi } from "@/api/services";

export default {
  name: "AuditLogsList",
  components: {
    Icon,
    Breadcrumb,
    StatsCard,
    DataTable,
    Badge,
    Alert,
    vmodal,
  },
  data() {
    return {
      logs: [],
      totalLogs: 0,
      loading: false,
      selectedAction: "",
      alertMessage: "",
      alertType: "success",
      showDetailsModal: false,
      selectedLog: null,
      columns: [
        { key: "action", label: "Amal" },
        { key: "entity", label: "Modul & ID" },
        { key: "user", label: "Foydalanuvchi" },
        { key: "date", label: "Sana & Vaqt" },
      ],
    };
  },
  computed: {
    createCount() {
      return this.logs.filter((l) => l.action === "CREATE").length;
    },
    updateCount() {
      return this.logs.filter((l) => l.action === "UPDATE").length;
    },
    deleteCount() {
      return this.logs.filter((l) => l.action === "DELETE").length;
    },
    filteredLogs() {
      if (!this.selectedAction) return this.logs;
      return this.logs.filter((l) => l.action === this.selectedAction);
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const params = { limit: 100 };
        if (this.selectedAction) params.action = this.selectedAction;
        const res = await auditApi.getAll(params);
        if (res && res.items) {
          this.logs = res.items;
          this.totalLogs = res.total || res.items.length;
        } else if (Array.isArray(res)) {
          this.logs = res;
          this.totalLogs = res.length;
        } else {
          this.logs = [];
          this.totalLogs = 0;
        }
      } catch (err) {
        console.error("Audit loglarini yuklashda xatolik:", err);
        this.alertType = "danger";
        this.alertMessage = "Audit loglarini yuklashda xatolik yuz berdi.";
      } finally {
        this.loading = false;
      }
    },
    getActionBadgeVariant(action) {
      switch (action) {
        case "CREATE":
          return "success";
        case "UPDATE":
          return "info";
        case "DELETE":
          return "danger";
        case "PAYMENT":
          return "primary";
        case "REFUND":
          return "warning";
        case "LOGIN":
          return "purple";
        default:
          return "gray";
      }
    },
    openDetailsModal(log) {
      this.selectedLog = log;
      this.showDetailsModal = true;
    },
    formatDateTime(dateStr) {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return d.toLocaleString("uz-UZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>
