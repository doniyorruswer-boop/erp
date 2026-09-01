<template>
  <div class="school-classes-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Maktab Sinflari & Fanlar' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Maktab Sinflari</h1>
        <p class="text-sm text-gray-400">1–11 sinflar, sinf rahbarlari va xonalar taqsimoti</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="showAddModal = true"
          class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/90 rounded py-2.5 px-4 font-medium shadow-sm transition cursor-pointer"
        >
          <Icon icon="solar:add-circle-bold" class="text-lg" />
          <span>Yangi Sinf Qo'shish</span>
        </button>
      </div>
    </div>

    <!-- 4 Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard title="Jami Sinflar" :value="`${classes.length} ta`" icon="solar:buildings-3-bold" variant="primary" />
      <StatsCard title="Jami O'quvchilar" :value="`${totalStudents} ta`" icon="ph:student-fill" variant="success" valueClass="text-green-600 dark:text-green-400" />
      <StatsCard title="O'rtacha Sinf Sig'imi" value="24 o'quvchi" icon="solar:users-group-two-rounded-bold" variant="purple" />
      <StatsCard title="Joriy Chorak" value="1-Chorak" icon="solar:calendar-mark-bold" variant="danger" valueClass="text-indigo-600 dark:text-indigo-400" />
    </div>

    <!-- Classes Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="cls in classes"
        :key="cls.id"
        class="card bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center">
                {{ cls.name }}
              </div>
              <div>
                <h3 class="font-bold text-base text-gray-800 dark:text-gray-100">{{ cls.name }} sinfi</h3>
                <span class="text-xs text-gray-400">{{ cls.stage || "Boshlang'ich ta'lim" }}</span>
              </div>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              Faol
            </span>
          </div>

          <div class="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 pt-2 border-t dark:border-gray-700/60">
            <div class="flex items-center justify-between">
              <span class="text-gray-400">Sinf rahbari:</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{ cls.teacherName || "Nilufar Qosimova" }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400">Xona:</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{ cls.roomName || "204-xona" }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400">Ta'lim tili:</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">O'zbekcha</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-3 border-t dark:border-gray-700 text-xs">
          <span class="font-bold text-primary flex items-center gap-1">
            <Icon icon="solar:users-group-rounded-linear" class="text-base" />
            <span>{{ cls.studentsCount || 22 }} ta o'quvchi</span>
          </span>
          <router-link
            :to="`/attendance?classId=${cls.id}`"
            class="text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <span>Jurnal & Davomat</span>
            <Icon icon="solar:alt-arrow-right-linear" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import StatsCard from "@/components/StatsCard.vue";

export default {
  name: "SchoolClassesView",
  components: {
    Icon,
    Breadcrumb,
    StatsCard,
  },
  data() {
    return {
      showAddModal: false,
      classes: [
        { id: "c-1", name: "1-A", stage: "Boshlang'ich", teacherName: "Kamola Karimova", roomName: "101-xona", studentsCount: 22 },
        { id: "c-2", name: "1-B", stage: "Boshlang'ich", teacherName: "Umida Yusupova", roomName: "102-xona", studentsCount: 20 },
        { id: "c-3", name: "2-A", stage: "Boshlang'ich", teacherName: "Dilfuza Alimova", roomName: "103-xona", studentsCount: 24 },
        { id: "c-4", name: "5-A", stage: "O'rta ta'lim", teacherName: "Jasur Rahimov", roomName: "201-xona", studentsCount: 25 },
        { id: "c-5", name: "9-A", stage: "Katta ta'lim", teacherName: "Azizbek Normatov", roomName: "302-xona", studentsCount: 21 },
        { id: "c-6", name: "11-A", stage: "Bitiruvchi sinf", teacherName: "Sardor Ahmedov", roomName: "305-xona", studentsCount: 19 },
      ],
    };
  },
  computed: {
    totalStudents() {
      return this.classes.reduce((acc, c) => acc + (c.studentsCount || 0), 0);
    },
  },
};
</script>
