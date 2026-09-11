<template>
  <div ref="containerRef" class="relative inline-block app-filter-dropdown font-lexend">
    <!-- Trigger Button (No .stop to allow clean document clicks, and event coordination) -->
    <button
      type="button"
      :class="[
        'h-9 sm:h-9.5 px-3 rounded-lg border bg-white dark:bg-gray-900 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs group select-none',
        isOpen
          ? 'border-primary ring-2 ring-primary/20 text-primary'
          : isNonDefault
            ? 'border-primary text-primary bg-primary/[0.03]'
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400',
      ]"
      @click="toggleDropdown"
    >
      <!-- Leading Icon -->
      <Icon
        v-if="icon"
        :icon="icon"
        :class="[
          'text-base transition-colors shrink-0',
          isOpen || isNonDefault
            ? 'text-primary'
            : 'text-gray-500 dark:text-gray-400 group-hover:text-primary',
        ]"
      />

      <!-- Label & Value text -->
      <span class="whitespace-nowrap flex items-center">
        <span v-if="label" class="text-gray-700 dark:text-gray-300 font-semibold mr-1"
          >{{ label }}:</span
        >
        <span
          :class="
            isNonDefault
              ? 'font-bold text-primary'
              : 'font-semibold text-gray-800 dark:text-gray-100'
          "
        >
          {{ displayLabel }}
        </span>
      </span>

      <!-- Down Arrow Chevron with 180deg flip -->
      <Icon
        icon="solar:alt-arrow-down-linear"
        class="text-xs text-gray-400 ml-1 transition-transform shrink-0"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown Menu Popup (O'quvchilar ro'yxati andozasi) -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        :class="[
          'absolute mt-2 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1 font-lexend text-xs sm:text-sm',
          placement === 'right' ? 'right-0' : 'left-0',
          minWidth,
        ]"
      >
        <!-- "Barchasi / All" Variant -->
        <div
          v-if="allLabel"
          :class="[
            'px-4 py-2.5 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition',
            isSelected(allValue)
              ? 'text-primary font-bold bg-primary/5'
              : 'text-gray-700 dark:text-gray-200',
          ]"
          @click="selectOption(allValue)"
        >
          <span>{{ allLabel }}</span>
          <Icon
            v-if="isSelected(allValue)"
            icon="solar:check-circle-bold"
            class="text-primary text-base shrink-0 ml-2"
          />
        </div>

        <!-- Options list -->
        <div
          v-for="opt in normalizedOptions"
          :key="opt.value"
          :class="[
            'px-4 py-2.5 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition',
            isSelected(opt.value)
              ? 'text-primary font-bold bg-primary/5'
              : 'text-gray-700 dark:text-gray-200',
          ]"
          @click="selectOption(opt.value)"
        >
          <span>{{ opt.label }}</span>
          <Icon
            v-if="isSelected(opt.value)"
            icon="solar:check-circle-bold"
            class="text-primary text-base shrink-0 ml-2"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AppFilterDropdown",
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
    label: {
      type: String,
      default: "",
    },
    allLabel: {
      type: String,
      default: "Barchasi",
    },
    allValue: {
      type: [String, Number],
      default: "ALL",
    },
    icon: {
      type: String,
      default: "solar:filter-bold-duotone",
    },
    minWidth: {
      type: String,
      default: "min-w-[200px]",
    },
    placement: {
      type: String,
      default: "left", // 'left' | 'right'
    },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      isOpen: false,
      dropdownId: "afd-" + Math.random().toString(36).substring(2, 9),
    };
  },
  computed: {
    normalizedOptions() {
      const opts = (this.options || []).map((opt) => {
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
      if (this.allLabel) {
        return opts.filter(
          (o) =>
            String(o.value).toLowerCase() !== String(this.allValue).toLowerCase() &&
            String(o.label).toLowerCase() !== String(this.allLabel).toLowerCase()
        );
      }
      return opts;
    },
    displayLabel() {
      if (this.isSelected(this.allValue)) {
        return this.allLabel || "Barchasi";
      }
      const match = this.normalizedOptions.find((o) => this.isSelected(o.value));
      if (match) return match.label;
      return this.modelValue || this.allLabel || "Barchasi";
    },
    isNonDefault() {
      return (
        !this.isSelected(this.allValue) &&
        this.modelValue !== "" &&
        this.modelValue !== null &&
        this.modelValue !== undefined
      );
    },
  },
  mounted() {
    document.addEventListener("click", this.handleDocClick);
    document.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("app-filter-dropdown-open", this.onOtherDropdownOpen);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleDocClick);
    document.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("app-filter-dropdown-open", this.onOtherDropdownOpen);
  },
  methods: {
    toggleDropdown() {
      if (!this.isOpen) {
        // Broadcast event so any other open dropdown closes immediately
        window.dispatchEvent(
          new CustomEvent("app-filter-dropdown-open", {
            detail: this.dropdownId,
          })
        );
        this.isOpen = true;
      } else {
        this.isOpen = false;
      }
    },
    closeDropdown() {
      this.isOpen = false;
    },
    onOtherDropdownOpen(e) {
      if (e.detail !== this.dropdownId) {
        this.isOpen = false;
      }
    },
    handleDocClick(e) {
      if (this.$refs.containerRef && !this.$refs.containerRef.contains(e.target)) {
        this.closeDropdown();
      }
    },
    handleKeydown(e) {
      if (e.key === "Escape" && this.isOpen) {
        this.closeDropdown();
      }
    },
    isSelected(val) {
      return String(this.modelValue) === String(val);
    },
    selectOption(val) {
      this.$emit("update:modelValue", val);
      this.$emit("change", val);
      this.closeDropdown();
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
