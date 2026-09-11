<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 font-lexend"
  >
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icon icon="solar:bill-check-bold" class="text-primary text-lg" />
          <span>So'nggi 10 ta to'lov</span>
        </h3>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Tizimga eng oxirgi kelib tushgan to'lov operatsiyalari ro'yxati
        </p>
      </div>

      <RouterLink
        to="/finance"
        class="text-xs sm:text-sm font-semibold text-primary hover:opacity-80 flex items-center gap-1 shrink-0"
      >
        <span>Barcha to'lovlar</span>
        <Icon icon="solar:alt-arrow-right-bold" class="text-xs" />
      </RouterLink>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
      <table class="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr
            class="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-bold uppercase tracking-wider text-xs"
          >
            <th class="py-2.5 px-3">O'quvchi</th>
            <th class="py-2.5 px-3">Sinf / Guruh</th>
            <th class="py-2.5 px-3">Oy</th>
            <th class="py-2.5 px-3 text-right">Summa</th>
            <th class="py-2.5 px-3 text-center">Holati</th>
            <th class="py-2.5 px-3 text-right">Sana</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
          <tr v-if="list.length === 0">
            <td colspan="6" class="py-8 text-center text-gray-400 dark:text-gray-500 text-xs">
              Ushbu davr uchun to'lovlar mavjud emas
            </td>
          </tr>
          <tr
            v-for="p in list"
            :key="p.id || p.receiptNumber || p.studentName"
            class="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition"
          >
            <!-- Student -->
            <td class="py-3 px-3">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 text-xs shrink-0"
                >
                  {{ p.studentName?.charAt(0) || "O" }}
                </div>
                <div>
                  <div class="font-bold text-gray-800 dark:text-gray-100 text-sm">
                    {{ p.studentName }}
                  </div>
                  <span v-if="p.receiptNumber" class="text-xs text-gray-400 font-mono">
                    #{{ p.receiptNumber }}
                  </span>
                </div>
              </div>
            </td>

            <!-- Class / Group -->
            <td class="py-3 px-3 text-gray-700 dark:text-gray-200 font-semibold text-sm">
              {{ p.className || "Asosiy sinf" }}
            </td>

            <!-- Month -->
            <td class="py-3 px-3 text-gray-600 dark:text-gray-300 text-sm">
              {{ p.month || "Joriy oy" }}
            </td>

            <!-- Amount -->
            <td class="py-3 px-3 text-right font-bold text-gray-900 dark:text-white text-sm">
              {{ formatUZS(p.amount) }}
            </td>

            <!-- Status -->
            <td class="py-3 px-3 text-center">
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-md text-xs font-semibold inline-flex items-center gap-1',
                  p.status === 'PARTIAL' || p.isPartial
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'bg-primary/10 text-primary border border-primary/20',
                ]"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="p.status === 'PARTIAL' || p.isPartial ? 'bg-amber-500' : 'bg-primary'"
                ></span>
                <span>{{ p.status === "PARTIAL" || p.isPartial ? "Qisman" : "To'langan" }}</span>
              </span>
            </td>

            <!-- Date -->
            <td class="py-3 px-3 text-right text-gray-500 dark:text-gray-400 font-mono text-xs">
              {{ formatDate(p.paymentDate || p.date) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { formatUZS } from "@/helper/formatters";

export default {
  name: "RecentPaymentsWidget",
  components: { Icon },
  props: {
    payments: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    list() {
      return this.payments && this.payments.length > 0 ? this.payments.slice(0, 10) : [];
    },
  },
  methods: {
    formatUZS,
    formatDate(dateStr) {
      if (!dateStr) return "18/07/2026";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      } catch (e) {
        return dateStr;
      }
    },
  },
};
</script>
