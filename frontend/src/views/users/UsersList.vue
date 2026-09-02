<template>
  <div class="users-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Foydalanuvchilar & Xodimlar' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Foydalanuvchilar & Xodimlar</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          Tizimga kirish huquqiga ega foydalanuvchilar, ularning rollari va filial birikmalari boshqaruvi.
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl shadow-sm transition duration-150 ease-in-out cursor-pointer"
        >
          <Icon icon="solar:user-plus-bold" class="w-5 h-5 mr-1.5" />
          Yangi Foydalanuvchi
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Jami Foydalanuvchilar</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ users.length }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Administratorlar</p>
        <p class="text-2xl font-bold text-primary mt-2">{{ adminCount }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">O'qituvchilar</p>
        <p class="text-2xl font-bold text-emerald-600 mt-2">{{ teacherCount }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Faol Akkauntlar</p>
        <p class="text-2xl font-bold text-blue-600 mt-2">{{ activeCount }} ta</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:w-80">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Icon icon="solar:magnifer-linear" class="w-5 h-5" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Ism, telefon yoki email bo'yicha..."
          class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <select
          v-model="selectedRole"
          class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
          class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Barcha holatlar</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
        <p>Yuklanmoqda...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="p-12 text-center text-gray-400">
        <Icon icon="solar:user-block-bold" class="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
        <p class="text-base font-medium">Hech qanday foydalanuvchi topilmadi</p>
        <p class="text-sm mt-1">Yangi foydalanuvchi qo'shish uchun yuqoridagi tugmani bosing.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead class="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
            <tr>
              <th class="px-6 py-4">Foydalanuvchi</th>
              <th class="px-6 py-4">Aloqa</th>
              <th class="px-6 py-4">Roli</th>
              <th class="px-6 py-4">Filiallar</th>
              <th class="px-6 py-4">Holat</th>
              <th class="px-6 py-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {{ (u.firstName?.[0] || 'U').toUpperCase() }}
                  </div>
                  <div>
                    <div>{{ u.firstName }} {{ u.lastName }}</div>
                    <div class="text-xs text-gray-400 font-normal">@{{ u.phone || u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm">{{ u.phone || '-' }}</div>
                <div class="text-xs text-gray-400">{{ u.email || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getRoleBadgeClass(u.role)"
                >
                  {{ formatRole(u.role) }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs text-gray-500">
                <span v-if="u.userBranches && u.userBranches.length > 0">
                  {{ u.userBranches.map(b => b.branch?.name).filter(Boolean).join(', ') || 'Asosiy filial' }}
                </span>
                <span v-else class="text-gray-400">Barcha filiallar</span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="u.isActive !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'"
                >
                  {{ u.isActive !== false ? 'Faol' : 'Bloklangan' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  v-if="u.lockedUntil && new Date(u.lockedUntil) > new Date()"
                  @click="unlockUser(u)"
                  class="p-1.5 text-amber-500 hover:text-amber-600 transition rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30"
                  title="Blokdan chiqarish"
                >
                  <Icon icon="solar:lock-unlocked-bold" class="w-4 h-4" />
                </button>
                <button
                  @click="openEditModal(u)"
                  class="p-1.5 text-gray-500 hover:text-primary transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Tahrirlash"
                >
                  <Icon icon="solar:pen-bold" class="w-4 h-4" />
                </button>
                <button
                  @click="deleteUser(u)"
                  class="p-1.5 text-gray-500 hover:text-rose-600 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="O'chirish"
                >
                  <Icon icon="solar:trash-bin-trash-bold" class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <div class="flex items-center justify-between pb-4 border-b dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ isEditing ? "Foydalanuvchini Tahrirlash" : "Yangi Foydalanuvchi Qo'shish" }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <Icon icon="solar:close-circle-bold" class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveUser" class="mt-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ism *</label>
              <input
                v-model="form.firstName"
                required
                type="text"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Familiya *</label>
              <input
                v-model="form.lastName"
                required
                type="text"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Telefon *</label>
              <input
                v-model="form.phone"
                required
                type="text"
                placeholder="+998901234567"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="user@eduhub.uz"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
              />
            </div>
          </div>

          <div v-if="!isEditing">
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Parol *</label>
            <input
              v-model="form.password"
              required
              type="password"
              minlength="6"
              placeholder="Kamida 6 ta belgi"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tizimdagi Roli *</label>
              <select
                v-model="form.role"
                required
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
              >
                <option value="ADMIN">Administrator</option>
                <option value="TEACHER">O'qituvchi</option>
                <option value="RECEPTIONIST">Qabulxona (Reception)</option>
                <option value="ACCOUNTANT">Buxgalter</option>
                <option value="STUDENT">Talaba</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Asosiy Filial</label>
              <select
                v-model="form.branchId"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
              >
                <option value="">Barcha filiallar</option>
                <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
          </div>

          <div class="pt-4 border-t dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50"
            >
              {{ saving ? "Saqlanmoqda..." : "Saqlash" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import { usersApi, branchesApi } from "@/api/services";
import api from "@/api/client";

export default {
  name: "UsersList",
  components: { Icon, Breadcrumb },
  data() {
    return {
      users: [],
      branches: [],
      loading: true,
      saving: false,
      searchQuery: "",
      selectedRole: "",
      selectedStatus: "",
      showModal: false,
      isEditing: false,
      currentUserId: null,
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
    filteredUsers() {
      return this.users.filter((u) => {
        const matchesQuery =
          !this.searchQuery ||
          `${u.firstName} ${u.lastName} ${u.phone} ${u.email}`
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());
        const matchesRole = !this.selectedRole || u.role === this.selectedRole;
        const matchesStatus =
          !this.selectedStatus ||
          (this.selectedStatus === "active" ? u.isActive !== false : u.isActive === false);
        return matchesQuery && matchesRole && matchesStatus;
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
        const [usersRes, branchesRes] = await Promise.allSettled([
          usersApi.getAll(),
          branchesApi.getAll(),
        ]);
        if (usersRes.status === "fulfilled") {
          this.users = Array.isArray(usersRes.value) ? usersRes.value : (usersRes.value?.items || []);
        }
        if (branchesRes.status === "fulfilled") {
          this.branches = Array.isArray(branchesRes.value) ? branchesRes.value : (branchesRes.value?.items || []);
        }
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        this.loading = false;
      }
    },
    formatRole(role) {
      const map = {
        SUPER_ADMIN: "Super Admin",
        ADMIN: "Admin",
        TEACHER: "O'qituvchi",
        RECEPTIONIST: "Qabulxona",
        ACCOUNTANT: "Buxgalter",
        STUDENT: "Talaba",
      };
      return map[role] || role;
    },
    getRoleBadgeClass(role) {
      const map = {
        SUPER_ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        TEACHER: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        RECEPTIONIST: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        ACCOUNTANT: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
        STUDENT: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      };
      return map[role] || "bg-gray-100 text-gray-800";
    },
    openCreateModal() {
      this.isEditing = false;
      this.currentUserId = null;
      this.form = {
        firstName: "",
        lastName: "",
        phone: "",
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
    closeModal() {
      this.showModal = false;
    },
    async saveUser() {
      this.saving = true;
      try {
        if (this.isEditing) {
          const updateData = {
            firstName: this.form.firstName,
            lastName: this.form.lastName,
            phone: this.form.phone,
            email: this.form.email,
            role: this.form.role,
          };
          await usersApi.update(this.currentUserId, updateData);
        } else {
          await usersApi.create(this.form);
        }
        this.$toast.success(this.isEditing ? "Foydalanuvchi ma'lumotlari yangilandi!" : "Yangi foydalanuvchi qo'shildi!");
        this.closeModal();
        await this.fetchData();
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "Foydalanuvchini saqlashda xatolik yuz berdi");
      } finally {
        this.saving = false;
      }
    },
    async unlockUser(user) {
      try {
        await api.post("/auth/unlock", { identifier: user.id });
        this.$toast.success(`${user.firstName} ${user.lastName} muvaffaqiyatli blokdan chiqarildi!`);
        await this.fetchData();
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "Blokdan chiqarishda xatolik");
      }
    },
    async deleteUser(user) {
      if (!confirm(`${user.firstName} ${user.lastName} foydalanuvchisini o'chirishni tasdiqlaysizmi?`)) return;
      try {
        await usersApi.delete(user.id);
        this.$toast.success("Foydalanuvchi o'chirildi");
        await this.fetchData();
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "O'chirishda xatolik");
      }
    },
  },
};
</script>
