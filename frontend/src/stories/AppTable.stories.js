import AppButton from "../components/common/AppButton.vue";
import AppGroupBadge from "../components/common/AppGroupBadge.vue";
import AppMoneyCell from "../components/common/AppMoneyCell.vue";
import AppStatusBadge from "../components/common/AppStatusBadge.vue";
import AppTable from "../components/common/AppTable.vue";
import AppUserCell from "../components/common/AppUserCell.vue";

export default {
  title: "Design System/AppTable",
  component: AppTable,
  tags: ["autodocs"],
};

const sampleColumns = [
  { key: "fullName", label: "O'quvchi F.I.SH", sortable: true },
  { key: "group", label: "Sinf / Guruh", align: "center", sortable: true },
  { key: "status", label: "Holati", align: "center" },
  { key: "balance", label: "Qarzdorlik", align: "right", sortable: true },
  { key: "actions", label: "Amallar", align: "center", sortable: false },
];

const sampleData = [
  { id: 1, fullName: "Abdurashid Karimov", group: "7-A", status: "Faol", balance: 0 },
  { id: 2, fullName: "Nilufar Usmonova", group: "7-A", status: "Faol", balance: 350000 },
  { id: 3, fullName: "Javohir Toshmatov", group: "9-B", status: "Sinov", balance: 0 },
  { id: 4, fullName: "Malika Rahimova", group: "10-A", status: "Qarzdor", balance: 1200000 },
  { id: 5, fullName: "Bekzod Shukurov", group: "Bootcamp #2", status: "Faol", balance: 0 },
  { id: 6, fullName: "Dilnoza Ahmedova", group: "Bootcamp #2", status: "Nofaol", balance: 450000 },
];

export const Default = {
  render: () => ({
    components: {
      AppTable,
      AppButton,
      AppStatusBadge,
      AppUserCell,
      AppMoneyCell,
      AppGroupBadge,
    },
    setup() {
      return {
        columns: sampleColumns,
        data: sampleData,
      };
    },
    template: `
      <div class="p-4 bg-gray-50 dark:bg-gray-950 min-h-[400px]">
        <AppTable
          title="O'quvchilar ro'yxati"
          :searchable="true"
          :selectable="true"
          :columns="columns"
          :items="data"
          :perPage="5"
        >
          <template #cell(fullName)="{ row }">
            <AppUserCell :name="row.fullName" :subtitle="'ID: ST-2026-' + row.id" />
          </template>

          <template #cell(group)="{ row }">
            <AppGroupBadge :name="row.group" />
          </template>

          <template #cell(status)="{ row }">
            <AppStatusBadge :status="row.status" />
          </template>

          <template #cell(balance)="{ row }">
            <AppMoneyCell :amount="row.balance" type="debt" align="right" />
          </template>

          <template #actions="{ row }">
            <div class="flex items-center justify-center gap-1">
              <AppButton size="sm" variant="ghost" icon="solar:eye-linear" />
              <AppButton size="sm" variant="ghost" icon="solar:pen-linear" />
            </div>
          </template>
        </AppTable>
      </div>
    `,
  }),
};
