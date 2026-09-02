<template>
  <div class="audit-logs-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Xavfsizlik Jurnali (Audit)' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Tizim Xavfsizlik Jurnali (Audit Log)</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          Barcha muhim harakatlar, to'lovlar, o'quvchilar va sozlamalar o'zgarishlari xronologiyasi.
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          @click="fetchData"
          class="inline-flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition cursor-pointer"
        >
          <Icon icon="solar:restart-bold" class="w-4 h-4 mr-1.5" />
          Yangilash
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Jami Yozuvlar</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ totalLogs }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Yaratish (CREATE)</p>
        <p class="text-2xl font-bold text-emerald-600 mt-2">{{ createCount }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">O'zgartirish (UPDATE)</p>
        <p class="text-2xl font-bold text-blue-600 mt-2">{{ updateCount }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">O'chirish (DELETE)</p>
        <p class="text-2xl font-bold text-rose-600 mt-2">{{ deleteCount }} ta</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:w-80">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Icon icon="solar:magnifer-linear" class="w-5 h-5" />
        </span>
        <input
          v-model="searchQuery"
          @input="debounceSearch"
          type="text"
          placeholder="Modul, ID yoki harakat..."
          class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <select
          v-model="selectedAction"
          @change="fetchData"
          class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Barcha amallar</option>
          <option value="CREATE">Yaratish (CREATE)</option>
          <option value="UPDATE">Tahrirlash (UPDATE)</option>
          <option value="DELETE">O'chirish (DELETE)</option>
          <option value="LOGIN">Tizimga kirish (LOGIN)</option>
        </select>

        <select
          v-model="selectedEntity"
          @change="fetchData"
          class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Barcha modullar</option>
          <option value="Student">O'quvchilar (Student)</option>
          <option value="Payment">To'lovlar (Payment)</option>
          <option value="Invoice">Hisob-fakturalar (Invoice)</option>
          <option value="Contract">Shartnomalar (Contract)</option>
          <option value="Group">Guruhlar (Group)</option>
          <option value="Course">Kurslar (Course)</option>
          <option value="User">Foydalanuvchilar (User)</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
        <p>Yuklanmoqda...</p>
      </div>

      <div v-else-if="logs.length === 0" class="p-12 text-center text-gray-400">
        <Icon icon="solar:document-text-bold" class="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
        <p class="text-base font-medium">Hech qanday audit yozuvi topilmadi</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead class="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
            <tr>
              <th class="px-6 py-4">Sana & Vaqt</th>
              <th class="px-6 py-4">Bajaruvchi (Actor)</th>
              <th class="px-6 py-4">Amal</th>
              <th class="px-6 py-4">Modul / Obyekt</th>
              <th class="px-6 py-4">IP Manzil</th>
              <th class="px-6 py-4 text-right">Tafsilot</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700 font-mono text-xs">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <td class="px-6 py-4 font-sans text-gray-900 dark:text-white">
                {{ formatDateTime(log.createdAt) }}
              </td>
              <td class="px-6 py-4 font-sans">
                <div v-if="log.user" class="font-medium text-gray-800 dark:text-gray-200">
                  {{ log.user.firstName }} {{ log.user.lastName }}
                </div>
                <div class="text-xs text-gray-400 font-normal">
                  {{ log.user?.phone || log.userId || "Tizim (Cron/System)" }}
                </div>
              </td>
              <td class="px-6 py-4 font-sans">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="getActionBadgeClass(log.action)"
                >
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="font-semibold text-gray-800 dark:text-gray-200 font-sans">
                  {{ log.entityType }}
                </div>
                <div class="text-gray-400 text-2xs truncate max-w-xs">
                  ID: {{ log.entityId }}
                </div>
              </td>
              <td class="px-6 py-4 text-gray-500">
                {{ log.ipAddress || '127.0.0.1' }}
              </td>
              <td class="px-6 py-4 text-right font-sans">
                <button
                  @click="viewDetails(log)"
                  class="px-2.5 py-1 text-xs text-primary hover:bg-primary/10 rounded-lg transition"
                >
                  Ko'rish
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedLog" class="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between pb-4 border-b dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            Audit Yozuvi Tafsiloti
          </h3>
          <button @click="selectedLog = null" class="text-gray-400 hover:text-gray-600">
            <Icon icon="solar:close-circle-bold" class="w-6 h-6" />
          </button>
        </div>

        <div class="mt-4 space-y-3 overflow-y-auto flex-1 pr-1 text-xs">
          <div class="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div><span class="text-gray-400">Modul:</span> <strong class="text-gray-800 dark:text-white">{{ selectedLog.entityType }}</strong></div>
            <div><span class="text-gray-400">Harakat:</span> <strong class="text-gray-800 dark:text-white">{{ selectedLog.action }}</strong></div>
            <div><span class="text-gray-400">Sana:</span> <span class="text-gray-800 dark:text-white">{{ formatDateTime(selectedLog.createdAt) }}</span></div>
            <div><span class="text-gray-400">IP Manzil:</span> <span class="text-gray-800 dark:text-white">{{ selectedLog.ipAddress || '127.0.0.1' }}</span></div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">O'zgarishlar (Payload / Diff)</label>
            <pre class="p-3 bg-gray-900 text-emerald-400 rounded-xl overflow-x-auto text-2xs font-mono">{{ JSON.stringify(selectedLog.details || selectedLog.changes || {}, null, 2) }}</pre>
          </div>
        </div>

        <div class="pt-4 border-t dark:border-gray-700 flex justify-end">
          <button
            @click="selectedLog = null"
            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import { auditApi } from "@/api/services";

export default {
  name: "AuditLogsList",
  components: { Icon, Breadcrumb },
  data() {
    return {
      logs: [],
      totalLogs: 0,
      loading: true,
      searchQuery: "",
      selectedAction: "",
      selectedEntity: "",
      selectedLog: null,
      searchTimeout: null,
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
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const params = {
          limit: 100,
        };
        if (this.selectedAction) params.action = this.selectedAction;
        if (this.selectedEntity) params.entityType = this.selectedEntity;
        if (this.searchQuery) params.search = this.searchQuery;

        const res = await auditApi.getAll(params);
        if (Array.isArray(res)) {
          this.logs = res;
          this.totalLogs = res.length;
        } else if (res?.items) {
          this.logs = res.items;
          this.totalLogs = res.meta?.total || res.items.length;
        } else {
          this.logs = [];
        }
      } catch (err) {
        console.error("Error loading audit logs:", err);
      } finally {
        this.loading = false;
      }
    },
    debounceSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.fetchData();
      }, 300);
    },
    formatDateTime(dateStr) {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return d.toLocaleString("uz-UZ", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    getActionBadgeClass(action) {
      const map = {
        CREATE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        DELETE: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
        LOGIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      };
      return map[action] || "bg-gray-100 text-gray-800";
    },
    viewDetails(log) {
      this.selectedLog = log;
    },
  },
};
</script>
