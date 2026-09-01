<template>
  <div class="form-input-component font-lexend">
    <label v-if="label" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <span
        v-if="icon"
        class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-base"
      >
        <Icon :icon="icon" />
      </span>
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :step="step"
        :class="[
          'w-full h-11 text-xs sm:text-sm rounded-xl border outline-none transition bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-2xs',
          icon ? 'pl-10 pr-3.5' : 'px-3.5',
          error
            ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
            : 'border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20',
          disabled ? 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed' : '',
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
    <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
    <p v-else-if="hint" class="text-[11px] text-gray-400 mt-1">{{ hint }}</p>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "FormInput",
  components: { Icon },
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
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
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    hint: {
      type: String,
      default: "",
    },
    step: {
      type: [String, Number],
      default: null,
    },
  },
  emits: ["update:modelValue"],
};
</script>
