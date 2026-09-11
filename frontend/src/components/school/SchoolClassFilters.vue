<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-3.5 shadow-2xs"
  >
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <!-- Chap tomon: Qidiruv qatori -->
      <div class="relative w-full sm:w-64 md:w-72">
        <Icon
          icon="solar:magnifer-linear"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
        />
        <input
          :value="filters.search"
          type="text"
          placeholder="O'quvchi ismi, ID, JSHSHIR yoki pasport..."
          class="w-full pl-9 pr-3.5 h-9 sm:h-9.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-2xs"
          @input="updateField('search', $event.target.value)"
        />
      </div>

      <!-- O'ng tomon: Filter tugmalari va tozalash -->
      <div class="flex items-center justify-end gap-2 sm:gap-2.5 flex-wrap flex-1">
        <!-- 1. Sinf Dropdown -->
        <div class="relative filter-dropdown-container">
          <button
            type="button"
            :class="[
              'h-9 sm:h-9.5 px-3 rounded-lg border bg-white dark:bg-gray-900 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs group shrink-0 whitespace-nowrap',
              activeDropdown === 'class'
                ? 'border-primary ring-2 ring-primary/20 text-primary'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400',
            ]"
            @click.stop="toggleDropdown('class')"
          >
            <Icon
              icon="solar:users-group-rounded-bold"
              class="text-base text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors"
            />
            <span>{{ tenantStore.classLabel }}: {{ filters.selectedClass || "Barchasi" }}</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              class="text-xs text-gray-400 ml-1 transition-transform"
              :class="{ 'rotate-180': activeDropdown === 'class' }"
            />
          </button>

          <Transition name="fade">
            <div
              v-if="activeDropdown === 'class'"
              class="absolute right-0 mt-2 min-w-[200px] max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1"
              @click.stop
            >
              <div
                v-for="opt in classOptions"
                :key="opt.value"
                :class="[
                  'px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition',
                  filters.selectedClass === opt.value
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-gray-700 dark:text-gray-200',
                ]"
                @click="selectFilter('selectedClass', opt.value)"
              >
                <span>{{ opt.label }}</span>
                <Icon
                  v-if="filters.selectedClass === opt.value"
                  icon="solar:check-circle-bold"
                  class="text-primary text-sm"
                />
              </div>
            </div>
          </Transition>
        </div>

        <!-- 2. Holati Dropdown -->
        <div class="relative filter-dropdown-container">
          <button
            type="button"
            :class="[
              'h-9 sm:h-9.5 px-3 rounded-lg border bg-white dark:bg-gray-900 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs group shrink-0 whitespace-nowrap',
              activeDropdown === 'status'
                ? 'border-primary ring-2 ring-primary/20 text-primary'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400',
            ]"
            @click.stop="toggleDropdown('status')"
          >
            <Icon
              icon="ri:user-follow-fill"
              class="text-base text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors"
            />
            <span>Holati: {{ filters.status || "Barchasi" }}</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              class="text-xs text-gray-400 ml-1 transition-transform"
              :class="{ 'rotate-180': activeDropdown === 'status' }"
            />
          </button>

          <Transition name="fade">
            <div
              v-if="activeDropdown === 'status'"
              class="absolute right-0 mt-2 min-w-[190px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1"
              @click.stop
            >
              <div
                v-for="opt in statusOptions"
                :key="opt.value"
                :class="[
                  'px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition',
                  filters.status === opt.value
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-gray-700 dark:text-gray-200',
                ]"
                @click="selectFilter('status', opt.value)"
              >
                <span>{{ opt.label }}</span>
                <Icon
                  v-if="filters.status === opt.value"
                  icon="solar:check-circle-bold"
                  class="text-primary text-sm"
                />
              </div>
            </div>
          </Transition>
        </div>

        <!-- 3. Ta'lim tili Dropdown -->
        <div class="relative filter-dropdown-container">
          <button
            type="button"
            :class="[
              'h-9 sm:h-9.5 px-3 rounded-lg border bg-white dark:bg-gray-900 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs group shrink-0 whitespace-nowrap',
              activeDropdown === 'language'
                ? 'border-primary ring-2 ring-primary/20 text-primary'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400',
            ]"
            @click.stop="toggleDropdown('language')"
          >
            <Icon
              icon="solar:global-linear"
              class="text-base text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors"
            />
            <span>Tili: {{ filters.language || "Barchasi" }}</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              class="text-xs text-gray-400 ml-1 transition-transform"
              :class="{ 'rotate-180': activeDropdown === 'language' }"
            />
          </button>

          <Transition name="fade">
            <div
              v-if="activeDropdown === 'language'"
              class="absolute right-0 mt-2 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1"
              @click.stop
            >
              <div
                v-for="opt in languageOptions"
                :key="opt.value"
                :class="[
                  'px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition',
                  filters.language === opt.value
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-gray-700 dark:text-gray-200',
                ]"
                @click="selectFilter('language', opt.value)"
              >
                <span>{{ opt.label }}</span>
                <Icon
                  v-if="filters.language === opt.value"
                  icon="solar:check-circle-bold"
                  class="text-primary text-sm"
                />
              </div>
            </div>
          </Transition>
        </div>

        <!-- 4. Smena Dropdown -->
        <div class="relative filter-dropdown-container">
          <button
            type="button"
            :class="[
              'h-9 sm:h-9.5 px-3 rounded-lg border bg-white dark:bg-gray-900 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs group shrink-0 whitespace-nowrap',
              activeDropdown === 'shift'
                ? 'border-primary ring-2 ring-primary/20 text-primary'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400',
            ]"
            @click.stop="toggleDropdown('shift')"
          >
            <Icon
              icon="solar:clock-circle-linear"
              class="text-base text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors"
            />
            <span>Smena: {{ filters.shift || "Barchasi" }}</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              class="text-xs text-gray-400 ml-1 transition-transform"
              :class="{ 'rotate-180': activeDropdown === 'shift' }"
            />
          </button>

          <Transition name="fade">
            <div
              v-if="activeDropdown === 'shift'"
              class="absolute right-0 mt-2 min-w-[220px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1"
              @click.stop
            >
              <div
                v-for="opt in shiftOptions"
                :key="opt.value"
                :class="[
                  'px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition',
                  filters.shift === opt.value
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-gray-700 dark:text-gray-200',
                ]"
                @click="selectFilter('shift', opt.value)"
              >
                <span>{{ opt.label }}</span>
                <Icon
                  v-if="filters.shift === opt.value"
                  icon="solar:check-circle-bold"
                  class="text-primary text-sm"
                />
              </div>
            </div>
          </Transition>
        </div>

        <!-- 5. O'quv yili Dropdown -->
        <div class="relative filter-dropdown-container">
          <button
            type="button"
            :class="[
              'h-9 sm:h-9.5 px-3 rounded-lg border bg-white dark:bg-gray-900 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs group shrink-0 whitespace-nowrap',
              activeDropdown === 'year'
                ? 'border-primary ring-2 ring-primary/20 text-primary'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400',
            ]"
            @click.stop="toggleDropdown('year')"
          >
            <Icon
              icon="solar:calendar-bold"
              class="text-base text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors"
            />
            <span>{{ filters.academicYear }}</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              class="text-xs text-gray-400 ml-1 transition-transform"
              :class="{ 'rotate-180': activeDropdown === 'year' }"
            />
          </button>

          <Transition name="fade">
            <div
              v-if="activeDropdown === 'year'"
              class="absolute right-0 mt-2 min-w-[190px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1"
              @click.stop
            >
              <div
                v-for="opt in yearOptions"
                :key="opt.value"
                :class="[
                  'px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition',
                  filters.academicYear === opt.value
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-gray-700 dark:text-gray-200',
                ]"
                @click="selectFilter('academicYear', opt.value)"
              >
                <span>{{ opt.label }}</span>
                <Icon
                  v-if="filters.academicYear === opt.value"
                  icon="solar:check-circle-bold"
                  class="text-primary text-sm"
                />
              </div>
            </div>
          </Transition>
        </div>

        <!-- Filtrlarni tozalash tugmasi -->
        <button
          v-if="isFiltered"
          type="button"
          class="h-9 sm:h-9.5 px-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs whitespace-nowrap"
          title="Filtrlarni tozalash"
          @click="$emit('reset')"
        >
          <Icon icon="solar:restart-linear" class="text-sm" />
          <span>Tozalash</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { useTenantStore } from "@/store/tenant";

export default {
  name: "SchoolClassFilters",
  components: {
    Icon,
  },
  props: {
    filters: {
      type: Object,
      required: true,
    },
    isFiltered: {
      type: Boolean,
      default: false,
    },
    classOptions: {
      type: Array,
      default: () => [],
    },
    statusOptions: {
      type: Array,
      default: () => [],
    },
    languageOptions: {
      type: Array,
      default: () => [],
    },
    shiftOptions: {
      type: Array,
      default: () => [],
    },
    yearOptions: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:filters", "reset"],
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      activeDropdown: null,
    };
  },
  mounted() {
    document.addEventListener("click", this.handleDocumentClick);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleDocumentClick);
  },
  methods: {
    toggleDropdown(name) {
      this.activeDropdown = this.activeDropdown === name ? null : name;
    },
    selectFilter(key, value) {
      this.$emit("update:filters", {
        ...this.filters,
        [key]: value,
      });
      this.activeDropdown = null;
    },
    updateField(key, value) {
      this.$emit("update:filters", {
        ...this.filters,
        [key]: value,
      });
    },
    handleDocumentClick(e) {
      if (!e.target.closest(".filter-dropdown-container")) {
        this.activeDropdown = null;
      }
    },
  },
};
</script>
