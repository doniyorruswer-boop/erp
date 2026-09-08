<template>
  <div class="universal-dashboard space-y-4 sm:space-y-5 font-lexend">
    <!-- 1. Katta Qulay Boshqaruv Paneli (Davr, Oylar va Vidjet sozlamalari tugmalari) -->
    <DashboardHeaderBar
      :selected-month="selectedMonth"
      :academic-year="selectedAcademicYear"
      @update:selectedMonth="selectMonth"
      @date-range-change="onDateRangeChange"
      @open-download-modal="isDownloadModalOpen = true"
      @open-settings-modal="isSettingsModalOpen = true"
    />

    <!-- 2. Asosiy Moliyaviy KPI Ko'rsatkichlar (Reja, Tushum, Ijro %, Qarzdorlik) -->
    <FinancialKpiCards
      v-if="widgetSettings.financialCards"
      :monthly-plan="statsData.monthlyPlan"
      :collected-this-month="statsData.collectedThisMonth"
      :plan-percentage="statsData.planPercentage"
      :debtors-count="statsData.debtorsCount"
      :total-debt="statsData.totalDebt"
    />

    <!-- 3. Kunlik Davomat Tahlili (Maktab va Bog'chalar uchun eng muhim ko'rsatkich) -->
    <AttendanceWidget
      v-if="widgetSettings.attendance"
      :summary="statsData.attendanceSummary"
    />

    <!-- 4. Oylik Operatsion Hodisalar Hisoblagichlari (Yangi lidlar, sinov darslari, shartnomalar, o'quvchilar...) -->
    <MonthlyEventCounters
      v-if="widgetSettings.monthlyEvents"
      :month-label="currentPeriodLabel"
      :events="statsData.monthlyEvents"
    />

    <!-- 5. Sotuv Voronkasi (CRM Bosqichlari: Murojaat → Sinov → Shartnoma → To'lov) -->
    <SalesFunnelWidget
      v-if="widgetSettings.salesFunnel"
      :funnel-data="statsData.salesFunnel"
      @open-stage-modal="onOpenStageModal"
    />

    <!-- 6. Sinflar va Xonalar To'lganligi (Real guruhlar va sig'im) -->
    <ClassOccupancyWidget
      v-if="widgetSettings.classOccupancy"
      :classes="classCards"
      :summary="statsData.classCapacity"
    />

    <!-- 7. Bugungi Dars Jadvali (Maktab va O'quv markazlari uchun) -->
    <TodayScheduleWidget
      v-if="widgetSettings.todaySchedule"
      :schedules="statsData.todaySchedules"
    />

    <!-- 8. Katta Moliyaviy Grafik & Top Qarzdorlar -->
    <div
      v-if="widgetSettings.financialCharts || widgetSettings.topDebtors"
      class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5"
    >
      <!-- Chap tomonda: Oylar kesimidagi ikki ustunli to'lovlar grafigi -->
      <div
        v-if="widgetSettings.financialCharts"
        :class="widgetSettings.topDebtors ? 'lg:col-span-2' : 'lg:col-span-3'"
      >
        <MonthlyRevenueChartWidget
          :academic-year="selectedAcademicYear"
          :monthly-data="monthlyPaymentChart"
        />
      </div>

      <!-- O'ng tomonda: Top-5 qarzdorliklar -->
      <div
        v-if="widgetSettings.topDebtors"
        :class="widgetSettings.financialCharts ? 'lg:col-span-1' : 'lg:col-span-3'"
      >
        <TopDebtorsWidget
          :debtors="topDebtorsList"
        />
      </div>
    </div>

    <!-- 9. To'lov Usullari Taqsimoti & Xarajatlar Tahlili -->
    <div
      v-if="widgetSettings.paymentMethods || widgetSettings.expenseCategories"
      class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
    >
      <PaymentMethodsWidget
        v-if="widgetSettings.paymentMethods"
        :payment-methods="statsData.paymentMethods"
        :class="!widgetSettings.expenseCategories ? 'md:col-span-2' : ''"
      />
      <ExpenseCategoriesWidget
        v-if="widgetSettings.expenseCategories"
        :expense-categories="statsData.expenseCategories"
        :total-expenses="statsData.totalExpenses"
        :class="!widgetSettings.paymentMethods ? 'md:col-span-2' : ''"
      />
    </div>

    <!-- 10. O'qituvchilar / Tarbiyachilar Yuklamasi -->
    <TopTeachersWidget
      v-if="widgetSettings.topTeachers"
      :teachers="statsData.topTeachers"
    />

    <!-- 11. So'nggi 10 ta To'lov Jadvali -->
    <RecentPaymentsWidget
      v-if="widgetSettings.recentPayments"
      :payments="recentPaymentsList"
    />

    <!-- Modallar -->
    <DownloadWidgetModal
      v-model="isDownloadModalOpen"
      :target-month="currentMonthLabel"
    />

    <WidgetSettingsModal
      v-model="isSettingsModalOpen"
      :settings="widgetSettings"
      @save="onSaveWidgetSettings"
    />

    <FunnelStageModal
      v-model="isStageModalOpen"
      :stage-info="selectedStageInfo"
    />
  </div>
</template>

<script>
import DashboardHeaderBar from "@/components/dashboard/DashboardHeaderBar.vue";
import FinancialKpiCards from "@/components/dashboard/FinancialKpiCards.vue";
import MonthlyEventCounters from "@/components/dashboard/MonthlyEventCounters.vue";
import SalesFunnelWidget from "@/components/dashboard/SalesFunnelWidget.vue";
import ClassOccupancyWidget from "@/components/dashboard/ClassOccupancyWidget.vue";
import MonthlyRevenueChartWidget from "@/components/dashboard/MonthlyRevenueChartWidget.vue";
import TopDebtorsWidget from "@/components/dashboard/TopDebtorsWidget.vue";
import RecentPaymentsWidget from "@/components/dashboard/RecentPaymentsWidget.vue";
import AttendanceWidget from "@/components/dashboard/AttendanceWidget.vue";
import TodayScheduleWidget from "@/components/dashboard/TodayScheduleWidget.vue";
import PaymentMethodsWidget from "@/components/dashboard/PaymentMethodsWidget.vue";
import ExpenseCategoriesWidget from "@/components/dashboard/ExpenseCategoriesWidget.vue";
import TopTeachersWidget from "@/components/dashboard/TopTeachersWidget.vue";
import DownloadWidgetModal from "@/components/dashboard/DownloadWidgetModal.vue";
import WidgetSettingsModal from "@/components/dashboard/WidgetSettingsModal.vue";
import FunnelStageModal from "@/components/dashboard/FunnelStageModal.vue";
import { formatUZS, formatShortNumber } from "@/helper/formatters";
import { dashboardApi } from "@/api/services";

export default {
  name: "UniversalUnifiedDashboard",
  components: {
    DashboardHeaderBar,
    FinancialKpiCards,
    MonthlyEventCounters,
    SalesFunnelWidget,
    ClassOccupancyWidget,
    MonthlyRevenueChartWidget,
    TopDebtorsWidget,
    RecentPaymentsWidget,
    AttendanceWidget,
    TodayScheduleWidget,
    PaymentMethodsWidget,
    ExpenseCategoriesWidget,
    TopTeachersWidget,
    DownloadWidgetModal,
    WidgetSettingsModal,
    FunnelStageModal,
  },
  props: {
    selectedAcademicYear: {
      type: String,
      default: () => {
        const now = new Date();
        const startYr = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
        return `${startYr}-${startYr + 1}`;
      },
    },
  },
  created() {
    this.loadSavedWidgetSettings();
  },
  data() {
    const now = new Date();
    const monthKeys = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
    const curMonthKey = monthKeys[now.getMonth()] || "Sen";

    let initialWidgetSettings = {
      financialCards: true,
      monthlyEvents: true,
      salesFunnel: true,
      classOccupancy: true,
      financialCharts: true,
      topDebtors: true,
      recentPayments: true,
      attendance: true,
      todaySchedule: false,
      paymentMethods: true,
      expenseCategories: false,
      topTeachers: true,
    };
    try {
      const saved = localStorage.getItem("eduhub_widget_settings");
      if (saved) {
        initialWidgetSettings = { ...initialWidgetSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Could not read widget settings from localStorage", e);
    }

    return {
      selectedMonth: curMonthKey,
      isDownloadModalOpen: false,
      isSettingsModalOpen: false,
      isStageModalOpen: false,
      selectedStageInfo: null,
      selectedDateRange: null,
      isLoading: false,
      widgetSettings: initialWidgetSettings,
      statsData: {
        monthlyPlan: 0,
        collectedThisMonth: 0,
        planPercentage: 0,
        debtorsCount: 0,
        totalDebt: 0,
        attendanceSummary: {
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
          rate: 0,
        },
        todaySchedules: [],
        paymentMethods: {
          labels: [],
          series: [],
          counts: [],
        },
        expenseCategories: {
          labels: [],
          series: [],
        },
        totalExpenses: 0,
        topTeachers: [],
        monthlyEvents: {
          newLeads: 0,
          trialLessons: 0,
          contracts: 0,
          newPayments: 0,
          activeStudents: 0,
          droppedOut: 0,
        },
        salesFunnel: {
          inquiries: 0,
          trials: 0,
          trialsPercent: 0,
          contracts: 0,
          contractsPercent: 0,
          payments: 0,
          paymentsPercent: 0,
          stages: [],
        },
        stageStudents: {
          inquiries: [],
          trials: [],
          contracts: [],
          payments: [],
        },
        classCapacity: {
          totalStudents: 0,
          totalCapacity: 0,
          freeSeats: 0,
          branchPower: "0/0",
          classes: [],
        },
      },
      classCards: [],
      monthlyPaymentChart: [],
      topDebtorsList: [],
      recentPaymentsList: [],
      activePeriodLabel: "",
    };
  },
  computed: {
    currentMonthLabel() {
      const months = {
        Avg: "Avgust",
        Sen: "Sentabr",
        Okt: "Oktabr",
        Noy: "Noyabr",
        Dek: "Dekabr",
        Yan: "Yanvar",
        Fev: "Fevral",
        Mar: "Mart",
        Apr: "Aprel",
        May: "May",
        Iyun: "Iyun",
        Iyul: "Iyul",
      };
      return months[this.selectedMonth] || "Sentabr";
    },
    currentPeriodLabel() {
      if (this.activePeriodLabel) return this.activePeriodLabel;
      const months = {
        Avg: "Avgust oyi",
        Sen: "Sentabr oyi",
        Okt: "Oktabr oyi",
        Noy: "Noyabr oyi",
        Dek: "Dekabr oyi",
        Yan: "Yanvar oyi",
        Fev: "Fevral oyi",
        Mar: "Mart oyi",
        Apr: "Aprel oyi",
        May: "May oyi",
        Iyun: "Iyun oyi",
        Iyul: "Iyul oyi",
      };
      return months[this.selectedMonth] || "Sentabr oyi";
    },
  },
  async mounted() {
    this.loadSavedWidgetSettings();
    await this.fetchDashboardData();
  },
  methods: {
    formatUZS,
    formatShortNumber,
    selectMonth(monthKey) {
      this.selectedMonth = monthKey;
      this.selectedDateRange = null;
      const months = {
        Avg: "Avgust oyi",
        Sen: "Sentabr oyi",
        Okt: "Oktabr oyi",
        Noy: "Noyabr oyi",
        Dek: "Dekabr oyi",
        Yan: "Yanvar oyi",
        Fev: "Fevral oyi",
        Mar: "Mart oyi",
        Apr: "Aprel oyi",
        May: "May oyi",
        Iyun: "Iyun oyi",
        Iyul: "Iyul oyi",
      };
      this.activePeriodLabel = months[monthKey] || `${monthKey} oyi`;
      this.fetchDashboardData();
    },
    onDateRangeChange(range) {
      this.selectedDateRange = range;
      if (range.label) {
        this.activePeriodLabel = range.label;
      }
      if (range.monthKey) {
        this.selectedMonth = range.monthKey;
      }
      this.fetchDashboardData();
    },
    onOpenStageModal(stage) {
      this.selectedStageInfo = {
        ...stage,
        items: this.statsData.stageStudents?.[stage.key] || [],
      };
      this.isStageModalOpen = true;
    },
    loadSavedWidgetSettings() {
      try {
        const saved = localStorage.getItem("eduhub_widget_settings");
        if (saved) {
          this.widgetSettings = { ...this.widgetSettings, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn("Could not load widget settings from localStorage");
      }
    },
    onSaveWidgetSettings(newSettings) {
      this.widgetSettings = { ...newSettings };
      try {
        localStorage.setItem("eduhub_widget_settings", JSON.stringify(newSettings));
        if (this.$toast && typeof this.$toast.success === "function") {
          this.$toast.success("Vidjetlar sozlamalari muvaffaqiyatli saqlandi!", "Sozlamalar saqlandi");
        }
      } catch (e) {
        console.warn("Could not save widget settings", e);
      }
    },
    async fetchDashboardData() {
      this.isLoading = true;
      try {
        const params = {
          month: this.selectedMonth,
          year: this.selectedAcademicYear,
        };
        if (this.selectedDateRange) {
          if (this.selectedDateRange.start) params.startDate = this.selectedDateRange.start;
          if (this.selectedDateRange.end) params.endDate = this.selectedDateRange.end;
          if (this.selectedDateRange.rangeKey) params.range = this.selectedDateRange.rangeKey;
        }
        const res = await dashboardApi.getStats(params);

        if (res) {
          this.statsData = {
            monthlyPlan: res.monthlyPlan ?? 0,
            collectedThisMonth: res.collectedThisMonth ?? 0,
            planPercentage: res.planPercentage ?? 0,
            debtorsCount: res.debtorsCount ?? 0,
            totalDebt: res.totalDebt ?? 0,
            attendanceSummary: res.attendanceSummary || {
              total: res.attendancesCount || 0,
              present: 0,
              late: 0,
              absent: 0,
              rate: res.attendanceRate || 0,
            },
            todaySchedules: res.todaySchedules || [],
            paymentMethods: res.paymentMethods || {
              labels: [],
              series: [],
              counts: [],
            },
            expenseCategories: res.expenseCategories || {
              labels: [],
              series: [],
            },
            totalExpenses: res.totalExpenses ?? 0,
            topTeachers: (res.topTeachers || []).map((t) => ({
              id: t.id,
              name: t.name,
              groupsCount: t.groupsCount || 0,
              studentsCount: t.studentsCount || 0,
            })),
            monthlyEvents: res.monthlyEvents || {
              newLeads: 0,
              trialLessons: 0,
              contracts: 0,
              newPayments: 0,
              activeStudents: 0,
              droppedOut: 0,
            },
            salesFunnel: res.salesFunnel || {
              inquiries: 0,
              trials: 0,
              trialsPercent: 0,
              contracts: 0,
              contractsPercent: 0,
              payments: 0,
              paymentsPercent: 0,
              stages: [],
            },
            stageStudents: res.stageStudents || {
              inquiries: [],
              trials: [],
              contracts: [],
              payments: [],
            },
            classCapacity: res.classCapacity || {
              totalStudents: 0,
              totalCapacity: 0,
              freeSeats: 0,
              branchPower: "0/0",
              classes: [],
            },
          };

          this.classCards = res.classCapacity?.classes || [];
          this.monthlyPaymentChart = res.monthlyPaymentChart || [];
          this.topDebtorsList = (res.debtorStudents || []).map((s) => ({
            name: s.name,
            className: s.className,
            phone: s.phone,
            amount: s.debtAmount,
          }));
          this.recentPaymentsList = (res.recentPayments || []).map((p) => ({
            id: p.id,
            studentName: p.studentName,
            className: p.cashboxName || "Asosiy",
            month: this.currentMonthLabel,
            amount: p.amount,
            isPartial: false,
            paymentDate: p.paymentDate,
            receiptNumber: p.receiptNumber,
          }));
        }
      } catch (err) {
        console.warn("API dan ma'lumot olishda xatolik:", err.message);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
