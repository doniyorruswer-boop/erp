<template>
  <div class="courses-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Kurslar' }]" />

    <!-- Header & vmodal Trigger -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Kurslar</h1>
        <p class="text-sm text-gray-400">O'quv markazidagi barcha kurslar va narxlar</p>
      </div>

      <vmodal
        ref="addCourseModal"
        title="Yangi Kurs Qo'shish"
        subtitle="Kurs nomi, oylik narxi va davomiyligini kiriting"
        btnText="Yangi Kurs"
        btnIcon="ic:round-add"
        btnColor="bg-primary"
        btnTextSubmit="Saqlash"
        btnTextClose="Bekor qilish"
        @submit="submitAddCourse"
      >
        <template v-slot:Icon>
          <Icon icon="solar:book-bookmark-bold" class="text-3xl text-primary mb-2" />
        </template>
        <template v-slot:body>
          <div class="space-y-3 text-sm text-left">
            <FormInput v-model="newCourse.name" label="Kurs nomi" required placeholder="Masalan: IELTS Intensive" icon="solar:book-bookmark-linear" />
            <FormCurrencyInput v-model="newCourse.price" label="Oylik narxi" required placeholder="650 000" />
            <div class="grid grid-cols-2 gap-3">
              <FormInput v-model="newCourse.duration" label="Davomiyligi (oy)" required type="number" />
              <FormInput v-model="newCourse.lessonCount" label="Darslar soni/oy" required type="number" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tavsif</label>
              <textarea
                v-model="newCourse.description"
                rows="2"
                placeholder="Kurs haqida qisqacha ma'lumot..."
                class="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 p-2.5 outline-none focus:border-primary dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              ></textarea>
            </div>
          </div>
        </template>
      </vmodal>
    </div>

    <!-- Floating Alert Toast -->
    <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      <StatsCard title="Jami Kurslar" :value="`${courses.length} ta`" icon="solar:book-bookmark-bold" variant="primary" />
      <StatsCard title="O'rtacha Kurs Narxi" :value="formatUZS(averagePrice)" icon="solar:wallet-money-bold" variant="purple" valueClass="text-primary" />
    </div>

    <!-- Courses Grid -->
    <LoadingSpinner v-if="loading" size="md" text="Kurslar yuklanmoqda..." />
    <div v-else-if="courses.length === 0" class="text-center py-10 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700 text-gray-400">
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
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ course.name }}</h3>
            <Badge variant="primary" size="xs">
              {{ course._count?.groups || 0 }} ta guruh
            </Badge>
          </div>
          <p class="text-xs text-gray-400 mb-3">{{ course.description || 'Tavsif kiritilmagan' }}</p>

          <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-400">Narxi:</span>
              <span class="font-bold text-gray-800 dark:text-gray-100">{{ formatUZS(course.price) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Davomiyligi:</span>
              <span class="text-gray-600 dark:text-gray-300">{{ course.duration }} oy ({{ course.lessonCount }} dars/oy)</span>
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
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import vmodal from "@/components/modal.vue";
import Alert from "@/components/Alert.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import StatsCard from "@/components/StatsCard.vue";
import Badge from "@/components/Badge.vue";
import FormInput from "@/components/FormInput.vue";
import AppButton from "@/components/AppButton.vue";
import { coursesApi } from "@/api/services";

export default {
  name: "CoursesList",
  components: {
    Icon,
    vmodal,
    Alert,
    Breadcrumb,
    StatsCard,
    Badge,
    FormInput,
    AppButton,
  },
  data() {
    return {
      courses: [],
      loading: false,
      alertMessage: "",
      newCourse: {
        name: "",
        price: 650000,
        duration: 6,
        lessonCount: 12,
        description: "",
      },
    };
  },
  computed: {
    averagePrice() {
      if (!this.courses.length) return 0;
      const sum = this.courses.reduce((acc, c) => acc + (c.price || 0), 0);
      return Math.round(sum / this.courses.length);
    },
  },
  mounted() {
    this.fetchCourses();
  },
  methods: {
    async fetchCourses() {
      this.loading = true;
      try {
        this.courses = await coursesApi.getAll();
      } catch (err) {
        console.error("Kurslar xatoligi:", err);
      } finally {
        this.loading = false;
      }
    },
    formatUZS(val) {
      if (!val) return "0 so'm";
      return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
    },
    async submitAddCourse() {
      try {
        await coursesApi.create(this.newCourse);
        if (this.$refs.addCourseModal) {
          this.$refs.addCourseModal.isOpen = false;
        }
        this.newCourse = { name: "", price: 650000, duration: 6, lessonCount: 12, description: "" };
        this.alertMessage = "Yangi kurs muvaffaqiyatli qo'shildi!";
        await this.fetchCourses();
      } catch (err) {
        alert(err.message || "Kurs yaratishda xatolik");
      }
    },
    async deleteCourse(id) {
      if (!confirm("Haqiqatdan ham bu kursni o'chirmoqchimisiz?")) return;
      try {
        await coursesApi.delete(id);
        this.alertMessage = "Kurs o'chirildi!";
        setTimeout(() => (this.alertMessage = ""), 4000);
        await this.fetchCourses();
      } catch (err) {
        alert(err.message || "O'chirishda xatolik");
      }
    },
  },
};
</script>
