<template>
  <div class="p-4 space-y-4">
    <!-- Filter Bar -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="relative w-72">
        <Icon icon="solar:magnifer-linear" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
        <input
          type="text"
          v-model="searchQuery"
          @input="currentPage = 1"
          placeholder="O'quvchi ismi, ID yoki chek raqami..."
          class="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs sm:text-sm outline-none focus:border-primary transition"
        />
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-gray-400 font-medium">To'lov usuli:</span>
        <select
          v-model="selectedMethod"
          @change="currentPage = 1"
          class="py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none"
        >
          <option value="ALL">Barcha usullar</option>
          <option v-for="opt in methodOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
      <table class="w-full text-left border-collapse min-w-[900px]">
        <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b dark:border-gray-700">
          <tr>
            <th class="py-3 px-3.5 w-12 text-center">#</th>
            <th class="py-3 px-4">Sana va Vaqt</th>
            <th class="py-3 px-4 min-w-[200px]">O'quvchi FISH</th>
            <th class="py-3 px-4">Sinf / Guruh</th>
            <th class="py-3 px-4 font-bold">Summa</th>
            <th class="py-3 px-4 text-center">To'lov Usuli</th>
            <th class="py-3 px-4">Chek / Kvitansiya</th>
            <th class="py-3 px-4">Qabul Qiluvchi</th>
            <th class="py-3 px-4 text-right">Amal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs sm:text-sm">
          <tr
            v-for="(t, idx) in paginatedTransactions"
            :key="t.id"
            class="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
          >
            <td class="py-3 px-3.5 text-center text-gray-400 font-medium">{{ (currentPage - 1) * perPage + idx + 1 }}</td>
            <td class="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {{ t.date }}
            </td>
            <td class="py-3 px-4">
              <router-link :to="`/students/${t.studentId}`" class="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors">
                {{ t.studentName }}
              </router-link>
              <span class="block text-[11px] text-primary font-medium">ID: {{ t.studentId }}</span>
            </td>
            <td class="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
              {{ t.className }}
            </td>
            <td class="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              {{ formatUZS(t.amount) }}
            </td>
            <td class="py-3 px-4 text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                  getBadgeClass(t.method)
                ]"
              >
                <Icon :icon="getMethodIcon(t.method)" class="text-xs" />
                <span>{{ getMethodName(t.method) }}</span>
              </span>
            </td>
            <td class="py-3 px-4 font-mono text-xs text-gray-500 dark:text-gray-400">
              {{ t.receiptNumber }}
            </td>
            <td class="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs">
              {{ t.cashier }}
            </td>
            <td class="py-3 px-4 text-right">
              <button
                type="button"
                @click="$emit('print-receipt', t)"
                class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-primary transition cursor-pointer"
                title="Chekni chop etish"
              >
                <Icon icon="solar:printer-linear" class="text-base" />
              </button>
            </td>
          </tr>
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="9" class="py-8 text-center text-gray-400">
              Qidiruv bo'yicha to'lovlar topilmadi
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <AppPagination
        v-model="currentPage"
        :total-items="filteredTransactions.length"
        :per-page="perPage"
        item-label="to'lov"
      />
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import AppPagination from "@/components/AppPagination.vue";
import { formatUZS } from "@/helper/formatters";
import {
  getPaymentMethodOptions,
  getPaymentMethodName,
  getPaymentMethodIcon,
  getPaymentMethodBadgeClass,
} from "@/config/paymentMethods";

export default {
  name: "MonthDetailTransactionsTab",
  components: { Icon, AppPagination },
  props: {
    transactions: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["print-receipt"],
  data() {
    return {
      searchQuery: "",
      selectedMethod: "ALL",
      currentPage: 1,
      perPage: 10,
    };
  },
  computed: {
    methodOptions() {
      return getPaymentMethodOptions();
    },
    filteredTransactions() {
      return this.transactions.filter((t) => {
        const matchesMethod = this.selectedMethod === "ALL" || t.method === this.selectedMethod;
        const q = this.searchQuery.toLowerCase().trim();
        const matchesSearch = !q ||
          t.studentName.toLowerCase().includes(q) ||
          String(t.studentId).includes(q) ||
          t.receiptNumber.toLowerCase().includes(q);
        return matchesMethod && matchesSearch;
      });
    },
    paginatedTransactions() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredTransactions.slice(start, start + this.perPage);
    },
  },
  methods: {
    formatUZS,
    getMethodName(m) {
      return getPaymentMethodName(m);
    },
    getMethodIcon(m) {
      return getPaymentMethodIcon(m);
    },
    getBadgeClass(m) {
      return getPaymentMethodBadgeClass(m);
    },
  },
};
</script>
