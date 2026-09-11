import { computed, onMounted, ref } from "vue";

import {
  addSchoolStudent,
  deleteSchoolStudent,
  loadSchoolStudents,
  recordStudentPayment,
  syncSchoolStudentsWithBackend,
  updateSchoolStudent,
} from "@/api/schoolStudentsData";
import { CLASS_NAMES_LIST } from "@/components/school/students/constants";
import toast from "@/utils/toast";

import { useConfirmModal } from "./useConfirmModal";
import { useFormatters } from "./useFormatters";
import { usePagination } from "./usePagination";

export function useSchoolStudents() {
  const { formatMoney } = useFormatters();

  // 1. Asosiy Ro'yxat Holati
  const studentsList = ref([]);
  const selectedStudentIds = ref([]);

  // 2. Filtrlar Holati
  const searchQuery = ref("");
  const selectedClass = ref("ALL");
  const selectedStage = ref("ALL");
  const selectedDebtFilter = ref("ALL");
  const activeDateChip = ref("ALL");
  const customDateFrom = ref(null);
  const customDateTo = ref(null);

  // 3. Modallar Holati
  const showCreateModal = ref(false);
  const showEditModal = ref(false);
  const showPaymentModal = ref(false);
  const editingStudent = ref(null);
  const payingStudent = ref(null);

  const deleteModal = useConfirmModal();
  const bulkDeleteModal = useConfirmModal();

  const classOptions = computed(() =>
    CLASS_NAMES_LIST.map((c) => ({ label: `${c} sinf`, value: c }))
  );

  // 4. Filtrlangan Ma'lumotlar
  const filteredStudents = computed(() => {
    let list = [...studentsList.value];

    const q = searchQuery.value.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          (s.phone && s.phone.replace(/\D/g, "").includes(q)) ||
          (s.parentName && s.parentName.toLowerCase().includes(q))
      );
    }

    if (selectedClass.value !== "ALL") {
      list = list.filter((s) => s.className === selectedClass.value);
    }

    if (selectedStage.value !== "ALL") {
      list = list.filter((s) => s.stage === selectedStage.value);
    }

    if (selectedDebtFilter.value === "DEBT") {
      list = list.filter((s) => (s.debt || 0) > 0);
    } else if (selectedDebtFilter.value === "NO_DEBT") {
      list = list.filter((s) => (s.debt || 0) === 0);
    }

    return list;
  });

  // Composable Pagination
  const pagination = usePagination(filteredStudents, { initialPerPage: 10 });

  const paidCount = computed(() => studentsList.value.filter((s) => (s.debt || 0) === 0).length);
  const debtCount = computed(() => studentsList.value.filter((s) => (s.debt || 0) > 0).length);
  const isFiltered = computed(() =>
    Boolean(
      searchQuery.value ||
      selectedClass.value !== "ALL" ||
      selectedStage.value !== "ALL" ||
      selectedDebtFilter.value !== "ALL"
    )
  );

  // 5. Harakatlar va Metodlar
  function fetchStudents() {
    studentsList.value = loadSchoolStudents();
  }

  async function syncBackend() {
    try {
      const synced = await syncSchoolStudentsWithBackend();
      if (Array.isArray(synced) && synced.length > 0) {
        studentsList.value = synced;
      }
    } catch (err) {
      console.warn("Backenddan o'quvchilarni sinxronlashda xatolik:", err);
    }
  }

  function handleCreateStudent(payload) {
    const created = addSchoolStudent(payload);
    fetchStudents();
    toast.success(`${created.fullName} muvaffaqiyatli qo'shildi!`, "Yangi o'quvchi");
  }

  function handleEditStudent(payload) {
    updateSchoolStudent(payload.id, payload);
    fetchStudents();
    toast.success("O'quvchi ma'lumotlari yangilandi!", "Muvaffaqiyatli");
  }

  function handlePaymentConfirm(payload) {
    recordStudentPayment(payload.studentId, payload.amount, payload.paymentType);
    fetchStudents();
    toast.success(`${formatMoney(payload.amount)} to'lov qabul qilindi!`, "To'lov");
  }

  function openEditModal(st) {
    editingStudent.value = st;
    showEditModal.value = true;
  }

  function openPaymentModal(st) {
    payingStudent.value = st;
    showPaymentModal.value = true;
  }

  function confirmDelete(st) {
    deleteModal.open(st);
  }

  function executeDelete() {
    deleteModal.executeConfirm((st) => {
      if (st) {
        deleteSchoolStudent(st.id);
        fetchStudents();
        toast.success(`${st.fullName} tizimdan o'chirildi.`, "O'chirildi");
      }
    });
  }

  function executeBulkDelete() {
    bulkDeleteModal.executeConfirm((ids) => {
      if (ids && ids.length > 0) {
        ids.forEach((id) => deleteSchoolStudent(id));
        selectedStudentIds.value = [];
        fetchStudents();
        toast.success(`${ids.length} ta o'quvchi o'chirildi.`, "Ommaviy o'chirish");
      }
    });
  }

  function resetAllFilters() {
    searchQuery.value = "";
    selectedClass.value = "ALL";
    selectedStage.value = "ALL";
    selectedDebtFilter.value = "ALL";
    activeDateChip.value = "ALL";
    customDateFrom.value = null;
    customDateTo.value = null;
    pagination.resetPage();
  }

  function handleDateRangeChange(payload) {
    customDateFrom.value = payload.start;
    customDateTo.value = payload.end;
    activeDateChip.value = "CUSTOM";
  }

  function exportToExcel() {
    const rows = filteredStudents.value.map((s) => ({
      ID: s.studentId,
      FIO: s.fullName,
      Sinf: s.className,
      Bosqich: s.stage,
      Telefon: s.phone,
      OylikTolv: s.monthlyFee,
      Qarzdorlik: s.debt,
      OtaOnasi: s.parentName || "",
      OtaOnasiTel: s.parentPhone || "",
      Holati: s.status,
    }));

    const headers = Object.keys(rows[0] || {}).join(",");
    const csvContent = rows
      .map((r) =>
        Object.values(r)
          .map((v) => `"${v}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + "\n" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Maktab_Oquvchilari_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel ro'yxat muvaffaqiyatli yuklab olindi!", "Eksport");
  }

  onMounted(() => {
    fetchStudents();
    syncBackend();
  });

  return {
    studentsList,
    selectedStudentIds,
    searchQuery,
    selectedClass,
    selectedStage,
    selectedDebtFilter,
    activeDateChip,
    customDateFrom,
    customDateTo,
    showCreateModal,
    showEditModal,
    showPaymentModal,
    editingStudent,
    payingStudent,
    deleteModal,
    bulkDeleteModal,
    classOptions,
    filteredStudents,
    pagination,
    paidCount,
    debtCount,
    isFiltered,
    fetchStudents,
    handleCreateStudent,
    handleEditStudent,
    handlePaymentConfirm,
    openEditModal,
    openPaymentModal,
    confirmDelete,
    executeDelete,
    executeBulkDelete,
    resetAllFilters,
    handleDateRangeChange,
    exportToExcel,
  };
}

export default useSchoolStudents;
