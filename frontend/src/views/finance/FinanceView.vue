<template>
  <div class="finance-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Moliya & Kassa' }]" />

    <!-- Header & vmodal Trigger -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Moliya & Kassa</h1>
        <p class="text-sm text-gray-400">O'quv markazining barcha to'lovlari va kassa hisoboti</p>
      </div>

      <vmodal
        ref="addPaymentModal"
        title="Yangi To'lov Qabul Qilish"
        subtitle="O'quvchining to'lov summasi va turini tanlang"
        btnText="Yangi To'lov"
        btnColor="bg-green-600"
        btnTextSubmit="To'lovni Tasdiqlash"
        btnTextClose="Bekor qilish"
        @submit="submitPayment"
      >
        <template v-slot:Icon>
          <Icon icon="solar:wallet-money-bold" class="text-3xl text-green-600 mb-2" />
        </template>
        <template v-slot:body>
          <div class="space-y-3 text-sm text-left">
            <FormSelect
              v-model="paymentForm.studentId"
              label="O'quvchini tanlang"
              required
              placeholder="O'quvchini tanlang..."
              :options="studentOptions"
            />
            <FormCurrencyInput
              v-model="paymentForm.amount"
              label="To'lov summasi"
              required
              placeholder="Masalan: 450 000"
            />
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
            <FormInput
              v-model="paymentForm.notes"
              label="Izoh"
              placeholder="Masalan: Mart oyi to'lovi"
            />
          </div>
        </template>
      </vmodal>
    </div>

    <!-- Floating Alert Toast -->
    <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      <StatsCard title="Jami Kassa Tushumi" :value="formatUZS(summary.totalIncome)" icon="solar:wallet-money-bold" variant="primary" />
      <StatsCard title="Joriy Oy Tushumi" :value="formatUZS(summary.monthlyIncome)" icon="solar:chart-2-bold" variant="success" valueClass="text-green-600 dark:text-green-400" />
      <StatsCard title="Qarzdor O'quvchilar" :value="`${summary.debtorsCount} ta`" icon="solar:danger-triangle-bold" variant="danger" valueClass="text-red-600 dark:text-red-400" />
    </div>

    <!-- Payments DataTable -->
    <DataTable
      title="To'lovlar Tarixi"
      subtitle="Barcha qabul qilingan to'lovlar va cheklar"
      :columns="columns"
      :data="payments"
      :loading="loading"
      :searchable="true"
      :showIndex="true"
      :showPerPage="true"
      searchPlaceholder="Chek raqami, o'quvchi yoki to'lov turi..."
      rowKey="id"
    >
      <template #cell(receiptNumber)="{ row }">
        <span class="font-mono text-xs text-gray-500 font-semibold">{{ row.receiptNumber || '-' }}</span>
      </template>

      <template #cell(student)="{ row }">
        <div class="font-medium text-gray-800 dark:text-gray-100">
          {{ row.student?.firstName }} {{ row.student?.lastName }}
        </div>
        <div class="text-xs text-gray-400">{{ row.student?.phone }}</div>
      </template>

      <template #cell(amount)="{ row }">
        <span class="font-bold text-green-600">
          +{{ formatUZS(row.amount) }}
        </span>
      </template>

      <template #cell(method)="{ row }">
        <Badge variant="primary" size="xs">
          {{ row.method }}
        </Badge>
      </template>

      <template #cell(paymentDate)="{ row }">
        <span class="text-xs text-gray-500">{{ formatDate(row.paymentDate) }}</span>
      </template>
    </DataTable>
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
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import { paymentsApi, studentsApi } from "@/api/services";

export default {
  name: "FinanceView",
  components: {
    Icon,
    vmodal,
    Alert,
    Breadcrumb,
    StatsCard,
    DataTable,
    Badge,
    FormInput,
    FormSelect,
  },
  data() {
    return {
      payments: [],
      students: [],
      summary: { totalIncome: 0, monthlyIncome: 0, debtorsCount: 0 },
      loading: false,
      alertMessage: "",
      columns: [
        { key: "receiptNumber", label: "Chek №", sortable: true },
        { key: "student", label: "O'quvchi", sortable: false },
        { key: "amount", label: "Summa", sortable: true },
        { key: "method", label: "To'lov Turi", sortable: true },
        { key: "paymentDate", label: "Sana", sortable: true },
        { key: "notes", label: "Izoh", sortable: false },
      ],
      paymentForm: {
        studentId: "",
        amount: 650000,
        method: "CASH",
        notes: "",
      },
    };
  },
  computed: {
    studentOptions() {
      return this.students.map((s) => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName} (${s.phone})`,
      }));
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [payments, summary, students] = await Promise.all([
          paymentsApi.getAll(),
          paymentsApi.getSummary(),
          studentsApi.getAll(),
        ]);
        this.payments = payments;
        this.summary = summary;
        this.students = students;
      } catch (err) {
        console.error("Moliya xatoligi:", err);
      } finally {
        this.loading = false;
      }
    },
    formatUZS(val) {
      if (!val) return "0 so'm";
      return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    async submitPayment() {
      try {
        await paymentsApi.create(this.paymentForm);
        if (this.$refs.addPaymentModal) {
          this.$refs.addPaymentModal.isOpen = false;
        }
        this.paymentForm = { studentId: "", amount: 650000, method: "CASH", notes: "" };
        this.alertMessage = "To'lov muvaffaqiyatli qabul qilindi!";
        await this.fetchData();
      } catch (err) {
        alert(err.message || "To'lovda xatolik");
      }
    },
  },
};
</script>
