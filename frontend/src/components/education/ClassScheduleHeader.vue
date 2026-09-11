<template>
  <div class="class-schedule-header space-y-4 font-lexend">
    <!-- 1. Breadcrumb va Sinf tanlash navigatsiyasi -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <Breadcrumb
        :items="[
          { title: 'O\'quv jarayoni', to: '/education/schedule' },
          { title: 'Dars jadvali', to: '/education/schedule' },
          { title: currentClass.name },
        ]"
      />

      <div class="flex items-center gap-2.5">
        <!-- Sinfni tezkor almashtirish triggeri -->
        <div class="flex items-center gap-2 text-xs">
          <span class="text-gray-500 dark:text-gray-400 font-medium">Sinf:</span>
          <div ref="triggerRef" class="inline-block">
            <AppButton variant="outline" size="md" @click="toggleDropdown">
              <span class="font-bold text-gray-800 dark:text-gray-100">
                {{ currentClass.name }} ({{ currentClass.stageLabel }})
              </span>
            </AppButton>
          </div>
        </div>

        <!-- Orqaga qaytish tugmasi -->
        <AppButton
          variant="outline"
          size="md"
          icon="solar:arrow-left-linear"
          to="/education/schedule"
        >
          Sinflarga qaytish
        </AppButton>
      </div>
    </div>

    <!-- Teleported Floating Dropdown Menu: sahifa scrollini buzmasligi uchun body ga teleport qilindi -->
    <Teleport to="body">
      <div v-if="isDropdownOpen">
        <!-- Transparent Backdrop: tashqariga bosilganda yopish -->
        <div class="fixed inset-0 z-[9998] bg-transparent" @click="closeDropdown" />

        <!-- Popover list: mustaqil scroll bo'ladi, sahifaga ta'sir qilmaydi -->
        <div
          ref="dropdownMenu"
          :style="dropdownStyle"
          class="custom-dropdown-scroll fixed z-[9999] min-w-[220px] max-h-64 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5 font-lexend animate-fade-in"
          @wheel.stop
          @touchmove.stop
        >
          <button
            v-for="c in allClasses"
            :key="c.id"
            type="button"
            class="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700/80 flex items-center justify-between transition cursor-pointer"
            :class="
              c.id === activeClassId
                ? 'text-primary font-bold bg-primary/5 dark:bg-primary/20'
                : 'text-gray-700 dark:text-gray-200'
            "
            @click="selectClass(c.id)"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                :style="{ backgroundColor: c.color || '#3b82f6' }"
              ></span>
              <span>{{ c.name }} ({{ c.stageLabel }})</span>
            </div>
            <Icon
              v-if="c.id === activeClassId"
              icon="solar:check-circle-bold"
              class="text-primary text-sm shrink-0"
            />
          </button>
        </div>
      </div>
    </Teleport>

    <!-- 2. Chorak sarlavhasi va Generatsiya paneli -->
    <div
      class="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800/80 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 shadow-2xs"
    >
      <div class="flex items-center gap-3 flex-wrap">
        <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          {{ activeQuarter.name }} | {{ activeQuarter.dateRangeText }}
        </h2>
        <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-white shadow-2xs">
          {{ currentClass.name }} sinf
        </span>
      </div>

      <div class="flex items-center gap-2">
        <AppButton
          variant="outline"
          icon="solar:document-medicine-bold"
          @click="$emit('open-templates')"
        >
          Shablonlar
        </AppButton>
        <AppButton variant="primary" icon="solar:restart-bold" @click="$emit('generate')">
          Generatsiya
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { SCHOOL_QUARTERS } from "@/api/scheduleData";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";

export default {
  name: "ClassScheduleHeader",
  components: {
    Icon,
    Breadcrumb,
    AppButton,
  },
  props: {
    currentClass: {
      type: Object,
      required: true,
    },
    allClasses: {
      type: Array,
      default: () => [],
    },
    activeClassId: {
      type: String,
      required: true,
    },
    quarters: {
      type: Array,
      default: () => SCHOOL_QUARTERS,
    },
    activeQuarterId: {
      type: String,
      default: "1",
    },
    weeksCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["change-class", "change-quarter", "generate", "open-templates"],
  data() {
    return {
      isDropdownOpen: false,
      triggerRect: null,
    };
  },
  computed: {
    activeQuarter() {
      return (
        this.quarters.find((q) => q.id === this.activeQuarterId) ||
        this.quarters[0] || {
          name: "1-CHORAK",
          dateRangeText: "02.09.2025 - 03.11.2025",
        }
      );
    },
    dropdownStyle() {
      if (!this.triggerRect) return {};
      const width = Math.max(this.triggerRect.width, 220);
      let left = this.triggerRect.left;
      if (left + width > window.innerWidth - 10) {
        left = window.innerWidth - width - 10;
      }
      if (left < 10) left = 10;

      const spaceBelow = window.innerHeight - this.triggerRect.bottom;
      const spaceAbove = this.triggerRect.top;

      if (spaceBelow < 250 && spaceAbove > 250) {
        return {
          bottom: `${window.innerHeight - this.triggerRect.top + 6}px`,
          left: `${left}px`,
          width: `${width}px`,
        };
      }

      return {
        top: `${this.triggerRect.bottom + 6}px`,
        left: `${left}px`,
        width: `${width}px`,
      };
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll, true);
    window.addEventListener("resize", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll, true);
    window.removeEventListener("resize", this.handleScroll);
  },
  methods: {
    updateRect() {
      if (this.$refs.triggerRef) {
        this.triggerRect = this.$refs.triggerRef.getBoundingClientRect();
      }
    },
    toggleDropdown() {
      if (!this.isDropdownOpen) {
        this.updateRect();
        this.isDropdownOpen = true;
      } else {
        this.isDropdownOpen = false;
      }
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
    selectClass(classId) {
      this.$emit("change-class", classId);
      this.isDropdownOpen = false;
    },
    handleScroll() {
      if (this.isDropdownOpen) {
        this.updateRect();
      }
    },
  },
};
</script>

<style scoped>
.custom-dropdown-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-dropdown-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-dropdown-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.4);
  border-radius: 9999px;
}
.custom-dropdown-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7);
}

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
