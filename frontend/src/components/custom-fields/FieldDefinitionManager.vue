<template>
  <div class="field-definition-manager font-lexend space-y-6">
    <!-- Header & Entity Type Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100">
          Moslashuvchan Maydonlar (Custom Fields)
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Har bir modul uchun qo'shimcha maxsus maydonlarni boshqarish
        </p>
      </div>
      <AppButton variant="primary" icon="lucide:plus" @click="openCreateModal">
        Yangi maydon qo'shish
      </AppButton>
    </div>

    <!-- Entity Tabs -->
    <div
      class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800"
    >
      <button
        v-for="tab in entityTabs"
        :key="tab.value"
        class="px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap"
        :class="
          activeTab === tab.value
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        "
        @click="switchTab(tab.value)"
      >
        <Icon :icon="tab.icon" class="text-sm" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Table of Fields -->
    <div
      class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xs overflow-hidden"
    >
      <div v-if="loading" class="p-8 text-center text-xs text-gray-500">
        Maydonlar yuklanmoqda...
      </div>
      <div v-else-if="fields.length === 0" class="p-8 text-center">
        <Icon
          icon="lucide:layout-list"
          class="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-2"
        />
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
          Ushbu modul uchun hali maxsus maydonlar kiritilmagan
        </p>
      </div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr
            class="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider"
          >
            <th class="p-3.5">Nomi</th>
            <th class="p-3.5">Kaliti (Key)</th>
            <th class="p-3.5">Turi</th>
            <th class="p-3.5">Guruhi</th>
            <th class="p-3.5 text-center">Majburiy</th>
            <th class="p-3.5 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
          <tr
            v-for="item in fields"
            :key="item.id"
            class="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition"
          >
            <td class="p-3.5 font-medium text-gray-800 dark:text-gray-200">{{ item.label }}</td>
            <td class="p-3.5 text-gray-500 font-mono text-[11px]">{{ item.key }}</td>
            <td class="p-3.5">
              <span
                class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              >
                {{ item.fieldType }}
              </span>
            </td>
            <td class="p-3.5 text-gray-600 dark:text-gray-400">
              {{ item.fieldGroup || "Asosiy" }}
            </td>
            <td class="p-3.5 text-center">
              <span v-if="item.isRequired" class="text-red-500 font-bold">Ha</span>
              <span v-else class="text-gray-400">Yo'q</span>
            </td>
            <td class="p-3.5 text-right space-x-2">
              <button
                class="p-1.5 text-gray-500 hover:text-primary transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                @click="openEditModal(item)"
              >
                <Icon icon="lucide:pencil" class="text-sm" />
              </button>
              <button
                class="p-1.5 text-gray-500 hover:text-red-500 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                @click="deleteField(item.id)"
              >
                <Icon icon="lucide:trash-2" class="text-sm" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit Modal -->
    <Modal v-if="showModal" :is-open="showModal" @close="showModal = false">
      <div class="p-6 space-y-4 font-lexend">
        <h3 class="text-sm font-bold text-gray-800 dark:text-gray-100">
          {{ editingId ? "Maydonni tahrirlash" : "Yangi maydon qo'shish" }}
        </h3>

        <FormInput
          v-model="form.label"
          label="Maydon nomi (Label)"
          placeholder="Masalan: Pasport nusxasi"
          required
        />

        <FormInput
          v-if="!editingId"
          v-model="form.key"
          label="Tizim kaliti (Key)"
          placeholder="masalan: passport_copy"
          required
        />

        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >Maydon turi</label
          >
          <select
            v-model="form.fieldType"
            class="w-full h-11 px-3.5 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
          >
            <option v-for="t in fieldTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div v-if="['SELECT', 'MULTI_SELECT'].includes(form.fieldType)">
          <FormInput
            v-model="form.optionsString"
            label="Variantlar (vergul bilan ajrating)"
            placeholder="Variant 1, Variant 2, Variant 3"
          />
        </div>

        <FormInput
          v-model="form.fieldGroup"
          label="Guruhi (Section)"
          placeholder="Masalan: Shaxsiy ma'lumotlar"
        />

        <div class="flex items-center gap-3 pt-2">
          <input
            id="modal-req"
            v-model="form.isRequired"
            type="checkbox"
            class="w-4 h-4 text-primary rounded border-gray-300"
          />
          <label for="modal-req" class="text-xs font-medium text-gray-700 dark:text-gray-300"
            >To'ldirilishi majburiy</label
          >
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <AppButton variant="secondary" @click="showModal = false">Bekor qilish</AppButton>
          <AppButton variant="primary" :loading="saving" @click="saveField">Saqlash</AppButton>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { customFieldsApi } from "@/api/services";
