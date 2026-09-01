<template>
  <div class="dynamic-field font-lexend">
    <!-- TEXT, EMAIL, PHONE, URL -->
    <div v-if="['TEXT', 'EMAIL', 'PHONE', 'URL'].includes(field.fieldType)">
      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ field.label }}
        <span v-if="field.isRequired" class="text-red-500">*</span>
      </label>
      <input
        :type="getInputType(field.fieldType)"
        :value="modelValue"
        :placeholder="field.placeholder || field.label"
        :required="field.isRequired"
        class="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 outline-none transition bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>

    <!-- NUMBER -->
    <div v-else-if="field.fieldType === 'NUMBER'">
      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ field.label }}
        <span v-if="field.isRequired" class="text-red-500">*</span>
      </label>
      <input
        type="number"
        :value="modelValue"
        :placeholder="field.placeholder || '0'"
        :required="field.isRequired"
        class="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 outline-none transition bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
        @input="$emit('update:modelValue', $event.target.value ? Number($event.target.value) : null)"
      />
    </div>

    <!-- TEXTAREA -->
    <div v-else-if="field.fieldType === 'TEXTAREA'">
      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ field.label }}
        <span v-if="field.isRequired" class="text-red-500">*</span>
      </label>
      <textarea
        :value="modelValue"
        :placeholder="field.placeholder || field.label"
        :required="field.isRequired"
        rows="3"
        class="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 outline-none transition bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs resize-none"
        @input="$emit('update:modelValue', $event.target.value)"
      ></textarea>
    </div>

    <!-- DATE / DATETIME -->
    <div v-else-if="['DATE', 'DATETIME'].includes(field.fieldType)">
      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ field.label }}
        <span v-if="field.isRequired" class="text-red-500">*</span>
      </label>
      <input
        :type="field.fieldType === 'DATE' ? 'date' : 'datetime-local'"
        :value="modelValue"
        :required="field.isRequired"
        class="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 outline-none transition bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>

    <!-- BOOLEAN -->
    <div v-else-if="field.fieldType === 'BOOLEAN'" class="flex items-center gap-3 pt-4">
      <input
        type="checkbox"
        :id="`field-${field.key}`"
        :checked="!!modelValue"
        class="w-5 h-5 text-primary rounded-lg border-gray-300 focus:ring-primary dark:border-gray-700 dark:bg-gray-900"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
      <label :for="`field-${field.key}`" class="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
        {{ field.label }}
        <span v-if="field.isRequired" class="text-red-500">*</span>
      </label>
    </div>

    <!-- SELECT -->
    <div v-else-if="field.fieldType === 'SELECT'">
      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ field.label }}
        <span v-if="field.isRequired" class="text-red-500">*</span>
      </label>
      <select
        :value="modelValue"
        :required="field.isRequired"
        class="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 outline-none transition bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="">Tanlang...</option>
        <option v-for="(opt, idx) in normalizedOptions" :key="idx" :value="opt">
          {{ opt }}
        </option>
      </select>
    </div>

    <!-- MULTI_SELECT -->
    <div v-else-if="field.fieldType === 'MULTI_SELECT'">
      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ field.label }}
        <span v-if="field.isRequired" class="text-red-500">*</span>
      </label>
      <div class="flex flex-wrap gap-2 p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
        <label
          v-for="(opt, idx) in normalizedOptions"
          :key="idx"
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition select-none hover:bg-gray-50 dark:hover:bg-gray-800"
          :class="{ 'bg-primary/10 border-primary text-primary font-medium': isMultiSelected(opt) }"
        >
          <input
            type="checkbox"
            :checked="isMultiSelected(opt)"
            class="hidden"
            @change="toggleMultiSelect(opt)"
          />
          <span>{{ opt }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DynamicField",
  props: {
    field: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: [String, Number, Boolean, Array, Object],
      default: null,
    },
  },
  emits: ["update:modelValue"],
  computed: {
    normalizedOptions() {
      if (!this.field.options) return [];
      if (Array.isArray(this.field.options)) return this.field.options;
      if (typeof this.field.options === "string") {
        return this.field.options.split(",").map((s) => s.trim());
      }
      return [];
    },
  },
  methods: {
    getInputType(type) {
      if (type === "EMAIL") return "email";
      if (type === "PHONE") return "tel";
      if (type === "URL") return "url";
      return "text";
    },
    isMultiSelected(opt) {
      return Array.isArray(this.modelValue) && this.modelValue.includes(opt);
    },
    toggleMultiSelect(opt) {
      const current = Array.isArray(this.modelValue) ? [...this.modelValue] : [];
      const index = current.indexOf(opt);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(opt);
      }
      this.$emit("update:modelValue", current);
    },
  },
};
</script>
