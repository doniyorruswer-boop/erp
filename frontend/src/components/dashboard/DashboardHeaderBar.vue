<template>
  <div
    class="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3.5 font-lexend"
  >
    <!-- Top Row: Title & Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Title, Academic Year & Subtitle -->
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <h1 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <span
            class="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
          >
            {{ academicYear }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Davr:
          <span class="font-semibold text-gray-700 dark:text-gray-200">{{
            displayPeriodName
          }}</span>
          · {{ academicYear }} o'quv yili
        </p>
      </div>

      <!-- Action Buttons (Windzo UI clean secondary buttons with matching DateRange button) -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- DateRange Picker Button (Matching 2nd Image, exact button dimensions) -->
        <div ref="datePickerRef" class="relative">
          <AppButton
            variant="outline"
            icon="solar:calendar-linear"
            title="Sana oralig'ini tanlash"
            @click="toggleDatePicker"
          >
            <span>{{ customDateRangeText }}</span>
          </AppButton>

          <!-- Interactive Visual Calendar Dropdown Popover -->
          <div
            v-if="isDatePickerOpen"
            class="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 z-50 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-4 space-y-3 font-lexend"
            @click.stop
          >
            <div
              class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700"
            >
              <span
                class="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider"
                >Davrni tanlash</span
              >
              <button
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="isDatePickerOpen = false"
              >
                <Icon icon="solar:close-circle-linear" class="text-base" />
              </button>
            </div>

            <!-- Quick Presets -->
            <div class="grid grid-cols-3 gap-1.5 text-xs">
              <button
                v-for="p in presetRanges"
                :key="p.key"
                type="button"
                :class="[
                  'py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer border text-center',
                  selectedPresetKey === p.key
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300',
                ]"
                @click="selectPreset(p)"
              >
                {{ p.label }}
              </button>
            </div>

            <!-- Interactive Calendar Grid Component -->
            <div
              class="border border-gray-100 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50/50 dark:bg-gray-800/40 space-y-2"
            >
              <!-- Calendar Month & Year Navigation -->
              <div
                class="flex items-center justify-between px-1 text-xs font-bold text-gray-700 dark:text-gray-200"
              >
                <button
                  type="button"
                  class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  @click="prevCalMonth"
                >
                  <Icon icon="solar:alt-arrow-left-linear" class="text-sm" />
                </button>
                <span>{{ calMonthName }} {{ calYear }}</span>
                <button
                  type="button"
                  class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  @click="nextCalMonth"
                >
                  <Icon icon="solar:alt-arrow-right-linear" class="text-sm" />
                </button>
              </div>

              <!-- Day-of-week headers -->
              <div class="grid grid-cols-7 text-center text-[11px] font-semibold text-gray-400">
                <span>Du</span>
                <span>Se</span>
                <span>Ch</span>
                <span>Pa</span>
                <span>Ju</span>
                <span>Sha</span>
                <span>Ya</span>
              </div>

              <!-- Days Grid -->
              <div class="grid grid-cols-7 gap-y-1 text-center text-xs">
                <div
                  v-for="(d, idx) in calendarDays"
                  :key="idx"
                  class="h-7 flex items-center justify-center relative"
                >
                  <button
                    v-if="d.day"
                    type="button"
                    :class="[
                      'w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer',
                      d.isStart || d.isEnd
                        ? 'bg-primary text-white font-bold shadow-2xs'
                        : d.isInRange
                          ? 'bg-primary/15 text-primary rounded-none w-full'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                    ]"
                    @click="selectCalendarDay(d)"
                  >
                    {{ d.day }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Custom Start & End Date Inputs with FormDatePicker Component -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <FormDatePicker
                  v-model="inputStartDate"
                  label="Boshlanish"
                  size="sm"
                  placeholder="KK / OO / YYYY"
                  @change="onStartDateChange"
                />
              </div>
              <div>
                <FormDatePicker
                  v-model="inputEndDate"
                  label="Tugash"
                  size="sm"
                  placeholder="KK / OO / YYYY"
                  @change="onEndDateChange"
                />
              </div>
            </div>

            <!-- Footer Actions -->
            <div
              class="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700"
            >
              <button
                type="button"
                class="py-1.5 px-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold cursor-pointer shadow-2xs"
                @click="isDatePickerOpen = false"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                class="py-1.5 px-3.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold cursor-pointer shadow-2xs"
                @click="applyDateRange"
              >
                Qo'llash
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="py-2 px-3 sm:px-3.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          @click="$emit('open-download-modal')"
        >
          <Icon
            icon="solar:download-minimalistic-linear"
            class="text-base text-gray-500 dark:text-gray-300"
          />
          <span>Vidjetni yuklab olish</span>
        </button>

        <button
          type="button"
          class="py-2 px-3 sm:px-3.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          @click="$emit('open-settings-modal')"
        >
          <Icon icon="solar:settings-linear" class="text-base text-gray-500 dark:text-gray-300" />
          <span>Vidjetlarni sozlash</span>
        </button>
      </div>
    </div>

    <!-- Bottom Row: Month Pills & Quick Date Range Filters (Sentabr - Iyun) -->
    <div
      class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700/70"
    >
      <!-- Month Pills (Project Primary Theme Color - 10 oylik o'quv yili) -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        <button
          v-for="m in academicMonths"
          :key="m.key"
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0',
            selectedMonth === m.key
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-gray-100 hover:bg-gray-200/80 dark:bg-gray-700/60 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300',
          ]"
          @click="onSelectMonth(m.key)"
        >
          {{ m.label }}
        </button>
      </div>

      <!-- Quick Date Range Pills (Image 2: Bugun | Kecha | 7 kun | Oy | Yil) -->
      <div class="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
        <span class="text-gray-500 dark:text-gray-400 font-medium">Qo'shilgan:</span>
        <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700/60 p-1">
          <button
            v-for="df in quickDateFilters"
            :key="df.key"
            type="button"
            :class="[
              'px-2.5 py-1 rounded-md text-xs sm:text-sm font-semibold transition cursor-pointer',
              localDateFilter === df.key
                ? 'bg-white dark:bg-gray-800 text-primary shadow-2xs font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
            ]"
            @click="handleDateRangeFilter(df.key)"
          >
            {{ df.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import FormDatePicker from "@/components/FormDatePicker.vue";

export default {
  name: "DashboardHeaderBar",
  components: {
    Icon,
    FormDatePicker,
  },
  props: {
    selectedMonth: {
      type: String,
      default: "Sen",
    },
    academicYear: {
      type: String,
      default: "2026-2027",
    },
  },
  emits: [
    "update:selectedMonth",
    "open-download-modal",
    "open-settings-modal",
    "date-range-change",
  ],
  data() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const firstDay = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
    const lastDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const lastDay = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(lastDate)}`;

    return {
      isDatePickerOpen: false,
      calYear: now.getFullYear(),
      calMonth: now.getMonth(),
      pickingEndDate: false,
      localDateFilter: "month",
      selectedPresetKey: "month",
      inputStartDate: firstDay,
      inputEndDate: lastDay,
      activePeriodCustomLabel: "",
      quickDateFilters: [
        { key: "today", label: "Bugun" },
        { key: "yesterday", label: "Kecha" },
        { key: "7days", label: "7 kun" },
        { key: "month", label: "Oy" },
        { key: "year", label: "Yil" },
      ],
      presetRanges: [
        { key: "today", label: "Bugun" },
        { key: "yesterday", label: "Kecha" },
        { key: "7days", label: "Oxirgi 7 kun" },
        { key: "month", label: "Shu oy" },
        { key: "prev_month", label: "O'tgan oy" },
        { key: "year", label: "O'quv yili" },
      ],
    };
  },
  computed: {
    academicYearsParsed() {
      const now = new Date();
      let [startYear, endYear] = (this.academicYear || "").split("-").map(Number);
      if (!startYear || !endYear) {
        startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
        endYear = startYear + 1;
      }
      return { startYear, endYear };
    },
    academicMonths() {
      const { startYear, endYear } = this.academicYearsParsed;
      const pad = (n) => String(n).padStart(2, "0");
      const makeMonth = (yr, mo, key, label, full) => {
        const lastDay = new Date(yr, mo, 0).getDate();
        return {
          key,
          label,
          full,
          year: yr,
          monthIndex: mo - 1,
          start: `${yr}-${pad(mo)}-01`,
          end: `${yr}-${pad(mo)}-${pad(lastDay)}`,
        };
      };

      return [
        makeMonth(startYear, 8, "Avg", "Avg", "Avgust"),
        makeMonth(startYear, 9, "Sen", "Sen", "Sentabr"),
        makeMonth(startYear, 10, "Okt", "Okt", "Oktabr"),
        makeMonth(startYear, 11, "Noy", "Noy", "Noyabr"),
        makeMonth(startYear, 12, "Dek", "Dek", "Dekabr"),
        makeMonth(endYear, 1, "Yan", "Yan", "Yanvar"),
        makeMonth(endYear, 2, "Fev", "Fev", "Fevral"),
        makeMonth(endYear, 3, "Mar", "Mar", "Mart"),
        makeMonth(endYear, 4, "Apr", "Apr", "Aprel"),
        makeMonth(endYear, 5, "May", "May", "May"),
        makeMonth(endYear, 6, "Iyun", "Iyun", "Iyun"),
        makeMonth(endYear, 7, "Iyul", "Iyul", "Iyul"),
      ];
    },
    currentMonthFullName() {
      const found = this.academicMonths.find((m) => m.key === this.selectedMonth);
      return found ? found.full : "Sentabr";
    },
    displayPeriodName() {
      if (this.localDateFilter === "today") return "Bugun";
      if (this.localDateFilter === "yesterday") return "Kecha";
      if (this.localDateFilter === "7days") return "Oxirgi 7 kun";
      if (this.localDateFilter === "month" || this.localDateFilter === "this_month")
        return this.currentMonthFullName;
      if (this.localDateFilter === "prev_month") return "O'tgan oy";
      if (this.localDateFilter === "year" || this.localDateFilter === "academic_year")
        return `${this.academicYear} o'quv yili`;
      if (this.activePeriodCustomLabel) return this.activePeriodCustomLabel;
      return this.currentMonthFullName;
    },
    calMonthName() {
      const months = [
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
      ];
      return months[this.calMonth] || "Oktabr";
    },
    todayStr() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    },
    calendarDays() {
      const year = this.calYear;
      const month = this.calMonth;
      const firstDay = new Date(year, month, 1);
      let startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
      const totalDays = new Date(year, month + 1, 0).getDate();

      const days = [];
      for (let i = 0; i < startingDay; i++) {
        days.push({ day: null });
      }
      for (let d = 1; d <= totalDays; d++) {
        const pad = (n) => String(n).padStart(2, "0");
        const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
        days.push({
          day: d,
          dateStr,
          isStart: dateStr === this.inputStartDate,
          isEnd: dateStr === this.inputEndDate,
          isInRange: dateStr > this.inputStartDate && dateStr < this.inputEndDate,
          isToday: dateStr === this.todayStr,
        });
      }
      return days;
    },
    customDateRangeText() {
      const formatDisplay = (dStr) => {
        if (!dStr) return "";
        const parts = dStr.split("-");
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dStr;
      };
      return `${formatDisplay(this.inputStartDate)} — ${formatDisplay(this.inputEndDate)}`;
    },
  },
  watch: {
    selectedMonth(newMonth) {
      const found = this.academicMonths.find((m) => m.key === newMonth);
      if (found) {
        this.inputStartDate = found.start;
        this.inputEndDate = found.end;
        this.syncCalendarView(found.start);
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    const found = this.academicMonths.find((m) => m.key === this.selectedMonth);
    if (found) {
      this.inputStartDate = found.start;
      this.inputEndDate = found.end;
      this.syncCalendarView(found.start);
    }
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    toggleDatePicker() {
      this.isDatePickerOpen = !this.isDatePickerOpen;
      if (this.isDatePickerOpen) {
        this.syncCalendarView(this.inputStartDate);
      }
    },
    handleClickOutside(event) {
      if (
        this.isDatePickerOpen &&
        this.$refs.datePickerRef &&
        !this.$refs.datePickerRef.contains(event.target)
      ) {
        this.isDatePickerOpen = false;
      }
    },
    prevCalMonth() {
      if (this.calMonth === 0) {
        this.calMonth = 11;
        this.calYear--;
      } else {
        this.calMonth--;
      }
    },
    nextCalMonth() {
      if (this.calMonth === 11) {
        this.calMonth = 0;
        this.calYear++;
      } else {
        this.calMonth++;
      }
    },
    syncCalendarView(dStr) {
      if (!dStr) return;
      const parts = dStr.split("-");
      if (parts.length === 3) {
        this.calYear = parseInt(parts[0], 10);
        this.calMonth = parseInt(parts[1], 10) - 1;
      }
    },
    selectCalendarDay(dayObj) {
      if (!dayObj.dateStr) return;
      const selected = dayObj.dateStr;
      if (!this.pickingEndDate) {
        this.inputStartDate = selected;
        this.inputEndDate = selected;
        this.pickingEndDate = true;
      } else {
        if (selected < this.inputStartDate) {
          this.inputEndDate = this.inputStartDate;
          this.inputStartDate = selected;
        } else {
          this.inputEndDate = selected;
        }
        this.pickingEndDate = false;
      }
      this.selectedPresetKey = "";
      this.localDateFilter = "";
    },
    onStartDateChange(val) {
      if (val) {
        this.inputStartDate = val;
        if (this.inputEndDate && val > this.inputEndDate) {
          this.inputEndDate = val;
        }
        this.syncCalendarView(val);
        this.selectedPresetKey = "";
        this.localDateFilter = "";
      }
    },
    onEndDateChange(val) {
      if (val) {
        this.inputEndDate = val;
        if (this.inputStartDate && val < this.inputStartDate) {
          this.inputStartDate = val;
        }
        this.syncCalendarView(val);
        this.selectedPresetKey = "";
        this.localDateFilter = "";
      }
    },
    onSelectMonth(monthKey) {
      const found = this.academicMonths.find((m) => m.key === monthKey);
      if (found) {
        this.inputStartDate = found.start;
        this.inputEndDate = found.end;
        this.syncCalendarView(found.start);
        this.selectedPresetKey = "";
        this.localDateFilter = "";
        this.activePeriodCustomLabel = `${found.full} oyi`;
        this.$emit("update:selectedMonth", monthKey);
        this.$emit("date-range-change", {
          start: found.start,
          end: found.end,
          rangeKey: "month",
          monthKey,
          label: `${found.full} oyi`,
        });
      }
    },
    handleDateRangeFilter(filterKey) {
      this.localDateFilter = filterKey;
      this.selectedPresetKey = filterKey;
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      const { startYear, endYear } = this.academicYearsParsed;
      let start = "";
      let end = "";
      let label = "";

      if (filterKey === "today") {
        start = fmt(now);
        end = fmt(now);
        label = "Bugun";
      } else if (filterKey === "yesterday") {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        start = fmt(y);
        end = fmt(y);
        label = "Kecha";
      } else if (filterKey === "7days") {
        const past = new Date(now);
        past.setDate(past.getDate() - 6);
        start = fmt(past);
        end = fmt(now);
        label = "Oxirgi 7 kun";
      } else if (filterKey === "month" || filterKey === "this_month") {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = fmt(firstDay);
        end = fmt(lastDay);
        label = `${this.currentMonthFullName} oyi`;
      } else if (filterKey === "prev_month") {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        start = fmt(firstDay);
        end = fmt(lastDay);
        label = "O'tgan oy";
      } else if (filterKey === "year" || filterKey === "academic_year") {
        start = `${startYear}-09-01`;
        end = `${endYear}-06-30`;
        label = `${this.academicYear} o'quv yili`;
      }

      this.activePeriodCustomLabel = label;

      if (start && end) {
        this.inputStartDate = start;
        this.inputEndDate = end;
        this.syncCalendarView(start);
        this.$emit("date-range-change", {
          start,
          end,
          rangeKey: filterKey,
          label,
        });
      }
    },
    selectPreset(preset) {
      this.handleDateRangeFilter(preset.key);
    },
    applyDateRange() {
      this.isDatePickerOpen = false;
      this.localDateFilter = "";
      this.selectedPresetKey = "";
      const label = "Maxsus sana oralig'i";
      this.activePeriodCustomLabel = label;
      this.$emit("date-range-change", {
        start: this.inputStartDate,
        end: this.inputEndDate,
        rangeKey: "custom",
        label,
      });
    },
  },
};
</script>
