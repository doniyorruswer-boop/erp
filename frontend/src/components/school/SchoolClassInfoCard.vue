<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-4.5 shadow-2xs space-y-3.5">
    <!-- Sinf nomi va tafsilotlari -->
    <div>
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        {{ classInfo.name }}
      </h2>
      <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 flex items-center flex-wrap gap-x-3 gap-y-1">
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ classInfo.academicYear }} o'quv yili</span>
        <span>•</span>
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ studentCount }} ta {{ tenantStore.isKindergarten ? "tarbiyalanuvchi" : "o'quvchi" }}</span>
        <span>•</span>
        <span class="flex items-center gap-1.5">
          <Icon icon="solar:user-id-bold" class="text-primary text-base" />
          {{ tenantStore.teacherRoleLabel }}: <strong class="text-gray-900 dark:text-gray-100 font-semibold">{{ classInfo.teacherName || 'Belgilanmagan' }}</strong>
        </span>
      </p>
    </div>

    <!-- Vkladkalar (Tabs) -->
    <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pt-1">
      <button
        type="button"
        @click="$emit('update:activeTab', 'students')"
        :class="[
          'pb-2 px-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer',
          activeTab === 'students'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        ]"
      >
        <Icon icon="ph:student-fill" class="text-lg" />
        <span>{{ tenantStore.isKindergarten ? "Tarbiyalanuvchilar" : "O'quvchilar" }} ({{ studentCount }})</span>
      </button>

      <button
        type="button"
        @click="$emit('update:activeTab', 'payments')"
        :class="[
          'pb-2 px-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer',
          activeTab === 'payments'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        ]"
      >
        <Icon icon="solar:wallet-money-bold" class="text-lg" />
        <span>To'lovlar varaqasi</span>
      </button>

      <button
        type="button"
        @click="$emit('update:activeTab', 'timetable')"
        :class="[
          'pb-2 px-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer',
          activeTab === 'timetable'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        ]"
      >
        <Icon icon="solar:calendar-date-bold" class="text-lg" />
        <span>{{ tenantStore.isKindergarten ? "Kun tartibi & Mashg'ulotlar" : "Dars jadvali & Tarix" }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import { useTenantStore } from "@/store/tenant";

export default {
  name: "SchoolClassInfoCard",
  components: {
    Icon,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  props: {
    classInfo: {
      type: Object,
      required: true,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    activeTab: {
      type: String,
      default: "students",
    },
  },
  emits: ["update:activeTab"],
};
</script>
