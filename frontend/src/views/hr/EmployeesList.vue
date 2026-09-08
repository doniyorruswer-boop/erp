<template>
  <div class="employees-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Xodimlar & Oylik Maosh' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Xodimlar & Oylik Maosh (HR)</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          O'qituvchilar va xodimlar ro'yxati, lavozimlar va oylik ish haqi fondi boshqaruvi
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="openCreateModal"
          class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/90 dark:border-gray-700 rounded-md py-2 px-4 font-medium shadow-sm transition cursor-pointer"
        >
          <Icon icon="solar:user-plus-bold" class="text-lg" />
          <span>Yangi Xodim</span>
        </button>
      </div>
    </div>

    <!-- Alert Message -->
    <Alert v-if="alertMessage" :message="alertMessage" :type="alertType" @close="alertMessage = ''" />

    <!-- 4 Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Jami Xodimlar"
        :value="`${employees.length} ta`"
        icon="solar:users-group-two-rounded-bold"
        variant="primary"
      />
      <StatsCard
        title="Faol Xodimlar"
        :value="`${activeCount} ta`"
        icon="solar:user-check-bold"
        variant="success"
        valueClass="text-green-600 dark:text-green-400"
      />
      <StatsCard
        title="Oylik Maosh Jamg'armasi"
        :value="`${formatMoney(totalSalaryFund)} so'm`"
        icon="solar:wallet-money-bold"
        variant="purple"
        valueClass="text-primary"
      />
      <StatsCard
        title="Joriy Davr"
        :value="currentPeriod"
        icon="solar:calendar-bold"
        variant="danger"
        valueClass="text-purple-600 dark:text-purple-400"
      />
    </div>

    <!-- Data Table Component -->
    <DataTable
      title="Barcha Xodimlar"
      subtitle="O'qituvchi va xodimlar ro'yxati, lavozimi va maosh holati"
      :columns="columns"
      :data="filteredEmployees"
      :loading="loading"
      :searchable="true"
      :showIndex="true"
      :showPerPage="true"
      searchPlaceholder="Ism, familiya, lavozim yoki telefon..."
      rowKey="id"
    >
      <!-- Header Actions: Status Filter -->
      <template #headerActions>
        <select
          v-model="selectedStatus"
          class="py-1.5 px-3 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
        >
          <option value="">Barcha holatlar</option>
          <option value="ACTIVE">Faol</option>
          <option value="ON_LEAVE">Ta'tilda</option>
          <option value="TERMINATED">Bo'shatilgan</option>
        </select>
      </template>

      <!-- Custom Employee Name Cell (Universal AppUserCell - 1-rasm standarti) -->
      <template #cell(name)="{ row }">
        <AppUserCell
          :name="(row.firstName || '') + ' ' + (row.lastName || '')"
          :image="row.avatar"
          :subtitle="row.phone || '-'"
        />
      </template>

      <!-- Custom Position Cell -->
      <template #cell(position)="{ row }">
        <div class="text-gray-800 dark:text-gray-200 font-medium">{{ row.position || 'Xodim' }}</div>
        <div class="text-xs text-gray-400">{{ row.department || row.branch?.name || 'Asosiy filial' }}</div>
      </template>

      <!-- Custom Salary Cell -->
      <template #cell(baseSalary)="{ row }">
        <span class="font-semibold text-gray-800 dark:text-gray-100">
          {{ formatMoney(row.baseSalary) }} so'm
        </span>
        <div class="text-[11px] text-gray-400 capitalize">
          {{ formatEmploymentType(row.employmentType) }}
        </div>
      </template>

      <!-- Custom Status Cell -->
      <template #cell(status)="{ row }">
        <Badge
          :variant="row.status === 'ACTIVE' ? 'success' : row.status === 'ON_LEAVE' ? 'warning' : 'danger'"
          :dot="true"
          size="sm"
        >
          {{ formatStatus(row.status) }}
        </Badge>
      </template>

      <!-- Actions Slot -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-1.5">
          <button
            type="button"
            @click="openPayrollModal(row)"
            title="Oylik maosh to'lash"
            class="p-1.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition flex items-center gap-1 font-medium cursor-pointer"
          >
            <Icon icon="solar:wallet-money-bold" class="text-base" />
            <span>Maosh</span>
          </button>
          <button
            type="button"
            @click="deleteEmployee(row)"
            title="O'chirish"
            class="p-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition cursor-pointer"
          >
            <Icon icon="solar:trash-bin-trash-linear" class="text-base" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Create Employee Modal -->
    <vmodal
      :model-value="showCreateModal"
      @update:model-value="showCreateModal = $event"
      title="Yangi Xodim Qo'shish"
      subtitle="Xodim shaxsiy va mehnat ma'lumotlarini kiriting"
      width="max-w-lg"
      :hide-button="true"
    >
      <form @submit.prevent="saveEmployee" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <FormInput
            v-model="form.firstName"
            label="Ism"
            required
            placeholder="Ali"
            icon="solar:user-linear"
          />
          <FormInput
            v-model="form.lastName"
            label="Familiya"
            required
            placeholder="Valiyev"
            icon="solar:user-linear"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <FormInput
            v-model="form.phone"
            label="Telefon"
            required
            placeholder="+998901234567"
            icon="solar:phone-linear"
          />
          <FormInput
            v-model="form.position"
            label="Lavozim"
            required
            placeholder="O'qituvchi, Admin..."
            icon="solar:case-linear"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <FormCurrencyInput
            v-model="form.baseSalary"
            label="Asosiy oylik maosh (so'm)"
            required
            placeholder="5 000 000"
          />
          <FormSelect
            v-model="form.employmentType"
            label="Bandlik turi"
            :options="[
              { value: 'FULL_TIME', label: 'To\'liq stavka (Full-time)' },
              { value: 'PART_TIME', label: 'Yarim stavka (Part-time)' },
              { value: 'CONTRACT', label: 'Shartnoma asosida' },
              { value: 'HOURLY', label: 'Soatbay' }
            ]"
          />
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t dark:border-gray-700">
          <button
            type="button"
            @click="showCreateModal = false"
            class="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-5 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-md shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Icon v-if="saving" icon="eos-icons:loading" class="animate-spin text-sm" />
            <span>{{ saving ? 'Saqlanmoqda...' : 'Saqlash' }}</span>
          </button>
        </div>
      </form>
    </vmodal>

    <!-- Payroll Modal -->
    <vmodal
      :model-value="showPayrollModal"
      @update:model-value="showPayrollModal = $event"
      :title="`Oylik Maosh To'lash: ${selectedEmployee ? selectedEmployee.firstName + ' ' + selectedEmployee.lastName : ''}`"
      subtitle="Belgilangan davr uchun hisoblangan ish haqini to'lovga chiqarish"
      width="max-w-md"
      :hide-button="true"
    >
      <form @submit.prevent="submitPayroll" class="space-y-3.5">
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Davr (Oy)</label>
          <input
            v-model="payrollForm.period"
            type="month"
            required
            class="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 p-2 outline-none focus:border-primary dark:bg-gray-900 text-gray-800 dark:text-gray-100"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Asosiy Miqdor (so'm)</label>
            <input
              v-model.number="payrollForm.baseAmount"
              type="number"
              required
              class="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 p-2 outline-none focus:border-primary dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Bonus (so'm)</label>
            <input
              v-model.number="payrollForm.bonusAmount"
              type="number"
              class="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 p-2 outline-none focus:border-primary dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ushlab qolish (so'm)</label>
            <input
              v-model.number="payrollForm.deductionAmount"
              type="number"
              class="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 p-2 outline-none focus:border-primary dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">To'lov usuli</label>
            <select
              v-model="payrollForm.paidVia"
              class="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 p-2 outline-none focus:border-primary dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            >
              <option value="CASH">Naqd kassa</option>
              <option value="CARD">Plastik karta</option>
              <option value="BANK_TRANSFER">Bank o'tkazmasi</option>
            </select>
          </div>
        </div>

        <!-- Calculated Summary Card -->
        <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-md border border-emerald-200 dark:border-emerald-800/50">
          <p class="text-xs text-emerald-700 dark:text-emerald-300 font-medium">To'lanadigan Yakuniy Summa:</p>
          <p class="text-xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">
            {{ formatMoney(calculatedNet) }} so'm
          </p>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t dark:border-gray-700">
          <button
            type="button"
            @click="showPayrollModal = false"
            class="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Icon v-if="saving" icon="eos-icons:loading" class="animate-spin text-sm" />
            <span>{{ saving ? 'To\'lanmoqda...' : 'To\'lovni Tasdiqlash' }}</span>
          </button>
        </div>
      </form>
    </vmodal>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import StatsCard from "@/components/StatsCard.vue";
import DataTable from "@/components/DataTable.vue";
import Badge from "@/components/Badge.vue";
import Alert from "@/components/Alert.vue";
import vmodal from "@/components/modal.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import FormCurrencyInput from "@/components/FormCurrencyInput.vue";
import { employeesApi } from "@/api/services";

export default {
  name: "EmployeesList",
  components: {
    Icon,
    Breadcrumb,
    StatsCard,
    DataTable,
    Badge,
    Alert,
    vmodal,
    FormInput,
    FormSelect,
    FormCurrencyInput,
  },
  data() {
    return {
      employees: [],
      loading: false,
      saving: false,
      selectedStatus: "",
      alertMessage: "",
      alertType: "success",
      showCreateModal: false,
      showPayrollModal: false,
      selectedEmployee: null,
      currentPeriod: new Date().toISOString().slice(0, 7),
      columns: [
        { key: "name", label: "Xodim" },
        { key: "position", label: "Lavozim & Bo'lim" },
        { key: "baseSalary", label: "Asosiy Oylik" },
        { key: "status", label: "Holat" },
      ],
      form: {
        firstName: "",
        lastName: "",
        phone: "+998",
        position: "O'qituvchi",
        baseSalary: 5000000,
        employmentType: "FULL_TIME",
      },
      payrollForm: {
        period: new Date().toISOString().slice(0, 7),
        baseAmount: 0,
        bonusAmount: 0,
        deductionAmount: 0,
        paidVia: "CASH",
      },
    };
  },
  computed: {
    activeCount() {
      return this.employees.filter((e) => e.status === "ACTIVE").length;
    },
    totalSalaryFund() {
      return this.employees.reduce((sum, e) => sum + Number(e.baseSalary || 0), 0);
    },
    filteredEmployees() {
      if (!this.selectedStatus) return this.employees;
      return this.employees.filter((emp) => emp.status === this.selectedStatus);
    },
    calculatedNet() {
      const b = Number(this.payrollForm.baseAmount || 0);
      const bonus = Number(this.payrollForm.bonusAmount || 0);
      const ded = Number(this.payrollForm.deductionAmount || 0);
      return Math.max(0, b + bonus - ded);
    },
  },
  mounted() {
    this.fetchEmployees();
  },
  methods: {
    async fetchEmployees() {
      this.loading = true;
      try {
        const res = await employeesApi.getAll();
        this.employees = Array.isArray(res) ? res : (res?.data || res?.items || []);
      } catch (err) {
        console.error("Xodimlarni yuklashda xatolik:", err);
        this.alertType = "danger";
        this.alertMessage = "Xodimlarni yuklashda xatolik yuz berdi.";
      } finally {
        this.loading = false;
      }
    },
    formatEmploymentType(type) {
      if (!type) return "to'liq stavka";
      const map = {
        FULL_TIME: "to'liq stavka",
        PART_TIME: "yarim stavka",
        CONTRACT: "shartnoma asosida",
        HOURLY: "soatbay",
      };
      return map[type] || type.toLowerCase();
    },
    formatStatus(status) {
      if (status === "ACTIVE") return "Faol";
      if (status === "ON_LEAVE") return "Ta'tilda";
      if (status === "TERMINATED") return "Bo'shatilgan";
      return status || "Faol";
    },
    openCreateModal() {
      this.form = {
        firstName: "",
        lastName: "",
        phone: "+998",
        position: "O'qituvchi",
        baseSalary: 5000000,
        employmentType: "FULL_TIME",
      };
      this.showCreateModal = true;
    },
    async saveEmployee() {
      if (!this.form.firstName || !this.form.lastName || !this.form.phone) {
        this.alertType = "danger";
        this.alertMessage = "Iltimos, ism, familiya va telefon raqamini kiriting!";
        return;
      }
      this.saving = true;
      try {
        await employeesApi.create(this.form);
        this.alertType = "success";
        this.alertMessage = "Yangi xodim muvaffaqiyatli qo'shildi!";
        this.showCreateModal = false;
        await this.fetchEmployees();
      } catch (err) {
        this.alertType = "danger";
        this.alertMessage = "Xodim qo'shishda xatolik: " + (err.response?.data?.message || err.message);
      } finally {
        this.saving = false;
      }
    },
    openPayrollModal(emp) {
      this.selectedEmployee = emp;
      this.payrollForm = {
        employeeId: emp.id,
        period: this.currentPeriod,
        baseAmount: Number(emp.baseSalary || 0),
        bonusAmount: 0,
        deductionAmount: 0,
        paidVia: "CASH",
      };
      this.showPayrollModal = true;
    },
    async submitPayroll() {
      this.saving = true;
      try {
        await employeesApi.createPayroll({
          employeeId: this.selectedEmployee.id,
          period: this.payrollForm.period,
          baseAmount: Number(this.payrollForm.baseAmount),
          bonusAmount: Number(this.payrollForm.bonusAmount || 0),
          deductionAmount: Number(this.payrollForm.deductionAmount || 0),
          paidVia: this.payrollForm.paidVia,
        });
        this.alertType = "success";
        this.alertMessage = "Oylik maosh to'lovi muvaffaqiyatli amalga oshirildi!";
        this.showPayrollModal = false;
      } catch (err) {
        this.alertType = "danger";
        this.alertMessage = "To'lovda xatolik: " + (err.response?.data?.message || err.message);
      } finally {
        this.saving = false;
      }
    },
    async deleteEmployee(emp) {
      if (!confirm(`${emp.firstName} ${emp.lastName}ni xodimlar ro'yxatidan o'chirmoqchimisiz?`)) return;
      try {
        await employeesApi.delete(emp.id);
        this.alertType = "success";
        this.alertMessage = "Xodim muvaffaqiyatli o'chirildi!";
        await this.fetchEmployees();
      } catch (err) {
        this.alertType = "danger";
        this.alertMessage = "O'chirishda xatolik: " + (err.response?.data?.message || err.message);
      }
    },
    formatMoney(val) {
      if (!val) return "0";
      return Number(val).toLocaleString("uz-UZ");
    },
  },
};
</script>
