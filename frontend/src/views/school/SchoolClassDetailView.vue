<template>
  <div class="school-class-detail-page p-4 font-lexend space-y-5">
    <!-- 1. Header (Breadcrumb, Sarlavha va O'ng Tomondagi Amallar Paneli) -->
    <SchoolClassHeader
      :class-info="classInfo"
      :is-bulk-table-mode="isBulkTableMode"
      @toggle-bulk="isBulkTableMode = !isBulkTableMode"
      @action="handleHeaderAction"
    />

    <!-- 2. Sinf Kartochkasi va Vkladkalar -->
    <SchoolClassInfoCard
      :class-info="classInfo"
      :student-count="students.length"
      :active-tab="activeTab"
      @update:active-tab="activeTab = $event"
    />

    <!-- 3. Vkladka 1: O'quvchilar ro'yxati -->
    <div v-if="activeTab === 'students'" class="space-y-4">
      <!-- Filtrlar paneli -->
      <SchoolClassFilters
        :filters="filters"
        :is-filtered="isFiltered"
        :class-options="classOptions"
        :status-options="statusOptions"
        :language-options="languageOptions"
        :shift-options="shiftOptions"
        :year-options="yearOptions"
        @update:filters="onUpdateFilters"
        @reset="resetFilters"
      />

      <!-- O'quvchilar jadvali -->
      <SchoolClassStudentsTable
        :students="paginatedStudents"
        :total-students="filteredStudents.length"
        :is-bulk-table-mode="isBulkTableMode"
        :selected-student-ids="selectedStudentIds"
        :current-page="currentPage"
        :total-pages="totalPages"
        :per-page="perPage"
        @toggle-select="toggleSelectStudent"
        @toggle-select-all="toggleSelectAllStudents"
        @student-click="goToStudentProfile"
        @update:current-page="currentPage = $event"
        @bulk-action="handleBulkAction"
      />
    </div>

    <!-- 4. Vkladka 2: To'lovlar varaqasi -->
    <SchoolClassPaymentsTab
      v-else-if="activeTab === 'payments'"
      :class-info="classInfo"
      :students="students"
      @print="showNotification('To\'lovlar varaqasi chop etishga tayyor')"
    />

    <!-- 5. Vkladka 3: Dars jadvali & Tarix -->
    <SchoolClassTimetableTab
      v-else-if="activeTab === 'timetable'"
      :class-info="classInfo"
      :week-days="weekDays"
      @edit="showNotification('Dars jadvalini tahrirlash oynasi ochildi')"
    />
  </div>
</template>

<script>
import { toast } from "@/utils/toast";
import { useTenantStore } from "@/store/tenant";
import { getClassById, getStudentsByClass, loadSchoolClasses } from "@/api/schoolClassesData";
import SchoolClassHeader from "@/components/school/SchoolClassHeader.vue";
import SchoolClassInfoCard from "@/components/school/SchoolClassInfoCard.vue";
import SchoolClassFilters from "@/components/school/SchoolClassFilters.vue";
import SchoolClassStudentsTable from "@/components/school/SchoolClassStudentsTable.vue";
import SchoolClassPaymentsTab from "@/components/school/SchoolClassPaymentsTab.vue";
import SchoolClassTimetableTab from "@/components/school/SchoolClassTimetableTab.vue";

export default {
  name: "SchoolClassDetailView",
  components: {
    SchoolClassHeader,
    SchoolClassInfoCard,
    SchoolClassFilters,
    SchoolClassStudentsTable,
    SchoolClassPaymentsTab,
    SchoolClassTimetableTab,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      activeTab: "students", // 'students' | 'payments' | 'timetable'
      isBulkTableMode: false,
      selectedStudentIds: [],
      currentPage: 1,
      perPage: 10,
      filters: {
        search: "",
        selectedClass: "1-A",
        classType: "",
        language: "",
        status: "",
        academicYear: "2025-2026",
        shift: "",
      },
      statusOptions: [
        { value: "", label: "Barcha holatlar" },
        { value: "O'qimoqda", label: "O'qimoqda" },
        { value: "Chetlashgan", label: "Chetlashgan" },
        { value: "Muzlatilgan", label: "Muzlatilgan" },
      ],
      languageOptions: [
        { value: "", label: "Barcha tillar" },
        { value: "O'zbek", label: "O'zbek tili" },
        { value: "Rus", label: "Rus tili" },
        { value: "Ingliz", label: "Ingliz tili" },
      ],
      shiftOptions: [
        { value: "", label: "Barcha smenalar" },
        { value: "1-smena", label: "1-smena (08:00 - 12:10)" },
        { value: "2-smena", label: "2-smena (13:00 - 17:10)" },
      ],
      yearOptions: [
        { value: "2025-2026", label: "2025-2026 o'quv yili" },
        { value: "2026-2027", label: "2026-2027 o'quv yili" },
      ],
      classInfo: {
        id: "1-a",
        name: "1-A",
        academicYear: "2025-2026",
        parallel: "1",
        teacherName: "Normatova Ruxshona",
        capacity: 25,
        plan: 1499400000,
        fact: 725374500,
        studentsCount: 28,
      },
      students: [],
      weekDays: [
        {
          name: "Dushanba",
          lessons: [
            { subject: "Ona tili", teacher: "Normatova R.", time: "08:00 - 08:45" },
            { subject: "Matematika", teacher: "Karimova Z.", time: "08:50 - 09:35" },
            { subject: "O'qish savodxonligi", teacher: "Normatova R.", time: "09:45 - 10:30" },
            { subject: "Tabiiy fanlar", teacher: "Saidov E.", time: "10:35 - 11:20" },
            { subject: "Jismoniy tarbiya", teacher: "Rahimov A.", time: "11:25 - 12:10" },
          ],
        },
        {
          name: "Seshanba",
          lessons: [
            { subject: "Matematika", teacher: "Karimova Z.", time: "08:00 - 08:45" },
            { subject: "Ingliz tili", teacher: "Smith J.", time: "08:50 - 09:35" },
            { subject: "Ona tili", teacher: "Normatova R.", time: "09:45 - 10:30" },
            { subject: "Tasviriy san'at", teacher: "Aliyeva D.", time: "10:35 - 11:20" },
            { subject: "Musiqa", teacher: "Berdiyev O.", time: "11:25 - 12:10" },
          ],
        },
        {
          name: "Chorshanba",
          lessons: [
            { subject: "O'qish savodxonligi", teacher: "Normatova R.", time: "08:00 - 08:45" },
            { subject: "Matematika", teacher: "Karimova Z.", time: "08:50 - 09:35" },
            { subject: "Rus tili", teacher: "Ivanova E.", time: "09:45 - 10:30" },
            { subject: "Texnologiya", teacher: "Usmonov B.", time: "10:35 - 11:20" },
            { subject: "Tarbiya", teacher: "Normatova R.", time: "11:25 - 12:10" },
          ],
        },
        {
          name: "Payshanba",
          lessons: [
            { subject: "Ona tili", teacher: "Normatova R.", time: "08:00 - 08:45" },
            { subject: "Matematika", teacher: "Karimova Z.", time: "08:50 - 09:35" },
            { subject: "Ingliz tili", teacher: "Smith J.", time: "09:45 - 10:30" },
            { subject: "Tabiiy fanlar", teacher: "Saidov E.", time: "10:35 - 11:20" },
            { subject: "Jismoniy tarbiya", teacher: "Rahimov A.", time: "11:25 - 12:10" },
          ],
        },
        {
          name: "Juma",
          lessons: [
            { subject: "O'qish savodxonligi", teacher: "Normatova R.", time: "08:00 - 08:45" },
            { subject: "Matematika", teacher: "Karimova Z.", time: "08:50 - 09:35" },
            { subject: "Rus tili", teacher: "Ivanova E.", time: "09:45 - 10:30" },
            { subject: "Informatika", teacher: "Rustamov D.", time: "10:35 - 11:20" },
            { subject: "Sinf soati", teacher: "Normatova R.", time: "11:25 - 12:10" },
          ],
        },
        {
          name: "Shanba",
          lessons: [
            { subject: "To'garak mashg'uloti", teacher: "Maxsus ustoz", time: "09:00 - 10:30" },
            { subject: "Robototexnika / Shaxmat", teacher: "Qodirov S.", time: "10:45 - 12:15" },
          ],
        },
      ],
    };
  },
  computed: {
    classOptions() {
      const list = loadSchoolClasses(this.tenantStore.businessType);
      const suffix = this.tenantStore.classLabel.toLowerCase() + 'i';
      return [
        { value: "", label: `Barcha ${this.tenantStore.classesLabel.toLowerCase()}` },
        ...list.map((c) => {
          const hasLabel = c.name.toLowerCase().includes(this.tenantStore.classLabel.toLowerCase());
          return {
            value: c.name,
            label: hasLabel ? c.name : `${c.name} ${suffix}`,
          };
        }),
      ];
    },
    isFiltered() {
      return Boolean(
        this.filters.search ||
        (this.filters.selectedClass && this.filters.selectedClass !== this.classInfo.name) ||
        this.filters.status ||
        this.filters.language ||
        this.filters.shift
      );
    },
    filteredStudents() {
      return this.students.filter((st) => {
        if (this.filters.search) {
          const q = this.filters.search.toLowerCase().trim();
          const matchName = st.fullName.toLowerCase().includes(q);
          const matchId = st.studentId.toLowerCase().includes(q);
          const matchPinfl = (st.pinfl || "").toLowerCase().includes(q);
          const matchPassport = st.passport.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchPinfl && !matchPassport) return false;
        }

        if (this.filters.selectedClass && st.className !== this.filters.selectedClass) {
          return false;
        }

        if (this.filters.classType && st.classType !== this.filters.classType) {
          return false;
        }

        if (this.filters.language && st.language !== this.filters.language) {
          return false;
        }

        if (this.filters.status && st.status !== this.filters.status) {
          return false;
        }

        if (this.filters.shift && st.shift !== this.filters.shift) {
          return false;
        }

        return true;
      });
    },
    totalPages() {
      return Math.ceil(this.filteredStudents.length / this.perPage) || 1;
    },
    paginatedStudents() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredStudents.slice(start, start + this.perPage);
    },
  },
  watch: {
    "$route.params.id": {
      immediate: true,
      handler(paramId) {
        if (paramId) {
          this.loadClassData(paramId);
        }
      },
    },
    "tenantStore.businessType": {
      handler(newType) {
        const currentList = loadSchoolClasses(newType);
        const match = currentList.find((c) => c.id.toLowerCase() === (this.classInfo.id || "").toLowerCase());
        if (match) {
          this.loadClassData(match.id);
        } else if (currentList.length > 0) {
          this.$router.push(`/school/classes/${currentList[0].id}`);
        } else {
          this.$router.push("/school/classes");
        }
      },
    },
  },
  methods: {
    loadClassData(paramId) {
      const found = getClassById(paramId, this.tenantStore.businessType);
      if (found) {
        this.classInfo = {
          ...this.classInfo,
          ...found,
        };
      } else {
        this.classInfo.id = paramId;
        this.classInfo.name = paramId.toUpperCase();
      }
      this.filters.selectedClass = this.classInfo.name;
      this.students = getStudentsByClass(this.classInfo.id, this.classInfo.name, this.classInfo.studentsCount, this.tenantStore.businessType);
      this.selectedStudentIds = [];
      this.currentPage = 1;
      document.title = `${this.classInfo.name} ${this.tenantStore.classLabel.toLowerCase()}i - EduHub`;
    },
    onUpdateFilters(newFilters) {
      if (newFilters.selectedClass && newFilters.selectedClass !== this.classInfo.name) {
        const targetClass = loadSchoolClasses(this.tenantStore.businessType).find(
          (c) => c.name.toLowerCase() === newFilters.selectedClass.toLowerCase()
        );
        if (targetClass) {
          this.$router.push(`/school/classes/${targetClass.id}`);
          return;
        }
      }
      this.filters = newFilters;
      this.currentPage = 1;
    },
    resetFilters() {
      this.filters = {
        search: "",
        selectedClass: this.classInfo.name,
        classType: "",
        language: "",
        status: "",
        academicYear: "2025-2026",
        shift: "",
      };
      this.currentPage = 1;
      this.showNotification("Filtrlar dastlabki holatga qaytarildi");
    },
    showNotification(msg, type = "success") {
      if (type === "error") {
        toast.error(msg);
      } else if (type === "warning") {
        toast.warning(msg);
      } else if (type === "info") {
        toast.info(msg);
      } else {
        toast.success(msg);
      }
    },
    toggleSelectStudent(id) {
      const idx = this.selectedStudentIds.indexOf(id);
      if (idx > -1) {
        this.selectedStudentIds.splice(idx, 1);
      } else {
        this.selectedStudentIds.push(id);
      }
    },
    toggleSelectAllStudents() {
      if (this.selectedStudentIds.length === this.filteredStudents.length) {
        this.selectedStudentIds = [];
      } else {
        this.selectedStudentIds = this.filteredStudents.map((s) => s.id);
      }
    },
    goToStudentProfile(st) {
      this.$router.push(`/students/${st.studentId || st.id}`);
    },
    handleHeaderAction(type) {
      if (type === "groups") {
        this.showNotification("Guruhlar paneli ochildi");
      } else if (type === "template") {
        this.showNotification("Excel shabloni yuklab olinmoqda...");
      } else if (type === "import") {
        this.showNotification("Excel import oynasi ochildi");
      } else if (type === "export") {
        this.showNotification("O'quvchilar ro'yxati Excelga export qilindi!");
      } else if (type === "passwords") {
        this.showNotification(`${this.tenantStore.classLabel} o'quvchilari parollari yangilandi!`);
      } else if (type === "promote") {
        if (confirm(`Haqiqatan ham ${this.classInfo.name}ni keyingi o'quv yiliga (2026-2027) o'tkazmoqchimisiz?`)) {
          this.showNotification(`${this.tenantStore.classLabel} muvaffaqiyatli keyingi o'quv yiliga ko'chirildi!`);
        }
      }
    },
    handleBulkAction(type) {
      if (type === "transfer") {
        this.showNotification(`${this.selectedStudentIds.length} ta o'quvchi boshqa ${this.tenantStore.classLabel.toLowerCase()}ga ko'chirildi`);
      } else if (type === "payment-sheet") {
        this.showNotification(`${this.selectedStudentIds.length} ta o'quvchi uchun to'lov varaqasi tayyorlandi`);
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
