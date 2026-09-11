<template>
  <div class="replace-teacher-page p-4 font-lexend space-y-4">
    <Breadcrumb
      :items="[
        { title: 'O\'quv jarayoni', to: '/education/schedule' },
        { title: 'O\'qituvchini almashtirish' },
      ]"
    />

    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          O'qituvchini almashtirish
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Kasallik yoki xizmat safari tufayli dars o'rnini bosish va vaqtincha biriktirish jurnali
        </p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="primary" icon="solar:add-circle-bold" @click="showAddModal = true">
          Almashtirish qo'shish
        </AppButton>
      </div>
    </div>

    <AppTable
      :columns="tableColumns"
      :data="substitutions"
      :total-items="substitutions.length"
      :show-index="true"
    >
      <template #cell(date)="{ row }">
        <AppDateCell :date="row.date" />
      </template>

      <template #cell(className)="{ row }">
        <AppGroupBadge :name="row.className" />
      </template>

      <template #cell(originalTeacher)="{ row }">
        <AppUserCell :name="row.originalTeacher" subtitle="Asosiy o'qituvchi" />
      </template>

      <template #cell(substituteTeacher)="{ row }">
        <AppUserCell :name="row.substituteTeacher" subtitle="O'rnini bosuvchi" />
      </template>

      <template #cell(status)="{ row }">
        <AppStatusBadge :status="row.status" />
      </template>

      <template #actions>
        <div class="flex items-center gap-1 justify-end">
          <button
            type="button"
            class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary transition"
            title="Tahrirlash"
          >
            <Icon icon="solar:pen-2-bold" class="text-sm" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-500 hover:text-rose-600 transition"
            title="O'chirish"
          >
            <Icon icon="solar:trash-bin-trash-bold" class="text-sm" />
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
  name: "ReplaceTeacherView",
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
      showAddModal: false,
      tableColumns: [
        { key: "date", label: "Sana", sortable: true },
        { key: "className", label: "Sinf", align: "center", sortable: true },
        { key: "period", label: "Dars", align: "center", sortable: true },
        { key: "subject", label: "Fan", sortable: true },
        { key: "originalTeacher", label: "Asosiy o'qituvchi", sortable: true },
        { key: "substituteTeacher", label: "O'rnini bosuvchi", sortable: true },
        { key: "reason", label: "Sababi", sortable: false },
        { key: "status", label: "Holat", align: "center", sortable: true },
        { key: "actions", label: "Amallar", align: "right", sortable: false },
      ],
      substitutions: [
        {
          id: 1,
          date: "2026-03-10",
          className: "1-A",
          period: "2-dars",
          subject: "Matematika",
          originalTeacher: "Normatova Ruxshona",
          substituteTeacher: "Karimova Zilola",
          reason: "Xizmat safari",
          status: "Faol",
        },
        {
          id: 2,
          date: "2026-03-09",
          className: "3-A",
          period: "3-dars",
          subject: "Ingliz tili",
          originalTeacher: "Aliyeva Dildora",
          substituteTeacher: "Saidov Elyor",
          reason: "Salomatligi tufayli",
          status: "Tasdiqlangan",
        },
        {
          id: 3,
          date: "2026-03-08",
          className: "5-B",
          period: "1-dars",
          subject: "Biologiya",
          originalTeacher: "Qodirova Shahnoza",
          substituteTeacher: "Sobirova Gulnora",
          reason: "Malaka oshirish",
          status: "Bajarildi",
        },
      ],
    };
  },
};
</script>
