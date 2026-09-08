<template>
  <div class="students-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'O\'quvchilar' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">O'quvchilar</h1>
        <p class="text-sm text-gray-400">O'quv markazidagi barcha o'quvchilar ro'yxati va holati</p>
      </div>

      <div class="flex items-center gap-2.5">
        <AppButton
          variant="primary"
          icon="solar:user-plus-bold"
          icon-class="text-lg"
          @click="$refs.studentWizard.open()"
        >
          Yangi O'quvchi Qo'shish
        </AppButton>
      </div>
    </div>

    <!-- Floating Alert Toast -->
    <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

    <!-- 4 Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <StatsCard title="Jami O'quvchilar" :value="`${students.length} ta`" icon="ph:student-fill" variant="primary" />
      <StatsCard title="Faol O'quvchilar" :value="`${activeCount} ta`" icon="ri:user-follow-fill" variant="success" valueClass="text-green-600 dark:text-green-400" />
      <StatsCard title="Qarzdorlar" :value="`${debtorsCount} ta`" icon="solar:danger-triangle-bold" variant="danger" valueClass="text-red-600 dark:text-red-400" />
      <StatsCard title="Umumiy Balans" :value="formatUZS(totalBalance)" icon="solar:wallet-money-bold" variant="purple" valueClass="text-primary" />
    </div>

    <!-- Data Table Component -->
    <DataTable
      title="Barcha O'quvchilar"
      subtitle="O'quvchilar ro'yxati va to'lov holati"
      :columns="columns"
      :data="filteredStudents"
      :loading="loading"
      :searchable="true"
      :showIndex="true"
      :showPerPage="true"
      searchPlaceholder="Ism, telefon yoki manzil..."
      rowKey="id"
    >
      <!-- Header Actions: Status Filter -->
      <template #headerActions>
        <select
          v-model="statusFilter"
          class="py-1.5 px-3 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
        >
          <option value="">Barcha holatlar</option>
          <option value="ACTIVE">Faol o'quvchilar</option>
          <option value="FROZEN">Muzlatilganlar</option>
          <option value="INACTIVE">Nofaollar</option>
        </select>
      </template>

      <!-- Custom Student Cell -->
      <template #cell(firstName)="{ row }">
        <router-link
          :to="`/students/${row.id}`"
          class="font-semibold text-gray-800 dark:text-gray-100 hover:text-primary transition flex items-center gap-1.5"
        >
          <span>{{ row.firstName }} {{ row.lastName }}</span>
          <Icon icon="solar:arrow-right-up-linear" class="text-xs opacity-0 group-hover:opacity-100 text-primary" />
        </router-link>
        <div class="text-xs text-gray-400">{{ row.address || 'Manzil yo\'q' }}</div>
      </template>

      <!-- Custom Parent Cell -->
      <template #cell(parentName)="{ row }">
        <div class="text-gray-800 dark:text-gray-200">{{ row.parentName || '-' }}</div>
        <div class="text-xs text-gray-400">{{ row.parentPhone || '' }}</div>
      </template>

      <!-- Custom Enrollments Cell -->
      <template #cell(enrollments)="{ row }">
        <div class="flex flex-wrap gap-1">
          <Badge
            v-for="en in row.enrollments"
            :key="en.id"
            variant="primary"
            size="xs"
          >
            {{ en.group?.name }}
          </Badge>
          <span v-if="!row.enrollments || row.enrollments.length === 0" class="text-xs text-gray-400">
            Guruhsiz
          </span>
        </div>
      </template>

      <!-- Custom Balance Cell -->
      <template #cell(balance)="{ row }">
        <span :class="row.balance >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
          {{ formatUZS(row.balance) }}
        </span>
      </template>

      <!-- Custom Status Cell -->
      <template #cell(status)="{ row }">
        <Badge
          :variant="row.status === 'ACTIVE' ? 'success' : row.status === 'FROZEN' ? 'warning' : 'danger'"
          :dot="true"
          size="sm"
        >
          {{ row.status === 'ACTIVE' ? 'Faol' : row.status === 'FROZEN' ? 'Muzlatilgan' : 'Nofaol' }}
        </Badge>
      </template>

      <!-- Actions Slot -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <router-link :to="`/students/${row.id}`">
            <AppButton
              variant="outline"
              size="sm"
              icon="solar:user-id-linear"
            >
              Profil
            </AppButton>
          </router-link>
          <AppButton
            variant="success"
            size="sm"
            icon="solar:wallet-money-bold"
            @click="openPaymentModal(row)"
          >
            To'lov
          </AppButton>
          <AppButton
            variant="outline"
            size="sm"
            icon="solar:trash-bin-trash-linear"
            class="text-red-600 border-red-200 hover:bg-red-50"
            @click="confirmDelete(row)"
          >
            O'chirish
          </AppButton>
        </div>
      </template>
    </DataTable>

    <!-- Payment Modal -->
    <vmodal
      ref="paymentModal"
      class="hidden"
      title="To'lov Qabul Qilish"
      subtitle="O'quvchi balansi va to'lov kvitansiyasi"
      btnTextSubmit="To'lovni Tasdiqlash"
      btnColorSubmit="bg-green-600"
      width="max-w-md"
      @submit="submitPayment"
    >
      <template v-slot:Icon>
        <Icon icon="solar:wallet-money-bold" class="text-3xl text-green-600 mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3 text-sm text-left">
          <div class="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-md flex items-center justify-between text-xs">
            <span class="text-gray-500 dark:text-gray-400">O'quvchi:</span>
            <span class="font-bold text-gray-800 dark:text-gray-100">{{ activeStudent?.firstName }} {{ activeStudent?.lastName }}</span>
          </div>
          <FormInput v-model="paymentForm.amount" type="number" step="10000" label="Summa (UZS)" required icon="solar:wallet-money-bold" />
          <FormSelect
            v-model="paymentForm.method"
            label="To'lov usuli"
            :options="[
              { value: 'CASH', label: 'Naqd pul' },
              { value: 'CARD', label: 'Plastik karta' },
              { value: 'PAYME', label: 'Payme' },
              { value: 'CLICK', label: 'Click' },
              { value: 'UZUM', label: 'Uzum Pay' },
            ]"
          />
          <FormInput v-model="paymentForm.notes" label="Izoh" placeholder="Masalan: Aprel oyi to'lovi" />
        </div>
      </template>
    </vmodal>

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      ref="confirmDeleteModal"
      title="O'quvchini o'chirish"
      :message="`Haqiqatan ham ${studentToDelete?.firstName} ${studentToDelete?.lastName} o'quvchini o'chirmoqchimisiz?`"
      confirmText="Ha, o'chirish"
      @confirm="executeDeleteStudent"
    />

    <!-- Multi-Step Student Wizard Modal -->
    <StudentWizardModal ref="studentWizard" @saved="onStudentWizardSaved" />
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import vmodal from "@/components/modal.vue";
import Alert from "@/components/Alert.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import StatsCard from "@/components/StatsCard.vue";
import DataTable from "@/components/DataTable.vue";
import Badge from "@/components/Badge.vue";
import AppButton from "@/components/AppButton.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import StudentWizardModal from "@/components/students/StudentWizardModal.vue";
import { studentsApi, paymentsApi } from "@/api/services";

