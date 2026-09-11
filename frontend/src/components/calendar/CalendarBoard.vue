<template>
  <div class="calendar-board space-y-4 font-lexend">
    <!-- Header with Action Button -->
    <div v-if="showHeader" class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ title }}</h2>
        <p v-if="subtitle" class="text-xs text-gray-400">{{ subtitle }}</p>
      </div>

      <!-- Main Action Button via vmodal -->
      <Vmodal
        ref="taskModal"
        :title="isEditing ? 'Topshiriqni Tahrirlash' : 'Yangi Topshiriq / Tadbir'"
        subtitle="Sana, nom va tadbir turini kiriting"
        btn-text="Yangi Topshiriq / Tadbir"
        btn-icon="solar:add-circle-bold"
        btn-color="bg-primary"
        btn-text-submit="Saqlash"
        btn-text-close="Bekor qilish"
        @submit="saveTaskForm"
      >
        <template #Icon>
          <Icon icon="solar:calendar-mark-bold" class="text-3xl text-primary mb-2" />
        </template>

        <template #body>
          <div class="space-y-3.5 text-xs text-left">
            <FormInput
              v-model="formData.title"
              label="Topshiriq / Tadbir nomi"
              required
              placeholder="Masalan: Yangi guruh ochilishi, IELTS Mock..."
              icon="solar:clipboard-text-linear"
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormDatePicker
                v-model="formData.date"
                label="Sana"
                required
                placeholder="Sanani tanlang"
              />

              <FormSelect
                v-model="formData.type"
                label="Turi"
                required
                :options="taskTypeOptions"
              />
            </div>

            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >Qo'shimcha izoh (ixtiyoriy)</label
              >
              <textarea
                v-model="formData.description"
                rows="2"
                placeholder="Tadbir haqida batafsil..."
                class="w-full p-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-xl outline-none focus:border-primary text-gray-800 dark:text-gray-100 text-xs"
              ></textarea>
            </div>
          </div>
        </template>
      </Vmodal>
    </div>

    <!-- Main Grid: Calendar (3/4) + Tasks (1/4) -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-5">
      <!-- Calendar Card (Col 1-3) -->
      <div
        class="lg:col-span-3 card bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 shadow-sm flex flex-col justify-between"
      >
        <!-- Calendar Month Bar -->
        <div
          class="flex items-center justify-between flex-wrap gap-3 mb-4 pb-3 border-b dark:border-gray-700"
        >
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">
            {{ currentMonthName }} {{ currentYear }}
          </h3>

          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition cursor-pointer"
              @click="goToToday"
            >
              Bugun
            </button>
            <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-0.5 rounded-md">
              <button
                class="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded transition cursor-pointer"
                title="Oldingi oy"
                @click="prevMonth"
              >
                <Icon icon="solar:alt-arrow-left-linear" class="text-base" />
              </button>
              <button
                class="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded transition cursor-pointer"
                title="Keyingi oy"
                @click="nextMonth"
              >
                <Icon icon="solar:alt-arrow-right-linear" class="text-base" />
              </button>
            </div>
          </div>
        </div>

        <!-- Days of Week Header -->
        <div
          class="grid grid-cols-7 text-center font-semibold text-xs text-gray-500 dark:text-gray-400 py-2 border-b dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-700/30 rounded-t-md"
        >
          <span>Du</span>
          <span>Se</span>
          <span>Ch</span>
          <span>Pa</span>
          <span>Ju</span>
          <span>Sh</span>
          <span>Ya</span>
        </div>

        <!-- Calendar Days Grid -->
        <div class="grid grid-cols-7 border-l border-t dark:border-gray-700/60 flex-1">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="[
              'min-h-[95px] p-1.5 border-r border-b dark:border-gray-700/60 transition cursor-pointer relative group flex flex-col justify-between',
              day.isCurrentMonth
                ? 'bg-white dark:bg-gray-800'
                : 'bg-gray-50/50 dark:bg-gray-900/30 text-gray-400',
              day.isToday ? 'bg-amber-50/60 dark:bg-amber-900/10' : '',
              selectedDateStr === day.dateString ? 'ring-2 ring-primary ring-inset' : '',
            ]"
            @click="selectDay(day)"
          >
            <!-- Date Number -->
            <div class="flex items-center justify-between">
              <span
                :class="[
                  'text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full',
                  day.isToday
                    ? 'bg-primary text-white font-bold'
                    : 'text-gray-700 dark:text-gray-300',
                ]"
              >
                {{ day.dayNumber }}
              </span>

              <button
                class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition p-0.5"
                title="Tadbir qo'shish"
                @click.stop="openEventModalForDate(day.dateString)"
              >
                <Icon icon="solar:add-circle-linear" class="text-sm" />
              </button>
            </div>

            <!-- Day Events List -->
            <div class="space-y-1 mt-1 overflow-hidden">
              <div
                v-for="ev in day.events"
                :key="ev.id"
                :class="[
                  'text-[10px] px-1.5 py-0.5 rounded font-medium truncate flex items-center gap-1 shadow-2xs',
                  ev.type === 'exam'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                    : ev.type === 'masterclass'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : ev.type === 'payment'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-blue-300',
                ]"
                @click.stop="viewEvent(ev)"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                <span class="truncate">{{ ev.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Topshiriqlar Ro'yxati (Tasks List) -->
      <div
        class="card bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm flex flex-col justify-between"
      >
        <div>
          <!-- Tasks Header -->
          <div class="flex items-center justify-between mb-3 pb-2.5 border-b dark:border-gray-700">
            <h4 class="font-bold text-sm text-gray-800 dark:text-gray-100">
              Topshiriqlar ro'yxati
            </h4>
            <button
              class="w-7 h-7 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
              title="Yangi topshiriq qo'shish"
              @click="openTaskModal()"
            >
              <Icon icon="solar:add-circle-bold" class="text-base" />
            </button>
          </div>

          <!-- Loading state -->
          <div
            v-if="loading"
            class="py-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2"
          >
            <Icon icon="solar:spinner-linear" class="animate-spin text-base" />
            <span>Topshiriqlar yuklanmoqda...</span>
          </div>

          <!-- Tasks Items with clear visible icons -->
          <div v-else-if="tasks.length > 0" class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            <div
              v-for="task in tasks"
              :key="task.id"
              class="p-2.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-start gap-2.5 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    :checked="task.completed"
                    class="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    @change="toggleTaskComplete(task)"
                  />
                  <div class="min-w-0 flex-1">
                    <h5
                      :class="[
                        'text-xs font-semibold leading-snug truncate',
                        task.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-800 dark:text-gray-200',
                      ]"
                    >
                      {{ task.title }}
                    </h5>
                    <span class="text-[11px] text-gray-400 block mt-0.5">{{ task.date }}</span>
                  </div>
                </div>

                <!-- Always visible clean action buttons -->
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    class="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition cursor-pointer"
                    title="Tahrirlash"
                    @click="editTask(task)"
                  >
                    <Icon icon="solar:pen-linear" class="text-sm" />
                  </button>
                  <button
                    class="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition cursor-pointer"
                    title="O'chirish"
                    @click="deleteTask(task.id)"
                  >
                    <Icon icon="solar:trash-bin-trash-linear" class="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="py-4">
            <EmptyState title="Hozircha topshiriqlar mavjud emas" />
          </div>
        </div>

        <!-- Tasks Bottom Info -->
        <div
          class="pt-3 border-t dark:border-gray-700 text-xs text-gray-400 flex items-center justify-between"
        >
          <span>Jami: {{ tasks.length }} ta</span>
          <span class="text-emerald-600 font-semibold">{{ completedCount }} ta bajarildi</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { tasksApi } from "@/api/services";
import vmodal from "@/components/common/AppModal.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import FormDatePicker from "@/components/FormDatePicker.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";

export default {
  name: "CalendarBoard",
  components: {
    Icon,
    vmodal,
    FormSelect,
    FormInput,
    FormDatePicker,
    EmptyState,
  },
  props: {
    title: {
      type: String,
      default: "Taqvim va Tadbirlar",
    },
    subtitle: {
      type: String,
      default: "",
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    const now = new Date();
    return {
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth(), // 0-indexed
      selectedDateStr: null,
      isEditing: false,
      loading: false,
      formData: {
        id: null,
        title: "",
        date: "",
        type: "task",
        description: "",
      },
      tasks: [],
      monthNames: [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avgust",
        "Sentabr",
        "Oktabr",
        "Noyabr",
        "Dekabr",
      ],
      taskTypeOptions: [
        { value: "task", label: "Topshiriq" },
        { value: "exam", label: "Imtihon / Test" },
        { value: "masterclass", label: "Masterclass" },
        { value: "payment", label: "To'lov muddati" },
      ],
    };
  },
  computed: {
    currentMonthName() {
      return this.monthNames[this.currentMonth];
    },
    completedCount() {
      return this.tasks.filter((t) => t.completed).length;
    },
    calendarDays() {
      const year = this.currentYear;
      const month = this.currentMonth;

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);

      // Monday is first day of week
      let startDayOfWeek = firstDayOfMonth.getDay() - 1;
      if (startDayOfWeek === -1) startDayOfWeek = 6;

      const totalDays = lastDayOfMonth.getDate();
      const prevMonthLastDay = new Date(year, month, 0).getDate();

      const days = [];
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // Previous month trailing days
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = prevMonthLastDay - i;
        const prevMonthDate = new Date(year, month - 1, d);
        const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        days.push({
          dayNumber: d,
          isCurrentMonth: false,
          dateString: dateStr,
          isToday: dateStr === todayStr,
          events: this.getEventsForDate(dateStr),
        });
      }

      // Current month days
      for (let i = 1; i <= totalDays; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        days.push({
          dayNumber: i,
          isCurrentMonth: true,
          dateString: dateStr,
          isToday: dateStr === todayStr,
          events: this.getEventsForDate(dateStr),
        });
      }

      // Next month trailing days to complete grid
      const remainingBoxes = (7 - (days.length % 7)) % 7;
      for (let i = 1; i <= remainingBoxes; i++) {
        const nextMonthDate = new Date(year, month + 1, i);
        const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        days.push({
          dayNumber: i,
          isCurrentMonth: false,
          dateString: dateStr,
          isToday: dateStr === todayStr,
          events: this.getEventsForDate(dateStr),
        });
      }

      return days;
    },
  },
  mounted() {
    this.fetchTasks();
  },
  methods: {
    normalizeTask(task) {
      if (!task) return null;
      let date = "";
      if (task.dueDate) {
        if (typeof task.dueDate === "string") {
          date = task.dueDate.split("T")[0];
        } else {
          try {
            date = new Date(task.dueDate).toISOString().split("T")[0];
          } catch (e) {
            date = "";
          }
        }
      } else if (task.date) {
        date = task.date;
      }
      return {
        id: task.id,
        title: task.title || "",
        description: task.description || "",
        date: date,
        dueDate: task.dueDate || null,
        status: task.status || "PENDING",
        priority: task.priority || "MEDIUM",
        completed: task.status === "COMPLETED",
        type: task.type || "task",
      };
    },
    async fetchTasks() {
      this.loading = true;
      try {
        const response = await tasksApi.getAll();
        const list = Array.isArray(response) ? response : response?.data || [];
        this.tasks = list.map(this.normalizeTask).filter(Boolean);
      } catch (error) {
        console.error("Vazifalarni yuklashda xatolik:", error);
      } finally {
        this.loading = false;
      }
    },
    getEventsForDate(dateStr) {
      return this.tasks.filter((t) => t.date === dateStr);
    },
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },
    goToToday() {
      const now = new Date();
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth();
      this.selectedDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    },
    selectDay(day) {
      this.selectedDateStr = day.dateString;
    },
    openTaskModal() {
      this.isEditing = false;
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      this.formData = {
        id: null,
        title: "",
        date: this.selectedDateStr || todayStr,
        type: "task",
        description: "",
      };
      if (this.$refs.taskModal) {
        this.$refs.taskModal.isOpen = true;
      }
    },
    openEventModalForDate(dateStr) {
      this.selectedDateStr = dateStr;
      this.openTaskModal();
    },
    editTask(task) {
      this.isEditing = true;
      this.formData = {
        id: task.id,
        title: task.title,
        date: task.date || "",
        type: task.type || "task",
        description: task.description || "",
      };
      if (this.$refs.taskModal) {
        this.$refs.taskModal.isOpen = true;
      }
    },
    async toggleTaskComplete(task) {
      const prevCompleted = task.completed;
      task.completed = !prevCompleted;
      task.status = task.completed ? "COMPLETED" : "PENDING";
      try {
        if (task.completed) {
          const res = await tasksApi.complete(task.id);
          if (res) {
            const normalized = this.normalizeTask(res);
            normalized.type = task.type || "task";
            const idx = this.tasks.findIndex((t) => t.id === task.id);
            if (idx !== -1) this.tasks.splice(idx, 1, normalized);
          }
        } else {
          const res = await tasksApi.update(task.id, { status: "PENDING" });
          if (res) {
            const normalized = this.normalizeTask(res);
            normalized.type = task.type || "task";
            const idx = this.tasks.findIndex((t) => t.id === task.id);
            if (idx !== -1) this.tasks.splice(idx, 1, normalized);
          }
        }
      } catch (error) {
        console.error("Vazifa holatini o'zgartirishda xatolik:", error);
        task.completed = prevCompleted;
        task.status = prevCompleted ? "COMPLETED" : "PENDING";
      }
    },
    async deleteTask(id) {
      try {
        await tasksApi.delete(id);
        this.tasks = this.tasks.filter((t) => t.id !== id);
      } catch (error) {
        console.error("Vazifani o'chirishda xatolik:", error);
      }
    },
    viewEvent(ev) {
      this.editTask(ev);
    },
    async saveTaskForm() {
      if (!this.formData.title) return;

      let dueDate = null;
      if (this.formData.date) {
        try {
          const d = new Date(this.formData.date);
          dueDate = isNaN(d.getTime()) ? null : d.toISOString();
        } catch (e) {
          dueDate = null;
        }
      }

      try {
        if (this.isEditing && this.formData.id) {
          const payload = {
            title: this.formData.title,
            description: this.formData.description || undefined,
            dueDate: dueDate || undefined,
          };
          const updated = await tasksApi.update(this.formData.id, payload);
          const normalized = this.normalizeTask(updated);
          normalized.type = this.formData.type || "task";
          const idx = this.tasks.findIndex((t) => t.id === this.formData.id);
          if (idx !== -1) {
            this.tasks.splice(idx, 1, normalized);
          } else {
            this.tasks.push(normalized);
          }
        } else {
          const payload = {
            title: this.formData.title,
            description: this.formData.description || undefined,
            dueDate: dueDate || undefined,
          };
          const created = await tasksApi.create(payload);
          const normalized = this.normalizeTask(created);
          normalized.type = this.formData.type || "task";
          this.tasks.push(normalized);
        }

        if (this.$refs.taskModal) {
          this.$refs.taskModal.isOpen = false;
        }
      } catch (error) {
        console.error("Vazifani saqlashda xatolik:", error);
      }
    },
  },
};
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
</style>
