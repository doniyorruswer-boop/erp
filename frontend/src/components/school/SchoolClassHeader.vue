<template>
  <div class="space-y-4">
    <!-- 1. Breadcrumb -->
    <Breadcrumb
      :items="[
        { title: 'Ta\'lim', to: '/school/classes' },
        { title: tenantStore.classesLabel, to: '/school/classes' },
        { title: `${classInfo.name} ${tenantStore.classLabel.toLowerCase()}i` },
      ]"
    />

    <!-- 2. Sahifa Asosiy Sarlavhasi va O'ng Tomondagi Amallar Paneli -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-2">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          O'quvchilar ro'yxati
        </h1>
      </div>

      <!-- O'ng tomondagi amallar tugmalari (Kanban AppButton komponenti bilan) -->
      <div class="flex items-center gap-2 flex-wrap">
        <AppButton icon="ri:team-fill" @click="$emit('action', 'groups')"> Guruhlar </AppButton>

        <AppButton icon="solar:document-text-bold" @click="$emit('action', 'template')">
          Shablon
        </AppButton>

        <AppButton icon="solar:import-linear" @click="$emit('action', 'import')">
          Import Excel
        </AppButton>

        <AppButton
          :variant="isBulkTableMode ? 'primary' : 'outline'"
          icon="solar:check-square-linear"
          @click="$emit('toggle-bulk')"
        >
          Ommaviy
        </AppButton>

        <AppButton icon="solar:export-linear" @click="$emit('action', 'export')">
          Export Excel
        </AppButton>

        <AppButton icon="solar:restart-linear" @click="$emit('action', 'passwords')">
          Parollarni yangilash
        </AppButton>

        <!-- Keyingi yilga o'tkazish (Primary variant) -->
        <AppButton
          variant="primary"
          icon="solar:square-academic-cap-bold"
          icon-class="text-lg"
          @click="$emit('action', 'promote')"
        >
          {{ tenantStore.promoteActionLabel }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";
import { useTenantStore } from "@/store/tenant";

export default {
  name: "SchoolClassHeader",
  components: {
    Breadcrumb,
    AppButton,
  },
  props: {
    classInfo: {
      type: Object,
      required: true,
    },
    isBulkTableMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["toggle-bulk", "action"],
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
};
</script>
