<template>
  <div ref="containerRef" class="relative inline-block font-lexend">
    <!-- Trigger Button (Matching DashboardHeaderBar 1:1, NO down arrow icon) -->
    <AppButton
      variant="outline"
      :size="size"
      icon="solar:calendar-linear"
      :title="title || 'Sana oralig\'ini tanlash'"
      @click="toggleDatePicker"
    >
      <span>{{ displayRangeText }}</span>
    </AppButton>

    <!-- Interactive Visual Calendar Dropdown Popover (Dashboard andozasi) -->
    <div
      v-if="isOpen"
      :class="[
        'absolute top-full mt-2 z-50 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-4 space-y-3 font-lexend select-none animate-fade-in',
        align === 'left' ? 'left-0' : 'right-0',
      ]"
      @click.stop
    >
      <!-- Popover Sarlavhasi -->
      <div
        class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700"
      >
        <span class="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider"
          >Davrni tanlash</span
        >
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          title="Yopish"
          @click="closeDatePicker"
        >
          <Icon icon="solar:close-circle-linear" class="text-base" />
        </button>
      </div>

      <!-- Tezkor Davr Presetlari -->
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

      <!-- Interaktiv Taqvim Gridi -->
      <div
        class="border border-gray-100 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50/50 dark:bg-gray-800/40 space-y-2"
      >
        <!-- Oy va Yil navigatsiyasi -->
        <div
          class="flex items-center justify-between px-1 text-xs font-bold text-gray-700 dark:text-gray-200"
        >
          <button
            type="button"
            class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition"
            title="Oldingi oy"
            @click="prevCalMonth"
          >
            <Icon icon="solar:alt-arrow-left-linear" class="text-sm" />
          </button>
          <span>{{ calMonthName }} {{ calYear }}</span>
          <button
            type="button"
            class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition"
            title="Keyingi oy"
            @click="nextCalMonth"
          >
            <Icon icon="solar:alt-arrow-right-linear" class="text-sm" />
          </button>
        </div>

        <!-- Hafta kunlari sarlavhasi -->
        <div class="grid grid-cols-7 text-center text-[11px] font-semibold text-gray-400">
          <span>Du</span>
          <span>Se</span>
          <span>Ch</span>
          <span>Pa</span>
          <span>Ju</span>
          <span>Sha</span>
          <span>Ya</span>
        </div>

        <!-- Kunlar katakchalari -->
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

      <!-- Maxsus Boshlanish va Tugash sanasi (FormDatePicker) -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <FormDatePicker
            v-model="tempStartDate"
            label="Boshlanish"
            size="sm"
            placeholder="KK / OO / YYYY"
            @change="onStartDateInput"
          />
        </div>
        <div>
          <FormDatePicker
            v-model="tempEndDate"
            label="Tugash"
            size="sm"
            placeholder="KK / OO / YYYY"
            @change="onEndDateInput"
          />
        </div>
      </div>

      <!-- Pastki boshqaruv amallari -->
      <div
        class="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700"
      >
        <button
          v-if="clearable && (tempStartDate || tempEndDate)"
          type="button"
          class="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline text-xs font-semibold cursor-pointer"
          @click="clearDateRange"
        >
          Tozalash
        </button>
        <div class="flex items-center gap-2 ml-auto">
          <button
            type="button"
            class="py-1.5 px-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold cursor-pointer shadow-2xs transition"
            @click="cancelDateRange"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            class="py-1.5 px-3.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold cursor-pointer shadow-2xs transition"
            @click="applyDateRange"
          >
            Qo'llash
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import AppButton from "@/components/common/AppButton.vue";
import FormDatePicker from "@/components/FormDatePicker.vue";

