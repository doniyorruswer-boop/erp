<template>
  <div class="form-time-picker-component font-lexend relative">
    <!-- Label -->
    <label v-if="label" class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Trigger Input -->
    <div
      ref="triggerInput"
      @click="togglePicker"
      :class="[
        'w-full text-xs rounded-md border flex items-center justify-between transition-colors bg-white dark:bg-gray-900 cursor-pointer shadow-2xs py-2 px-3',
        isOpen ? 'border-primary ring-1 ring-primary/30' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600',
        error ? 'border-red-500 ring-1 ring-red-500' : ''
      ]"
    >
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <Icon icon="solar:clock-circle-linear" class="text-gray-400 text-base shrink-0" />
        <span
          :class="[
            'truncate',
            modelValue ? 'text-gray-800 dark:text-gray-100 font-semibold' : 'text-gray-400'
          ]"
        >
          {{ modelValue || placeholder || 'Masalan: 14:00 - 18:00' }}
        </span>
      </div>

      <div class="flex items-center gap-1 shrink-0 ml-2">
        <button
          v-if="modelValue"
          type="button"
          @click.stop="clearTime"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded transition cursor-pointer"
          title="Tozalash"
        >
          <Icon icon="solar:close-circle-linear" class="text-sm" />
        </button>
        <Icon icon="solar:alt-arrow-down-linear" class="text-gray-400 text-xs transition-transform" :class="{ 'rotate-180': isOpen }" />
      </div>
    </div>

    <!-- Teleported Dropdown Time Picker Popover (Ochilib chiqadigan oyna) -->
    <Teleport to="body">
      <div v-if="isOpen">
        <!-- Transparent Backdrop -->
        <div class="fixed inset-0 z-[99998]" @click="closePicker" />

        <div
          :style="dropdownStyle"
          class="form-timepicker-popover fixed z-[99999] w-72 sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 text-xs font-lexend space-y-3.5 animate-fade-in"
          @click.stop
        >
          <div class="flex items-center justify-between border-b dark:border-gray-700 pb-2">
            <span class="font-bold text-gray-800 dark:text-gray-100 text-xs flex items-center gap-1.5">
              <Icon icon="solar:clock-circle-bold" class="text-primary text-base" />
              Vaqtni tanlang (Soat va Minut)
            </span>
            <span class="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
              {{ tempTimeFormatted }}
            </span>
          </div>

          <!-- Boshlanish va Tugash vaqtlari -->
          <div class="space-y-2.5">
            <!-- Boshlanish -->
            <div class="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border dark:border-gray-700/60 flex items-center justify-between">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Boshlanish vaqti:</span>
              <div class="flex items-center gap-1.5">
                <select
                  v-model="startHour"
                  class="w-14 p-1.5 text-xs font-bold rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-center outline-none focus:border-primary cursor-pointer"
                >
                  <option v-for="h in hoursList" :key="'sh'+h" :value="h">{{ h }}</option>
                </select>
                <span class="text-gray-500 font-bold">:</span>
                <select
                  v-model="startMinute"
                  class="w-14 p-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-center outline-none focus:border-primary cursor-pointer"
                >
                  <option v-for="m in minutesList" :key="'sm'+m" :value="m">{{ m }}</option>
                </select>
              </div>
            </div>

            <!-- Tugash -->
            <div class="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border dark:border-gray-700/60 flex items-center justify-between">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Tugash vaqti:</span>
              <div class="flex items-center gap-1.5">
                <select
                  v-model="endHour"
                  class="w-14 p-1.5 text-xs font-bold rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-center outline-none focus:border-primary cursor-pointer"
                >
                  <option v-for="h in hoursList" :key="'eh'+h" :value="h">{{ h }}</option>
                </select>
                <span class="text-gray-500 font-bold">:</span>
                <select
                  v-model="endMinute"
                  class="w-14 p-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-center outline-none focus:border-primary cursor-pointer"
                >
                  <option v-for="m in minutesList" :key="'em'+m" :value="m">{{ m }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-2 border-t dark:border-gray-700">
            <button
              type="button"
              @click="closePicker"
              class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              @click="saveTime"
              class="px-5 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-md shadow-sm cursor-pointer transition"
            >
              Tanlash
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
  name: "FormTimePicker",
  components: { Icon },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "change"],
  data() {
    const hours = [];
    for (let i = 7; i <= 22; i++) {
      hours.push(String(i).padStart(2, "0"));
    }

    return {
      isOpen: false,
      inputRect: null,
      hoursList: hours,
      minutesList: ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"],
      startHour: "14",
      startMinute: "00",
      endHour: "18",
      endMinute: "00",
    };
  },
  computed: {
    dropdownStyle() {
      if (!this.inputRect) return {};
      const width = 320;
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
    tempTimeFormatted() {
      return `${this.startHour}:${this.startMinute} - ${this.endHour}:${this.endMinute}`;
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val && val.includes("-")) {
          const parts = val.split("-").map((s) => s.trim());
          if (parts[0] && parts[0].includes(":")) {
            const [sh, sm] = parts[0].split(":");
            if (sh) this.startHour = sh.padStart(2, "0");
            if (sm) this.startMinute = sm.padStart(2, "0");
          }
          if (parts[1] && parts[1].includes(":")) {
            const [eh, em] = parts[1].split(":");
            if (eh) this.endHour = eh.padStart(2, "0");
            if (em) this.endMinute = em.padStart(2, "0");
          }
        }
      },
    },
  },
  beforeUnmount() {
    this.removeListeners();
  },
  methods: {
    updateRect() {
      if (this.$refs.triggerInput) {
        this.inputRect = this.$refs.triggerInput.getBoundingClientRect();
      } else if (this.$el) {
        this.inputRect = this.$el.getBoundingClientRect();
      }
    },
    togglePicker() {
      if (!this.isOpen) {
        this.updateRect();
        window.addEventListener("scroll", this.updateRect, true);
        window.addEventListener("resize", this.updateRect);
      } else {
        this.removeListeners();
      }
      this.isOpen = !this.isOpen;
    },
    closePicker() {
      this.isOpen = false;
      this.removeListeners();
    },
    removeListeners() {
      window.removeEventListener("scroll", this.updateRect, true);
      window.removeEventListener("resize", this.updateRect);
    },
    saveTime() {
      const val = `${this.startHour}:${this.startMinute} - ${this.endHour}:${this.endMinute}`;
      this.$emit("update:modelValue", val);
      this.$emit("change", val);
      this.closePicker();
    },
    clearTime() {
      this.$emit("update:modelValue", "");
      this.$emit("change", "");
      this.closePicker();
    },
  },
};
</script>

<style scoped>
select {
  text-align-last: center;
}
</style>