import AppButton from "@/components/common/AppButton.vue";
import modal from "@/components/common/AppModal.vue";

import FormInput from "../FormInput.vue";

export default {
  name: "FieldDefinitionManager",
  components: { Icon, FormInput, AppButton, modal },
  data() {
    return {
      activeTab: "STUDENT",
      loading: false,
      saving: false,
      showModal: false,
      editingId: null,
      fields: [],
      entityTabs: [
        { label: "O'quvchilar", value: "STUDENT", icon: "lucide:graduation-cap" },
        { label: "Lidlar", value: "LEAD", icon: "lucide:user-plus" },
        { label: "Mijozlar", value: "CUSTOMER", icon: "lucide:users" },
        { label: "Guruhlar", value: "GROUP", icon: "lucide:layers" },
        { label: "Kurslar", value: "COURSE", icon: "lucide:book-open" },
        { label: "Xodimlar", value: "USER", icon: "lucide:briefcase" },
      ],
      fieldTypes: [
        "TEXT",
        "TEXTAREA",
        "NUMBER",
        "DATE",
        "DATETIME",
        "BOOLEAN",
        "SELECT",
        "MULTI_SELECT",
        "EMAIL",
        "PHONE",
        "URL",
      ],
      form: {
        label: "",
        key: "",
        fieldType: "TEXT",
        optionsString: "",
        fieldGroup: "Asosiy",
        isRequired: false,
      },
    };
  },
  mounted() {
    this.fetchFields();
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab;
      this.fetchFields();
    },
    async fetchFields() {
      this.loading = true;
      try {
        const res = await customFieldsApi.getDefinitions({ entityType: this.activeTab });
        this.fields = res.data || [];
      } catch (err) {
        console.error("Maydonlarni yuklashda xatolik:", err);
      } finally {
        this.loading = false;
      }
    },
    openCreateModal() {
      this.editingId = null;
      this.form = {
        label: "",
        key: "",
        fieldType: "TEXT",
        optionsString: "",
        fieldGroup: "Asosiy",
        isRequired: false,
      };
      this.showModal = true;
    },
    openEditModal(item) {
      this.editingId = item.id;
      this.form = {
        label: item.label,
        key: item.key,
        fieldType: item.fieldType,
        optionsString: Array.isArray(item.options) ? item.options.join(", ") : "",
        fieldGroup: item.fieldGroup || "Asosiy",
        isRequired: item.isRequired,
      };
      this.showModal = true;
    },
    async saveField() {
      this.saving = true;
      try {
        const options = this.form.optionsString
          ? this.form.optionsString
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

        if (this.editingId) {
          await customFieldsApi.updateDefinition(this.editingId, {
            label: this.form.label,
            fieldType: this.form.fieldType,
            options,
            fieldGroup: this.form.fieldGroup,
            isRequired: this.form.isRequired,
          });
        } else {
          await customFieldsApi.createDefinition({
            entityType: this.activeTab,
            label: this.form.label,
            key: this.form.key,
            fieldType: this.form.fieldType,
            options,
            fieldGroup: this.form.fieldGroup,
            isRequired: this.form.isRequired,
          });
        }
        this.showModal = false;
        await this.fetchFields();
      } catch (err) {
        alert(err.response?.data?.message || "Saqlashda xatolik");
      } finally {
        this.saving = false;
      }
    },
    async deleteField(id) {
      if (!confirm("Haqiqatan ham ushbu maydonni o'chirmoqchimisiz?")) return;
      try {
        await customFieldsApi.deleteDefinition(id);
        await this.fetchFields();
      } catch (err) {
        alert("O'chirishda xatolik yuz berdi");
      }
    },
  },
};
</script>
