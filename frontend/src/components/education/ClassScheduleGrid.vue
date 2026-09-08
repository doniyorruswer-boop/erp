<template>
  <div class="class-schedule-grid space-y-4 font-lexend">
    <!-- Haftalik dars jadvallari ro'yxati (Chorakdagi barcha haftalar ketma-ket) -->
    <div
      v-for="(week, wIdx) in weeksList"
      :key="week.weekNumber || wIdx"
      class="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800/80 rounded-2xl shadow-2xs overflow-hidden"
    >
      <!-- Hafta sarlavhasi (Hafta raqami va sana oraliqlari) -->
      <div class="px-4 py-3 bg-gray-50/90 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 flex items-center justify-center font-bold text-xs">
            {{ week.weekNumber }}
          </span>
          <span class="font-bold text-sm text-gray-900 dark:text-gray-100">
            {{ week.weekLabel || (week.weekNumber + '-hafta') }}
          </span>
          <span v-if="week.dateRangeText" class="text-xs text-gray-500 dark:text-gray-400 font-medium">
            ({{ week.dateRangeText }})
          </span>
        </div>

        <div class="text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5">
          <Icon icon="solar:calendar-linear" class="text-xs text-primary" />
          <span>Dushanba — Shanba</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-xs min-w-[980px]">
          <!-- 1. Kunlar sarlavhasi -->
          <thead>
            <tr class="bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200">
              <th class="py-2.5 px-3 w-10 text-center font-bold border-r border-gray-200 dark:border-gray-800">
                #
              </th>
              <th
                v-for="day in week.days"
                :key="day.dateKey"
                class="py-2.5 px-3 font-bold border-r border-gray-200 dark:border-gray-800 last:border-r-0 text-left"
              >
                {{ day.dayName }}
              </th>
            </tr>

            <!-- 2. Sanalar lentasi (Primary rangda) -->
            <tr class="bg-primary text-white text-[11px] font-semibold">
              <th class="py-1 px-2 text-center border-r border-white/20"></th>
              <th
                v-for="day in week.days"
                :key="'date-' + day.dateKey"
                class="py-1 px-3 text-center border-r border-white/20 last:border-r-0 tracking-wide"
              >
                {{ day.dateLabel }}
              </th>
            </tr>
          </thead>

          <!-- 3. Dars soatlari qatorlari (1-dan 5-darsgacha) -->
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr
              v-for="period in periodsList"
              :key="period.number"
              class="hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors"
            >
              <!-- Dars raqami (#) -->
              <td class="py-2 px-2 text-center font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                {{ period.number }}
              </td>

              <!-- Kun katakchalari -->
              <td
                v-for="day in week.days"
                :key="day.dateKey + '-' + period.number"
                class="p-0 border-r border-gray-200 dark:border-gray-800 last:border-r-0 align-top"
              >
                <ClassScheduleCell
                  :day="day"
                  :period="period"
                  :lesson="getLesson(day.dateKey, period.number)"
                  @click="$emit('cell-click', { day, period })"
                  @view="$emit('view-lesson', { day, period })"
                  @edit="$emit('edit-lesson', { day, period })"
                  @delete="$emit('delete-lesson', { day, period })"
                  @add="$emit('add-lesson', { day, period })"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import ClassScheduleCell from "./ClassScheduleCell.vue";

export default {
  name: "ClassScheduleGrid",
  components: {
    Icon,
    ClassScheduleCell,
  },
  props: {
    weeksList: {
      type: Array,
      required: true,
    },
    periodsList: {
      type: Array,
      required: true,
    },
    scheduleMap: {
      type: Object,
      required: true,
    },
    activeQuarter: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: [
    "cell-click",
    "view-lesson",
    "edit-lesson",
    "delete-lesson",
    "add-lesson",
  ],
  methods: {
    getLesson(dateKey, periodNum) {
      return this.scheduleMap[`${dateKey}_${periodNum}`] || null;
    },
  },
};
</script>
