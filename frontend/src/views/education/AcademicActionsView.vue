<template>
  <div class="academic-actions-page p-4 font-lexend space-y-4">
    <Breadcrumb
      :items="[
        { title: 'O\'quv jarayoni', to: '/education/schedule' },
        { title: 'Akademik harakatlar' },
      ]"
    />

    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Akademik harakatlar
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          O'quvchilarni sinfdan-sinfga o'tkazish, akademik ta'til va ko'chirish buyruqlari jurnali
        </p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="primary" icon="solar:add-circle-bold"> Yangi buyruq </AppButton>
      </div>
    </div>

    <!-- Actions Table -->
    <AppTable
      :columns="tableColumns"
      :data="actionsList"
      :total-items="actionsList.length"
      :show-index="true"
    >
      <template #cell(date)="{ row }">
        <AppDateCell :date="row.date" />
      </template>

      <template #cell(studentName)="{ row }">
        <AppUserCell :name="row.studentName" :subtitle="'Buyruq № ' + row.orderNumber" />
      </template>

      <template #cell(fromClass)="{ row }">
        <AppGroupBadge :name="row.fromClass" />
      </template>

      <template #cell(toClass)="{ row }">
        <AppGroupBadge :name="row.toClass" />
      </template>

      <template #cell(status)="{ row }">
        <AppStatusBadge :status="row.status" />
      </template>

      <template #actions>
        <div class="flex items-center gap-1 justify-end">
          <button
            type="button"
            class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary transition"
            title="Hujjatni ko'rish"
          >
            <Icon icon="solar:document-text-bold" class="text-sm" />
          </button>
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";
import AppDateCell from "@/components/common/AppDateCell.vue";
import AppGroupBadge from "@/components/common/AppGroupBadge.vue";
import AppStatusBadge from "@/components/common/AppStatusBadge.vue";
import AppTable from "@/components/common/AppTable.vue";
import AppUserCell from "@/components/common/AppUserCell.vue";

export default {
  name: "AcademicActionsView",
  components: {
    Icon,
    Breadcrumb,
    AppTable,
    AppButton,
    AppDateCell,
    AppGroupBadge,
    AppUserCell,
    AppStatusBadge,
  },
  data() {
    return {
      tableColumns: [
        { key: "date", label: "Sana", sortable: true },
        { key: "studentName", label: "O'quvchi / Buyruq", sortable: true },
        { key: "actionType", label: "Harakat turi", sortable: true },
        { key: "fromClass", label: "Avvalgi sinf", align: "center", sortable: true },
        { key: "toClass", label: "Yangi sinf / Holat", align: "center", sortable: true },
        { key: "reason", label: "Asos / Sabab", sortable: false },
        { key: "status", label: "Holat", align: "center", sortable: true },
        { key: "actions", label: "Hujjat", align: "right", sortable: false },
      ],
      actionsList: [
        {
          id: 1,
          date: "2026-03-01",
          orderNumber: "B-142",
          studentName: "Qosimov Timur",
          actionType: "Sinfni o'zgartirish",
          fromClass: "1-A",
          toClass: "1-B",
          reason: "Ota-onasi arizasiga ko'ra",
          status: "Tasdiqlangan",
        },
        {
          id: 2,
          date: "2026-02-15",
          orderNumber: "B-119",
          studentName: "Karimov Shahzod",
          actionType: "Akademik ta'til",
          fromClass: "2-B",
          toClass: "Ta'tilda",
          reason: "Salomatligi sababli (1 yil)",
          status: "Faol",
        },
        {
          id: 3,
          date: "2026-01-20",
          orderNumber: "B-098",
          studentName: "Saidov Mansur",
          actionType: "Boshqa maktabga ko'chirish",
          fromClass: "4-A",
          toClass: "Chetlatilgan",
          reason: "Yashash joyi o'zgarganligi munosabati bilan",
          status: "Bajarildi",
        },
      ],
    };
  },
};
</script>
