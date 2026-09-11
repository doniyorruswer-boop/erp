<template>
  <div ref="dropdownRef" class="form-select-component font-lexend relative">
    <!-- Form Label -->
    <label v-if="label" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Custom Select Trigger Button -->
    <div
      ref="triggerRef"
      :class="[
        'w-full h-11 text-xs sm:text-sm rounded-xl border flex items-center justify-between transition bg-white dark:bg-gray-900 cursor-pointer shadow-2xs px-3.5 select-none',
        isOpen
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600',
        error ? 'border-red-500 ring-2 ring-red-500/20' : '',
        disabled
          ? 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed pointer-events-none'
          : '',
      ]"
      @click="toggleDropdown"
    >
      <!-- Left side: Optional Icon + Selected Label -->
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <Icon v-if="icon" :icon="icon" class="text-gray-400 text-base shrink-0" />
        <span
          :class="[
            'truncate font-medium',
            selectedOption
              ? 'text-gray-800 dark:text-gray-100'
              : 'text-gray-400 dark:text-gray-500',
          ]"
        >
          {{ selectedOption ? selectedOption.label : placeholder || "Tanlang..." }}
        </span>
      </div>

      <!-- Right side: Clear Button + Animated Chevron -->
      <div class="flex items-center gap-1.5 shrink-0 ml-2">
        <button
          v-if="
            clearable &&
            modelValue !== '' &&
            modelValue !== null &&
            modelValue !== undefined &&
            !disabled
          "
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded transition cursor-pointer"
          title="Tozalash"
          @click.stop="clearSelection"
        >
          <Icon icon="solar:close-circle-linear" class="text-sm" />
        </button>
        <Icon
          icon="solar:alt-arrow-down-linear"
          class="text-gray-400 text-xs transition-transform duration-200"
          :class="{ 'rotate-180 text-primary': isOpen }"
        />
      </div>
    </div>

    <!-- Error / Hint Message -->
    <FormFieldError :error="error" />

    <!-- Teleported Floating Dropdown Menu Popup (Renders above modals without clipping) -->
    <Teleport to="body">
      <div v-if="isOpen">
        <!-- Transparent Backdrop overlay for click-outside dismissal -->
        <div class="fixed inset-0 z-[99998] bg-transparent" @click="closeDropdown" />

        <!-- Floating Popover Card -->
        <div
          :style="dropdownStyle"
          class="form-select-popover fixed z-[99999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden text-xs sm:text-sm font-lexend max-h-64 flex flex-col animate-fade-in"
          @click.stop
        >
          <!-- Search Input if items > 5 or searchable is true -->
          <div
            v-if="isSearchable"
            class="p-2 border-b dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40"
          >
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400">
                <Icon icon="ei:search" class="text-base" />
              </span>
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                placeholder="Qidirish..."
                class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                @click.stop
              />
            </div>
          </div>

          <!-- Options List -->
          <div class="overflow-y-auto p-1.5 space-y-0.5 max-h-52">
            <div
              v-for="opt in filteredOptions"
              :key="opt.value"
              :class="[
                'px-3 py-2 rounded-xl cursor-pointer flex items-center justify-between transition',
                isSelected(opt)
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60',
              ]"
              @click="selectOption(opt)"
            >
              <div class="flex items-center gap-2 truncate">
                <Icon v-if="opt.icon" :icon="opt.icon" class="text-sm shrink-0" />
                <span class="truncate">{{ opt.label }}</span>
              </div>
              <Icon
                v-if="isSelected(opt)"
                icon="solar:check-circle-bold"
                class="text-base shrink-0 text-white"
              />
            </div>

            <!-- Empty placeholder if no matches -->
            <div v-if="filteredOptions.length === 0" class="p-4 text-center text-gray-400 text-xs">
              Variantlar topilmadi
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "FormSelect",
  components: {
    Icon,
  },
  props: {
    modelValue: {
      type: [String, Number, Boolean, null],
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: "Tanlang...",
    },
    icon: {
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
    clearable: {
      type: Boolean,
      default: false,
    },
    searchable: {
      type: Boolean,
      default: null,
    },
    error: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      isOpen: false,
      searchQuery: "",
      inputRect: null,
    };
  },
  computed: {
    normalizedOptions() {
      if (!Array.isArray(this.options)) return [];
      return this.options.map((opt) => {
        if (opt === null || opt === undefined) {
          return { value: "", label: "—" };
        }
        if (typeof opt === "object") {
          return {
            value: opt.value !== undefined ? opt.value : opt.id !== undefined ? opt.id : opt,
            label: opt.label !== undefined ? opt.label : opt.name || opt.title || String(opt.value),
            icon: opt.icon || null,
          };
        }
        return {
          value: opt,
          label: String(opt),
          icon: null,
        };
      });
    },
    selectedOption() {
      if (this.modelValue === "" || this.modelValue === null || this.modelValue === undefined) {
        return null;
      }
      return (
        this.normalizedOptions.find((opt) => String(opt.value) === String(this.modelValue)) || null
      );
    },
    isSearchable() {
      if (this.searchable !== null) return this.searchable;
      return this.normalizedOptions.length > 5;
    },
    filteredOptions() {
      if (!this.searchQuery.trim()) return this.normalizedOptions;
      const q = this.searchQuery.toLowerCase();
      return this.normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(q));
    },
    dropdownStyle() {
      if (!this.inputRect) return {};
      const width = Math.max(this.inputRect.width, 220);
      let left = this.inputRect.left;
      if (left + width > window.innerWidth - 10) {
        left = window.innerWidth - width - 10;
      }
      if (left < 10) left = 10;

      const spaceBelow = window.innerHeight - this.inputRect.bottom;
      const spaceAbove = this.inputRect.top;

      // If tight space below, open upwards
      if (spaceBelow < 250 && spaceAbove > 250) {
        return {
          bottom: `${window.innerHeight - this.inputRect.top + 6}px`,
          left: `${left}px`,
          width: `${width}px`,
        };
      }

      return {
        top: `${this.inputRect.bottom + 6}px`,
        left: `${left}px`,
        width: `${width}px`,
      };
    },
  },
  methods: {
    updateRect() {
      if (this.$refs.triggerRef) {
        this.inputRect = this.$refs.triggerRef.getBoundingClientRect();
      }
    },
    toggleDropdown() {
      if (this.disabled) return;
      if (!this.isOpen) {
        this.updateRect();
        this.isOpen = true;
        this.searchQuery = "";
        if (this.isSearchable) {
          this.$nextTick(() => {
            if (this.$refs.searchInput) {
              this.$refs.searchInput.focus();
            }
          });
        }
      } else {
        this.isOpen = false;
      }
    },
    closeDropdown() {
      this.isOpen = false;
      this.searchQuery = "";
    },
    selectOption(opt) {
      this.$emit("update:modelValue", opt.value);
      this.$emit("change", opt.value);
      this.closeDropdown();
    },
    clearSelection() {
      this.$emit("update:modelValue", "");
      this.$emit("change", "");
      this.searchQuery = "";
    },
    isSelected(opt) {
      if (this.modelValue === "" || this.modelValue === null || this.modelValue === undefined) {
        return false;
      }
      return String(opt.value) === String(this.modelValue);
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
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
