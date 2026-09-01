<template>
  <div class="school-dashboard space-y-5 font-lexend">
    <!-- Top 5 KPI Cards (Reusable StatCard Component) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatCard
        title="O'quvchilar"
        :value="schoolStats.totalStudents"
        icon="ph:student-fill"
        variant="blue"
        delta="▼ 88"
        delta-label="o'tgan yilga"
      />

      <StatCard
        title="Faol shartnomalar"
        :value="schoolStats.activeContracts"
        icon="solar:document-text-bold"
        variant="indigo"
        delta="▼ 117"
        delta-label="o'tgan yilga"
      />

      <StatCard
        title="Bugungi to'lov"
        :value="formatUZS(schoolStats.todayPayment)"
        icon="solar:wallet-money-bold"
        variant="emerald"
        delta="▼ 0 ta"
        delta-label="kechagi kunga"
      />

      <StatCard
        title="Umumiy qarzdorlik"
        :value="formatShortNumber(schoolStats.totalDebt)"
        icon="solar:danger-triangle-bold"
        variant="rose"
        delta="▲ 2.6 mln"
        delta-label="o'tgan oyga"
      />

      <StatCard
        title="Maktab Davomati"
        :value="`${schoolStats.attendanceRate}%`"
        icon="solar:calendar-mark-bold"
        variant="amber"
        :subtext="`${schoolStats.presentStudents}/${schoolStats.totalStudents} keldi`"
        subicon="solar:check-circle-bold"
      />
    </div>

    <!-- Financial Activity & Analysis (Matches Image 1 from User) -->
    <FinancialActivitySection />

    <!-- Sinflar Sig'imi (50%) & Tezkor Amallar (50%) -->
    <ClassCapacityAndQuickActions
      :class-list="schoolClasses"
      @add-student="isAddStudentModalOpen = true"
    />

    <!-- Oylar Kesimida Shartnomalar Statistikasi (Full Width) -->
    <MonthlyContractsStatistics />

    <!-- Universal Student Wizard Modal -->
    <StudentWizardModal
      v-if="isAddStudentModalOpen"
      v-model="isAddStudentModalOpen"
      @student-created="onStudentCreated"
    />
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import FinancialActivitySection from "@/components/dashboard/FinancialActivitySection.vue";
import ClassCapacityAndQuickActions from "@/components/dashboard/ClassCapacityAndQuickActions.vue";
import MonthlyContractsStatistics from "@/components/dashboard/MonthlyContractsStatistics.vue";
import StudentWizardModal from "@/components/students/StudentWizardModal.vue";
import { formatUZS, formatShortNumber } from "@/helper/formatters";
import { dashboardApi, groupsApi } from "@/api";

export default {
  name: "SchoolDashboard",
  components: {
    Icon,
    StatCard,
    FinancialActivitySection,
    ClassCapacityAndQuickActions,
    MonthlyContractsStatistics,
    StudentWizardModal,
  },
  data() {
    return {
      isAddStudentModalOpen: false,
      activeTab: "debtors",
      schoolStats: {
        totalStudents: 60,
        activeContracts: 42,
        todayPayment: 0,
        totalDebt: 1242703226,
        attendanceRate: 93.3,
        presentStudents: 56,
      },
      schoolClasses: [
        { id: 1, name: "1-A", teacher: "Matluba Rahimova", capacity: 20, studentsCount: 15, boys: 8, girls: 7 },
        { id: 2, name: "2-A", teacher: "Gulbahor Saidova", capacity: 20, studentsCount: 15, boys: 9, girls: 6 },
        { id: 3, name: "3-B", teacher: "Dilshod Ergashev", capacity: 20, studentsCount: 14, boys: 7, girls: 7 },
        { id: 4, name: "5-A", teacher: "Nilufar Azimova", capacity: 20, studentsCount: 16, boys: 8, girls: 8 },
      ],
    };
  },
  async mounted() {
    await this.fetchDashboardData();
  },
  methods: {
    formatUZS,
    formatShortNumber,
    async fetchDashboardData() {
      try {
        const stats = await dashboardApi.getStats({ type: "SCHOOL" });
        if (stats) {
          if (stats.totalStudents !== undefined) this.schoolStats.totalStudents = stats.totalStudents;
          if (stats.totalRevenue !== undefined) this.schoolStats.todayPayment = stats.totalRevenue;
          if (stats.attendanceRate !== undefined) this.schoolStats.attendanceRate = stats.attendanceRate;
          if (stats.activeGroups !== undefined) this.schoolStats.activeContracts = stats.totalStudents || 42;
          if (stats.groups && Array.isArray(stats.groups) && stats.groups.length > 0) {
            this.schoolClasses = stats.groups;
          }
        }

        const groupsRes = await groupsApi.getAll({ type: "SCHOOL" });
        if (groupsRes && Array.isArray(groupsRes) && groupsRes.length > 0) {
          this.schoolClasses = groupsRes.map((g) => ({
            id: g.id,
            name: g.name,
            teacher: g.teacher ? `${g.teacher.firstName} ${g.teacher.lastName}` : "Belgilanmagan",
            capacity: g.room ? g.room.capacity : 20,
            studentsCount: g.enrollments ? g.enrollments.length : 15,
            boys: g.enrollments ? g.enrollments.filter((e) => e.student && e.student.gender === "MALE").length : 8,
            girls: g.enrollments ? g.enrollments.filter((e) => e.student && e.student.gender === "FEMALE").length : 7,
          }));
        }
      } catch (err) {
        console.warn("Backend API yuklanmadi, standart holat ishlayapti:", err.message);
      }
    },
    onStudentCreated(student) {
      this.isAddStudentModalOpen = false;
      this.fetchDashboardData();
      this.$notify?.({
        type: "success",
        title: "Muvaffaqiyatli",
        text: `${student.firstName || "O'quvchi"} tizimga muvaffaqiyatli qo'shildi!`,
      });
    },
  },
};
</script>
