<template>
  <div class="attendance-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Davomat Jurnali' }]" />

    <!-- Top Header & Actions -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Davomat Jurnali</h1>
        <p class="text-sm text-gray-400">Guruhlar bo'yicha interaktiv dars davomati va oylik elektron jurnal</p>
      </div>

      <div class="flex items-center gap-2">
        <!-- View Mode Switcher: Daily / Monthly Journal -->
        <div class="bg-gray-100 dark:bg-gray-700/80 p-1 rounded-md flex items-center gap-1 border dark:border-gray-600">
          <button
            @click="switchMode('daily')"
            :class="viewMode === 'daily' ? 'bg-white dark:bg-gray-800 text-primary font-bold shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
            class="px-3 py-1.5 text-xs rounded transition flex items-center gap-1.5"
          >
            <Icon icon="solar:calendar-date-bold" class="text-base" />
            <span>Kunlik Davomat</span>
          </button>
          <button
            @click="switchMode('monthly')"
            :class="viewMode === 'monthly' ? 'bg-white dark:bg-gray-800 text-primary font-bold shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
            class="px-3 py-1.5 text-xs rounded transition flex items-center gap-1.5"
          >
            <Icon icon="solar:notebook-bookmark-bold" class="text-base" />
            <span>Oylik Jurnal</span>
          </button>
        </div>

        <AppButton
          v-if="viewMode === 'daily' && attendanceList.length > 0"
          variant="success"
          size="md"
          icon="fluent:checkmark-12-filled"
          :loading="saving"
          @click="saveAttendance"
        >
          <span>Saqlash</span>
        </AppButton>
      </div>
    </div>

    <!-- Floating Alert Toast -->
    <Alert v-if="alertMessage" :floating="true" @close="alertMessage = ''">
      <template #content>{{ alertMessage }}</template>
    </Alert>

    <!-- Filters Bar (Group & Date / Month selection) -->
    <div class="card bg-white dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700 shadow-sm mb-5">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- Left: Group & Date Selectors -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="w-full sm:w-64">
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Guruhni tanlang</label>
            <select
              v-model="selectedGroupId"
              @change="onFilterChange"
              class="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none focus:border-primary text-gray-800 dark:text-gray-200"
            >
              <option value="" disabled>Guruhni tanlang...</option>
              <option v-for="g in groups" :key="g.id" :value="g.id">
                {{ g.name }} ({{ g.course?.name }})
              </option>
            </select>
          </div>

          <div v-if="viewMode === 'daily'" class="w-full sm:w-48">
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Dars sanasi</label>
            <input
              v-model="selectedDate"
              @change="onFilterChange"
              type="date"
              class="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none focus:border-primary text-gray-800 dark:text-gray-200"
            />
          </div>

          <div v-if="viewMode === 'monthly'" class="w-full sm:w-48">
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Oy</label>
            <input
              v-model="selectedMonth"
              @change="onFilterChange"
              type="month"
              class="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none focus:border-primary text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        <!-- Right Quick Actions (Daily View) -->
        <div v-if="viewMode === 'daily' && attendanceList.length > 0" class="flex flex-wrap items-center gap-2">
          <button
            @click="markAll('PRESENT')"
            class="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 transition flex items-center gap-1"
          >
            <Icon icon="fluent:checkmark-12-filled" />
            <span>Barchasi keldi</span>
          </button>
          <button
            @click="markAll('ABSENT_UNEXCUSED')"
            class="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 transition flex items-center gap-1"
          >
            <Icon icon="fluent:dismiss-12-filled" />
            <span>Barchasi kelmadi</span>
          </button>
        </div>
      </div>

      <!-- Live Summary Metric Bar (Daily Mode) -->
      <div
        v-if="viewMode === 'daily' && attendanceList.length > 0"
        class="mt-4 pt-4 border-t dark:border-gray-700 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center"
      >
        <div class="p-2.5 rounded-md bg-gray-50 dark:bg-gray-700/50">
          <div class="text-xs text-gray-400">Jami O'quvchi</div>
          <div class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ attendanceList.length }}</div>
        </div>
        <div class="p-2.5 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div class="text-xs text-green-600 dark:text-green-400">Kelganlar</div>
          <div class="text-lg font-bold text-green-700 dark:text-green-300">{{ stats.present }} ta</div>
        </div>
        <div class="p-2.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div class="text-xs text-amber-600 dark:text-amber-400">Sabablilar</div>
          <div class="text-lg font-bold text-amber-700 dark:text-amber-300">{{ stats.excused }} ta</div>
        </div>
        <div class="p-2.5 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div class="text-xs text-red-600 dark:text-red-400">Sababsizlar</div>
          <div class="text-lg font-bold text-red-700 dark:text-red-300">{{ stats.absent }} ta</div>
        </div>
        <div class="p-2.5 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div class="text-xs text-blue-600 dark:text-blue-400">Davomat %</div>
          <div class="text-lg font-bold text-blue-700 dark:text-blue-300">{{ stats.percentage }}%</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card bg-white dark:bg-gray-800 p-8 text-center rounded-md border dark:border-gray-700">
      <LoadingSpinner size="md" text="Davomat ma'lumotlari yuklanmoqda..." />
    </div>

    <!-- No Group Selected -->
    <div v-else-if="!selectedGroupId" class="card bg-white dark:bg-gray-800 p-12 text-center text-gray-400 rounded-md border dark:border-gray-700">
      <div class="flex flex-col items-center justify-center gap-2">
        <Icon icon="solar:calendar-linear" class="text-4xl text-gray-300" />
        <p class="text-sm">Davomatni ko'rish yoki belgilash uchun yuqoridan guruhni tanlang.</p>
      </div>
    </div>

    <!-- MAIN BODY: Daily Attendance Cards List -->
    <div v-else-if="viewMode === 'daily'">
      <div v-if="attendanceList.length === 0" class="card bg-white dark:bg-gray-800 p-12 text-center text-gray-400 rounded-md border dark:border-gray-700">
        Ushbu guruhda o'quvchilar mavjud emas.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(item, index) in attendanceList"
          :key="item.student.id"
          class="card bg-white dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700 shadow-sm hover:border-gray-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <!-- Student Info & Avatar -->
          <div class="flex items-center gap-3.5 min-w-[240px]">
            <div class="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
              {{ item.student.firstName?.[0] }}{{ item.student.lastName?.[0] }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400 font-mono">#{{ index + 1 }}</span>
                <h4 class="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                  {{ item.student.firstName }} {{ item.student.lastName }}
                </h4>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                <span>{{ item.student.phone }}</span>
                <span
                  :class="item.student.balance >= 0 ? 'text-green-600' : 'text-red-500'"
                  class="font-medium"
                >
                  Balans: {{ formatUZS(item.student.balance) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Modern Segmented Pill Selector for Status -->
          <div class="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg border dark:border-gray-700">
            <!-- Present -->
            <button
              type="button"
              @click="item.status = 'PRESENT'"
              :class="item.status === 'PRESENT' ? 'bg-green-600 text-white font-bold shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50'"
              class="px-3.5 py-1.5 text-xs rounded-md transition flex items-center gap-1"
            >
              <Icon icon="solar:check-circle-bold" class="text-sm" />
              <span>Keldi</span>
            </button>

            <!-- Late -->
            <button
              type="button"
              @click="item.status = 'LATE'"
              :class="item.status === 'LATE' ? 'bg-blue-600 text-white font-bold shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50'"
              class="px-3.5 py-1.5 text-xs rounded-md transition flex items-center gap-1"
            >
              <Icon icon="solar:clock-circle-bold" class="text-sm" />
              <span>Kechikdi</span>
            </button>

            <!-- Excused -->
            <button
              type="button"
              @click="item.status = 'ABSENT_EXCUSED'"
              :class="item.status === 'ABSENT_EXCUSED' ? 'bg-amber-500 text-white font-bold shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50'"
              class="px-3.5 py-1.5 text-xs rounded-md transition flex items-center gap-1"
            >
              <Icon icon="solar:info-circle-bold" class="text-sm" />
              <span>Sababli</span>
            </button>

            <!-- Absent -->
            <button
              type="button"
              @click="item.status = 'ABSENT_UNEXCUSED'"
              :class="item.status === 'ABSENT_UNEXCUSED' ? 'bg-red-600 text-white font-bold shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50'"
              class="px-3.5 py-1.5 text-xs rounded-md transition flex items-center gap-1"
            >
              <Icon icon="solar:close-circle-bold" class="text-sm" />
              <span>Kelmadi</span>
            </button>
          </div>

          <!-- Note input -->
          <div class="w-full md:w-56">
            <input
              v-model="item.comment"
              placeholder="Izoh yozish (ixtiyoriy)..."
              type="text"
              class="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none focus:border-primary text-gray-800 dark:text-gray-200 transition"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN BODY: Real Monthly Matrix Journal View -->
    <div v-else-if="viewMode === 'monthly'" class="card bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h3 class="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icon icon="solar:notebook-bookmark-bold" class="text-primary text-lg" />
          <span>{{ currentGroup?.name }} — {{ selectedMonth }} Oylik Elektron Jurnal</span>
        </h3>
        <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> Keldi (✓)</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Kechikdi (K)</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Sababli (S)</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> Kelmadi (✕)</span>
        </div>
      </div>

      <div v-if="monthlyStudents.length === 0" class="p-12 text-center text-gray-400">
        Ushbu guruhda o'quvchilar mavjud emas.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700/60 border-b dark:border-gray-600 text-gray-500 dark:text-gray-300 uppercase font-semibold">
              <th class="p-3 w-10 text-center sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">№</th>
              <th class="p-3 min-w-[180px] sticky left-10 bg-gray-50 dark:bg-gray-700 z-10">O'quvchi</th>
              <th
                v-for="d in daysInMonth"
                :key="d"
                class="p-2 text-center min-w-[34px] border-l dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                :title="`${selectedMonth}-${String(d).padStart(2, '0')} sanasiga o'tish`"
                @click="jumpToDate(d)"
              >
                {{ d }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="(row, idx) in monthlyStudents"
              :key="row.student.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
            >
              <td class="p-3 text-center text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-10">{{ idx + 1 }}</td>
              <td class="p-3 font-medium text-gray-800 dark:text-gray-100 sticky left-10 bg-white dark:bg-gray-800 z-10">
                {{ row.student.firstName }} {{ row.student.lastName }}
              </td>
              <td
                v-for="d in daysInMonth"
                :key="d"
                class="p-2 text-center border-l dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60"
                @click="jumpToDate(d)"
              >
                <!-- Real attendance status from PostgreSQL -->
                <span
                  v-if="row.days[d]?.status === 'PRESENT'"
                  class="inline-flex w-5 h-5 items-center justify-center rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 shadow-xs"
                  title="Kelgan"
                >
                  ✓
                </span>
                <span
                  v-else-if="row.days[d]?.status === 'LATE'"
                  class="inline-flex w-5 h-5 items-center justify-center rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-xs"
                  title="Kechikkan"
                >
                  K
                </span>
                <span
                  v-else-if="row.days[d]?.status === 'ABSENT_EXCUSED'"
                  class="inline-flex w-5 h-5 items-center justify-center rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 shadow-xs"
                  title="Sababli kelmagan"
                >
                  S
                </span>
                <span
                  v-else-if="row.days[d]?.status === 'ABSENT_UNEXCUSED'"
                  class="inline-flex w-5 h-5 items-center justify-center rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 shadow-xs"
                  title="Sababsiz kelmagan"
                >
                  ✕
                </span>
                <span v-else class="text-gray-300 dark:text-gray-600 text-xs">-</span>
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
import Alert from "@/components/Alert.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/AppButton.vue";
import { groupsApi, attendanceApi } from "@/api/services";

export default {
  name: "AttendanceView",
  components: {
    Icon,
    Alert,
    Breadcrumb,
    AppButton,
  },
  data() {
    return {
      viewMode: "daily", // 'daily' | 'monthly'
      groups: [],
      selectedGroupId: "",
      selectedDate: new Date().toISOString().split("T")[0],
      selectedMonth: new Date().toISOString().slice(0, 7),
      attendanceList: [],
      monthlyStudents: [],
      loading: false,
      saving: false,
      alertMessage: "",
    };
  },
  computed: {
    currentGroup() {
      return this.groups.find((g) => g.id === this.selectedGroupId);
    },
    daysInMonth() {
      const [year, month] = this.selectedMonth.split("-");
      const total = new Date(year, month, 0).getDate();
      return Array.from({ length: total }, (_, i) => i + 1);
    },
    stats() {
      const total = this.attendanceList.length;
      if (!total) return { present: 0, excused: 0, absent: 0, percentage: 0 };
      const present = this.attendanceList.filter((s) => s.status === "PRESENT" || s.status === "LATE").length;
      const excused = this.attendanceList.filter((s) => s.status === "ABSENT_EXCUSED").length;
      const absent = this.attendanceList.filter((s) => s.status === "ABSENT_UNEXCUSED").length;
      const percentage = Math.round((present / total) * 100);
      return { present, excused, absent, percentage };
    },
  },
  async mounted() {
    await this.fetchGroups();
    const queryGroupId = this.$route.query.groupId;
    if (queryGroupId) {
      this.selectedGroupId = queryGroupId;
      await this.loadAttendance();
    }
  },
  methods: {
    async fetchGroups() {
      try {
        this.groups = await groupsApi.getAll();
        if (!this.selectedGroupId && this.groups.length > 0) {
          this.selectedGroupId = this.groups[0].id;
          await this.loadAttendance();
        }
      } catch (err) {
        console.error("Guruhlar xatoligi:", err);
      }
    },
    async switchMode(mode) {
      this.viewMode = mode;
      await this.loadAttendance();
    },
    async onFilterChange() {
      await this.loadAttendance();
    },
    async loadAttendance() {
      if (!this.selectedGroupId) return;
      this.loading = true;
      try {
        if (this.viewMode === "daily") {
          if (!this.selectedDate) return;
          const res = await attendanceApi.getAttendance(this.selectedGroupId, this.selectedDate);
          this.attendanceList = res.students || [];
        } else {
          if (!this.selectedMonth) return;
          const res = await attendanceApi.getMonthlyAttendance(this.selectedGroupId, this.selectedMonth);
          this.monthlyStudents = res.students || [];
        }
      } catch (err) {
        console.error("Davomat xatoligi:", err);
      } finally {
        this.loading = false;
      }
    },
    jumpToDate(day) {
      const dayStr = String(day).padStart(2, "0");
      this.selectedDate = `${this.selectedMonth}-${dayStr}`;
      this.viewMode = "daily";
      this.loadAttendance();
    },
    markAll(status) {
      this.attendanceList.forEach((item) => {
        item.status = status;
      });
    },
    formatUZS(val) {
      if (val === undefined || val === null) return "0 so'm";
      return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
    },
    async saveAttendance() {
      if (!this.selectedGroupId || !this.selectedDate) return;
      this.saving = true;
      try {
        const records = this.attendanceList.map((item) => ({
          studentId: item.student.id,
          status: item.status,
          comment: item.comment || undefined,
        }));
        await attendanceApi.markAttendance(this.selectedGroupId, this.selectedDate, records);
        this.alertMessage = "Davomat muvaffaqiyatli saqlandi!";
      } catch (err) {
        alert(err.message || "Davomatni saqlashda xatolik");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
