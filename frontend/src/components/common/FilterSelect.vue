<template>
  <div
    class="filter-select-component font-lexend relative inline-block"
    :class="[minWidth, widthClass]"
  >
    <!-- Left Filter Icon -->
    <span
      v-if="icon"
      class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition"
      :class="iconColor"
    >
      <Icon :icon="icon" :class="iconSizeClass" />
    </span>

    <!-- Native Select with custom styling -->
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="[
        'w-full font-semibold border-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs cursor-pointer appearance-none transition',
        borderColorClass,
        icon ? 'pl-9' : 'pl-3.5',
        'pr-9',
        sizeClasses,
        disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : '',
      ]"
      @change="onChange($event.target.value)"
    >
      <!-- Optional "All / Placeholder" option -->
      <option v-if="allLabel" :value="allValue">
        {{ allLabel }}
      </option>

      <!-- Options list -->
      <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <!-- Right Dropdown Arrow Icon -->
    <span
      class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500"
    >
      <Icon icon="solar:alt-arrow-down-linear" class="text-sm" />
    </span>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "FilterSelect",
  components: {
    Icon,
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    options: {
      type: Array,
      default: () => [],
    },
    allLabel: {
      type: String,
      default: "Barchasi",
    },
    allValue: {
      type: [String, Number],
      default: "",
    },
    icon: {
      type: String,
      default: "solar:filter-bold-duotone",
    },
    iconColor: {
      type: String,
      default: "text-primary",
    },
    minWidth: {
      type: String,
      default: "min-w-[190px]",
    },
    widthClass: {
      type: String,
      default: "w-full sm:w-auto",
    },
    size: {
      type: String,
      default: "md", // 'sm' | 'md' | 'lg'
    },
    borderVariant: {
      type: String,
      default: "default", // 'default' | 'primary'
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "change"],
  computed: {
    borderColorClass() {
      if (this.borderVariant === "primary") {
        return "border-primary focus:border-primary";
      }
      return "border-gray-300 dark:border-gray-600 focus:border-primary";
    },
    normalizedOptions() {
      return (this.options || []).map((opt) => {
        if (typeof opt === "object" && opt !== null) {
          return {
            value: opt.value !== undefined ? opt.value : opt.id || "",
            label: opt.label !== undefined ? opt.label : opt.name || opt.title || opt.value || "",
          };
        }
        return {
          value: opt,
          label: String(opt),
        };
      });
    },
    sizeClasses() {
      switch (this.size) {
        case "sm":
          return "py-1.5 text-xs";
        case "lg":
          return "py-2.5 text-base";
        case "md":
        default:
          return "py-2 text-sm";
      }
    },
    iconSizeClass() {
      switch (this.size) {
        case "sm":
          return "text-base";
        case "lg":
          return "text-xl";
        case "md":
        default:
          return "text-lg";
      }
    },
  },
  methods: {
    onChange(val) {
      this.$emit("update:modelValue", val);
      this.$emit("change", val);
    },
  },
};
</script>
