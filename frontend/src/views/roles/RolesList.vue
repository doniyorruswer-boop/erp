<template>
  <div class="roles-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Rollar & Tizim Ruxsatlari' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Rollar & Tizim Ruxsatlari (RBAC)</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          Foydalanuvchi rollari, maxsus huquqlar va modul bo'yicha ruxsatnomalar boshqaruvi.
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl shadow-sm transition duration-150 ease-in-out cursor-pointer"
        >
          <Icon icon="solar:shield-plus-bold" class="w-5 h-5 mr-1.5" />
          Yangi Rol Yaratish
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Jami Rollar</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ roles.length }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Tizim Rollari</p>
        <p class="text-2xl font-bold text-primary mt-2">{{ systemRolesCount }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Maxsus (Custom) Rollar</p>
        <p class="text-2xl font-bold text-emerald-600 mt-2">{{ customRolesCount }} ta</p>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Mavjud Ruxsatlar</p>
        <p class="text-2xl font-bold text-indigo-600 mt-2">{{ availablePermissions.length }} ta</p>
      </div>
    </div>

    <!-- Roles Grid / Table -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
        <p>Yuklanmoqda...</p>
      </div>

      <div v-else-if="roles.length === 0" class="p-12 text-center text-gray-400">
        <Icon icon="solar:shield-warning-bold" class="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
        <p class="text-base font-medium">Hech qanday rol topilmadi</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead class="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
            <tr>
              <th class="px-6 py-4">Rol Nomi</th>
              <th class="px-6 py-4">Kodi</th>
              <th class="px-6 py-4">Tavsif</th>
              <th class="px-6 py-4">Ruxsatlar soni</th>
              <th class="px-6 py-4">Turi</th>
              <th class="px-6 py-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="role in roles" :key="role.id" class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                <div class="flex items-center gap-2">
                  <Icon icon="solar:shield-check-bold" class="w-5 h-5 text-primary" />
                  {{ role.name }}
                </div>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-gray-500">
                {{ role.code || role.name?.toUpperCase().replace(/\s+/g, '_') }}
              </td>
              <td class="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                {{ role.description || "Standart tizim roli" }}
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {{ role.permissions ? (Array.isArray(role.permissions) ? role.permissions.length : Object.keys(role.permissions).length) : "Barchasi" }} ta ruxsat
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="role.isSystem ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'"
                >
                  {{ role.isSystem ? "Tizim" : "Maxsus" }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="openEditModal(role)"
                  class="p-1.5 text-gray-500 hover:text-primary transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Tahrirlash"
                >
                  <Icon icon="solar:pen-bold" class="w-4 h-4" />
                </button>
                <button
                  v-if="!role.isSystem"
                  @click="deleteRole(role)"
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

    <!-- Create/Edit Role Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between pb-4 border-b dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ isEditing ? "Rolni Tahrirlash" : "Yangi Maxsus Rol Yaratish" }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <Icon icon="solar:close-circle-bold" class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveRole" class="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Rol Nomi *</label>
              <input
                v-model="form.name"
                required
                type="text"
                placeholder="Masalan: Metodist, Nazoratchi"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Rol Kodi *</label>
              <input
                v-model="form.code"
                required
                type="text"
                placeholder="METHODIST"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tavsif</label>
            <input
              v-model="form.description"
              type="text"
              placeholder="Ushbu rol foydalanuvchilarining vazifalari haqida qisqacha..."
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
            />
          </div>

          <!-- Permissions Checkboxes Grouped -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Biriktiriladigan Huquqlar (Ruxsatnomalar)
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto">
              <label
                v-for="perm in availablePermissions"
                :key="perm.id || perm"
                class="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary transition"
              >
                <input
                  type="checkbox"
                  :value="perm.id || perm"
                  v-model="form.permissions"
                  class="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span>{{ perm.label || perm.id || perm }}</span>
              </label>
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
import { rolesApi } from "@/api/services";

export default {
  name: "RolesList",
  components: { Icon, Breadcrumb },
  data() {
    return {
      roles: [],
      availablePermissions: [
        { id: "students.view", label: "O'quvchilarni ko'rish" },
        { id: "students.create", label: "O'quvchi qo'shish" },
        { id: "students.edit", label: "O'quvchini tahrirlash" },
        { id: "students.delete", label: "O'quvchini o'chirish" },
        { id: "courses.manage", label: "Kurslarni boshqarish" },
        { id: "groups.manage", label: "Guruhlarni boshqarish" },
        { id: "attendance.mark", label: "Davomatni belgilash" },
        { id: "finance.view", label: "Moliyani ko'rish" },
        { id: "payments.create", label: "To'lovlarni qabul qilish" },
        { id: "notifications.send", label: "Xabarnomalar yuborish" },
        { id: "settings.manage", label: "Tizim sozlamalari" },
      ],
      loading: true,
      saving: false,
      showModal: false,
      isEditing: false,
      currentRoleId: null,
      form: {
        name: "",
        code: "",
        description: "",
        permissions: [],
      },
    };
  },
  computed: {
    systemRolesCount() {
      return this.roles.filter((r) => r.isSystem).length;
    },
    customRolesCount() {
      return this.roles.filter((r) => !r.isSystem).length;
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [rolesRes, permsRes] = await Promise.allSettled([
          rolesApi.getAll(),
          rolesApi.getPermissions(),
        ]);
        if (rolesRes.status === "fulfilled") {
          this.roles = Array.isArray(rolesRes.value) ? rolesRes.value : (rolesRes.value?.items || []);
        }
        if (permsRes.status === "fulfilled" && Array.isArray(permsRes.value) && permsRes.value.length > 0) {
          this.availablePermissions = permsRes.value;
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      } finally {
        this.loading = false;
      }
    },
    openCreateModal() {
      this.isEditing = false;
      this.currentRoleId = null;
      this.form = {
        name: "",
        code: "",
        description: "",
        permissions: [],
      };
      this.showModal = true;
    },
    openEditModal(role) {
      this.isEditing = true;
      this.currentRoleId = role.id;
      this.form = {
        name: role.name,
        code: role.code || "",
        description: role.description || "",
        permissions: Array.isArray(role.permissions) ? [...role.permissions] : [],
      };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async saveRole() {
      this.saving = true;
      try {
        if (this.isEditing) {
          await rolesApi.update(this.currentRoleId, this.form);
        } else {
          await rolesApi.create(this.form);
        }
        this.$toast.success(this.isEditing ? "Rol yangilandi!" : "Yangi rol yaratildi!");
        this.closeModal();
        await this.fetchData();
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "Rolni saqlashda xatolik yuz berdi");
      } finally {
        this.saving = false;
      }
    },
    async deleteRole(role) {
      if (!confirm(`"${role.name}" rolini o'chirishni tasdiqlaysizmi?`)) return;
      try {
        await rolesApi.delete(role.id);
        this.$toast.success("Rol muvaffaqiyatli o'chirildi");
        await this.fetchData();
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "O'chirishda xatolik");
      }
    },
  },
};
</script>
