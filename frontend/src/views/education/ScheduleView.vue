<template>
  <div class="schedule-view-page p-4 font-lexend space-y-4">
    <!-- 1. Breadcrumb -->
    <Breadcrumb
      :items="[
        { title: 'O\'quv jarayoni', to: '/education/schedule' },
        { title: 'Dars jadvali' }
      ]"
    />

    <!-- 2. Header Section (Sarlavha, Asosiy tablar va Ko'rish rejimi tugmalari) -->
    <div class="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 dark:border-gray-800 pb-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Dars jadvali
        </h1>
      </div>

      <!-- O'ng tomonda: 3-rasmdagi asosiy tablar va ko'rish rejimi (Kataklar / Ro'yxat) -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- 3-rasmdagi tugmalar: Sinflar, Darajalar, O'qituvchilar, Xonalar bo'yicha -->
        <div class="flex items-center gap-2 flex-wrap">
          <AppButton
            v-for="tab in mainTabs"
            :key="tab.key"
            :variant="activeTab === tab.key ? 'primary' : 'outline'"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </AppButton>
        </div>

        <!-- Ko'rish rejimi: Kataklar / Ro'yxat -->
        <div
          class="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 shadow-2xs"
        >
          <AppButton
            :variant="displayType === 'grid' ? 'primary' : 'ghost'"
            icon="solar:widget-5-bold"
            @click="displayType = 'grid'"
          >
            Kataklar
          </AppButton>

          <AppButton
            :variant="displayType === 'list' ? 'primary' : 'ghost'"
            icon="solar:list-bold"
            @click="displayType = 'list'"
          >
            Ro'yxat
          </AppButton>
        </div>
      </div>
    </div>

    <!-- 4. TAB 1: SINFLAR BO'YICHA (Asosiy rejim) -->
    <div v-if="activeTab === 'classes'" class="space-y-4">
      <!-- Choraklar bo'yicha tezkor filtr tugmalari - 1-rasm: 1-CHORAK, 2-CHORAK, ... -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          v-for="q in quarterFilters"
          :key="q.key"
          type="button"
          @click="selectedQuarter = q.key"
          :class="[
            'px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-2xs',
            selectedQuarter === q.key
              ? 'border-2 border-primary text-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#131b2e] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          ]"
        >
          {{ q.label }}
        </button>
      </div>

      <!-- A) Kataklar ko'rinishi (Grid Plitki) -->
      <div
        v-if="displayType === 'grid'"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <div
          v-for="cls in filteredClasses"
          :key="cls.id"
          class="bg-white dark:bg-[#131b2e] rounded-2xl border border-gray-200 dark:border-gray-800/80 p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700"
        >
          <!-- Yuqori rangli chegara (Sinf rangi bo'yicha) -->
          <div
            class="absolute top-0 left-0 right-0 h-1"
            :style="{ backgroundColor: cls.color }"
          ></div>

          <div>
            <!-- Yuqori qism: Sinf nishoni, Bosqich raqami va Sinf rahbari -->
            <div class="flex items-center gap-3 mb-3 pt-0.5">
              <!-- Dumaloq-to'rtburchak Sinf Badge -->
              <div
                class="w-12 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-xs shrink-0 select-none tracking-tight"
                :style="{ backgroundColor: cls.color }"
              >
                {{ cls.name }}
              </div>

              <!-- Parallel va Sinf rahbari -->
              <div class="min-w-0 flex-1">
                <div class="text-[11px] text-gray-400 dark:text-gray-400 font-semibold leading-tight">
                  {{ cls.parallel }}
                </div>
                <div class="truncate text-xs font-medium mt-0.5">
                  <span
                    v-if="cls.teacherName"
                    class="text-gray-800 dark:text-gray-200 font-semibold"
                    :title="cls.teacherName"
                  >
                    {{ cls.teacherName }}
                  </span>
                  <span
                    v-else
                    class="text-gray-400 dark:text-gray-400 italic text-[11px]"
                  >
                    Sinf rahbari belgilanmagan
                  </span>
                </div>
              </div>
            </div>

            <!-- O'rta qism: O'quvchilar sig'imi (👥 28 / 25) -->
            <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 my-2">
              <Icon icon="solar:users-group-rounded-linear" class="text-base text-gray-400 dark:text-gray-400 shrink-0" />
              <span class="font-semibold text-gray-700 dark:text-gray-200">
                {{ cls.studentsCount }} / {{ cls.capacity }}
              </span>
            </div>
          </div>

          <!-- Pastki qator: Shablonlar va Ochish amallari - Standard AppButton o'lchami -->
          <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
            <!-- Shablonlar tugmasi -->
            <AppButton
              variant="outline"
              @click="openTemplatesModal(cls)"
            >
              Shablonlar
            </AppButton>

            <!-- Ochish -> tugmasi (Primary rangli AppButton) -->
            <AppButton
              variant="primary"
              @click="openClassSchedule(cls)"
            >
              <span class="flex items-center gap-1.5">
                <span>Ochish</span>
                <Icon icon="solar:arrow-right-linear" class="text-sm font-bold" />
              </span>
            </AppButton>
          </div>
        </div>
      </div>

      <!-- B) Ro'yxat ko'rinishi (AppTable komponenti bilan) -->
      <div v-else>
        <AppTable
          :columns="tableColumns"
          :data="filteredClasses"
          :total-items="filteredClasses.length"
          :show-index="true"
        >
          <!-- Sinf katakchasi -->
          <template #cell(name)="{ row }">
            <div class="flex items-center gap-2">
              <span
                class="px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-2xs"
                :style="{ backgroundColor: row.color }"
              >
                {{ row.name }}
              </span>
              <span class="text-xs text-gray-500 font-medium">({{ row.stageLabel }})</span>
            </div>
          </template>

          <!-- Sinf rahbari -->
          <template #cell(teacherName)="{ row }">
            <AppUserCell
              v-if="row.teacherName"
              :name="row.teacherName"
              subtitle="Sinf rahbari"
            />
            <span v-else class="text-gray-400 italic text-xs">
              Belgilanmagan
            </span>
          </template>

          <!-- O'quvchilar soni / Sig'im -->
          <template #cell(capacityInfo)="{ row }">
            <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <Icon icon="solar:users-group-rounded-linear" class="text-sm text-gray-400" />
              <span>{{ row.studentsCount }} / {{ row.capacity }}</span>
            </div>
          </template>

          <!-- Haftalik darslar -->
          <template #cell(lessonsPerWeek)="{ row }">
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {{ row.lessonsPerWeek }} soat / hafta
            </span>
          </template>

          <!-- Amallar ustuni: Standard AppButton komponentlari bilan -->
          <template #actions="{ row }">
            <div class="flex items-center gap-2 justify-end">
              <AppButton
                variant="outline"
                @click="openTemplatesModal(row)"
              >
                Shablonlar
              </AppButton>
              <AppButton
                variant="primary"
                @click="openClassSchedule(row)"
              >
                <span class="flex items-center gap-1.5">
                  <span>Ochish</span>
                  <Icon icon="solar:arrow-right-linear" class="text-sm font-bold" />
                </span>
              </AppButton>
            </div>
          </template>
        </AppTable>
      </div>
    </div>

    <!-- 5. TAB 2: DARAJALAR BO'YICHA -->
    <div v-else-if="activeTab === 'levels'" class="space-y-4">
      <div
        v-for="group in levelGroups"
        :key="group.title"
        class="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-2xs space-y-3"
      >
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full bg-primary"></span>
            <h3 class="font-bold text-base text-gray-900 dark:text-gray-100">
              {{ group.title }}
            </h3>
            <span class="text-xs text-gray-400 font-medium">({{ group.classes.length }} ta sinf)</span>
          </div>
          <span class="text-xs text-gray-500 font-medium">
            Jami o'quvchilar: {{ group.classes.reduce((sum, c) => sum + c.studentsCount, 0) }} nafar
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
          <div
            v-for="c in group.classes"
            :key="c.id"
            @click="openClassSchedule(c)"
            class="p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary hover:bg-primary/5 transition cursor-pointer text-center group"
          >
            <div
              class="w-10 h-8 rounded-lg mx-auto flex items-center justify-center font-bold text-white text-xs shadow-2xs mb-2"
              :style="{ backgroundColor: c.color }"
            >
              {{ c.name }}
            </div>
            <div class="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition truncate">
              {{ c.teacherName || 'Raxbar yo\'q' }}
            </div>
            <div class="text-[11px] text-gray-400 mt-0.5">
              {{ c.studentsCount }} o'quvchi
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 6. TAB 3: O'QITUVCHILAR BO'YICHA -->
    <div v-else-if="activeTab === 'teachers'" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="teacher in teachersList"
          :key="teacher.id"
          class="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-2xs hover:shadow-md transition space-y-3"
        >
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {{ teacher.name.charAt(0) }}
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                {{ teacher.name }}
              </h4>
              <p class="text-xs text-primary font-medium">
                {{ teacher.subject }}
              </p>
            </div>
          </div>

          <div class="space-y-1 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <span>Telefon:</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ teacher.phone }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Doimiy xona:</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ teacher.room }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Haftalik yuklama:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">24 soat</span>
            </div>
          </div>

          <AppButton
            variant="outline"
            size="sm"
            :full-width="true"
            @click="openTeacherSchedule(teacher)"
          >
            Dars jadvalini ko'rish
          </AppButton>
        </div>
      </div>
    </div>

    <!-- 7. TAB 4: XONALAR BO'YICHA -->
    <div v-else-if="activeTab === 'rooms'" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="room in roomsList"
          :key="room.id"
          class="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-2xs hover:shadow-md transition space-y-3"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100">
                {{ room.name }}
              </h4>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ room.floor }}
              </p>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Faol
            </span>
          </div>

          <div class="space-y-1 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <span>Sig'imi:</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ room.capacity }} o'rin</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Bugungi bandlik:</span>
              <span class="font-medium text-primary">6 ta dars</span>
            </div>
          </div>

          <AppButton
            variant="outline"
            size="sm"
            :full-width="true"
            @click="openRoomSchedule(room)"
          >
            Xona bandligini ko'rish
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ClassScheduleDetailModal
      v-model="showScheduleModal"
      :class-id="activeClassId"
      @saved="handleScheduleSaved"
    />

    <ScheduleTemplateModal
      v-model="showTemplatesModal"
      :target-class="templateTargetClass"
      @applied="handleTemplateApplied"
    />
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppTable from "@/components/AppTable.vue";
import AppButton from "@/components/AppButton.vue";
import AppUserCell from "@/components/AppUserCell.vue";
import ClassScheduleDetailModal from "@/components/education/ClassScheduleDetailModal.vue";
import ScheduleTemplateModal from "@/components/education/ScheduleTemplateModal.vue";
import {
  SCHEDULE_CLASSES,
  TEACHERS_LIST,
  ROOMS_LIST,
} from "@/api/scheduleData";

