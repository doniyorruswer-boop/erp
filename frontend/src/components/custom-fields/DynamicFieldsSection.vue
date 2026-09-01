<template>
  <div v-if="fields && fields.length > 0" class="dynamic-fields-section space-y-4 font-lexend">
    <div
      v-for="(groupFields, groupName) in groupedFields"
      :key="groupName"
      class="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700/60"
    >
      <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3.5 flex items-center gap-2">
        <span class="w-1.5 h-3.5 bg-primary rounded-full"></span>
        {{ groupName || "Qo'shimcha ma'lumotlar" }}
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DynamicField
          v-for="field in groupFields"
          :key="field.id || field.key"
          :field="field"
          :model-value="values[field.key]"
          @update:model-value="updateField(field.key, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import DynamicField from "./DynamicField.vue";

export default {
  name: "DynamicFieldsSection",
  components: { DynamicField },
  props: {
    fields: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue"],
  computed: {
    values() {
      return this.modelValue || {};
    },
    groupedFields() {
      const groups = {};
      for (const field of this.fields) {
        const group = field.fieldGroup || "Asosiy";
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(field);
      }
      return groups;
    },
  },
  methods: {
    updateField(key, value) {
      const updated = { ...this.values, [key]: value };
      this.$emit("update:modelValue", updated);
    },
  },
};
</script>
