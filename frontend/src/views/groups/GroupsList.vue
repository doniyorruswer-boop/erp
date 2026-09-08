<template>
  <div class="groups-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Guruhlar' }]" />

    <!-- Header & vmodal Trigger -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Guruhlar</h1>
        <p class="text-sm text-gray-400">O'quv markazidagi barcha dars guruhlari va jadvallar</p>
      </div>

      <vmodal
        ref="addGroupModal"
        title="Yangi Guruh Ochish"
        subtitle="Guruh nomi, kursi va dars vaqtlarini tanlang"
        btnText="Yangi Guruh"
        btnIcon="ic:round-add"
        btnColor="bg-primary"
        btnTextSubmit="Saqlash"
        btnTextClose="Bekor qilish"
        @submit="submitAddGroup"
      >
        <template v-slot:Icon>
          <Icon icon="ri:team-fill" class="text-3xl text-primary mb-2" />
        </template>
        <template v-slot:body>
          <div class="space-y-3 text-sm text-left">
            <FormInput v-model="newGroup.name" label="Guruh nomi" required placeholder="IELTS-Target-01" icon="ri:team-line" />
            <FormSelect
              v-model="newGroup.courseId"
              label="Kurs"
              required
              :options="courseOptions"
            />
            <FormSelect
              v-model="newGroup.days"
              label="Dars kunlari"
              :options="[
                { value: 'ODD_DAYS', label: 'Dushanba - Chorshanba - Juma (Toq kunlar)' },
                { value: 'EVEN_DAYS', label: 'Seshanba - Payshanba - Shanba (Juft kunlar)' },
                { value: 'EVERYDAY', label: 'Har kuni' },
                { value: 'WEEKEND', label: 'Shanba - Yakshanba' },
              ]"
            />
            <div class="grid grid-cols-2 gap-3">
              <FormSelect
                v-model="newGroup.teacherId"
                label="O'qituvchi"
                :options="teacherOptions"
              />
              <FormSelect
                v-model="newGroup.roomId"
                label="Xona"
                :options="roomOptions"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <FormInput v-model="newGroup.startTime" label="Boshlanish vaqti" required placeholder="14:00" icon="solar:clock-circle-linear" />
              <FormInput v-model="newGroup.endTime" label="Tugash vaqti" required placeholder="16:00" icon="solar:clock-circle-linear" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <FormInput v-model="newGroup.startDate" type="date" label="Boshlanish sanasi" placeholder="2026-09-01" icon="solar:calendar-date-linear" />
              <FormInput v-model="newGroup.endDate" type="date" label="Tugash sanasi" placeholder="2026-11-30" icon="solar:calendar-date-linear" />
            </div>
          </div>
        </template>
      </vmodal>
    </div>

    <!-- Floating Alert Toast -->
    <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      <StatsCard title="Jami Guruhlar" :value="`${groups.length} ta`" icon="ri:team-fill" variant="primary" />
      <StatsCard title="Faol Guruhlar" :value="`${activeGroupsCount} ta`" icon="solar:check-circle-bold" variant="success" valueClass="text-green-600 dark:text-green-400" />
      <StatsCard title="Jami O'quvchilar" :value="`${totalEnrolledStudents} ta`" icon="ph:student-fill" variant="purple" valueClass="text-primary" />
    </div>

    <!-- Groups Grid -->
    <LoadingSpinner v-if="loading" size="md" text="Guruhlar yuklanmoqda..." />
    <div v-else-if="groups.length === 0" class="text-center py-10 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700 text-gray-400">
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
              :variant="group.status === 'ACTIVE' ? 'success' : group.status === 'PLANNING' ? 'warning' : 'neutral'"
              :dot="true"
              size="xs"
            >
              {{ group.status === 'ACTIVE' ? 'Faol' : group.status === 'PLANNING' ? 'Rejalashtirilgan' : 'Tugagan' }}
            </Badge>
          </div>

          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mt-2">{{ group.name }}</h3>

          <div class="space-y-1 text-xs text-gray-600 dark:text-gray-300 my-3 py-2 border-t border-b dark:border-gray-700">
            <div><span class="text-gray-400">O'qituvchi:</span> {{ group.teacher ? group.teacher.firstName + ' ' + group.teacher.lastName : '-' }}</div>
            <div><span class="text-gray-400">Kunlar:</span> {{ formatDays(group.days) }} ({{ group.startTime }} - {{ group.endTime }})</div>
            <div><span class="text-gray-400">Xona:</span> {{ group.room?.name || '-' }}</div>
            <div v-if="group.startDate || group.endDate">
              <span class="text-gray-400">Davr:</span> {{ formatDate(group.startDate) }} — {{ formatDate(group.endDate) }}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2.5 pt-3 border-t dark:border-gray-700">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-700 dark:text-gray-200">
              {{ group._count?.enrollments || 0 }} ta o'quvchi
            </span>
            <span class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-medium">
              <Icon icon="solar:notes-linear" class="text-xs" />
              {{ group._count?.lessons || 0 }} ta dars
            </span>
          </div>

          <div class="flex items-center gap-2 mt-1">
            <button
              type="button"
              :disabled="generatingGroupId === group.id"
              @click="handleGenerateLessons(group)"
              class="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs px-2.5 py-2 rounded-md transition font-medium disabled:opacity-50"
              title="Guruh jadvali asosida darslarni avtomatik generatsiya qilish"
            >
              <Icon
                :icon="generatingGroupId === group.id ? 'line-md:loading-loop' : 'solar:calendar-add-bold'"
                class="text-sm shrink-0"
              />
              <span class="truncate">{{ generatingGroupId === group.id ? 'Generatsiya...' : 'Darslarni generatsiya qilish' }}</span>
            </button>

            <router-link
              :to="`/attendance?groupId=${group.id}`"
              class="inline-flex items-center gap-1 bg-primary text-white text-xs px-3 py-2 rounded-md hover:bg-opacity-90 transition font-medium shadow-sm shrink-0"
            >
              <Icon icon="fluent:calendar-checkmark-24-filled" class="text-sm" />
              <span>Davomat</span>
            </router-link>
          </div>
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
import FormSelect from "@/components/FormSelect.vue";
import { groupsApi, coursesApi, usersApi, roomsApi } from "@/api/services";