export default {
  name: "ScheduleView",
  components: {
    Icon,
    Breadcrumb,
    AppTable,
    AppButton,
    AppUserCell,
    ClassScheduleDetailModal,
    ScheduleTemplateModal,
  },
  data() {
    return {
      displayType: "grid", // 'grid' | 'list'
      activeTab: "classes", // 'classes' | 'levels' | 'teachers' | 'rooms'
      searchQuery: "",
      selectedStage: "all",

      classesList: SCHEDULE_CLASSES,
      teachersList: TEACHERS_LIST,
      roomsList: ROOMS_LIST,

      showScheduleModal: false,
      activeClassId: "1-a",

      showTemplatesModal: false,
      templateTargetClass: null,

      mainTabs: [
        { key: "classes", label: "Sinflar bo'yicha" },
        { key: "levels", label: "Darajalar bo'yicha" },
        { key: "teachers", label: "O'qituvchilar bo'yicha" },
        { key: "rooms", label: "Xonalar bo'yicha" },
      ],

      quarterFilters: [
        { key: "1", label: "1-CHORAK" },
        { key: "2", label: "2-CHORAK" },
        { key: "3", label: "3-CHORAK" },
        { key: "4", label: "4-CHORAK" },
        { key: "5", label: "5-CHORAK" },
      ],
      selectedQuarter: "1",

      tableColumns: [
        { key: "name", label: "Sinf", sortable: true },
        { key: "parallel", label: "Daraja", align: "center", sortable: true },
        { key: "teacherName", label: "Sinf rahbari", sortable: true },
        { key: "capacityInfo", label: "O'quvchilar soni", align: "center", sortable: false },
        { key: "lessonsPerWeek", label: "Darslar miqdori", align: "center", sortable: true },
        { key: "actions", label: "Amallar", align: "right", sortable: false },
      ],
    };
  },
  computed: {
    filteredClasses() {
      return this.classesList.filter((c) => {
        // Search query
        if (this.searchQuery.trim()) {
          const q = this.searchQuery.toLowerCase().trim();
          const matchesName = c.name.toLowerCase().includes(q);
          const matchesTeacher = (c.teacherName || "").toLowerCase().includes(q);
          const matchesParallel = (c.parallel || "").includes(q);
          return matchesName || matchesTeacher || matchesParallel;
        }

        return true;
      });
    },
    levelGroups() {
      return [
        {
          title: "Boshlang'ich sinflar (1 - 4 sinf)",
          classes: this.classesList.filter((c) => parseInt(c.parallel, 10) <= 4),
        },
        {
          title: "Asosiy o'rta sinflar (5 - 9 sinf)",
          classes: this.classesList.filter(
            (c) => parseInt(c.parallel, 10) >= 5 && parseInt(c.parallel, 10) <= 9
          ),
        },
        {
          title: "Yuqori sinflar (10 - 11 sinf)",
          classes: this.classesList.filter((c) => parseInt(c.parallel, 10) >= 10),
        },
      ];
    },
  },
  methods: {
    openClassSchedule(cls) {
      const classId = typeof cls === "object" ? cls.id : cls;
      this.$router.push({
        path: `/education/schedule/class/${classId}`,
        query: { quarter: this.selectedQuarter || "1" },
      });
    },
    openTemplatesModal(cls) {
      this.templateTargetClass = cls;
      this.showTemplatesModal = true;
    },
    openTeacherSchedule(teacher) {
      // Find a class this teacher teaches, or default to 1-a
      const found = this.classesList.find((c) => c.teacherName === teacher.name);
      this.activeClassId = found ? found.id : "1-a";
      this.showScheduleModal = true;
    },
    openRoomSchedule() {
      this.activeClassId = "1-a";
      this.showScheduleModal = true;
    },
    handleScheduleSaved({ classId }) {
      console.log("Schedule updated for", classId);
    },
    handleTemplateApplied({ classId }) {
      this.activeClassId = classId;
    },
  },
};
</script>
