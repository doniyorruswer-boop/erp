<template>
  <div class="gradebook-page p-4 font-lexend space-y-4">
    <Breadcrumb
      :items="[
        { title: 'O\'quv jarayoni', to: '/education/schedule' },
        { title: 'Baholar jurnali' }
      ]"
    />

    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Baholar jurnali
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Sinflar va fanlar kesimida kundalik baholar va davomat jurnali
        </p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="outline" icon="solar:printer-bold" @click="printGradebook">
          Chop etish
        </AppButton>
        <AppButton variant="primary" icon="ri:file-excel-2-line">
          Excel eksport
        </AppButton>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Sinf selektori -->
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

        <!-- Fan selektori -->
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

        <!-- Chorak selektori -->
        <div class="flex items-center gap-1.5 text-xs">
          <span class="text-gray-500">Davr:</span>
          <select
            v-model="selectedQuarter"
            class="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 font-bold text-xs text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="q1">1-Chorak</option>
            <option value="q2">2-Chorak</option>
            <option value="q3">3-Chorak (Hozirgi)</option>
            <option value="q4">4-Chorak</option>
          </select>
        </div>
      </div>

      <div class="text-xs text-gray-500">
        O'qituvchi: <strong class="text-gray-800 dark:text-gray-200">Normatova Ruxshona</strong>
      </div>
    </div>

    <!-- Gradebook Matrix Table -->
    <div class="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xs overflow-x-auto">
      <table class="w-full border-collapse text-left text-xs min-w-[800px]">
        <thead>
          <tr class="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
            <th class="py-3 px-3 w-12 text-center font-bold">#</th>
            <th class="py-3 px-4 w-60 font-bold">O'quvchi F.I.SH</th>
            <th
              v-for="d in daysHeaders"
              :key="d"
              class="py-3 px-2 text-center font-bold w-9 border-l border-gray-200 dark:border-gray-800"
            >
              {{ d }}
            </th>
            <th class="py-3 px-3 text-center font-bold w-20 border-l border-gray-200 dark:border-gray-800">
              O'rtacha
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
          <tr
            v-for="(st, idx) in students"
            :key="st.id"
            class="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
          >
            <td class="py-2.5 px-3 text-center text-gray-400 font-medium">
              {{ idx + 1 }}
            </td>
            <td class="py-2.5 px-4 font-bold text-gray-800 dark:text-gray-200">
              {{ st.name }}
            </td>
            <td
              v-for="(grade, gIdx) in st.grades"
              :key="gIdx"
              class="py-2.5 px-1 text-center border-l border-gray-100 dark:border-gray-800"
            >
              <span
                v-if="grade"
                class="w-6 h-6 inline-flex items-center justify-center rounded text-xs font-bold"
                :class="getGradeBadgeClass(grade)"
              >
                {{ grade }}
              </span>
              <span v-else class="text-gray-300 dark:text-gray-700">·</span>
            </td>
            <td class="py-2.5 px-3 text-center font-bold border-l border-gray-200 dark:border-gray-800 text-primary">
              {{ st.average }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/AppButton.vue";
import { SCHEDULE_CLASSES, SUBJECTS_LIST } from "@/api/scheduleData";

export default {
  name: "GradebookView",
  components: {
    Breadcrumb,
    AppButton,
  },
  data() {
    return {
      classesList: SCHEDULE_CLASSES,
      subjectsList: SUBJECTS_LIST,
      selectedClass: "1-A",
      selectedSubject: "Matematika",
      selectedQuarter: "q3",
      daysHeaders: [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29],
      students: [
        { id: 1, name: "Abdullayev Jasur", grades: [5, 4, 5, 5, "", 4, 5, 4, 5, "", 5, 5, 4], average: "4.8" },
        { id: 2, name: "Baxromova Diyora", grades: [4, 4, 4, 5, 4, 4, 4, 5, "", 4, 4, 5, 4], average: "4.3" },
        { id: 3, name: "Ergashev Bobur", grades: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], average: "5.0" },
        { id: 4, name: "Karimov Shahzod", grades: [3, 4, 4, "", "nb", 4, 4, 3, 4, 4, 3, 4, 4], average: "3.7" },
        { id: 5, name: "Normatova Rayhona", grades: [5, 5, 4, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5], average: "4.8" },
        { id: 6, name: "Olimov Sanjar", grades: [4, 3, 4, 4, 4, 3, 4, 4, "", 4, 4, 3, 4], average: "3.8" },
        { id: 7, name: "Qosimov Timur", grades: [5, 4, 5, 5, 5, 4, 5, 4, 5, 5, 5, 5, 4], average: "4.7" },
        { id: 8, name: "Rustamova Kamola", grades: [5, 5, 5, 5, 4, 5, 5, 5, 5, 4, 5, 5, 5], average: "4.8" },
      ],
    };
  },
  methods: {
    getGradeBadgeClass(grade) {
      if (grade === 5) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400";
      if (grade === 4) return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400";
      if (grade === 3) return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400";
      if (grade === 2) return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400";
      if (grade === "nb") return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-normal";
      return "";
    },
    printGradebook() {
      window.print();
    },
  },
};
</script>
