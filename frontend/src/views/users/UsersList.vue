<template>
  <div class="users-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Foydalanuvchilar & Xodimlar' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Foydalanuvchilar & Xodimlar
        </h1>
        <p class="text-sm text-gray-400 mt-0.5">
          Tizimga kirish huquqiga ega foydalanuvchilar, ularning rollari va filial birikmalari
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/90 dark:border-gray-700 rounded-md py-2 px-4 font-medium shadow-sm transition cursor-pointer"
          @click="openCreateModal"
        >
          <Icon icon="solar:user-plus-bold" class="text-lg" />
          <span>Yangi Foydalanuvchi</span>
        </button>
      </div>
    </div>

    <!-- Alert Message -->
    <Alert
      v-if="alertMessage"
      :message="alertMessage"
      :type="alertType"
      @close="alertMessage = ''"
    />

    <!-- 4 Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Jami Foydalanuvchilar"
        :value="`${users.length} ta`"
        icon="solar:users-group-two-rounded-bold"
        variant="primary"
      />
      <StatsCard
        title="Administratorlar"
        :value="`${adminCount} ta`"
        icon="solar:shield-user-bold"
        variant="purple"
        value-class="text-primary"
      />
      <StatsCard
        title="O'qituvchilar"
        :value="`${teacherCount} ta`"
        icon="solar:diploma-bold"
        variant="success"
        value-class="text-green-600 dark:text-green-400"
      />
      <StatsCard
        title="Faol Akkauntlar"
        :value="`${activeCount} ta`"
        icon="solar:user-check-bold"
        variant="info"
        value-class="text-blue-600 dark:text-blue-400"
      />
    </div>

    <!-- Data Table Component -->
    <DataTable
      title="Barcha Foydalanuvchilar"
      subtitle="Tizim a'zolari va ularga berilgan kirish ruxsatlari"
      :columns="columns"
      :data="filteredUsers"
      :loading="loading"
      :searchable="true"
      :show-index="true"
      :show-per-page="true"
      search-placeholder="Ism, telefon, email yoki rol..."
      row-key="id"
    >
      <!-- Header Actions: Role & Status Filters -->
      <template #headerActions>
        <div class="flex items-center gap-2">
          <select
            v-model="selectedRole"
            class="py-1.5 px-3 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
          >
            <option value="">Barcha rollar</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Administrator</option>
            <option value="TEACHER">O'qituvchi</option>
            <option value="RECEPTIONIST">Qabulxona (Reception)</option>
            <option value="ACCOUNTANT">Buxgalter</option>
            <option value="STUDENT">Talaba</option>
          </select>

          <select
            v-model="selectedStatus"
            class="py-1.5 px-3 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
          >
            <option value="">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </select>
        </div>
      </template>

      <!-- Custom User Cell -->
      <template #cell(user)="{ row }">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0"
          >
            {{ (row.firstName?.[0] || "U") + (row.lastName?.[0] || "") }}
          </div>
          <div>
            <div class="font-semibold text-gray-800 dark:text-gray-100">
              {{ row.firstName }} {{ row.lastName }}
            </div>
            <div class="text-xs text-gray-400 flex items-center gap-1.5">
              <span>{{ row.phone || "-" }}</span>
              <span v-if="row.email" class="text-gray-300 dark:text-gray-600">•</span>
              <span v-if="row.email">{{ row.email }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Custom Role Cell -->
      <template #cell(role)="{ row }">
        <Badge :variant="getRoleBadgeVariant(row.role)" size="sm">
          {{ formatRole(row.role) }}
        </Badge>
      </template>

      <!-- Custom Branch Cell -->
      <template #cell(branch)="{ row }">
        <span class="text-xs text-gray-700 dark:text-gray-300">
          {{ getBranchName(row) }}
        </span>
      </template>

      <!-- Custom Status Cell -->
      <template #cell(status)="{ row }">
        <Badge :variant="row.isActive !== false ? 'success' : 'danger'" :dot="true" size="sm">
          {{ row.isActive !== false ? "Faol" : "Nofaol" }}
        </Badge>
      </template>

      <!-- Actions Slot -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="Tahrirlash"
            class="p-1.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition cursor-pointer"
            @click="openEditModal(row)"
          >
            <Icon icon="solar:pen-linear" class="text-base" />
          </button>
          <button
            type="button"
            title="O'chirish"
            class="p-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition cursor-pointer"
            @click="deleteUser(row)"
          >
            <Icon icon="solar:trash-bin-trash-linear" class="text-base" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Create / Edit User Modal -->
    <Vmodal
      :model-value="showModal"
      :title="isEditing ? 'Foydalanuvchini Tahrirlash' : 'Yangi Foydalanuvchi Qo\'shish'"
      subtitle="Tizimga kirish akkaunti va rol biriktirish"
      width="max-w-lg"
      :hide-button="true"
      @update:model-value="showModal = $event"
    >
      <form class="space-y-4" @submit.prevent="saveUser">
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
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="user@eduhub.uz"
            icon="solar:letter-linear"
          />
        </div>

        <div v-if="!isEditing">
          <FormInput
            v-model="form.password"
            label="Parol"
            type="password"
            required
            placeholder="Kamida 6 ta belgi"
            icon="solar:lock-password-linear"
          />
        </div>
        <div v-else>
          <FormInput
            v-model="form.password"
            label="Yangi Parol (ixtiyoriy)"
            type="password"
            placeholder="O'zgartirish uchun yangi parol kiriting"
            icon="solar:lock-password-linear"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <FormSelect
            v-model="form.role"
            label="Tizimdagi Roli"
            required
            :options="[
              { value: 'SUPER_ADMIN', label: 'Super Admin' },
              { value: 'ADMIN', label: 'Administrator' },
              { value: 'TEACHER', label: 'O\'qituvchi' },
              { value: 'RECEPTIONIST', label: 'Qabulxona (Reception)' },
              { value: 'ACCOUNTANT', label: 'Buxgalter' },
              { value: 'STUDENT', label: 'Talaba' },
            ]"
          />

          <FormSelect v-model="form.branchId" label="Filial" :options="branchOptions" />
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t dark:border-gray-700">
          <button
            type="button"
            class="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition cursor-pointer"
            @click="showModal = false"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-5 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-md shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Icon v-if="saving" icon="eos-icons:loading" class="animate-spin text-sm" />
            <span>{{ saving ? "Saqlanmoqda..." : "Saqlash" }}</span>
          </button>
        </div>
      </form>
    </Vmodal>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { branchesApi, rolesApi, usersApi } from "@/api/services";
