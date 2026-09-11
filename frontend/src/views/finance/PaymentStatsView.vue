<template>
  <div class="payment-stats-page p-4 font-lexend">
    <!-- 1. Breadcrumb (Barcha sahifalar kabi standart) -->
    <Breadcrumb :items="[{ title: 'To\'lovlar statistikasi' }]" />

    <!-- 2. Header Section (Student sahifasi bilan 100% bir xil layout va margin) -->
    <PaymentStatsHeader
      v-model:tab="activeTab"
      v-model:year="selectedYear"
      :year-options="yearOptions"
      :is-school="tenantStore.isSchool"
      @change-year="fetchStats"
    />

    <!-- 3. Yuklanish holati (Loading State) -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div
        class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
        To'lovlar statistikasi hisoblanmoqda...
      </p>
    </div>

    <!-- 4. Asosiy mazmun (Tablar kesimida) -->
    <template v-else>
      <!-- TAB 1: OYLAR BO'YICHA -->
      <div v-if="activeTab === 'months'" class="space-y-5">
        <!-- 10 ta oylik kartochkalar (Responsive moslashuvchan grid) -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
        >
          <PaymentMonthCard v-for="m in statsData.months" :key="m.key" :month="m" />
        </div>

        <!-- Yillik Xulosa Paneli -->
        <PaymentAnnualSummary :summary="statsData" />
      </div>

      <!-- TAB 2: SINFLAR / GURUHLAR BO'YICHA -->
      <div v-else class="space-y-5">
        <div
          v-if="!statsData.classes || statsData.classes.length === 0"
          class="text-center py-16 text-gray-500 dark:text-gray-400"
        >
          Ushbu muassasada hozircha faol sinflar yoki guruhlar topilmadi.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <PaymentClassCard v-for="cls in statsData.classes" :key="cls.id" :item="cls" />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { dashboardApi } from "@/api/services";
import Breadcrumb from "@/components/Breadcrumb.vue";
import PaymentAnnualSummary from "@/components/payment-stats/PaymentAnnualSummary.vue";
import PaymentClassCard from "@/components/payment-stats/PaymentClassCard.vue";
import PaymentMonthCard from "@/components/payment-stats/PaymentMonthCard.vue";
import PaymentStatsHeader from "@/components/payment-stats/PaymentStatsHeader.vue";
import { useTenantStore } from "@/store/tenant";

export default {
  name: "PaymentStatsView",
  components: {
    Breadcrumb,
    PaymentStatsHeader,
    PaymentMonthCard,
    PaymentClassCard,
    PaymentAnnualSummary,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    const now = new Date();
    const startYr = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    const currentAcademicYear = `${startYr}-${startYr + 1}`;
    const prevAcademicYear = `${startYr - 1}-${startYr}`;
    const nextAcademicYear = `${startYr + 1}-${startYr + 2}`;

    return {
      activeTab: "months",
      currentAcademicYear,
      selectedYear: currentAcademicYear,
      yearOptions: [
        { value: currentAcademicYear, label: `${currentAcademicYear} o'quv yili (Joriy)` },
        { value: prevAcademicYear, label: `${prevAcademicYear} o'quv yili` },
        { value: nextAcademicYear, label: `${nextAcademicYear} o'quv yili` },
      ],
      isLoading: false,
      statsData: {
        academicYear: currentAcademicYear,
        totalPlan: 0,
        totalFact: 0,
        overallPercent: 0,
        totalDebt: 0,
        debtorsCount: 0,
        months: [],
        classes: [],
      },
    };
  },
  async mounted() {
    await this.fetchStats();
  },
  methods: {
    async fetchStats() {
      this.isLoading = true;
      try {
        const res = await dashboardApi.getPaymentStats({ year: this.selectedYear });
        if (res) {
          this.statsData = res;
        }
      } catch (err) {
        console.error("To'lovlar statistikasini yuklashda xatolik:", err);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.font-lexend {
  font-family: "Lexend", sans-serif;
}
</style>
