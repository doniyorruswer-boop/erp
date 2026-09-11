import { computed, onMounted, ref } from "vue";

import { groupService } from "@/services/group.service";

export function useGroups() {
  const groups = ref([]);
  const courses = ref([]);
  const teachers = ref([]);
  const rooms = ref([]);
  const loading = ref(false);
  const alertMessage = ref("");
  const generatingGroupId = ref(null);

  const newGroup = ref({
    name: "",
    courseId: "",
    teacherId: "",
    roomId: "",
    days: "ODD_DAYS",
    startTime: "14:00",
    endTime: "16:00",
    startDate: "",
    endDate: "",
  });

  const fetchGroups = async () => {
    loading.value = true;
    try {
      groups.value = await groupService.getAll();
    } catch (err) {
      console.error("[useGroups] Error fetching groups:", err);
      groups.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchResources = async () => {
    const res = await groupService.getRelatedResources();
    courses.value = res.courses;
    teachers.value = res.teachers;
    rooms.value = res.rooms;
  };

  const activeGroupsCount = computed(
    () => groups.value.filter((g) => g.status === "ACTIVE").length
  );

  const totalEnrolledStudents = computed(() =>
    groups.value.reduce((acc, g) => acc + (g._count?.enrollments || 0), 0)
  );

  const formatUZS = (val) => {
    if (!val) return "0 so'm";
    return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
  };

  const courseOptions = computed(() =>
    courses.value.map((c) => ({
      value: c.id,
      label: `${c.name} (${formatUZS(c.price)})`,
    }))
  );

  const teacherOptions = computed(() => [
    { value: "", label: "O'qituvchi tanlanmagan" },
    ...teachers.value.map((t) => ({
      value: t.id,
      label: `${t.firstName} ${t.lastName}`,
    })),
  ]);

  const roomOptions = computed(() => [
    { value: "", label: "Xona tanlanmagan" },
    ...rooms.value.map((r) => ({
      value: r.id,
      label: `${r.name} (${r.capacity} o'rin)`,
    })),
  ]);

  const addGroup = async (payload) => {
    try {
      await groupService.create(payload || newGroup.value);
      alertMessage.value = "Yangi guruh muvaffaqiyatli ochildi!";
      newGroup.value = {
        name: "",
        courseId: "",
        teacherId: "",
        roomId: "",
        days: "ODD_DAYS",
        startTime: "14:00",
        endTime: "16:00",
        startDate: "",
        endDate: "",
      };
      await fetchGroups();
      return true;
    } catch (err) {
      alert(err.message || "Guruh yaratishda xatolik");
      return false;
    }
  };

  const deleteGroup = async (id) => {
    if (!confirm("Haqiqatdan ham bu guruhni o'chirmoqchimisiz?")) return false;
    try {
      await groupService.delete(id);
      alertMessage.value = "Guruh o'chirildi!";
      setTimeout(() => {
        alertMessage.value = "";
      }, 4000);
      await fetchGroups();
      return true;
    } catch (err) {
      alert(err.message || "O'chirishda xatolik");
      return false;
    }
  };

  const generateLessons = async (groupId) => {
    generatingGroupId.value = groupId;
    try {
      await groupService.generateLessons(groupId);
      alertMessage.value = "Guruh uchun darslar muvaffaqiyatli yaratildi!";
      setTimeout(() => {
        alertMessage.value = "";
      }, 4000);
      await fetchGroups();
    } catch (err) {
      alert(err.message || "Darslarni yaratishda xatolik");
    } finally {
      generatingGroupId.value = null;
    }
  };

  onMounted(() => {
    fetchGroups();
    fetchResources();
  });

  return {
    groups,
    courses,
    teachers,
    rooms,
    loading,
    alertMessage,
    generatingGroupId,
    newGroup,
    activeGroupsCount,
    totalEnrolledStudents,
    courseOptions,
    teacherOptions,
    roomOptions,
    fetchGroups,
    addGroup,
    deleteGroup,
    generateLessons,
  };
}
