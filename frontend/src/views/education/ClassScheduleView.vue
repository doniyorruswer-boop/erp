<template>
  <div class="class-schedule-view p-4 font-lexend space-y-4">
    <!-- 1. Sahifa Headeri (Breadcrumb, Sinf almashtirgich, Sarlavha, Generatsiya) -->
    <ClassScheduleHeader
      :current-class="currentClass"
      :all-classes="allClasses"
      :active-class-id="activeClassId"
      :quarters="quarters"
      :active-quarter-id="activeQuarterId"
      :weeks-count="weeksList.length"
      @change-class="changeClass"
      @change-quarter="changeQuarter"
      @generate="generateSchedule"
      @open-templates="showTemplatesModal = true"
    />

    <!-- 2. Haftalik Dars Jadvali Matritsasi (Grid ko'rinishi) -->
    <ClassScheduleGrid
      :weeks-list="weeksList"
      :periods-list="periodsList"
      :schedule-map="scheduleMap"
      :active-quarter="activeQuarter"
      @cell-click="handleCellClick"
      @view-lesson="handleViewLesson"
      @edit-lesson="handleEditLesson"
      @delete-lesson="handleDeleteLesson"
      @add-lesson="handleAddLesson"
    />

    <!-- 3. Modal 1: Ko'rish va Davomat (3-rasm) - vmodal asosida -->
    <ClassLessonDetailModal
      v-model="showDetailModal"
      :day="activeDay"
      :period="activePeriod"
      :lesson="activeLesson"
      :current-class="currentClass"
      :students="classStudents"
    />

    <!-- 4. Modal 2: Tahrirlash (4-rasm) - vmodal asosida -->
    <ClassLessonEditModal
      v-model="showEditModal"
      :day="activeDay"
      :period="activePeriod"
      :lesson="activeLesson"
      :periods-list="periodsList"
      :subjects-list="subjectsList"
      :teachers-list="teachersList"
      :rooms-list="roomsList"
      @save="handleSaveEditedLesson"
    />

    <!-- 5. Modal 3: Yangi dars qo'shish (5-rasm) - vmodal asosida -->
    <ClassLessonAddModal
      v-model="showAddModal"
      :day="activeDay"
      :period="activePeriod"
      :periods-list="periodsList"
      :subjects-list="subjectsList"
      :teachers-list="teachersList"
      :rooms-list="roomsList"
      @save="handleSaveNewLesson"
    />

    <!-- 6. Modal 4: O'chirishni tasdiqlash modali (AppConfirmModal) -->
    <AppConfirmModal
      ref="deleteConfirmModal"
      title="Darsni o'chirish"
      :message="
        lessonToDelete
          ? '«' +
            (lessonToDelete.lesson?.subject || 'Dars') +
            '» darsini o\'chirishni tasdiqlaysizmi?'
          : ''
      "
      :description="
        lessonToDelete
          ? lessonToDelete.day?.dayName +
            ', ' +
            lessonToDelete.day?.dateString +
            ' soat ' +
            lessonToDelete.period?.time
          : ''
      "
      confirm-text="Tasdiqlash va O'chirish"
      cancel-text="Bekor qilish"
      variant="danger"
      @confirm="executeDeleteLesson"
    />

    <!-- 7. Modal 5: Dars jadvali shablonlari modali (ScheduleTemplateModal) -->
    <ScheduleTemplateModal
      v-model="showTemplatesModal"
      :target-class="currentClass"
      :active-quarter-id="activeQuarterId"
      :active-quarter="activeQuarter"
      :weeks-count="weeksList.length"
      @applied="handleTemplateApplied"
    />
  </div>
</template>

<script>
import {
  generateWeeksForQuarter,
  ROOMS_LIST,
  SCHEDULE_CLASSES,
  SCHOOL_QUARTERS,
  SUBJECTS_LIST,
  TEACHERS_LIST,
} from "@/api/scheduleData";
import { initialSchoolStudents } from "@/api/schoolStudentsData";
import AppConfirmModal from "@/components/common/AppConfirmModal.vue";
import ClassLessonAddModal from "@/components/education/ClassLessonAddModal.vue";
import ClassLessonDetailModal from "@/components/education/ClassLessonDetailModal.vue";
import ClassLessonEditModal from "@/components/education/ClassLessonEditModal.vue";
import ClassScheduleGrid from "@/components/education/ClassScheduleGrid.vue";
import ClassScheduleHeader from "@/components/education/ClassScheduleHeader.vue";
import ScheduleTemplateModal from "@/components/education/ScheduleTemplateModal.vue";
import toast from "@/utils/toast";

export default {
  name: "ClassScheduleView",
  components: {
    ClassScheduleHeader,
    ClassScheduleGrid,
    ClassLessonDetailModal,
    ClassLessonEditModal,
    ClassLessonAddModal,
    ScheduleTemplateModal,
    AppConfirmModal,
  },
  data() {
    return {
      activeClassId: this.$route.params.classId || "1-a",
      activeQuarterId: this.$route.query.quarter || "1",
      quarters: SCHOOL_QUARTERS,
      allClasses: SCHEDULE_CLASSES,
      subjectsList: SUBJECTS_LIST,
      teachersList: TEACHERS_LIST,
      roomsList: ROOMS_LIST,
      showTemplatesModal: false,

      // Dars vaqtlari (1-dan 5-darsgacha)
      periodsList: [
        { number: 1, time: "08:00 - 08:45" },
        { number: 2, time: "08:50 - 09:35" },
        { number: 3, time: "09:40 - 10:25" },
        { number: 4, time: "10:35 - 11:20" },
        { number: 5, time: "11:25 - 12:10" },
      ],

      // Darslar xaritasi: scheduleMap[dateKey_periodNumber] = lessonObj
      scheduleMap: {},

      // Modallar holati
      showDetailModal: false,
      showEditModal: false,
      showAddModal: false,

      // O'chirilishi kutilayotgan dars
      lessonToDelete: null,

      // Faol katakcha / dars ma'lumotlari
      activeDay: null,
      activePeriod: null,
      activeLesson: null,
    };
  },
  computed: {
    activeQuarter() {
      return this.quarters.find((q) => q.id === this.activeQuarterId) || this.quarters[0];
    },
    weeksList() {
      return generateWeeksForQuarter(this.activeQuarter.startDate, this.activeQuarter.endDate);
    },
    currentClass() {
      return (
        this.allClasses.find((c) => c.id === this.activeClassId) ||
        this.allClasses[0] || { name: "1-A", color: "#0ca678" }
      );
    },
    classStudents() {
      const clsName = this.currentClass.name;
      const filtered = initialSchoolStudents.filter((s) => s.className === clsName);
      if (filtered.length > 0) return filtered;
      return [
        { id: "st-1", fullName: "Umarov Ali Ikromovich" },
        { id: "st-2", fullName: "Abdullayev Jasur Rustamovich" },
        { id: "st-3", fullName: "Karimov Shahzod Dilshodovich" },
      ];
    },
  },
  watch: {
    "$route.params.classId"(newId) {
      if (newId) {
        this.activeClassId = newId;
        this.loadClassSchedule();
      }
    },
    "$route.query.quarter"(newQ) {
      if (newQ && newQ !== this.activeQuarterId) {
        this.activeQuarterId = newQ;
        this.loadClassSchedule();
      }
    },
  },
  mounted() {
    this.loadClassSchedule();
  },
  methods: {
    changeClass(newClassId) {
      this.activeClassId = newClassId;
      this.$router.push({
        path: `/education/schedule/class/${newClassId}`,
        query: { quarter: this.activeQuarterId },
      });
    },
    changeQuarter(quarterId) {
      this.activeQuarterId = quarterId;
      this.$router.replace({
        query: { ...this.$route.query, quarter: quarterId },
      });
      this.loadClassSchedule();
    },
    getStorageKey() {
      return `educrm_dated_schedule_${this.activeClassId}_q${this.activeQuarterId}`;
    },
    loadClassSchedule() {
      const primaryKey = this.getStorageKey();
      let saved = localStorage.getItem(primaryKey);
      if (!saved && this.activeQuarterId === "1") {
        saved = localStorage.getItem(`educrm_dated_schedule_${this.activeClassId}`);
      }

      if (saved) {
        try {
          this.scheduleMap = JSON.parse(saved);
          return;
        } catch (e) {}
      }

      // Default mock darslar: bu chorakdagi darslarni taqsimlaymiz
      const sampleSubjects = [
        { subject: "Chizmachilik", teacher: "Normatov Jamshid Normatovich", room: "200-xona" },
        { subject: "Matematika", teacher: "Karimova Zilola", room: "200-xona" },
        { subject: "Ona tili", teacher: "Normatova Ruxshona", room: "101-xona" },
        { subject: "Ingliz tili", teacher: "Aliyeva Dildora", room: "302-xona" },
        { subject: "Informatika (IT)", teacher: "Saidov Elyor", room: "IT-Lab 1" },
        { subject: "Jismoniy tarbiya", teacher: "Mamatov Sherzod", room: "Sport zal" },
        { subject: "Tarbiya", teacher: "Normatova Ruxshona", room: "101-xona" },
      ];

      const initialMap = {};
      this.weeksList.forEach((week, wIdx) => {
        week.days.forEach((day, dIdx) => {
          if (!day.inQuarter || day.dateLabel === "—") return;
          const isSaturday = day.dayName === "Shanba";
          const maxP = isSaturday ? 3 : 4;
          for (let p = 1; p <= maxP; p++) {
            const item = sampleSubjects[(wIdx * 3 + dIdx + p) % sampleSubjects.length];
            initialMap[`${day.dateKey}_${p}`] = {
              date: day.dateString,
              time: this.periodsList[p - 1].time,
              room: item.room,
              subject: item.subject,
              teacher: item.teacher,
              lessonType: "Asosiy",
              group: "Umumiy guruh",
              status: "Rejalashtirilgan",
            };
          }
        });
      });

      this.scheduleMap = initialMap;
      this.saveToStorage();
    },
    saveToStorage() {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.scheduleMap));
      if (this.activeQuarterId === "1") {
        localStorage.setItem(
          `educrm_dated_schedule_${this.activeClassId}`,
          JSON.stringify(this.scheduleMap)
        );
      }
    },
    getLesson(dateKey, periodNum) {
      return this.scheduleMap[`${dateKey}_${periodNum}`];
    },
    handleCellClick({ day, period }) {
      const existing = this.getLesson(day.dateKey, period.number);
      if (existing) {
        this.handleViewLesson({ day, period });
      } else {
        this.handleAddLesson({ day, period });
      }
    },
    handleViewLesson({ day, period }) {
      this.activeDay = day;
      this.activePeriod = period;
      this.activeLesson = this.getLesson(day.dateKey, period.number);
      this.showDetailModal = true;
    },
    handleEditLesson({ day, period }) {
      this.activeDay = day;
      this.activePeriod = period;
      this.activeLesson = this.getLesson(day.dateKey, period.number);
      this.showEditModal = true;
    },
    handleDeleteLesson({ day, period }) {
      const lesson = this.getLesson(day.dateKey, period.number);
      this.lessonToDelete = { day, period, lesson };
      if (this.$refs.deleteConfirmModal) {
        this.$refs.deleteConfirmModal.open();
      }
    },
    executeDeleteLesson() {
      if (!this.lessonToDelete) return;
      const key = `${this.lessonToDelete.day.dateKey}_${this.lessonToDelete.period.number}`;
      delete this.scheduleMap[key];
      this.saveToStorage();
      this.lessonToDelete = null;
    },
    handleAddLesson({ day, period }) {
      this.activeDay = day;
      this.activePeriod = period;
      this.showAddModal = true;
    },
    handleSaveEditedLesson({ day, period, lesson }) {
      const key = `${day.dateKey}_${period.number}`;
      this.scheduleMap[key] = { ...lesson };
      this.saveToStorage();
      this.showEditModal = false;
    },
    handleSaveNewLesson({ day, period, lesson }) {
      const key = `${day.dateKey}_${period.number}`;
      this.scheduleMap[key] = {
        ...lesson,
        status: "Rejalashtirilgan",
      };
      this.saveToStorage();
      this.showAddModal = false;
    },
    generateSchedule() {
      const sampleSubjects = [
        { subject: "Chizmachilik", teacher: "Normatov Jamshid Normatovich", room: "200-xona" },
        { subject: "Matematika", teacher: "Karimova Zilola", room: "200-xona" },
        { subject: "Ona tili", teacher: "Normatova Ruxshona", room: "101-xona" },
        { subject: "Ingliz tili", teacher: "Aliyeva Dildora", room: "302-xona" },
        { subject: "Informatika (IT)", teacher: "Saidov Elyor", room: "IT-Lab 1" },
        { subject: "Jismoniy tarbiya", teacher: "Mamatov Sherzod", room: "Sport zal" },
        { subject: "Tarbiya", teacher: "Normatova Ruxshona", room: "101-xona" },
      ];

      const newMap = {};
      this.weeksList.forEach((week, wIdx) => {
        week.days.forEach((day, dIdx) => {
          if (!day.inQuarter || day.dateLabel === "—") return;
          const isSaturday = day.dayName === "Shanba";
          const maxP = isSaturday ? 3 : 4;
          for (let p = 1; p <= maxP; p++) {
            const item = sampleSubjects[(wIdx * 3 + dIdx + p) % sampleSubjects.length];
            newMap[`${day.dateKey}_${p}`] = {
              date: day.dateString,
              time: this.periodsList[p - 1].time,
              room: item.room,
              subject: item.subject,
              teacher: item.teacher,
              lessonType: "Asosiy",
              group: "Umumiy guruh",
              status: "Rejalashtirilgan",
            };
          }
        });
      });
      this.scheduleMap = newMap;
      this.saveToStorage();
      toast.success(
        `${this.activeQuarter.name} (${this.activeQuarter.dateRangeText}) uchun ${this.weeksList.length} haftaga darslar to'liq generatsiya qilindi!`
      );
    },
    handleTemplateApplied({ schedule }) {
      if (schedule) {
        this.scheduleMap = schedule;
      } else {
        this.loadClassSchedule();
      }
    },
  },
};
</script>
