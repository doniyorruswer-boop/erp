<template>
  <Vmodal
    :model-value="modelValue"
    :title="modalTitle"
    subtitle="Dars ma'lumotlari, ko'rsatkichlar va o'quvchilar davomati"
    icon="solar:document-text-bold"
    icon-bg-class="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
    width="max-w-2xl"
    :hide-button="true"
    @update:model-value="handleClose"
  >
    <template #body>
      <div class="space-y-4 text-left p-1 font-lexend">
        <!-- 1. Meta chips (Sana, Vaqt, Xona, O'qituvchi) - 3-rasm -->
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 shadow-2xs"
          >
            <Icon icon="solar:calendar-bold" class="text-xs" />
            {{ day?.dayName }}, {{ day?.dateString }}
          </span>

          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800 shadow-2xs"
          >
            <Icon icon="solar:clock-circle-bold" class="text-xs" />
            {{ period?.time }}
          </span>

          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 shadow-2xs"
          >
            <Icon icon="solar:buildings-2-bold" class="text-xs" />
            {{ lesson?.room || "200-xona" }}
          </span>

          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs"
          >
            <Icon icon="solar:user-bold" class="text-xs" />
            {{ lesson?.teacher || "Normatov Jamshid Normatovich" }}
          </span>
        </div>

        <!-- 2. Status badge: Rejalashtirilgan -->
        <div>
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            {{ lesson?.status || "Rejalashtirilgan" }}
          </span>
        </div>

        <!-- 3. KPI counters: Jami, Kelgan, Kelmagan (3-rasm) -->
        <div class="grid grid-cols-3 gap-3">
          <div
            class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center shadow-2xs"
          >
            <div
              class="flex items-center justify-center gap-1.5 text-primary text-base sm:text-lg font-bold"
            >
              <Icon icon="solar:users-group-rounded-linear" />
              <span>{{ localStudents.length }}</span>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">Jami</div>
          </div>

          <div
            class="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 text-center shadow-2xs"
          >
            <div
              class="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-base sm:text-lg font-bold"
            >
              <Icon icon="solar:check-circle-bold" />
              <span>{{ presentCount }}</span>
            </div>
            <div class="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 font-medium">
              Kelgan
            </div>
          </div>

          <div
            class="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl p-3 text-center shadow-2xs"
          >
            <div
              class="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 text-base sm:text-lg font-bold"
            >
              <Icon icon="solar:close-circle-bold" />
              <span>{{ absentCount }}</span>
            </div>
            <div class="text-xs text-rose-700 dark:text-rose-300 mt-0.5 font-medium">Kelmagan</div>
          </div>
        </div>

        <!-- 4. Mobil ilova orqali kiritilgan tegi (3-rasm) -->
        <div>
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50/80 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs"
          >
            <Icon icon="solar:smartphone-linear" class="text-sm" />
            Mobil ilova orqali kiritilgan
          </span>
        </div>

        <!-- 5. O'quvchilar davomati jadvali (3-rasm) -->
        <div
          class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto shadow-2xs"
        >
          <table class="w-full text-xs text-left border-collapse">
            <thead
              class="bg-gray-50 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10"
            >
              <tr>
                <th class="py-2.5 px-3 w-10 text-center font-bold">#</th>
                <th class="py-2.5 px-4 font-bold">O'QUVCHI ISMI</th>
                <th class="py-2.5 px-3 text-center font-bold">DAVOMAT</th>
                <th class="py-2.5 px-3 text-center font-bold">BAHO</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              <tr
                v-for="(st, sIdx) in localStudents"
                :key="st.id || sIdx"
                class="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td class="py-2.5 px-3 text-center text-gray-400 font-medium">
                  {{ sIdx + 1 }}
                </td>
                <td class="py-2.5 px-4 font-bold text-gray-900 dark:text-gray-100">
                  {{ st.fullName }}
                </td>
                <td class="py-2.5 px-3 text-center">
                  <div class="inline-flex items-center gap-1">
                    <button
                      type="button"
                      :class="[
                        'px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer',
                        st.attendance === 'present'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600',
                      ]"
                      @click="toggleAttendance(st, 'present')"
                    >
                      Kelgan
                    </button>
                    <button
                      type="button"
                      :class="[
                        'px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer',
                        st.attendance === 'absent'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-rose-50 hover:text-rose-600',
                      ]"
                      @click="toggleAttendance(st, 'absent')"
                    >
                      Kelmagan
                    </button>
                  </div>
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span
                    v-if="st.grade"
                    class="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold inline-flex items-center justify-center text-xs"
                  >
                    {{ st.grade }}
                  </span>
                  <span v-else class="text-gray-300 dark:text-gray-600">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-end gap-2.5 w-full">
        <AppButton variant="secondary" @click="handleClose"> Yopish </AppButton>
      </div>
    </template>
  </Vmodal>
</template>

<script>
import { Icon } from "@iconify/vue";

import AppButton from "@/components/common/AppButton.vue";
import vmodal from "@/components/common/AppModal.vue";

export default {
  name: "ClassLessonDetailModal",
  components: {
    Icon,
    vmodal,
    AppButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    day: {
      type: Object,
      default: null,
    },
    period: {
      type: Object,
      default: null,
    },
    lesson: {
      type: Object,
      default: null,
    },
    currentClass: {
      type: Object,
      default: () => ({ name: "1-A" }),
    },
    students: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      localStudents: [],
    };
  },
  computed: {
    modalTitle() {
      const subject = this.lesson?.subject || "Dars";
      const clsName = this.currentClass?.name || "1-A";
      return `${subject} – ${clsName} sinf`;
    },
    presentCount() {
      return this.localStudents.filter((s) => s.attendance === "present").length;
    },
    absentCount() {
      return this.localStudents.filter((s) => s.attendance === "absent").length;
    },
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.initStudents();
      }
    },
  },
  methods: {
    initStudents() {
      if (this.students && this.students.length > 0) {
        this.localStudents = this.students.map((s, idx) => ({
          ...s,
          attendance: idx === 0 ? "present" : null,
          grade: idx === 0 ? 5 : null,
        }));
      } else {
        this.localStudents = [
          { id: "st-1", fullName: "Umarov Ali Ikromovich", attendance: "present", grade: 5 },
          { id: "st-2", fullName: "Abdullayev Jasur Rustamovich", attendance: null, grade: null },
          { id: "st-3", fullName: "Karimov Shahzod Dilshodovich", attendance: null, grade: null },
        ];
      }
    },
    toggleAttendance(student, status) {
      student.attendance = student.attendance === status ? null : status;
    },
    handleClose() {
      this.$emit("update:modelValue", false);
    },
  },
};
</script>
