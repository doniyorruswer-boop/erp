<template>
  <div class="form-currency-component font-lexend">
    <!-- Label -->
    <label v-if="label" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <!-- Left Icon (Enhanced contrast and size) -->
      <span
        class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 dark:text-gray-400 text-lg"
      >
        <Icon :icon="icon || 'solar:wallet-money-bold'" />
      </span>

      <!-- Formatted Input -->
      <input
        type="text"
        :value="displayFormatted"
        :placeholder="placeholder || 'Masalan: 450 000'"
        :required="required"
        :disabled="disabled"
        :class="[
          'w-full h-11 text-xs sm:text-sm rounded-xl border outline-none transition bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 pl-10 pr-14 font-medium shadow-2xs',
          error
            ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
            : 'border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20',
          disabled ? 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed' : '',
        ]"
        @input="onInput"
        @blur="onBlur"
      />

      <!-- Right Currency Unit Badge -->
      <span
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-semibold text-gray-500 dark:text-gray-400"
      >
        {{ unit || "UZS" }}
      </span>
    </div>

    <!-- Error/Hint Message -->
    <FormFieldError :error="error" />
    <p v-if="!error && hint" class="text-[11px] text-gray-400 mt-1">{{ hint }}</p>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { formatMoney, parseMoney } from "@/config/app.config";

export default {
  name: "FormCurrencyInput",
  components: { Icon },
  props: {
    modelValue: {
      type: [Number, String],
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
    unit: {
      type: String,
      default: "UZS",
    },
    separator: {
      type: String,
      default: " ", // ' ' probel yoki ',' vergul
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
      default: "solar:wallet-money-bold",
    },
    error: {
      type: String,
      default: "",
    },
    hint: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "change"],
  computed: {
    displayFormatted() {
      if (this.modelValue === null || this.modelValue === undefined || this.modelValue === "") {
        return "";
      }
      return formatMoney(this.modelValue, false, this.separator);
    },
  },
  methods: {
    onInput(event) {
      const rawVal = event.target.value;
      const num = parseMoney(rawVal);
      this.$emit("update:modelValue", num);
    },
    onBlur(event) {
      const num = parseMoney(event.target.value);
      this.$emit("update:modelValue", num);
      this.$emit("change", num);
    },
  },
};
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
</style>
