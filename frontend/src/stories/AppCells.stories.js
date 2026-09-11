import AppMoneyCell from "../components/common/AppMoneyCell.vue";
import AppPhoneCell from "../components/common/AppPhoneCell.vue";
import AppUserCell from "../components/common/AppUserCell.vue";

export default {
  title: "Design System/Table Cells",
  tags: ["autodocs"],
};

export const UserCells = {
  render: () => ({
    components: { AppUserCell },
    template: `
      <div class="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-xl">
        <h4 class="text-sm font-semibold text-gray-500">F.I.SH va Shaxs Katakchalari</h4>
        <div class="space-y-3 max-w-md">
          <AppUserCell name="Alisher Navoiy" subtitle="Super Administrator" />
          <AppUserCell name="Zilola Karimova" subtitle="7-A sinf o'quvchisi" :clickable="true" />
          <AppUserCell name="Jasur Rahimov" badge="Nofaol" badgeVariant="danger" subtitle="ID: ST-2026-089" />
          <AppUserCell name="Shahnoza Boboyeva" size="lg" subtitle="Bosh buxgalter" />
        </div>
      </div>
    `,
  }),
};

export const MoneyCells = {
  render: () => ({
    components: { AppMoneyCell },
    template: `
      <div class="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-xl">
        <h4 class="text-sm font-semibold text-gray-500">Pul va To'lov Katakchalari</h4>
        <div class="space-y-2 max-w-sm">
          <div class="flex justify-between border-b pb-1">
            <span class="text-sm text-gray-500">Oddiy to'lov:</span>
            <AppMoneyCell :amount="1850000" />
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="text-sm text-gray-500">Qarzdorlik (mavjud):</span>
            <AppMoneyCell :amount="420000" type="debt" />
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="text-sm text-gray-500">Qarzdorlik (nol):</span>
            <AppMoneyCell :amount="0" type="debt" />
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="text-sm text-gray-500">Kirim / Daromad:</span>
            <AppMoneyCell :amount="12500000" type="income" />
          </div>
        </div>
      </div>
    `,
  }),
};

export const PhoneCells = {
  render: () => ({
    components: { AppPhoneCell },
    template: `
      <div class="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-xl">
        <h4 class="text-sm font-semibold text-gray-500">Telefon Raqam Katakchalari</h4>
        <div class="space-y-2 max-w-sm">
          <AppPhoneCell phone="901234567" />
          <AppPhoneCell phone="998971112233" />
          <AppPhoneCell phone="" emptyText="Raqam kiritilmagan" />
        </div>
      </div>
    `,
  }),
};