export default {
  name: "GroupsList",
  components: {
    Icon,
    vmodal,
    Alert,
    Breadcrumb,
    StatsCard,
    Badge,
    FormInput,
    FormSelect,
  },
  data() {
    return {
      groups: [],
      courses: [],
      teachers: [],
      rooms: [],
      loading: false,
      alertMessage: "",
      generatingGroupId: null,
      newGroup: {
        name: "",
        courseId: "",
        teacherId: "",
        roomId: "",
        days: "ODD_DAYS",
        startTime: "14:00",
        endTime: "16:00",
        startDate: "",
        endDate: "",
      },
    };
  },
  computed: {
    activeGroupsCount() {
      return this.groups.filter((g) => g.status === "ACTIVE").length;
    },
    totalEnrolledStudents() {
      return this.groups.reduce((acc, g) => acc + (g._count?.enrollments || 0), 0);
    },
    courseOptions() {
      return this.courses.map((c) => ({
        value: c.id,
        label: `${c.name} (${this.formatUZS(c.price)})`,
      }));
    },
    teacherOptions() {
      return [
        { value: "", label: "O'qituvchi tanlanmagan" },
        ...this.teachers.map((t) => ({
          value: t.id,
          label: `${t.firstName} ${t.lastName}`,
        })),
      ];
    },
    roomOptions() {
      return [
        { value: "", label: "Xona tanlanmagan" },
        ...this.rooms.map((r) => ({
          value: r.id,
          label: `${r.name} (${r.capacity} o'rin)`,
        })),
      ];
    },
  },
  mounted() {
    this.fetchGroups();
    this.fetchCourses();
    this.fetchTeachers();
    this.fetchRooms();
  },
  methods: {
    async fetchGroups() {
      this.loading = true;
      try {
        this.groups = await groupsApi.getAll();
      } catch (err) {
        console.error("Guruhlar xatoligi:", err);
      } finally {
        this.loading = false;
      }
    },
    async fetchCourses() {
      try {
        this.courses = await coursesApi.getAll();
        if (this.courses.length > 0 && !this.newGroup.courseId) {
          this.newGroup.courseId = this.courses[0].id;
        }
      } catch (err) {
        console.error("Kurslar xatoligi:", err);
      }
    },
    async fetchTeachers() {
      try {
        this.teachers = await usersApi.getAll({ role: "TEACHER" });
      } catch (err) {
        console.error("O'qituvchilar xatoligi:", err);
      }
    },
    async fetchRooms() {
      try {
        this.rooms = await roomsApi.getAll();
      } catch (err) {
        console.error("Xonalar xatoligi:", err);
      }
    },
    formatDays(days) {
      const map = {
        ODD_DAYS: "Dush / Chor / Juma",
        EVEN_DAYS: "Sesh / Pay / Shanba",
        EVERYDAY: "Har kuni",
        WEEKEND: "Shanba / Yakshanba",
        CUSTOM: "Boshqa",
      };
      return map[days] || days;
    },
    formatDate(val) {
      if (!val) return "-";
      const d = new Date(val);
      return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "2-digit", day: "2-digit" });
    },
    formatUZS(val) {
      if (!val) return "0 so'm";
      return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
    },
    async handleGenerateLessons(group) {
      if (this.generatingGroupId) return;
      this.generatingGroupId = group.id;
      try {
        const res = await groupsApi.generateLessons(group.id);
        const count = res?.createdCount ?? 0;
        const msg = res?.message || `${count} ta dars muvaffaqiyatli generatsiya qilindi!`;
        this.alertMessage = msg;
        await this.fetchGroups();
      } catch (err) {
        console.error("Darslarni generatsiya qilishda xatolik:", err);
        alert(err.response?.data?.message || err.message || "Darslarni generatsiya qilishda xatolik yuz berdi");
      } finally {
        this.generatingGroupId = null;
      }
    },
    async submitAddGroup() {
      try {
        await groupsApi.create({
          name: this.newGroup.name,
          courseId: this.newGroup.courseId,
          teacherId: this.newGroup.teacherId || undefined,
          roomId: this.newGroup.roomId || undefined,
          days: this.newGroup.days,
          startTime: this.newGroup.startTime,
          endTime: this.newGroup.endTime,
          startDate: this.newGroup.startDate || undefined,
          endDate: this.newGroup.endDate || undefined,
        });
        if (this.$refs.addGroupModal) {
          this.$refs.addGroupModal.isOpen = false;
        }
        this.newGroup = {
          name: "",
          courseId: this.courses[0]?.id || "",
          teacherId: "",
          roomId: "",
          days: "ODD_DAYS",
          startTime: "14:00",
          endTime: "16:00",
          startDate: "",
          endDate: "",
        };
        this.alertMessage = "Yangi guruh muvaffaqiyatli ochildi!";
        await this.fetchGroups();
      } catch (err) {
        alert(err.message || "Guruh ochishda xatolik");
      }
    },
  },
};
</script>
