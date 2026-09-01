<template>
  <div class="dashboard-page p-4 font-lexend space-y-5">
    <!-- Top Header & Business Type Indicator -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <Breadcrumb :items="[{ title: 'Dashboard & Analitika' }]" />
        <div class="mt-1">
          <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            {{ dashboardTitle }}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Academic Year / Period Selector with FilterSelect (Only for School and Kindergarten) -->
        <FilterSelect
          v-if="currentActiveType !== 'COURSE_CENTER'"
          v-model="selectedAcademicYear"
          :options="academicYears"
          :all-label="''"
          border-variant="primary"
          icon=""
          min-width="min-w-[140px]"
          size="md"
          @change="onAcademicYearChange"
        />

        <router-link
          to="/calendar"
          class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/80 dark:border-gray-700 rounded py-2.5 px-4 font-medium shadow-sm transition cursor-pointer"
        >
          <Icon icon="solar:calendar-mark-bold" class="text-lg" />
          <span>Taqvim</span>
        </router-link>
      </div>
    </div>

    <!-- Dynamic Dashboard Content with Fade Transition -->
    <transition name="fade" mode="out-in">
      <!-- 1. Course Center & IT Academy Dashboard -->
      <CourseCenterDashboard
        v-if="currentActiveType === 'COURSE_CENTER'"
        :stats="stats"
      />

      <!-- 2. Private School Dashboard (My-School style) -->
      <SchoolDashboard
        v-else-if="currentActiveType === 'SCHOOL'"
      />

      <!-- 3. Kindergarten Dashboard -->
      <KindergartenDashboard
        v-else-if="currentActiveType === 'KINDERGARTEN'"
      />
    </transition>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import FilterSelect from "@/components/FilterSelect.vue";
import CourseCenterDashboard from "./dashboard/CourseCenterDashboard.vue";
import SchoolDashboard from "./dashboard/SchoolDashboard.vue";
import KindergartenDashboard from "./dashboard/KindergartenDashboard.vue";
import { useTenantStore } from "@/store/tenant";
import { dashboardApi } from "@/api/services";

export default {
  name: "Dashboard",
  components: {
    Icon,
    Breadcrumb,
    FilterSelect,
    CourseCenterDashboard,
    SchoolDashboard,
    KindergartenDashboard,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      selectedAcademicYear: "2025-2026",
      academicYears: [
        { value: "2025-2026", label: "2025-2026" },
        { value: "2026-2027", label: "2026-2027" },
        { value: "2028-2029", label: "2028-2029" },
        { value: "2024-2025", label: "2024-2025" },
        { value: "2023-2024", label: "2023-2024" },
      ],
      overrideType: null, // null means use tenantStore.businessType
      loading: false,
      stats: {
        totalStudents: 0,
        activeGroups: 0,
        coursesCount: 0,
        totalRevenue: 0,
        debtorsCount: 0,
        totalLeads: 0,
        teachersCount: 0,
        paymentsCount: 0,
        attendanceRate: 94.8,
        monthlyRevenue: {
          categories: ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"],
          actual: [],
          target: [],
        },
        studentsFlow: {
          categories: ["Fev", "Mar", "Apr", "May", "Iyun", "Iyul"],
          newStudents: [],
          graduates: [],
        },
        leadsGrowth: {
          categories: ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"],
          leads: [],
        },
        paymentMethods: {
          labels: ["Payme", "Click", "Naqd pul", "Karta (Terminal)"],
          series: [45, 30, 15, 10],
        },
        recentPayments: [],
        topTeachers: [],
      },
    };
  },
  computed: {
    currentActiveType() {
      if (this.overrideType) return this.overrideType;
      if (this.tenantStore.isSchool) return "SCHOOL";
      if (this.tenantStore.isKindergarten) return "KINDERGARTEN";
      return this.tenantStore.businessType || "COURSE_CENTER";
    },
    dashboardTitle() {
      switch (this.currentActiveType) {
        case "SCHOOL":
          return "Maktab Boshqaruv & Analitika Paneli";
        case "KINDERGARTEN":
          return "Bog'cha Boshqaruv & Ovqatlanish Paneli";
        default:
          return "O'quv Markazi Boshqaruv Paneli";
      }
    },
    businessTypeLabel() {
      switch (this.currentActiveType) {
        case "SCHOOL":
          return "Xususiy Maktab";
        case "KINDERGARTEN":
          return "Xususiy Bog'cha";
        default:
          return "O'quv Markazi";
      }
    },
    businessTypeBadgeClass() {
      switch (this.currentActiveType) {
        case "SCHOOL":
          return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
        case "KINDERGARTEN":
          return "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-800";
        default:
          return "bg-primary/10 text-primary border border-primary/20";
      }
    },
  },
  watch: {
    "tenantStore.businessType"() {
      this.overrideType = null;
      this.fetchStats();
    },
    "tenantStore.activeOrgId"() {
      this.overrideType = null;
      this.fetchStats();
    },
    overrideType() {
      this.fetchStats();
    },
  },
  mounted() {
    this.fetchStats();
  },
  methods: {
    async fetchStats() {
      this.loading = true;
      try {
        const res = await dashboardApi.getStats({
          type: this.currentActiveType,
          orgId: this.tenantStore.activeOrgId,
        });
        if (res) {
          this.stats = { ...this.stats, ...res };
        }
      } catch (err) {
        console.error("Dashboard yuklashda xatolik:", err);
      } finally {
        this.loading = false;
      }
    },
    onAcademicYearChange(year) {
      console.log("Tanlangan o'quv yili:", year);
      this.fetchStats();
    },
  },
};
</script>
