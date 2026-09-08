<template>
  <div class="payment-month-detail-page p-4 font-lexend space-y-5">
    <!-- 1. Header (Breadcrumb, Title, Buttons) -->
    <MonthDetailHeader
      :month-info="monthInfo"
      :debtors-count="debtorsList.length"
      @export-excel="exportMonthExcel"
      @print-summary="printSummarySheet"
      @open-sms="openSmsModal"
    />

    <!-- 2. KPI Cards -->
    <MonthDetailKpis
      :metrics="monthMetrics"
      :debtors-count="debtorsList.length"
      :transactions-count="transactionsList.length"
    />

    <!-- 3. Charts (Daily Inflow Bar Chart & Methods Donut Chart) -->
    <MonthDetailCharts
      :month-name="monthInfo.name"
      :daily-data="dailyChartData"
      :methods-distribution="paymentMethodsList"
    />

    <!-- 4. Deep Inspection Tabs -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden">
      <!-- Tabs Navigation Header with Solar Icons -->
      <div class="flex items-center gap-2 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/80 overflow-x-auto">
        <button
          type="button"
          @click="activeSubTab = 'classes'"
          :class="[
            'px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap',
            activeSubTab === 'classes'
              ? 'bg-primary text-white shadow-2xs'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700'
          ]"
        >
          <Icon icon="solar:users-group-two-rounded-bold" class="text-base" />
          <span>Sinflar va Guruhlar kesimi ({{ classBreakdown.length }})</span>
        </button>

        <button
          type="button"
          @click="activeSubTab = 'transactions'"
          :class="[
            'px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap',
            activeSubTab === 'transactions'
              ? 'bg-primary text-white shadow-2xs'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700'
          ]"
        >
          <Icon icon="solar:wallet-money-bold" class="text-base" />
          <span>Shu oydagi to'lovlar jurnali ({{ transactionsList.length }})</span>
        </button>

        <button
          type="button"
          @click="activeSubTab = 'debtors'"
          :class="[
            'px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap',
            activeSubTab === 'debtors'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          ]"
        >
          <Icon icon="solar:danger-triangle-bold" class="text-base" />
          <span>Qarzdorlar ro'yxati ({{ debtorsList.length }})</span>
        </button>
      </div>

      <!-- Tab 1: Sinflar Kesimida -->
      <MonthDetailClassesTab
        v-if="activeSubTab === 'classes'"
        :classes="classBreakdown"
      />

      <!-- Tab 2: To'lovlar Jurnali -->
      <MonthDetailTransactionsTab
        v-else-if="activeSubTab === 'transactions'"
        :transactions="transactionsList"
        @print-receipt="printReceipt"
      />

      <!-- Tab 3: Qarzdorlar Ro'yxati -->
      <MonthDetailDebtorsTab
        v-else-if="activeSubTab === 'debtors'"
        :debtors="debtorsList"
        :total-debt="monthMetrics.debt"
        @open-sms="openSmsModal"
        @send-single-sms="sendSingleSms"
      />
    </div>

    <!-- 5. SMS Modal Component -->
    <MonthDetailSmsModal
      ref="smsModal"
      :month-name="monthInfo.name"
      :debtors-count="debtorsList.length"
      @sms-sent="onSmsSent"
    />
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import MonthDetailHeader from "@/components/payment-stats/month-detail/MonthDetailHeader.vue";
import MonthDetailKpis from "@/components/payment-stats/month-detail/MonthDetailKpis.vue";
import MonthDetailCharts from "@/components/payment-stats/month-detail/MonthDetailCharts.vue";
import MonthDetailClassesTab from "@/components/payment-stats/month-detail/MonthDetailClassesTab.vue";
import MonthDetailTransactionsTab from "@/components/payment-stats/month-detail/MonthDetailTransactionsTab.vue";
import MonthDetailDebtorsTab from "@/components/payment-stats/month-detail/MonthDetailDebtorsTab.vue";
import MonthDetailSmsModal from "@/components/payment-stats/month-detail/MonthDetailSmsModal.vue";

