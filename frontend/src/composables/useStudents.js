import { computed, onMounted, ref } from "vue";

import { studentService } from "@/services/student.service";

/**
 * Composable for Course Center Student Management
 */
export function useStudents() {
  const students = ref([]);
  const loading = ref(false);
  const alertMessage = ref("");
  const statusFilter = ref("");
  const searchQuery = ref("");
  const activeStudent = ref(null);
  const studentToDelete = ref(null);

  const fetchStudents = async () => {
    loading.value = true;
    try {
      students.value = await studentService.getCombinedStudentsList();
    } catch (err) {
      console.error("[useStudents] Error fetching students:", err);
      students.value = [];
    } finally {
      loading.value = false;
    }
  };

  const filteredStudents = computed(() => {
    let list = students.value;
    if (statusFilter.value) {
      list = list.filter((s) => s.status === statusFilter.value);
    }
    if (searchQuery.value && searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      list = list.filter(
        (s) =>
          (s.firstName && s.firstName.toLowerCase().includes(q)) ||
          (s.lastName && s.lastName.toLowerCase().includes(q)) ||
          (s.phone && s.phone.includes(q)) ||
          (s.address && s.address.toLowerCase().includes(q))
      );
    }
    return list;
  });

  const activeCount = computed(() => students.value.filter((s) => s.status === "ACTIVE").length);

  const debtorsCount = computed(() => students.value.filter((s) => (s.balance || 0) < 0).length);

  const totalBalance = computed(() => students.value.reduce((acc, s) => acc + (s.balance || 0), 0));

  const addStudent = async (payload) => {
    try {
      await studentService.create(payload);
      alertMessage.value = "Yangi o'quvchi muvaffaqiyatli qo'shildi!";
      await fetchStudents();
      return true;
    } catch (err) {
      alert(err.message || "Xatolik yuz berdi");
      return false;
    }
  };

  const confirmDelete = (student) => {
    studentToDelete.value = student;
  };

  const executeDeleteStudent = async () => {
    if (!studentToDelete.value) return;
    try {
      await studentService.delete(studentToDelete.value.id);
      alertMessage.value = "O'quvchi o'chirildi!";
      await fetchStudents();
    } catch (err) {
      alert(err.message || "O'chirishda xatolik");
    } finally {
      studentToDelete.value = null;
    }
  };

  const onStudentWizardSaved = async (student) => {
    alertMessage.value = `${student.firstName || ""} ${student.lastName || ""} o'quvchilar safiga muvaffaqiyatli qo'shildi!`;
    await fetchStudents();
  };

  onMounted(() => {
    fetchStudents();
  });

  return {
    students,
    loading,
    alertMessage,
    statusFilter,
    searchQuery,
    activeStudent,
    studentToDelete,
    filteredStudents,
    activeCount,
    debtorsCount,
    totalBalance,
    fetchStudents,
    addStudent,
    confirmDelete,
    executeDeleteStudent,
    onStudentWizardSaved,
  };
}
