<template>
  <div class="roles-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Rollar & Tizim Ruxsatlari' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Rollar & Tizim Ruxsatlari (RBAC)
        </h1>
        <p class="text-sm text-gray-400 mt-0.5">
          Foydalanuvchi rollari, maxsus huquqlar va modul bo'yicha ruxsatnomalar boshqaruvi
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/90 dark:border-gray-700 rounded-md py-2 px-4 font-medium shadow-sm transition cursor-pointer"
          @click="openCreateModal"
        >
          <Icon icon="solar:shield-plus-bold" class="text-lg" />
          <span>Yangi Rol Yaratish</span>
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
        title="Jami Rollar"
        :value="`${roles.length} ta`"
        icon="solar:shield-check-bold"
        variant="primary"
      />
      <StatsCard
        title="Tizim Rollari"
        :value="`${systemRolesCount} ta`"
        icon="solar:shield-star-bold"
        variant="purple"
        value-class="text-primary"
      />
      <StatsCard
        title="Maxsus (Custom) Rollar"
        :value="`${customRolesCount} ta`"
        icon="solar:shield-user-bold"
        variant="success"
        value-class="text-green-600 dark:text-green-400"
      />
      <StatsCard
        title="Mavjud Ruxsatlar"
        :value="`${availablePermissions.length} ta`"
        icon="solar:key-minimalistic-square-bold"
        variant="info"
        value-class="text-indigo-600 dark:text-indigo-400"
      />
    </div>

    <!-- Data Table Component -->
    <DataTable
      title="Barcha Rollar"
      subtitle="Tizimda mavjud rollar va ularga biriktirilgan funksional imkoniyatlar"
      :columns="columns"
      :data="roles"
      :loading="loading"
      :searchable="true"
      :show-index="true"
      :show-per-page="true"
      search-placeholder="Rol nomi yoki kodi..."
      row-key="id"
    >
      <!-- Custom Role Name Cell -->
      <template #cell(name)="{ row }">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"
          >
            <Icon icon="solar:shield-check-bold" class="text-base" />
          </div>
          <div>
            <span class="font-semibold text-gray-800 dark:text-gray-100">{{ row.name }}</span>
            <div class="text-xs text-gray-400">{{ row.description || "Tavsif berilmagan" }}</div>
          </div>
        </div>
      </template>

      <!-- Custom Code Cell -->
      <template #cell(code)="{ row }">
        <span
          class="font-mono text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded"
        >
          {{ row.code || row.name?.toUpperCase().replace(/\s+/g, "_") }}
        </span>
      </template>

      <!-- Custom Permissions Cell -->
      <template #cell(permissions)="{ row }">
        <Badge variant="primary" size="xs">
          {{ (row.permissions || row.rolePermissions || []).length }} ta ruxsat
        </Badge>
      </template>

      <!-- Custom Type Cell -->
      <template #cell(isSystem)="{ row }">
        <Badge :variant="row.isSystem ? 'purple' : 'success'" size="sm">
          {{ row.isSystem ? "Tizim roli" : "Maxsus rol" }}
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
            v-if="!row.isSystem"
            type="button"
            title="O'chirish"
            class="p-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition cursor-pointer"
            @click="deleteRole(row)"
          >
            <Icon icon="solar:trash-bin-trash-linear" class="text-base" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Create / Edit Role Modal -->
    <Vmodal
      :model-value="showModal"
      :title="isEditing ? 'Rolni Tahrirlash' : 'Yangi Rol Yaratish'"
      subtitle="Rol parametrlari va ruxsatnomalar matritsasini belgilang"
      width="max-w-2xl"
      :hide-button="true"
      @update:model-value="showModal = $event"
    >
      <form class="space-y-4" @submit.prevent="saveRole">
        <div class="grid grid-cols-2 gap-3">
          <FormInput
            v-model="form.name"
            label="Rol Nomi"
            required
            placeholder="Masalan: Filial Menejeri"
            icon="solar:shield-linear"
          />
          <FormInput
            v-model="form.code"
            label="Rol Kodi (Katta harflarda)"
            required
            placeholder="BRANCH_MANAGER"
            icon="solar:code-linear"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Tavsif</label
          >
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Ushbu rol foydalanuvchilariga qanday vakolatlar beriladi..."
            class="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 p-2 outline-none focus:border-primary dark:bg-gray-900 text-gray-800 dark:text-gray-100"
          ></textarea>
        </div>

        <!-- Permissions Matrix Grouped by Module -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label
              class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
            >
              Ruxsatlar Matritsasi ({{ selectedPermissionCodes.length }} /
              {{ availablePermissions.length }} tanlandi)
            </label>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                @click="selectAllPermissions"
              >
                Barchasini tanlash
              </button>
              <span class="text-gray-300">|</span>
              <button
                type="button"
                class="text-[11px] text-rose-500 hover:underline font-medium cursor-pointer"
                @click="clearAllPermissions"
              >
                Tozalash
              </button>
            </div>
          </div>

          <div
            class="max-h-60 overflow-y-auto space-y-3 p-3 bg-gray-50 dark:bg-gray-900/60 rounded-md border dark:border-gray-700"
          >
            <div
              v-for="(perms, moduleName) in groupedPermissions"
              :key="moduleName"
              class="space-y-1.5"
            >
              <div
                class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b dark:border-gray-700 pb-1 flex items-center justify-between"
              >
                <span>{{ moduleName }} Moduli</span>
                <span class="text-[10px] text-gray-400 font-normal">({{ perms.length }} ta)</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <label
                  v-for="perm in perms"
                  :key="perm.code"
                  class="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 hover:text-primary cursor-pointer"
                >
                  <input
                    v-model="selectedPermissionCodes"
                    type="checkbox"
                    :value="perm.code"
                    class="mt-0.5 rounded text-primary focus:ring-primary dark:bg-gray-800"
                  />
                  <div>
                    <div class="font-medium font-mono text-[11px]">{{ perm.code }}</div>
                    <div class="text-[10px] text-gray-400">{{ perm.description }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
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

import { rolesApi } from "@/api/services";
import Alert from "@/components/Alert.vue";
import Badge from "@/components/Badge.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import vmodal from "@/components/common/AppModal.vue";
import DataTable from "@/components/common/AppTable.vue";
import FormInput from "@/components/FormInput.vue";
import StatsCard from "@/components/StatsCard.vue";

export default {
  name: "RolesList",
  components: {
    Icon,
    Breadcrumb,
    StatsCard,
    DataTable,
    Badge,
    Alert,
    vmodal,
    FormInput,
  },
  data() {
    return {
      roles: [],
      availablePermissions: [],
      selectedPermissionCodes: [],
      loading: false,
      saving: false,
      alertMessage: "",
      alertType: "success",
      showModal: false,
      isEditing: false,
      currentRoleId: null,
      columns: [
        { key: "name", label: "Rol Nomi" },
        { key: "code", label: "Kodi" },
        { key: "permissions", label: "Ruxsatlar" },
        { key: "isSystem", label: "Turi" },
      ],
      form: {
        name: "",
        code: "",
        description: "",
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
    groupedPermissions() {
      const groups = {};
      this.availablePermissions.forEach((p) => {
        const mod = p.module || "UMUMIY";
        if (!groups[mod]) groups[mod] = [];
        groups[mod].push(p);
      });
      return groups;
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
          const val = rolesRes.value;
          this.roles = Array.isArray(val) ? val : val?.data || val?.items || [];
        }
        if (permsRes.status === "fulfilled") {
          const val = permsRes.value;
          this.availablePermissions = Array.isArray(val) ? val : val?.data || val?.items || [];
        }
      } catch (err) {
        console.error("Rollar va ruxsatlarni yuklashda xatolik:", err);
        this.alertType = "danger";
        this.alertMessage = "Ma'lumotlarni yuklashda xatolik yuz berdi.";
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
      };
      this.selectedPermissionCodes = [];
      this.showModal = true;
    },
    openEditModal(role) {
      this.isEditing = true;
      this.currentRoleId = role.id;
      this.form = {
        name: role.name,
        code: role.code,
        description: role.description || "",
      };
      const perms = role.permissions || role.rolePermissions || [];
      this.selectedPermissionCodes = perms.map((p) =>
        typeof p === "string" ? p : p.permission?.code || p.code
      );
      this.showModal = true;
    },
    selectAllPermissions() {
      this.selectedPermissionCodes = this.availablePermissions.map((p) => p.code);
    },
    clearAllPermissions() {
      this.selectedPermissionCodes = [];
    },
    async saveRole() {
      if (!this.form.name || !this.form.code) {
        this.alertType = "danger";
        this.alertMessage = "Iltimos, rol nomi va kodini kiriting!";
        return;
      }
      this.saving = true;
      try {
        const payload = {
          ...this.form,
          permissions: this.selectedPermissionCodes,
        };
        if (this.isEditing) {
          await rolesApi.update(this.currentRoleId, payload);
          this.alertType = "success";
          this.alertMessage = "Rol muvaffaqiyatli yangilandi!";
        } else {
          await rolesApi.create(payload);
          this.alertType = "success";
          this.alertMessage = "Yangi rol muvaffaqiyatli yaratildi!";
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
    async deleteRole(role) {
      if (!confirm(`${role.name} rolini o'chirmoqchimisiz?`)) return;
      try {
        await rolesApi.delete(role.id);
        this.alertType = "success";
        this.alertMessage = "Rol muvaffaqiyatli o'chirildi!";
        await this.fetchData();
      } catch (err) {
        this.alertType = "danger";
        this.alertMessage = "O'chirishda xatolik: " + (err.response?.data?.message || err.message);
      }
    },
  },
};
</script>
