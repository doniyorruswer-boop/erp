<template>
  <div class="kindergarten-dashboard space-y-5 font-lexend">
    <!-- Top 5 KPI Cards (Unified with School Dashboard Style) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatCard
        title="Tarbiyalanuvchilar"
        value="124"
        icon="solar:smile-circle-bold"
        variant="pink"
        delta="▼ 12"
        delta-label="o'tgan yilga"
      />

      <StatCard
        title="Faol shartnomalar"
        value="118"
        icon="solar:document-text-bold"
        variant="indigo"
        delta="▼ 8"
        delta-label="o'tgan yilga"
      />

      <StatCard
        title="Bugungi to'lov"
        :value="formatUZS(1600000)"
        icon="solar:wallet-money-bold"
        variant="emerald"
        delta="▼ 0 ta"
        delta-label="kechagi kunga"
      />

      <StatCard
        title="Umumiy qarzdorlik"
        :value="formatUZS(11200000)"
        icon="solar:danger-triangle-bold"
        variant="rose"
        delta="▲ 1.2 mln"
        delta-label="o'tgan oyga"
      />

      <StatCard
        title="Bog'cha Davomati"
        value="93.5%"
        icon="solar:calendar-mark-bold"
        variant="amber"
        :subtext="`${todayAttendance}/${totalChildren} keldi`"
        subicon="solar:check-circle-bold"
      />
    </div>

    <!-- Financial Activity & Analysis (Matches School & My-School Style) -->
    <FinancialActivitySection :is-kindergarten="true" />

    <!-- Guruhlar Sig'imi (50%) & Tezkor Amallar (50%) -->
    <ClassCapacityAndQuickActions
      :is-kindergarten="true"
      :class-list="kindergartenGroups"
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
import { dashboardApi, groupsApi } from "@/api";
import ClassCapacityAndQuickActions from "@/components/dashboard/ClassCapacityAndQuickActions.vue";
import FinancialActivitySection from "@/components/dashboard/FinancialActivitySection.vue";
import MonthlyContractsStatistics from "@/components/dashboard/MonthlyContractsStatistics.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import StudentWizardModal from "@/components/students/StudentWizardModal.vue";
import { formatUZS } from "@/helper/formatters";

export default {
  name: "KindergartenDashboard",
  components: {
    StatCard,
    FinancialActivitySection,
    ClassCapacityAndQuickActions,
    MonthlyContractsStatistics,
    StudentWizardModal,
  },
  data() {
    return {
      isAddStudentModalOpen: false,
      tab: "payments",
      totalChildren: 124,
      todayAttendance: 116,
      monthlyRevenue: 186000000,
      expectedRevenue: 198400000,
      availableSeats: 16,
      kindergartenGroups: [
        {
          id: 1,
          name: "Kichkintoylar",
          age: "2-3 yosh",
          teacher: "Zulayho Karimova",
          nanny: "Munira Opa",
          capacity: 20,
          studentsCount: 18,
          presentToday: 17,
          colorClass: "bg-pink-500",
          icon: "solar:smile-circle-bold",
        },
        {
          id: 2,
          name: "Mittivoylar",
          age: "3-4 yosh",
          teacher: "Nigora Aliyeva",
          nanny: "Gulnora Opa",
          capacity: 25,
          studentsCount: 24,
          presentToday: 23,
          colorClass: "bg-amber-500",
          icon: "solar:star-fall-minimalistic-bold",
        },
        {
          id: 3,
          name: "Bilimdonlar",
          age: "4-5 yosh",
          teacher: "Shahnoza Yusupova",
          nanny: "Nodira Opa",
          capacity: 25,
          studentsCount: 25,
          presentToday: 24,
          colorClass: "bg-blue-500",
          icon: "solar:sun-2-bold",
        },
        {
          id: 4,
          name: "Alpomishlar",
          age: "5-6 yosh",
          teacher: "Feruza Rasulova",
          nanny: "Dilorom Opa",
          capacity: 25,
          studentsCount: 25,
          presentToday: 22,
          colorClass: "bg-purple-500",
          icon: "solar:medal-ribbons-star-bold",
        },
        {
          id: 5,
          name: "Kelajak (Maktabga tayyorlov)",
          age: "6-7 yosh",
          teacher: "Madina Rahimova",
          nanny: "Saodat Opa",
          capacity: 25,
          studentsCount: 22,
          presentToday: 21,
          colorClass: "bg-emerald-500",
          icon: "solar:diploma-bold",
        },
      ],
    };
  },
  async mounted() {
    await this.fetchDashboardData();
  },
  methods: {
    formatUZS,
    async fetchDashboardData() {
      try {
        const stats = await dashboardApi.getStats({ type: "KINDERGARTEN" });
        if (stats) {
          if (stats.totalStudents !== undefined) this.totalChildren = stats.totalStudents;
          if (stats.totalRevenue !== undefined) this.monthlyRevenue = stats.totalRevenue;
          if (stats.attendanceRate !== undefined)
            this.todayAttendance = Math.round((this.totalChildren * stats.attendanceRate) / 100);
          if (stats.groups && Array.isArray(stats.groups) && stats.groups.length > 0) {
            this.kindergartenGroups = stats.groups;
          }
        }

        const groupsRes = await groupsApi.getAll({ type: "KINDERGARTEN" });
        if (groupsRes && Array.isArray(groupsRes) && groupsRes.length > 0) {
          this.kindergartenGroups = groupsRes.map((g) => ({
            id: g.id,
            name: g.name,
            teacher: g.teacher ? `${g.teacher.firstName} ${g.teacher.lastName}` : "Belgilanmagan",
            capacity: g.room ? g.room.capacity : 25,
            studentsCount: g.enrollments ? g.enrollments.length : 20,
            boys: g.enrollments
              ? g.enrollments.filter((e) => e.student && e.student.gender === "MALE").length
              : 10,
            girls: g.enrollments
              ? g.enrollments.filter((e) => e.student && e.student.gender === "FEMALE").length
              : 10,
          }));
        }
      } catch (err) {
        console.warn("Backend API yuklanmadi, standart ma'lumotlar ishlayapti:", err.message);
      }
    },
    onStudentCreated(student) {
      this.isAddStudentModalOpen = false;
      this.fetchDashboardData();
      this.$notify?.({
        type: "success",
        title: "Muvaffaqiyatli",
        text: `${student.firstName || "Bola"} tizimga muvaffaqiyatli qo'shildi!`,
      });
    },
  },
};
</script>
