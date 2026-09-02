<template>
  <div class="employees-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Xodimlar & Oylik Maosh' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Xodimlar & Oylik Maosh (HR)</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          O'qituvchilar va xodimlar ro'yxati, lavozimlar va oylik ish haqi fondi boshqaruvi.
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl shadow-sm transition duration-150 ease-in-out cursor-pointer"
        >
          <Icon icon="solar:user-plus-bold" class="w-5 h-5 mr-1.5" />
          Yangi Xodim
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Jami Xodimlar</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ employees.length }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Faol Xodimlar</p>
        <p class="text-2xl font-bold text-emerald-600 mt-2">{{ activeCount }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Oylik Maosh Jamg'armasi</p>
        <p class="text-2xl font-bold text-blue-600 mt-2">{{ formatMoney(totalSalaryFund) }} so'm</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Joriy Davr</p>
        <p class="text-2xl font-bold text-purple-600 mt-2">{{ currentPeriod }}</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:w-80">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Ism, familiya yoki lavozim..."
          class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <select
          v-model="selectedStatus"
          class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Barcha holatlar</option>
          <option value="ACTIVE">Faol</option>
          <option value="ON_LEAVE">Ta'tilda</option>
          <option value="TERMINATED">Bo'shatilgan</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mb-2"></div>
        <p>Yuklanmoqda...</p>
      </div>

      <div v-else-if="filteredEmployees.length === 0" class="p-12 text-center text-gray-400">
        <p class="text-base font-medium">Hech qanday xodim topilmadi</p>
        <p class="text-sm mt-1">Yangi xodim qo'shish uchun yuqoridagi tugmani bosing.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead class="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
            <tr>
              <th class="px-6 py-4">Xodim</th>
              <th class="px-6 py-4">Lavozim & Bo'lim</th>
              <th class="px-6 py-4">Bandlik & Stavka</th>
              <th class="px-6 py-4">Asosiy Oylik</th>
              <th class="px-6 py-4">Holat</th>
              <th class="px-6 py-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                <div>{{ emp.firstName }} {{ emp.lastName }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ emp.phone }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-gray-800 dark:text-gray-200">{{ emp.position }}</div>
                <div class="text-xs text-gray-400">{{ emp.department || 'Boshqaruv' }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {{ emp.employmentType }}
                </span>
              </td>
              <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                {{ formatMoney(emp.baseSalary) }} so'm
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="emp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-800'"
                >
                  {{ emp.status === 'ACTIVE' ? 'Faol' : emp.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="openPayrollModal(emp)"
                  class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg transition"
                >
                  Maosh to'lash
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Employee Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Yangi Xodim Qo'shish</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
            <input v-model="form.firstName" type="text" class="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700" placeholder="Anvar" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Familiya</label>
            <input v-model="form.lastName" type="text" class="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700" placeholder="Qodirov" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
            <input v-model="form.phone" type="text" class="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700" placeholder="+998901234567" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Lavozim</label>
            <input v-model="form.position" type="text" class="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700" placeholder="Katta O'qituvchi" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Asosiy Oylik (so'm)</label>
            <input v-model.number="form.baseSalary" type="number" class="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700" placeholder="6000000" />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showCreateModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Bekor qilish</button>
          <button @click="saveEmployee" :disabled="saving" class="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">
            {{ saving ? "Saqlanmoqda..." : "Saqlash" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Issue Payroll Modal -->
    <div v-if="showPayrollModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          Maosh To'lash: {{ selectedEmployee?.firstName }} {{ selectedEmployee?.lastName }}
        </h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Davr (Oy)</label>
            <input v-model="payrollForm.period" type="month" class="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Asosiy Miqdor (so'm)</label>
            <input v-model.number="payrollForm.baseAmount" type="number" class="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Bonus / Rag'batlantirish (so'm)</label>
            <input v-model.number="payrollForm.bonusAmount" type="number" class="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ushlab qolish / Jarima (so'm)</label>
            <input v-model.number="payrollForm.deductionAmount" type="number" class="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-700" />
          </div>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
            <p class="text-xs text-emerald-700 dark:text-emerald-300">To'lanadigan Yakuniy Summa:</p>
            <p class="text-xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">
              {{ formatMoney(calculatedNet) }} so'm
            </p>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showPayrollModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Bekor qilish</button>
          <button @click="submitPayroll" :disabled="saving" class="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">
            {{ saving ? "To'lanmoqda..." : "To'lovni Tasdiqlash" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import { employeesApi } from "@/api/services";

export default {
  name: "EmployeesList",
  components: {
    Icon,
    Breadcrumb,
  },
  data() {
    return {
      employees: [],
      loading: false,
      saving: false,
      searchQuery: "",
      selectedStatus: "",
      showCreateModal: false,
      showPayrollModal: false,
      selectedEmployee: null,
      currentPeriod: new Date().toISOString().slice(0, 7),
      form: {
        firstName: "",
        lastName: "",
        phone: "",
        position: "",
        baseSalary: 5000000,
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
      return this.employees.filter((emp) => {
        const matchesStatus = !this.selectedStatus || emp.status === this.selectedStatus;
        const q = this.searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          emp.firstName?.toLowerCase().includes(q) ||
          emp.lastName?.toLowerCase().includes(q) ||
          emp.position?.toLowerCase().includes(q) ||
          emp.phone?.includes(q);
        return matchesStatus && matchesSearch;
      });
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
        this.employees = res.data || [];
      } catch (err) {
        console.error("Xodimlarni yuklashda xatolik:", err);
      } finally {
        this.loading = false;
      }
    },
    openCreateModal() {
      this.form = {
        firstName: "",
        lastName: "",
        phone: "+998",
        position: "O'qituvchi",
        baseSalary: 5000000,
      };
      this.showCreateModal = true;
    },
    async saveEmployee() {
      if (!this.form.firstName || !this.form.lastName || !this.form.phone) {
        alert("Iltimos, ism, familiya va telefonni to'ldiring!");
        return;
      }
      this.saving = true;
      try {
        await employeesApi.create(this.form);
        this.showCreateModal = false;
        await this.fetchEmployees();
      } catch (err) {
        alert("Xodim qo'shishda xatolik: " + (err.response?.data?.message || err.message));
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
          baseAmount: this.payrollForm.baseAmount,
          bonusAmount: this.payrollForm.bonusAmount,
          deductionAmount: this.payrollForm.deductionAmount,
          paidVia: this.payrollForm.paidVia,
        });
        alert("Maosh muvaffaqiyatli to'landi!");
        this.showPayrollModal = false;
      } catch (err) {
        alert("To'lovda xatolik: " + (err.response?.data?.message || err.message));
      } finally {
        this.saving = false;
      }
    },
    formatMoney(val) {
      if (!val) return "0";
      return Number(val).toLocaleString("uz-UZ");
    },
  },
};
</script>