export default {
  name: "StudentsList",
  components: {
    Icon,
    vmodal,
    Alert,
    Breadcrumb,
    StatsCard,
    DataTable,
    Badge,
    AppButton,
    FormInput,
    FormSelect,
    ConfirmModal,
    StudentWizardModal,
  },
  data() {
    return {
      students: [],
      loading: false,
      alertMessage: "",
      activeStudent: null,
      studentToDelete: null,
      statusFilter: "",
      columns: [
        { key: "firstName", label: "O'quvchi", sortable: true },
        { key: "phone", label: "Telefon", sortable: false },
        { key: "parentName", label: "Ota-onasi", sortable: false },
        { key: "enrollments", label: "Guruhlar", sortable: false },
        { key: "balance", label: "Balans", sortable: true },
        { key: "status", label: "Holat", sortable: true },
      ],
      newStudent: {
        firstName: "",
        lastName: "",
        phone: "",
        parentName: "",
        parentPhone: "",
        address: "",
      },
      paymentForm: {
        amount: 650000,
        method: "CASH",
        notes: "",
      },
    };
  },
  computed: {
    filteredStudents() {
      if (!this.statusFilter) return this.students;
      return this.students.filter((s) => s.status === this.statusFilter);
    },
    activeCount() {
      return this.students.filter((s) => s.status === "ACTIVE").length;
    },
    debtorsCount() {
      return this.students.filter((s) => s.balance < 0).length;
    },
    totalBalance() {
      return this.students.reduce((acc, s) => acc + (s.balance || 0), 0);
    },
  },
  mounted() {
    this.fetchStudents();
  },
  methods: {
    async fetchStudents() {
      this.loading = true;
      try {
        const data = await studentsApi.getAll().catch(() => []);
        const apiStudents = Array.isArray(data) ? data : [];

        // 1. Locally saved students from wizard
        let saved = [];
        try {
          const raw = localStorage.getItem("educrm_students_store");
          if (raw) saved = JSON.parse(raw);
        } catch (e) {}

        // 2. Also retrieve all ENROLLED leads from all lead stores
        const leadStoreKeys = [
          "educrm_leads_store_COURSE_CENTER",
          "educrm_leads_store_SCHOOL",
          "educrm_leads_store_KINDERGARTEN",
        ];
        const enrolledLeads = [];
        leadStoreKeys.forEach((k) => {
          try {
            const rawL = localStorage.getItem(k);
            if (rawL) {
              const leads = JSON.parse(rawL);
              const list = leads.filter((l) => l.stage === "ENROLLED" || l.status === "ENROLLED");
              enrolledLeads.push(...list);
            }
          } catch (e) {}
        });

        const normalizePhone = (p) => (p || "").replace(/\D/g, "");

        const enrolledFromLeads = enrolledLeads.map((l) => {
          const names = (l.fullName || "").trim().split(" ");
          const fName = l.firstName || names[0] || "O'quvchi";
          const lName = l.lastName || names.slice(1).join(" ") || "—";
          return {
            id: l.id || `lead-${Date.now()}`,
            firstName: fName,
            lastName: lName,
            phone: l.phone || "",
            parentName: l.parentName || "-",
            parentPhone: l.parentPhone || "",
            address: l.address || "Manzil kiritilmagan",
            balance: Number(l.amount) || 0,
            status: "ACTIVE",
            enrollments: l.courseName ? [{ id: `en-${l.id}`, group: { name: l.courseName } }] : [],
            createdAt: l.createdAt || new Date().toISOString(),
          };
        });

        const combinedRecent = [...saved, ...enrolledFromLeads];
        const seenPhones = new Set();
        const result = [];

        // 1. Add recent / saved / enrolled students to top
        combinedRecent.forEach((s) => {
          const phoneDigits = normalizePhone(s.phone);
          const key = phoneDigits || s.id;
          if (!seenPhones.has(key)) {
            seenPhones.add(key);
            result.push(s);
          }
        });

        // 2. Add API students
        apiStudents.forEach((s) => {
          const phoneDigits = normalizePhone(s.phone);
          const key = phoneDigits || s.id;
          if (!seenPhones.has(key)) {
            seenPhones.add(key);
            result.push(s);
          }
        });

        this.students = result;
      } catch (err) {
        console.error("O'quvchilarni olishda xatolik:", err);
        this.students = [];
      } finally {
        this.loading = false;
      }
    },
    formatUZS(val) {
      if (val === undefined || val === null) return "0 so'm";
      return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
    },
    async submitAddStudent() {
      try {
        await studentsApi.create(this.newStudent);
        if (this.$refs.addStudentModal) {
          this.$refs.addStudentModal.isOpen = false;
        }
        this.newStudent = { firstName: "", lastName: "", phone: "", parentName: "", parentPhone: "", address: "" };
        this.alertMessage = "Yangi o'quvchi muvaffaqiyatli qo'shildi!";
        await this.fetchStudents();
      } catch (err) {
        alert(err.message || "Xatolik yuz berdi");
      }
    },
    openPaymentModal(student) {
      this.activeStudent = student;
      this.paymentForm = { amount: 650000, method: "CASH", notes: "" };
      if (this.$refs.paymentModal) {
        this.$refs.paymentModal.isOpen = true;
      }
    },
    async submitPayment() {
      try {
        await paymentsApi.create({
          studentId: this.activeStudent.id,
          amount: this.paymentForm.amount,
          method: this.paymentForm.method,
          notes: this.paymentForm.notes,
        });
        if (this.$refs.paymentModal) {
          this.$refs.paymentModal.isOpen = false;
        }
        this.alertMessage = "To'lov muvaffaqiyatli qabul qilindi!";
        await this.fetchStudents();
      } catch (err) {
        alert(err.message || "To'lovni saqlashda xatolik");
      }
    },
    confirmDelete(student) {
      this.studentToDelete = student;
      this.$refs.confirmDeleteModal.open();
    },
    async executeDeleteStudent() {
      if (!this.studentToDelete) return;
      try {
        await studentsApi.delete(this.studentToDelete.id);
        this.alertMessage = "O'quvchi o'chirildi!";
        await this.fetchStudents();
      } catch (err) {
        alert(err.message || "O'chirishda xatolik");
      } finally {
        this.studentToDelete = null;
      }
    },
    async onStudentWizardSaved(student) {
      this.alertMessage = `${student.firstName} ${student.lastName} o'quvchilar safiga muvaffaqiyatli qo'shildi!`;
      await this.fetchStudents();
    },
  },
};
</script>
