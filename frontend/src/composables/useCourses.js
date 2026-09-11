import { computed, onMounted, ref } from "vue";

import { courseService } from "@/services/course.service";

/**
 * Composable for Course Management
 */
export function useCourses() {
  const courses = ref([]);
  const loading = ref(false);
  const alertMessage = ref("");
  const newCourse = ref({
    name: "",
    price: 650000,
    duration: 6,
    lessonCount: 12,
    description: "",
  });

  const fetchCourses = async () => {
    loading.value = true;
    try {
      courses.value = await courseService.getAll();
    } catch (err) {
      console.error("[useCourses] Error fetching courses:", err);
      courses.value = [];
    } finally {
      loading.value = false;
    }
  };

  const averagePrice = computed(() => {
    if (!courses.value.length) return 0;
    const sum = courses.value.reduce((acc, c) => acc + (c.price || 0), 0);
    return Math.round(sum / courses.value.length);
  });

  const totalCourses = computed(() => courses.value.length);

  const addCourse = async (payload) => {
    try {
      await courseService.create(payload || newCourse.value);
      alertMessage.value = "Yangi kurs muvaffaqiyatli qo'shildi!";
      newCourse.value = {
        name: "",
        price: 650000,
        duration: 6,
        lessonCount: 12,
        description: "",
      };
      await fetchCourses();
      return true;
    } catch (err) {
      alert(err.message || "Kurs yaratishda xatolik");
      return false;
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm("Haqiqatdan ham bu kursni o'chirmoqchimisiz?")) return false;
    try {
      await courseService.delete(id);
      alertMessage.value = "Kurs o'chirildi!";
      setTimeout(() => {
        alertMessage.value = "";
      }, 4000);
      await fetchCourses();
      return true;
    } catch (err) {
      alert(err.message || "O'chirishda xatolik");
      return false;
    }
  };

  onMounted(() => {
    fetchCourses();
  });

  return {
    courses,
    loading,
    alertMessage,
    newCourse,
    averagePrice,
    totalCourses,
    fetchCourses,
    addCourse,
    deleteCourse,
  };
}
