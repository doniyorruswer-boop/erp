<template>
  <div class="form-datepicker-component font-lexend relative">
    <!-- Label -->
    <label v-if="label" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input Box Trigger -->
    <div
      ref="triggerInput"
      @click="togglePicker"
      :class="[
        'w-full h-11 text-xs sm:text-sm rounded-xl border flex items-center justify-between transition-colors bg-white dark:bg-gray-900 cursor-pointer shadow-2xs px-3.5',
        isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600',
        error ? 'border-red-500 ring-2 ring-red-500/20' : '',
        disabled ? 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed' : ''
      ]"
    >
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <Icon :icon="icon || 'solar:calendar-linear'" class="text-gray-400 text-base shrink-0" />
        <span
          :class="[
            'truncate',
            displayValue ? 'text-gray-800 dark:text-gray-100 font-medium' : 'text-gray-400'
          ]"
        >
          {{ displayValue || placeholder || 'Sanani tanlang...' }}
        </span>
      </div>

      <div class="flex items-center gap-1 shrink-0 ml-2">
        <button
          v-if="modelValue && !disabled"
          type="button"
          @click.stop="clearDate"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded transition cursor-pointer"
          title="Tozalash"
        >
          <Icon icon="solar:close-circle-linear" class="text-sm" />
        </button>
        <Icon icon="solar:alt-arrow-down-linear" class="text-gray-400 text-xs transition-transform duration-200" :class="{ 'rotate-180 text-primary': isOpen }" />
      </div>
    </div>

    <!-- Error/Hint Message -->
    <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
    <p v-else-if="hint" class="text-[11px] text-gray-400 mt-1">{{ hint }}</p>

    <!-- Teleported Calendar Dropdown Popup -->
    <Teleport to="body">
      <div v-if="isOpen">
        <!-- Transparent Backdrop to close entire picker on outside click -->
        <div class="fixed inset-0 z-[99998]" @click="closePicker" />

        <!-- Calendar Card -->
        <div
          :style="dropdownStyle"
          class="form-datepicker-popover fixed z-[99999] w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-3.5 text-xs font-lexend animate-fade-in select-none"
          @click="closeSubDropdowns"
        >
          <!-- Internal backdrop when Month or Year popup is open -->
          <div
            v-if="showMonthSelect || showYearSelect"
            class="fixed inset-0 z-40 bg-transparent"
            @click.stop="closeSubDropdownsDirectly"
          />

          <!-- Calendar Header Navigator with Month & Year Selectors -->
          <div class="relative z-50 flex items-center justify-between mb-3 pb-2.5 border-b dark:border-gray-700">
            <div class="flex items-center gap-1.5">
              <!-- Month Dropdown Selector -->
              <div class="relative month-selector-container">
                <button
                  type="button"
                  @click.stop="toggleMonthSelect"
                  class="px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-800 dark:text-gray-100 text-xs flex items-center gap-1 transition cursor-pointer border border-gray-200 dark:border-gray-600"
                >
                  <span>{{ monthNames[viewMonth] }}</span>
                  <Icon icon="solar:alt-arrow-down-linear" class="text-xs text-gray-400" />
                </button>

                <!-- Month Popup Grid -->
                <div
                  v-if="showMonthSelect"
                  @click.stop
                  class="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1.5 z-50 grid grid-cols-2 gap-1 text-xs"
                >
                  <button
                    v-for="(mName, mIdx) in monthNames"
                    :key="mIdx"
                    type="button"
                    @click.stop="selectMonth(mIdx)"
                    :class="[
                      'px-2 py-1.5 rounded-lg text-left font-medium transition cursor-pointer',
                      viewMonth === mIdx
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                    ]"
                  >
                    {{ mName }}
                  </button>
                </div>
              </div>

              <!-- Year Dropdown Selector -->
              <div class="relative year-selector-container">
                <button
                  type="button"
                  @click.stop="toggleYearSelect"
                  class="px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-800 dark:text-gray-100 text-xs flex items-center gap-1 transition cursor-pointer border border-gray-200 dark:border-gray-600"
                >
                  <span>{{ viewYear }}</span>
                  <Icon icon="solar:alt-arrow-down-linear" class="text-xs text-gray-400" />
                </button>

                <!-- Year Popup Scrollable List (Auto-centered on current/active year) -->
                <div
                  v-if="showYearSelect"
                  ref="yearListContainer"
                  @click.stop
                  class="absolute left-0 mt-1 w-28 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1 z-50 space-y-0.5 text-xs"
                >
                  <button
                    v-for="yr in yearList"
                    :key="yr"
                    :ref="el => { if (yr === viewYear) activeYearEl = el }"
                    type="button"
                    @click.stop="selectYear(yr)"
                    :class="[
                      'w-full px-2.5 py-1.5 rounded-lg text-left font-medium transition cursor-pointer',
                      viewYear === yr
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                    ]"
                  >
                    {{ yr }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Left / Right Month Nav Arrows -->
            <div class="flex items-center gap-0.5">
              <button
                type="button"
                @click.stop="prevMonth"
                class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                title="Oldingi oy"
              >
                <Icon icon="solar:alt-arrow-left-linear" class="text-base" />
              </button>
              <button
                type="button"
                @click.stop="nextMonth"
                class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                title="Keyingi oy"
              >
                <Icon icon="solar:alt-arrow-right-linear" class="text-base" />
              </button>
            </div>
          </div>

          <!-- Day of Week Labels -->
          <div class="grid grid-cols-7 text-center font-semibold text-[11px] text-gray-400 mb-1.5">
            <span>Du</span>
            <span>Se</span>
            <span>Ch</span>
            <span>Pa</span>
            <span>Ju</span>
            <span>Sh</span>
            <span class="text-rose-500">Ya</span>
          </div>

          <!-- Days Grid -->
          <div class="grid grid-cols-7 gap-1 text-center">
            <button
              v-for="(day, idx) in daysInMonthGrid"
              :key="idx"
              type="button"
              @click.stop="selectDate(day)"
              :disabled="day.disabled"
              :class="[
                'h-7 w-7 mx-auto rounded-lg flex items-center justify-center text-xs font-medium transition cursor-pointer',
                day.isCurrentMonth ? 'text-gray-700 dark:text-gray-200' : 'text-gray-300 dark:text-gray-600',
                day.isSelected ? 'bg-primary text-white font-bold shadow-xs' : '',
                day.isToday && !day.isSelected ? 'border border-primary text-primary font-bold' : '',
                !day.isSelected && !day.disabled ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : '',
                day.disabled ? 'opacity-30 cursor-not-allowed' : ''
              ]"
            >
              {{ day.dayNumber }}
            </button>
          </div>

          <!-- Quick Presets Footer -->
          <div class="mt-3 pt-2 border-t dark:border-gray-700 flex items-center justify-between text-[11px]">
            <button
              type="button"
              @click.stop="setQuickDate('today')"
              class="text-primary hover:underline font-bold cursor-pointer"
            >
              Bugun
            </button>
            <button
              type="button"
              @click.stop="setQuickDate('tomorrow')"
              class="text-gray-600 dark:text-gray-300 hover:text-primary transition cursor-pointer font-medium"
            >
              Ertaga
            </button>
            <button
              type="button"
              @click.stop="clearDate"
              class="text-rose-500 hover:underline cursor-pointer font-semibold"
            >
              Tozalash
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "FormDatePicker",
  components: { Icon },
  props: {
    modelValue: {
      type: String,
      default: "", // Format: 'YYYY-MM-DD'
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "Sanani tanlang...",
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: "solar:calendar-linear",
    },
    error: {
      type: String,
      default: "",
    },
    hint: {
      type: String,
      default: "",
    },
    minDate: {
      type: String,
      default: "",
    },
    maxDate: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "change"],
  data() {
    const initialDate = this.modelValue ? new Date(this.modelValue) : new Date();
    const validDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

    return {
      isOpen: false,
      showMonthSelect: false,
      showYearSelect: false,
      activeYearEl: null,
      inputRect: null,
      viewYear: validDate.getFullYear(),
      viewMonth: validDate.getMonth(), // 0-11
      monthNames: [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
      ],
    };
  },
  computed: {
    yearList() {
      const currentYear = new Date().getFullYear();
      const list = [];
      for (let y = currentYear - 20; y <= currentYear + 15; y++) {
        list.push(y);
      }
      return list;
    },
    dropdownStyle() {
      if (!this.inputRect) return {};
      const width = 288;
      let left = this.inputRect.left;
      if (left + width > window.innerWidth - 10) {
        left = window.innerWidth - width - 10;
      }
      left = Math.max(10, left);

      const top = this.inputRect.bottom + 6;
      return {
        top: `${top}px`,
        left: `${left}px`,
      };
    },
    displayValue() {
      if (!this.modelValue) return "";
      const parts = this.modelValue.split("-");
      if (parts.length === 3) {
        const y = parts[0];
        const m = parseInt(parts[1], 10) - 1;
        const d = parts[2];
        if (this.monthNames[m]) {
          return `${d}-${this.monthNames[m]}, ${y}`;
        }
      }
      return this.modelValue;
    },
    daysInMonthGrid() {
      const year = this.viewYear;
      const month = this.viewMonth;

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);

      const totalDays = lastDayOfMonth.getDate();
      let firstDayIndex = firstDayOfMonth.getDay() - 1;
      if (firstDayIndex === -1) firstDayIndex = 6;

      const prevMonthLastDate = new Date(year, month, 0).getDate();

      const days = [];

      // Previous month overflow days
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const pDay = prevMonthLastDate - i;
        days.push({
          dayNumber: pDay,
          isCurrentMonth: false,
          isSelected: false,
          isToday: false,
          disabled: true,
          dateStr: "",
        });
      }

      // Current month days
      const today = new Date();
      const isCurrentViewingMonthAndYear =
        today.getFullYear() === year && today.getMonth() === month;

      for (let day = 1; day <= totalDays; day++) {
        const mStr = String(month + 1).padStart(2, "0");
        const dStr = String(day).padStart(2, "0");
        const dateStr = `${year}-${mStr}-${dStr}`;

        const isSelected = this.modelValue === dateStr;
        const isToday = isCurrentViewingMonthAndYear && today.getDate() === day;

        let disabled = false;
        if (this.minDate && dateStr < this.minDate) disabled = true;
        if (this.maxDate && dateStr > this.maxDate) disabled = true;

        days.push({
          dayNumber: day,
          isCurrentMonth: true,
          isSelected,
          isToday,
          disabled,
          dateStr,
        });
      }

      // Next month overflow days
      const remainingSlots = 42 - days.length;
      for (let day = 1; day <= (remainingSlots >= 7 ? remainingSlots - 7 : remainingSlots); day++) {
        days.push({
          dayNumber: day,
          isCurrentMonth: false,
          isSelected: false,
          isToday: false,
          disabled: true,
          dateStr: "",
        });
      }

      return days;
    },
  },
  methods: {
    togglePicker() {
      if (this.disabled) return;
      if (!this.isOpen) {
        this.updatePosition();
        this.isOpen = true;
        this.showMonthSelect = false;
        this.showYearSelect = false;
      } else {
        this.isOpen = false;
      }
    },
    closePicker() {
      this.isOpen = false;
      this.showMonthSelect = false;
      this.showYearSelect = false;
    },
    closeSubDropdowns(e) {
      if (e && e.target) {
        if (!e.target.closest(".month-selector-container")) {
          this.showMonthSelect = false;
        }
        if (!e.target.closest(".year-selector-container")) {
          this.showYearSelect = false;
        }
      } else {
        this.showMonthSelect = false;
        this.showYearSelect = false;
      }
    },
    closeSubDropdownsDirectly() {
      this.showMonthSelect = false;
      this.showYearSelect = false;
    },
    toggleMonthSelect() {
      this.showMonthSelect = !this.showMonthSelect;
      this.showYearSelect = false;
    },
    toggleYearSelect() {
      this.showYearSelect = !this.showYearSelect;
      this.showMonthSelect = false;
      if (this.showYearSelect) {
        this.$nextTick(() => {
          if (this.activeYearEl && typeof this.activeYearEl.scrollIntoView === "function") {
            this.activeYearEl.scrollIntoView({ block: "center", behavior: "auto" });
          }
        });
      }
    },
    selectMonth(mIdx) {
      this.viewMonth = mIdx;
      this.showMonthSelect = false;
    },
    selectYear(yr) {
      this.viewYear = yr;
      this.showYearSelect = false;
    },
    updatePosition() {
      if (this.$refs.triggerInput) {
        this.inputRect = this.$refs.triggerInput.getBoundingClientRect();
      }
    },
    prevMonth() {
      this.showMonthSelect = false;
      this.showYearSelect = false;
      if (this.viewMonth === 0) {
        this.viewMonth = 11;
        this.viewYear--;
      } else {
        this.viewMonth--;
      }
    },
    nextMonth() {
      this.showMonthSelect = false;
      this.showYearSelect = false;
      if (this.viewMonth === 11) {
        this.viewMonth = 0;
        this.viewYear++;
      } else {
        this.viewMonth++;
      }
    },
    selectDate(day) {
      if (!day.isCurrentMonth || day.disabled) return;
      this.$emit("update:modelValue", day.dateStr);
      this.$emit("change", day.dateStr);
      this.closePicker();
    },
    setQuickDate(preset) {
      const target = new Date();
      if (preset === "tomorrow") {
        target.setDate(target.getDate() + 1);
      }
      const y = target.getFullYear();
      const m = String(target.getMonth() + 1).padStart(2, "0");
      const d = String(target.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      this.viewYear = y;
      this.viewMonth = target.getMonth();
      this.$emit("update:modelValue", dateStr);
      this.$emit("change", dateStr);
      this.closePicker();
    },
    clearDate() {
      this.$emit("update:modelValue", "");
      this.$emit("change", "");
      this.closePicker();
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
