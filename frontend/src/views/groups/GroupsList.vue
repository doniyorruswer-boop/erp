<script setup>
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import { RouterLink } from "vue-router";

import Alert from "@/components/Alert.vue";
import Badge from "@/components/Badge.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import GroupCreateModal from "@/components/groups/GroupCreateModal.vue";
import GroupStatsCards from "@/components/groups/GroupStatsCards.vue";
import { useGroups } from "@/composables/useGroups";
import { formatDate } from "@/helper/formatters";

const {
  groups,
  loading,
  alertMessage,
  generatingGroupId,
  activeGroupsCount,
  totalEnrolledStudents,
  courseOptions,
  teacherOptions,
  roomOptions,
  addGroup,
  generateLessons,
} = useGroups();

const createModal = ref(null);

const formatDays = (days) => {
  const map = {
    ODD_DAYS: "Du - Cho - Ju",
    EVEN_DAYS: "Se - Pay - Sha",
    EVERYDAY: "Har kuni",
    WEEKEND: "Shanba - Yakshanba",
  };
  return map[days] || days || "-";
};

const handleGenerateLessons = (group) => {
  generateLessons(group.id);
};
</script>

<template>
  <div class="groups-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Guruhlar' }]" />

    <!-- Header & Trigger -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Guruhlar</h1>
        <p class="text-sm text-gray-400">O'quv markazidagi barcha dars guruhlari va jadvallar</p>
      </div>

      <AppButton
        variant="primary"
        icon="ic:round-add"
        icon-class="text-lg"
        @click="createModal?.open()"
      >
        Yangi Guruh
      </AppButton>
    </div>

    <!-- Floating Alert Toast -->
    <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

    <!-- Stats Cards -->
    <GroupStatsCards
      :total-count="groups.length"
      :active-count="activeGroupsCount"
      :total-enrolled="totalEnrolledStudents"
    />

    <!-- Groups Grid -->
    <LoadingSpinner v-if="loading" size="md" text="Guruhlar yuklanmoqda..." />
    <div
      v-else-if="groups.length === 0"
      class="text-center py-10 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700 text-gray-400"
    >
      Guruhlar mavjud emas.
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="group in groups"
        :key="group.id"
        class="card bg-white dark:bg-gray-800 p-5 rounded-md border dark:border-gray-700 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-2">
            <Badge variant="primary" size="xs">
              {{ group.course?.name }}
            </Badge>
            <Badge
              :variant="
                group.status === 'ACTIVE'
                  ? 'success'
                  : group.status === 'PLANNING'
                    ? 'warning'
                    : 'neutral'
              "
              :dot="true"
              size="xs"
            >
              {{
                group.status === "ACTIVE"
                  ? "Faol"
                  : group.status === "PLANNING"
                    ? "Rejalashtirilgan"
                    : "Tugagan"
              }}
            </Badge>
          </div>

          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mt-2">
            {{ group.name }}
          </h3>

          <div
            class="space-y-1 text-xs text-gray-600 dark:text-gray-300 my-3 py-2 border-t border-b dark:border-gray-700"
          >
            <div>
              <span class="text-gray-400">O'qituvchi:</span>
              {{ group.teacher ? group.teacher.firstName + " " + group.teacher.lastName : "-" }}
            </div>
            <div>
              <span class="text-gray-400">Kunlar:</span>
              {{ formatDays(group.days) }} ({{ group.startTime }} - {{ group.endTime }})
            </div>
            <div>
              <span class="text-gray-400">Xona:</span>
              {{ group.room?.name || "-" }}
            </div>
            <div v-if="group.startDate || group.endDate">
              <span class="text-gray-400">Davr:</span>
              {{ formatDate(group.startDate) }} —
              {{ formatDate(group.endDate) }}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2.5 pt-3 border-t dark:border-gray-700">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-700 dark:text-gray-200">
              {{ group._count?.enrollments || 0 }} ta o'quvchi
            </span>
            <span
              class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-medium"
            >
              <Icon icon="solar:notes-linear" class="text-xs" />
              {{ group._count?.lessons || 0 }} ta dars
            </span>
          </div>

          <div class="flex items-center gap-2 mt-1">
            <button
              type="button"
              :disabled="generatingGroupId === group.id"
              class="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs px-2.5 py-2 rounded-md transition font-medium disabled:opacity-50"
              title="Guruh jadvali asosida darslarni avtomatik generatsiya qilish"
              @click="handleGenerateLessons(group)"
            >
              <Icon
                :icon="
                  generatingGroupId === group.id
                    ? 'line-md:loading-loop'
                    : 'solar:calendar-add-bold'
                "
                class="text-sm shrink-0"
              />
              <span class="truncate">{{
                generatingGroupId === group.id ? "Generatsiya..." : "Darslarni generatsiya qilish"
              }}</span>
            </button>

            <RouterLink
              :to="`/attendance?groupId=${group.id}`"
              class="inline-flex items-center gap-1 bg-primary text-white text-xs px-3 py-2 rounded-md hover:bg-opacity-90 transition font-medium shadow-sm shrink-0"
            >
              <Icon icon="fluent:calendar-checkmark-24-filled" class="text-sm" />
              <span>Davomat</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Group Modal -->
    <GroupCreateModal
      ref="createModal"
      :course-options="courseOptions"
      :teacher-options="teacherOptions"
      :room-options="roomOptions"
      @submit="addGroup"
    />
  </div>
</template>