export default {
  name: "AppDateRangePicker",
  components: {
    Icon,
    AppButton,
    FormDatePicker,
  },
  props: {
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    modelValue: {
      type: Object,
      default: () => null,
    },
    size: {
      type: String,
      default: "md",
    },
    align: {
      type: String,
      default: "right", // 'left' | 'right'
    },
    placeholder: {
      type: String,
      default: "Sana oralig'ini tanlash",
    },
    title: {
      type: String,
      default: "",
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    academicYear: {
      type: String,
      default: "2026-2027",
    },
    autoApplyPreset: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:startDate", "update:endDate", "update:modelValue", "change"],
  data() {
    const now = new Date();
    const initialStart = this.startDate || (this.modelValue && this.modelValue.start) || "";
    const initialEnd = this.endDate || (this.modelValue && this.modelValue.end) || "";

    return {
      isOpen: false,
      pickingEndDate: false,
      calYear: now.getFullYear(),
      calMonth: now.getMonth(),
      selectedPresetKey: "",
      tempStartDate: initialStart,
      tempEndDate: initialEnd,
      innerStartDate: initialStart,
      innerEndDate: initialEnd,
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
    displayRangeText() {
      const formatDisplay = (dStr) => {
        if (!dStr) return "";
        const parts = dStr.split("-");
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dStr;
      };

      const s = this.innerStartDate;
      const e = this.innerEndDate;

      if (s && e) {
        return `${formatDisplay(s)} — ${formatDisplay(e)}`;
      }
      if (s) {
        return `${formatDisplay(s)} dan`;
      }
      if (e) {
        return `${formatDisplay(e)} gacha`;
      }
      return this.placeholder;
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
      return months[this.calMonth] || "Sentabr";
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
          isStart: dateStr === this.tempStartDate,
          isEnd: dateStr === this.tempEndDate,
          isInRange: dateStr > this.tempStartDate && dateStr < this.tempEndDate,
          isToday: dateStr === this.todayStr,
        });
      }
      return days;
    },
  },
  watch: {
    startDate(newVal) {
      this.innerStartDate = newVal || "";
      this.tempStartDate = newVal || "";
      if (newVal) this.syncCalendarView(newVal);
    },
    endDate(newVal) {
      this.innerEndDate = newVal || "";
      this.tempEndDate = newVal || "";
    },
    modelValue: {
      deep: true,
      handler(newVal) {
        if (newVal) {
          this.innerStartDate = newVal.start || "";
          this.innerEndDate = newVal.end || "";
          this.tempStartDate = this.innerStartDate;
          this.tempEndDate = this.innerEndDate;
          if (this.innerStartDate) this.syncCalendarView(this.innerStartDate);
        }
      },
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    toggleDatePicker() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.tempStartDate = this.innerStartDate;
        this.tempEndDate = this.innerEndDate;
        if (this.tempStartDate) {
          this.syncCalendarView(this.tempStartDate);
        }
      }
    },
    closeDatePicker() {
      this.isOpen = false;
    },
    handleClickOutside(event) {
      if (
        this.isOpen &&
        this.$refs.containerRef &&
        !this.$refs.containerRef.contains(event.target)
      ) {
        // FormDatePicker popoveri Teleport qilingani sababli tekshirish
        if (
          event.target.closest &&
          (event.target.closest(".form-datepicker-popover") ||
            event.target.closest(".form-datepicker-component"))
        ) {
          return;
        }
        this.isOpen = false;
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
        this.tempStartDate = selected;
        this.tempEndDate = selected;
        this.pickingEndDate = true;
      } else {
        if (selected < this.tempStartDate) {
          this.tempEndDate = this.tempStartDate;
          this.tempStartDate = selected;
        } else {
          this.tempEndDate = selected;
        }
        this.pickingEndDate = false;
      }
      this.selectedPresetKey = "";
    },
    onStartDateInput(val) {
      if (val) {
        this.tempStartDate = val;
        if (this.tempEndDate && val > this.tempEndDate) {
          this.tempEndDate = val;
        }
        this.syncCalendarView(val);
        this.selectedPresetKey = "";
      }
    },
    onEndDateInput(val) {
      if (val) {
        this.tempEndDate = val;
        if (this.tempStartDate && val < this.tempStartDate) {
          this.tempStartDate = val;
        }
        this.syncCalendarView(val);
        this.selectedPresetKey = "";
      }
    },
    selectPreset(preset) {
      this.selectedPresetKey = preset.key;
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      let start = "";
      let end = "";

      if (preset.key === "today") {
        start = fmt(now);
        end = fmt(now);
      } else if (preset.key === "yesterday") {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        start = fmt(y);
        end = fmt(y);
      } else if (preset.key === "7days") {
        const past = new Date(now);
        past.setDate(past.getDate() - 6);
        start = fmt(past);
        end = fmt(now);
      } else if (preset.key === "month" || preset.key === "this_month") {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = fmt(firstDay);
        end = fmt(lastDay);
      } else if (preset.key === "prev_month") {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        start = fmt(firstDay);
        end = fmt(lastDay);
      } else if (preset.key === "year" || preset.key === "academic_year") {
        const { startYear, endYear } = this.academicYearsParsed;
        start = `${startYear}-09-01`;
        end = `${endYear}-06-30`;
      }

      if (start && end) {
        this.tempStartDate = start;
        this.tempEndDate = end;
        this.syncCalendarView(start);
        if (this.autoApplyPreset) {
          this.applyDateRange();
        }
      }
    },
    applyDateRange() {
      this.innerStartDate = this.tempStartDate;
      this.innerEndDate = this.tempEndDate;
      this.isOpen = false;

      const payload = {
        start: this.innerStartDate,
        end: this.innerEndDate,
        rangeKey: this.selectedPresetKey || "custom",
        label: this.selectedPresetKey
          ? this.presetRanges.find((p) => p.key === this.selectedPresetKey)?.label || "Davr"
          : "Maxsus sana oralig'i",
      };

      this.$emit("update:startDate", this.innerStartDate);
      this.$emit("update:endDate", this.innerEndDate);
      this.$emit("update:modelValue", { start: this.innerStartDate, end: this.innerEndDate });
      this.$emit("change", payload);
    },
    cancelDateRange() {
      this.tempStartDate = this.innerStartDate;
      this.tempEndDate = this.innerEndDate;
      this.isOpen = false;
    },
    clearDateRange() {
      this.tempStartDate = "";
      this.tempEndDate = "";
      this.innerStartDate = "";
      this.innerEndDate = "";
      this.selectedPresetKey = "";
      this.isOpen = false;

      const payload = {
        start: "",
        end: "",
        rangeKey: "all",
        label: "Barchasi",
      };

      this.$emit("update:startDate", "");
      this.$emit("update:endDate", "");
      this.$emit("update:modelValue", { start: "", end: "" });
      this.$emit("change", payload);
    },
  },
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.15s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
