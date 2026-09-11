<script setup>
import { ref } from "vue";

import Alert from "@/components/Alert.vue";
import Badge from "@/components/Badge.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import CourseCreateEditModal from "@/components/courses/CourseCreateEditModal.vue";
import CourseStatsCards from "@/components/courses/CourseStatsCards.vue";
import { useCourses } from "@/composables/useCourses";

const { courses, loading, alertMessage, averagePrice, totalCourses, addCourse, deleteCourse } =
  useCourses();

const courseModal = ref(null);

const formatUZS = (val) => {
  if (!val) return "0 so'm";
  return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
};

const handleCreateCourse = (payload) => {
  addCourse(payload);
};
</script>

<template>
  <div class="courses-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Kurslar' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Kurslar</h1>
        <p class="text-sm text-gray-400">
          O'quv markazidagi mavjud o'quv kurslari va ularning narxlari
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <AppButton
          variant="primary"
          icon="solar:add-circle-bold"
          icon-class="text-lg"
          @click="courseModal?.open()"
        >
          Yangi Kurs Qo'shish
        </AppButton>
      </div>
    </div>

    <!-- Alert Toast -->
    <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

    <!-- 3 Stats Cards -->
    <CourseStatsCards :total-count="totalCourses" :average-price="averagePrice" />

    <!-- Courses Grid -->
    <LoadingSpinner v-if="loading" size="md" text="Kurslar yuklanmoqda..." />
    <div
      v-else-if="courses.length === 0"
      class="text-center py-10 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700 text-gray-400"
    >
      Kurslar mavjud emas.
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="course in courses"
        :key="course.id"
        class="card bg-white dark:bg-gray-800 p-5 rounded-md border dark:border-gray-700 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">
              {{ course.name }}
            </h3>
            <Badge variant="primary" size="xs"> {{ course._count?.groups || 0 }} ta guruh </Badge>
          </div>
          <p class="text-xs text-gray-400 mb-3">
            {{ course.description || "Tavsif kiritilmagan" }}
          </p>

          <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-400">Narxi:</span>
              <span class="font-bold text-gray-800 dark:text-gray-100">{{
                formatUZS(course.price)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Davomiyligi:</span>
              <span class="text-gray-600 dark:text-gray-300">
                {{ course.duration }} oy ({{ course.lessonCount }} dars/oy)
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t dark:border-gray-700 flex justify-end">
          <AppButton
            variant="outline"
            size="sm"
            icon="solar:trash-bin-trash-linear"
            class="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
            @click="deleteCourse(course.id)"
          >
            O'chirish
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Create Course Modal -->
    <CourseCreateEditModal ref="courseModal" @save="handleCreateCourse" />
  </div>
</template>
