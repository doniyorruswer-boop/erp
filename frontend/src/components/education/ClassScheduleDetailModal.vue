<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      @click.self="close"
    >
      <div
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-lexend animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- 1. Modal Header -->
        <div
          class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3 bg-gray-50/70 dark:bg-gray-800/50"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-sm shrink-0"
              :style="{ backgroundColor: currentClass?.color || '#3b82f6' }"
            >
              {{ currentClass?.name || "Sinf" }}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {{ currentClass?.name }} — Haftalik Dars Jadvali
                </h3>
                <span
                  class="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20"
                >
                  {{ currentClass?.stageLabel || "Boshlang'ich" }}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                <span>
                  Sinf rahbari:
                  <strong class="text-gray-700 dark:text-gray-200 font-semibold">
                    {{ currentClass?.teacherName || "Belgilanmagan" }}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  O'quvchilar:
                  <strong class="text-gray-700 dark:text-gray-200 font-semibold">
                    {{ currentClass?.studentsCount || 0 }} / {{ currentClass?.capacity || 25 }}
                  </strong>
                </span>
              </p>
            </div>
          </div>

          <!-- Fast Class Switcher & Actions -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Select other class quickly -->
            <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mr-2">
              <span>Sinf:</span>
              <select
                v-model="selectedClassId"
                class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-primary"
                @change="onClassChange"
              >
                <option v-for="c in allClasses" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>

            <!-- Print button -->
            <AppButton variant="outline" size="sm" icon="solar:printer-bold" @click="printSchedule">
              Chop etish
            </AppButton>

            <!-- Close button -->
            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              @click="close"
            >
              <Icon icon="solar:close-circle-bold" class="text-xl" />
            </button>
          </div>
        </div>

        <!-- 2. Timetable Grid Table (Scrollable) -->
        <div class="flex-1 overflow-auto p-4 bg-gray-100/40 dark:bg-gray-950/40">
          <div
            class="min-w-[780px] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs overflow-hidden"
          >
            <!-- Grid Table -->
            <table class="w-full border-collapse text-left text-xs">
              <thead>
                <tr
                  class="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
                >
                  <th
                    class="py-3 px-3 w-28 font-bold border-r border-gray-200 dark:border-gray-800 text-center"
                  >
                    Qo'ng'iroq
                  </th>
                  <th
                    v-for="day in weekdays"
                    :key="day.key"
                    class="py-3 px-3 font-bold border-r border-gray-200 dark:border-gray-800 last:border-r-0 text-center"
                  >
                    <div class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {{ day.label }}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr
                  v-for="bell in bellPeriods"
                  :key="bell.period"
                  class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <!-- Period / Time Cell -->
                  <td
                    class="py-2.5 px-3 border-r border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 text-center"
                  >
                    <div class="font-bold text-gray-800 dark:text-gray-200">
                      {{ bell.label }}
                    </div>
                    <div class="text-[11px] text-gray-400 dark:text-gray-400 mt-0.5">
                      {{ bell.time }}
                    </div>
                  </td>

                  <!-- Each Day Cell -->
                  <td
                    v-for="day in weekdays"
                    :key="day.key"
                    class="p-2 border-r border-gray-200 dark:border-gray-800 last:border-r-0 align-top relative group"
                    @click="openEditSlot(day.key, bell.period)"
                  >
                    <!-- Filled Lesson Slot -->
                    <div
                      v-if="schedule[day.key] && schedule[day.key][bell.period]"
                      class="p-2 rounded-lg border transition-all cursor-pointer shadow-2xs hover:shadow-sm"
                      :class="getSubjectColor(schedule[day.key][bell.period].subject)"
                    >
                      <div class="flex items-center justify-between gap-1 mb-1">
                        <span class="font-bold text-xs leading-tight truncate">
                          {{ schedule[day.key][bell.period].subject }}
                        </span>
                        <Icon
                          icon="solar:pen-2-bold"
                          class="text-xs opacity-0 group-hover:opacity-80 transition shrink-0"
                        />
                      </div>
                      <div class="text-[11px] opacity-90 truncate flex items-center gap-1">
                        <Icon icon="solar:user-bold" class="text-[10px] shrink-0" />
                        <span class="truncate">{{ schedule[day.key][bell.period].teacher }}</span>
                      </div>
                      <div class="text-[10px] opacity-75 mt-0.5 flex items-center gap-1">
                        <Icon icon="solar:home-bold" class="text-[9px] shrink-0" />
                        <span class="truncate">{{ schedule[day.key][bell.period].room }}</span>
                      </div>
                    </div>

                    <!-- Empty Slot Placeholder -->
                    <div
                      v-else
                      class="h-16 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 flex items-center justify-center transition cursor-pointer text-gray-300 dark:text-gray-600 hover:text-primary"
                    >
                      <span
                        class="text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon icon="solar:add-circle-bold" class="text-sm" />
                        Qo'shish
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Modal Footer -->
        <div
          class="px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2 bg-gray-50 dark:bg-gray-900 text-xs"
        >
          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Icon icon="solar:info-circle-bold" class="text-primary text-sm" />
            <span
              >Katakchani bosish orqali darsni o'zgartirishingiz yoki yangi dars biriktirishingiz
              mumkin.</span
            >
          </div>

          <div class="flex items-center gap-2">
            <AppButton variant="outline" size="sm" @click="close"> Yopish </AppButton>
          </div>
        </div>
      </div>

      <!-- Nested Slot Edit Modal -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="editingSlot"
          class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
          @click.self="editingSlot = null"
        >
          <div
            class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4"
          >
            <div
              class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3"
            >
              <div>
                <h4 class="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  Darsni tahrirlash
                </h4>
                <p class="text-xs text-gray-400">
                  {{ editingDayLabel }}, {{ editingSlot.period }}-dars ({{ editingSlotTime }})
                </p>
              </div>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                @click="editingSlot = null"
              >
                <Icon icon="solar:close-circle-bold" class="text-lg" />
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <!-- Fan tanlash -->
              <div>
                <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fan:
                </label>
                <select
                  v-model="editForm.subject"
                  class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Fan tanlang --</option>
                  <option v-for="s in subjectsList" :key="s.id" :value="s.name">
                    {{ s.name }}
                  </option>
                </select>
              </div>

              <!-- O'qituvchi tanlash -->
              <div>
                <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  O'qituvchi:
                </label>
                <select
                  v-model="editForm.teacher"
                  class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- O'qituvchi tanlang --</option>
                  <option v-for="t in teachersList" :key="t.id" :value="t.name">
                    {{ t.name }} ({{ t.subject }})
                  </option>
                </select>
              </div>

              <!-- Xona tanlash -->
              <div>
                <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dars xonasi / Kabinet:
                </label>
                <select
                  v-model="editForm.room"
                  class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Xona tanlang --</option>
                  <option v-for="r in roomsList" :key="r.id" :value="r.name">
                    {{ r.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Actions inside edit modal -->
            <div
              class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800"
            >
              <button
                v-if="hasExistingLesson"
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition"
                @click="clearCurrentSlot"
              >
                Darsni bekor qilish
              </button>
              <div v-else></div>

              <div class="flex items-center gap-2">
                <AppButton variant="outline" size="sm" @click="editingSlot = null">
                  Bekor qilish
                </AppButton>
                <AppButton variant="primary" size="sm" @click="saveSlot"> Saqlash </AppButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script>
import { Icon } from "@iconify/vue";

import {
  BELL_PERIODS,
  getClassSchedule,
  ROOMS_LIST,
  saveClassSchedule,
  SCHEDULE_CLASSES,
  SUBJECTS_LIST,
  TEACHERS_LIST,
  WEEKDAYS,
} from "@/api/scheduleData";
import AppButton from "@/components/common/AppButton.vue";

export default {
  name: "ClassScheduleDetailModal",
  components: {
    Icon,
    AppButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    classId: {
      type: String,
      default: "1-a",
    },
  },
  emits: ["update:modelValue", "saved"],
  data() {
    return {
      selectedClassId: this.classId,
      schedule: {},
      allClasses: SCHEDULE_CLASSES,
      bellPeriods: BELL_PERIODS,
      weekdays: WEEKDAYS,
      subjectsList: SUBJECTS_LIST,
      teachersList: TEACHERS_LIST,
      roomsList: ROOMS_LIST,

      editingSlot: null,
      editForm: {
        subject: "",
        teacher: "",
        room: "",
      },
    };
  },
  computed: {
    currentClass() {
      return this.allClasses.find((c) => c.id === this.selectedClassId) || this.allClasses[0];
    },
    editingDayLabel() {
      if (!this.editingSlot) return "";
      const day = this.weekdays.find((d) => d.key === this.editingSlot.day);
      return day ? day.label : "";
    },
    editingSlotTime() {
      if (!this.editingSlot) return "";
      const bell = this.bellPeriods.find((b) => b.period === this.editingSlot.period);
      return bell ? bell.time : "";
    },
    hasExistingLesson() {
      if (!this.editingSlot) return false;
      return !!(
        this.schedule[this.editingSlot.day] &&
        this.schedule[this.editingSlot.day][this.editingSlot.period]
      );
    },
  },
  watch: {
    classId(newVal) {
      if (newVal) {
        this.selectedClassId = newVal;
        this.loadSchedule();
      }
    },
    modelValue(newVal) {
      if (newVal) {
        this.selectedClassId = this.classId || "1-a";
        this.loadSchedule();
      }
    },
  },
  methods: {
    close() {
      this.$emit("update:modelValue", false);
    },
    onClassChange() {
      this.loadSchedule();
    },
    loadSchedule() {
      this.schedule = JSON.parse(JSON.stringify(getClassSchedule(this.selectedClassId)));
    },
    getSubjectColor(subjName) {
      const found = this.subjectsList.find((s) => s.name === subjName);
      if (found) return found.color;
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
    },
    openEditSlot(dayKey, period) {
      this.editingSlot = { day: dayKey, period };
      const existing = this.schedule[dayKey] && this.schedule[dayKey][period];
      if (existing) {
        this.editForm = {
          subject: existing.subject,
          teacher: existing.teacher,
          room: existing.room,
        };
      } else {
        this.editForm = {
          subject: "",
          teacher: this.currentClass?.teacherName || "",
          room: "101",
        };
      }
    },
    saveSlot() {
      if (!this.editingSlot) return;
      const { day, period } = this.editingSlot;
      if (!this.schedule[day]) this.schedule[day] = {};

      if (!this.editForm.subject) {
        // If empty subject, delete slot
        delete this.schedule[day][period];
      } else {
        this.schedule[day][period] = {
          period,
          subject: this.editForm.subject,
          teacher: this.editForm.teacher || this.currentClass?.teacherName || "O'qituvchi",
          room: this.editForm.room || "101",
        };
      }

      saveClassSchedule(this.selectedClassId, this.schedule);
      this.editingSlot = null;
      this.$emit("saved", { classId: this.selectedClassId, schedule: this.schedule });
    },
    clearCurrentSlot() {
      if (!this.editingSlot) return;
      const { day, period } = this.editingSlot;
      if (this.schedule[day]) {
        delete this.schedule[day][period];
      }
      saveClassSchedule(this.selectedClassId, this.schedule);
      this.editingSlot = null;
      this.$emit("saved", { classId: this.selectedClassId, schedule: this.schedule });
    },
    printSchedule() {
      window.print();
    },
  },
};
</script>