import { loadSchoolClasses, getStudentsByClass } from "@/api/schoolClassesData";
import { useTenantStore } from "@/store/tenant";
import { dashboardApi, paymentsApi } from "@/api/services";
import {
  getActivePaymentMethods,
  getPaymentMethodName,
  getPaymentMethodColor,
} from "@/config/paymentMethods";

export default {
  name: "PaymentMonthDetailView",
  components: {
    Icon,
    MonthDetailHeader,
    MonthDetailKpis,
    MonthDetailCharts,
    MonthDetailClassesTab,
    MonthDetailTransactionsTab,
    MonthDetailDebtorsTab,
    MonthDetailSmsModal,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      isLoading: false,
      activeSubTab: "classes",
      statsData: null,
      realPayments: [],
    };
  },
  computed: {
    monthKey() {
      return this.$route.params.monthKey || "Okt";
    },
    monthInfo() {
      const q = this.$route.query;
      const key = String(this.monthKey).toLowerCase().trim();

      if (this.statsData && Array.isArray(this.statsData.months)) {
        const found = this.statsData.months.find(
          (m) =>
            m.key.toLowerCase() === key ||
            m.name.toLowerCase().startsWith(key)
        );
        if (found) {
          return {
            key: found.key,
            name: found.name,
            year: found.year || q.year || "2025-2026",
            plan: Number(found.plan) || Number(q.plan) || 1250000000,
            fact: Number(found.fact) || Number(q.fact) || 0,
            percent: found.percent !== undefined ? found.percent : Math.round(((found.fact || 0) / (found.plan || 1)) * 100),
            isCurrent: !!found.isCurrent,
            isPast: !!found.isPast,
          };
        }
      }

      if (q.name && q.plan !== undefined) {
        const plan = Number(q.plan) || 1250000000;
        const fact = Number(q.fact) || 0;
        const percent = q.percent !== undefined ? Number(q.percent) : Math.round((fact / (plan || 1)) * 100);
        return {
          key: this.monthKey,
          name: q.name,
          year: q.year || "2025-2026",
          plan,
          fact,
          percent,
          isCurrent: percent > 0 && percent < 100,
          isPast: percent === 0,
        };
      }

      const map = {
        avg: { name: "Avgust", year: "2025-2026", plan: 1100000000, fact: 1045000000, percent: 95 },
        sen: { name: "Sentabr", year: "2025-2026", plan: 1250000000, fact: 1187500000, percent: 95 },
        okt: { name: "Oktabr", year: "2025-2026", plan: 1250000000, fact: 980500000, percent: 78 },
        noy: { name: "Noyabr", year: "2025-2026", plan: 1250000000, fact: 625000000, percent: 50 },
        dek: { name: "Dekabr", year: "2025-2026", plan: 1250000000, fact: 250000000, percent: 20 },
        yan: { name: "Yanvar", year: "2025-2026", plan: 1250000000, fact: 0, percent: 0 },
        fev: { name: "Fevral", year: "2025-2026", plan: 1250000000, fact: 0, percent: 0 },
        mar: { name: "Mart", year: "2025-2026", plan: 1250000000, fact: 0, percent: 0 },
        apr: { name: "Aprel", year: "2025-2026", plan: 1250000000, fact: 0, percent: 0 },
        may: { name: "May", year: "2025-2026", plan: 1250000000, fact: 0, percent: 0 },
      };
      const prefix = key.slice(0, 3);
      return map[prefix] || {
        key: this.monthKey,
        name: this.monthKey.charAt(0).toUpperCase() + this.monthKey.slice(1),
        year: "2025-2026",
        plan: 1250000000,
        fact: 980500000,
        percent: 78,
      };
    },
    monthMetrics() {
      const plan = this.monthInfo.plan;
      const fact = this.monthInfo.fact;
      const debt = Math.max(0, plan - fact);
      const percent = this.monthInfo.percent;
      const count = this.transactionsList.length;
      const avgAmount = count > 0 ? Math.round(fact / count) : 4458000;
      return { plan, fact, debt, percent, avgAmount };
    },
    classBreakdown() {
      const bType = this.tenantStore?.businessType || "SCHOOL";
      const classes = loadSchoolClasses(bType);
      const monthRatio = ((this.monthInfo.fact || 1) / (this.monthInfo.plan || 1)) || 0.8;

      return classes.map((c, i) => {
        const studentCount = c.studentsCount || 28;
        const monthlyRate = 4458000;
        const plan = studentCount * monthlyRate;
        const variance = [0.95, 0.88, 0.76, 0.92, 0.68, 0.84, 0.90, 0.82, 0.86, 0.72, 0.80, 0.94][i % 12];
        const fact = Math.round(plan * Math.min(1, monthRatio * variance));
        const debt = Math.max(0, plan - fact);
        const percent = plan > 0 ? Math.round((fact / plan) * 100) : 0;
        return {
          id: c.id,
          name: c.name,
          courseName: c.courseName || (this.tenantStore.isSchool ? "Umumta'lim sinfi" : "Standart guruh"),
          studentsCount: studentCount,
          plan,
          fact,
          debt,
          percent,
          teacherName: c.teacherName || "Normatova Ruxshona",
        };
      });
    },
    transactionsList() {
      const bType = this.tenantStore?.businessType || "SCHOOL";
      const classes = loadSchoolClasses(bType);

      if (this.realPayments && this.realPayments.length > 0) {
        return this.realPayments.map((p, idx) => {
          const date = p.paymentDate
            ? new Date(p.paymentDate).toLocaleDateString("uz-UZ", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : `${String((idx % 28) + 1).padStart(2, "0")}.09.2025 10:30`;

          const studentName = p.student
            ? `${p.student.firstName} ${p.student.lastName}`
            : (p.customer ? `${p.customer.firstName} ${p.customer.lastName}` : "Noma'lum o'quvchi");

          return {
            id: p.id || `tx-${idx + 1}`,
            date,
            studentId: p.studentId || (p.student && p.student.id) || `STU-${1000 + idx}`,
            studentName,
            className: (classes[idx % classes.length]?.name) || "1-A",
            amount: Number(p.amount) || 4458000,
            method: p.method || ["CARD", "CLICK", "CASH", "PAYME"][idx % 4],
            receiptNumber: p.receiptNumber || `CHK-${90000 + idx}`,
            cashier: p.receivedBy ? `${p.receivedBy.firstName} ${p.receivedBy.lastName}` : (p.cashbox ? p.cashbox.name : "Asosiy Kassa"),
          };
        });
      }

      const activeMethods = getActivePaymentMethods();
      const list = [];
      let txId = 1001;
      const mName = this.monthInfo.name;
      const monthNumMap = {
        Avgust: "08", Sentabr: "09", Oktabr: "10", Oktyabr: "10",
        Noyabr: "11", Dekabr: "12", Yanvar: "01", Fevral: "02",
        Mart: "03", Aprel: "04", May: "05",
      };
      const monthStr = monthNumMap[mName] || "09";
      const yearStr = ["01", "02", "03", "04", "05"].includes(monthStr) ? "2026" : "2025";

      for (let day = 1; day <= 28; day++) {
        const dateStr = `${String(day).padStart(2, "0")}.${monthStr}.${yearStr}`;
        const countOnDay = (day <= 10) ? 5 : 2;
        for (let k = 0; k < countOnDay; k++) {
          const cls = classes[(day + k) % classes.length];
          const stList = getStudentsByClass(cls.id, cls.name, cls.studentsCount, bType);
          const st = stList[(day * 3 + k) % stList.length] || { studentId: "250026000300", fullName: "To'rayev Shahnoza Shavkat o'g'li" };
          const methodObj = activeMethods[(day + k * 2) % activeMethods.length];
          list.push({
            id: `tx-${txId++}`,
            date: `${dateStr} ${9 + (k % 8)}:${String(10 + (day % 45)).padStart(2, "0")}`,
            studentId: st.studentId,
            studentName: st.fullName,
            className: cls.name,
            amount: 4458000,
            method: methodObj ? methodObj.code : "CARD",
            receiptNumber: `CHK-${90000 + txId}`,
            cashier: "Kassir (M. Saidova)",
          });
        }
      }
      return list;
    },
    debtorsList() {
      const bType = this.tenantStore?.businessType || "SCHOOL";
      const classes = loadSchoolClasses(bType);
      const list = [];

      classes.forEach((c, idx) => {
        const students = getStudentsByClass(c.id, c.name, c.studentsCount, bType);
        const debtorCount = idx % 2 === 0 ? 2 : 1;
        for (let sIdx = 0; sIdx < debtorCount; sIdx++) {
          const st = students[(idx * 3 + sIdx * 5) % students.length];
          if (st) {
            list.push({
              studentId: st.studentId,
              studentName: st.fullName,
              className: c.name,
              debtAmount: 4458000 * (sIdx === 0 ? 1 : 2),
              parentName: st.parentName || "Ota-onasi",
              parentPhone: st.parentPhone || "+998901234567",
              delayDays: 5 + ((idx * 3 + sIdx * 7) % 20),
            });
          }
        }
      });
      return list;
    },
    dailyChartData() {
      const sumsByDay = Array(30).fill(0);
      this.transactionsList.forEach((t) => {
        const day = parseInt(t.date.slice(0, 2), 10);
        if (day >= 1 && day <= 30) {
          sumsByDay[day - 1] += (t.amount || 0);
        }
      });
      return sumsByDay;
    },
    paymentMethodsList() {
      const activeMethods = getActivePaymentMethods();
      const total = this.transactionsList.length || 1;
      const counts = {};
      activeMethods.forEach((m) => { counts[m.code] = 0; });

      this.transactionsList.forEach((t) => {
        if (counts[t.method] !== undefined) {
          counts[t.method]++;
        } else {
          counts[activeMethods[0]?.code || "CARD"] = (counts[activeMethods[0]?.code || "CARD"] || 0) + 1;
        }
      });

      return activeMethods.map((m) => ({
        code: m.code,
        name: m.name,
        color: m.color,
        percent: Math.round(((counts[m.code] || 0) / total) * 100),
      }));
    },
  },
  async mounted() {
    await this.fetchRealData();
  },
  methods: {
    async fetchRealData() {
      this.isLoading = true;
      try {
        const year = this.$route.query.year || "2025-2026";
        const [statsRes, paymentsRes] = await Promise.allSettled([
          dashboardApi.getPaymentStats({ year }),
          paymentsApi.getAll({ limit: 100 }),
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value) {
          this.statsData = statsRes.value;
        }

        if (paymentsRes.status === "fulfilled" && paymentsRes.value) {
          const list = Array.isArray(paymentsRes.value)
            ? paymentsRes.value
            : (paymentsRes.value.payments || paymentsRes.value.data || []);
          this.realPayments = list;
        }
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err);
      } finally {
        this.isLoading = false;
      }
    },
    exportMonthExcel() {
      alert(`${this.monthInfo.name} ${this.monthInfo.year} to'lovlar hisoboti Excel formatida yuklab olindi!`);
    },
    printSummarySheet() {
      window.print();
    },
    openSmsModal() {
      if (this.$refs.smsModal) {
        this.$refs.smsModal.open();
      }
    },
    onSmsSent(count) {
      alert(`${count} ta qarzdor ota-onaga eslatma SMS yuborildi!`);
    },
    sendSingleSms(debtor) {
      alert(`${debtor.parentPhone} raqamiga eslatma SMS yuborildi!`);
    },
    printReceipt(tx) {
      alert(`Chek #${tx.receiptNumber} chop etish oynasiga uzatildi!`);
    },
  },
};
</script>

<style scoped>
.font-lexend {
  font-family: "Lexend", sans-serif;
}
</style>
