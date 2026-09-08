<template>
  <div class="final-grades-page p-4 font-lexend space-y-4">
    <Breadcrumb
      :items="[
        { title: 'O\'quv jarayoni', to: '/education/schedule' },
        { title: 'Yakuniy baholar' }
      ]"
    />

    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Yakuniy baholar
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Choraklik, yillik va yakuniy davlat attestatsiyasi baholari qaydnomasi
        </p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="outline" icon="solar:printer-bold" @click="printGrades">
          Chop etish
        </AppButton>
        <AppButton variant="primary" icon="ri:file-excel-2-line">
          Excel hisobot
        </AppButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-1.5 text-xs">
          <span class="text-gray-500">Sinf:</span>
          <select
            v-model="selectedClass"
            class="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 font-bold text-xs text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option v-for="c in classesList" :key="c.id" :value="c.name">
              {{ c.name }} sinf
            </option>
          </select>
        </div>

        <div class="flex items-center gap-1.5 text-xs">
          <span class="text-gray-500">Fan:</span>
          <select
            v-model="selectedSubject"
            class="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 font-bold text-xs text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option v-for="s in subjectsList" :key="s.id" :value="s.name">
              {{ s.name }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-1.5 text-xs">
          <span class="text-gray-500">O'quv yili:</span>
          <select
            v-model="selectedYear"
            class="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 font-bold text-xs text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Final Grades Table using AppTable -->
    <AppTable
      :columns="tableColumns"
      :data="studentsFinal"
      :total-items="studentsFinal.length"
      :show-index="true"
    >
      <template #cell(fullName)="{ row }">
        <AppUserCell :name="row.name" subtitle="O'quvchi" />
      </template>

      <template #cell(q1)="{ row }">
        <span class="px-2.5 py-1 rounded text-xs font-bold" :class="getBadgeClass(row.q1)">{{ row.q1 }}</span>
      </template>

      <template #cell(q2)="{ row }">
        <span class="px-2.5 py-1 rounded text-xs font-bold" :class="getBadgeClass(row.q2)">{{ row.q2 }}</span>
      </template>

      <template #cell(q3)="{ row }">
        <span class="px-2.5 py-1 rounded text-xs font-bold" :class="getBadgeClass(row.q3)">{{ row.q3 }}</span>
      </template>

      <template #cell(q4)="{ row }">
        <span class="px-2.5 py-1 rounded text-xs font-bold" :class="getBadgeClass(row.q4)">{{ row.q4 || '—' }}</span>
      </template>

      <template #cell(annual)="{ row }">
        <span class="px-3 py-1 rounded-md text-xs font-bold text-white shadow-2xs" :class="row.annual >= 4 ? 'bg-emerald-600' : 'bg-amber-500'">
          {{ row.annual }}
        </span>
      </template>
    </AppTable>
  </div>
</template>

<script>
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppTable from "@/components/AppTable.vue";
import AppButton from "@/components/AppButton.vue";
import AppUserCell from "@/components/AppUserCell.vue";
import { SCHEDULE_CLASSES, SUBJECTS_LIST } from "@/api/scheduleData";

export default {
  name: "FinalGradesView",
  components: {
    Breadcrumb,
    AppTable,
    AppButton,
    AppUserCell,
  },
  data() {
    return {
      classesList: SCHEDULE_CLASSES,
      subjectsList: SUBJECTS_LIST,
      selectedClass: "1-A",
      selectedSubject: "Matematika",
      selectedYear: "2025-2026",
      tableColumns: [
        { key: "fullName", label: "O'quvchi F.I.SH", sortable: true },
        { key: "q1", label: "1-Chorak", align: "center", sortable: true },
        { key: "q2", label: "2-Chorak", align: "center", sortable: true },
        { key: "q3", label: "3-Chorak", align: "center", sortable: true },
        { key: "q4", label: "4-Chorak", align: "center", sortable: true },
        { key: "annual", label: "Yillik baho", align: "center", sortable: true },
      ],
      studentsFinal: [
        { id: 1, name: "Abdullayev Jasur", q1: 5, q2: 5, q3: 5, q4: "", annual: 5 },
        { id: 2, name: "Baxromova Diyora", q1: 4, q2: 4, q3: 5, q4: "", annual: 4 },
        { id: 3, name: "Ergashev Bobur", q1: 5, q2: 5, q3: 5, q4: "", annual: 5 },
        { id: 4, name: "Karimov Shahzod", q1: 4, q2: 3, q3: 4, q4: "", annual: 4 },
        { id: 5, name: "Normatova Rayhona", q1: 5, q2: 5, q3: 5, q4: "", annual: 5 },
        { id: 6, name: "Olimov Sanjar", q1: 4, q2: 4, q3: 4, q4: "", annual: 4 },
        { id: 7, name: "Qosimov Timur", q1: 5, q2: 5, q3: 4, q4: "", annual: 5 },
        { id: 8, name: "Rustamova Kamola", q1: 5, q2: 5, q3: 5, q4: "", annual: 5 },
      ],
    };
  },
  methods: {
    getBadgeClass(grade) {
      if (grade === 5) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400";
      if (grade === 4) return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400";
      if (grade === 3) return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400";
      if (grade === 2) return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400";
      return "text-gray-400";
    },
    printGrades() {
      window.print();
    },
  },
};
</script>