import Alert from "@/components/Alert.vue";
import Badge from "@/components/Badge.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import vmodal from "@/components/common/AppModal.vue";
import DataTable from "@/components/common/AppTable.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import StatsCard from "@/components/StatsCard.vue";

export default {
  name: "UsersList",
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
  },
  data() {
    return {
      users: [],
      branches: [],
      roles: [],
      loading: false,
      saving: false,
      selectedRole: "",
      selectedStatus: "",
      alertMessage: "",
      alertType: "success",
      showModal: false,
      isEditing: false,
      currentUserId: null,
      columns: [
        { key: "user", label: "Foydalanuvchi" },
        { key: "role", label: "Roli" },
        { key: "branch", label: "Filial" },
        { key: "status", label: "Holat" },
      ],
      form: {
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        role: "TEACHER",
        branchId: "",
      },
    };
  },
  computed: {
    adminCount() {
      return this.users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;
    },
    teacherCount() {
      return this.users.filter((u) => u.role === "TEACHER").length;
    },
    activeCount() {
      return this.users.filter((u) => u.isActive !== false).length;
    },
    branchOptions() {
      const opts = [{ value: "", label: "Barcha filiallar (Umumiy)" }];
      this.branches.forEach((b) => {
        opts.push({ value: b.id, label: b.name });
      });
      return opts;
    },
    filteredUsers() {
      return this.users.filter((user) => {
        const matchesRole = !this.selectedRole || user.role === this.selectedRole;
        const matchesStatus =
          !this.selectedStatus ||
          (this.selectedStatus === "active" && user.isActive !== false) ||
          (this.selectedStatus === "inactive" && user.isActive === false);
        return matchesRole && matchesStatus;
      });
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [usersRes, branchesRes, rolesRes] = await Promise.allSettled([
          usersApi.getAll(),
          branchesApi.getAll(),
          rolesApi.getAll(),
        ]);
        if (usersRes.status === "fulfilled") {
          const val = usersRes.value;
          this.users = Array.isArray(val) ? val : val?.data || val?.items || [];
        }
        if (branchesRes.status === "fulfilled") {
          const val = branchesRes.value;
          this.branches = Array.isArray(val) ? val : val?.data || val?.items || [];
        }
        if (rolesRes.status === "fulfilled") {
          const val = rolesRes.value;
          this.roles = Array.isArray(val) ? val : val?.data || val?.items || [];
        }
      } catch (err) {
        console.error("Foydalanuvchilarni yuklashda xatolik:", err);
        this.alertType = "danger";
        this.alertMessage = "Foydalanuvchilarni yuklashda xatolik yuz berdi.";
      } finally {
        this.loading = false;
      }
    },
    formatRole(role) {
      const map = {
        SUPER_ADMIN: "Super Admin",
        ADMIN: "Administrator",
        TEACHER: "O'qituvchi",
        RECEPTIONIST: "Qabulxona",
        ACCOUNTANT: "Buxgalter",
        STUDENT: "Talaba",
      };
      return map[role] || role;
    },
    getRoleBadgeVariant(role) {
      switch (role) {
        case "SUPER_ADMIN":
          return "purple";
        case "ADMIN":
          return "primary";
        case "TEACHER":
          return "success";
        case "RECEPTIONIST":
          return "warning";
        case "ACCOUNTANT":
          return "info";
        default:
          return "gray";
      }
    },
    getBranchName(row) {
      if (row.branch?.name) return row.branch.name;
      if (row.userBranches && row.userBranches.length > 0) {
        return row.userBranches[0].branch?.name || "Filial";
      }
      return "Umumiy";
    },
    openCreateModal() {
      this.isEditing = false;
      this.currentUserId = null;
      this.form = {
        firstName: "",
        lastName: "",
        phone: "+998",
        email: "",
        password: "",
        role: "TEACHER",
        branchId: "",
      };
      this.showModal = true;
    },
    openEditModal(user) {
      this.isEditing = true;
      this.currentUserId = user.id;
      this.form = {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        password: "",
        role: user.role,
        branchId: user.userBranches?.[0]?.branchId || "",
      };
      this.showModal = true;
    },
    async saveUser() {
      if (!this.form.firstName || !this.form.lastName || !this.form.phone) {
        this.alertType = "danger";
        this.alertMessage = "Iltimos, ism, familiya va telefon raqamini kiriting!";
        return;
      }
      this.saving = true;
      try {
        if (this.isEditing) {
          const payload = { ...this.form };
          if (!payload.password) delete payload.password;
          await usersApi.update(this.currentUserId, payload);
          this.alertType = "success";
          this.alertMessage = "Foydalanuvchi ma'lumotlari muvaffaqiyatli yangilandi!";
        } else {
          await usersApi.create(this.form);
          this.alertType = "success";
          this.alertMessage = "Yangi foydalanuvchi muvaffaqiyatli yaratildi!";
        }
        this.showModal = false;
        await this.fetchData();
      } catch (err) {
        this.alertType = "danger";
        this.alertMessage = "Xatolik: " + (err.response?.data?.message || err.message);
      } finally {
        this.saving = false;
      }
    },
    async deleteUser(user) {
      if (!confirm(`${user.firstName} ${user.lastName} akkauntini o'chirmoqchimisiz?`)) return;
      try {
        await usersApi.delete(user.id);
        this.alertType = "success";
        this.alertMessage = "Foydalanuvchi muvaffaqiyatli o'chirildi!";
        await this.fetchData();
      } catch (err) {
        this.alertType = "danger";
        this.alertMessage = "O'chirishda xatolik: " + (err.response?.data?.message || err.message);
      }
    },
  },
};
</script>
