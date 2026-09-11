import AppGroupBadge from "../components/common/AppGroupBadge.vue";
import AppStatusBadge from "../components/common/AppStatusBadge.vue";

export default {
  title: "Design System/Badges",
  component: AppStatusBadge,
  tags: ["autodocs"],
};

export const StatusBadges = {
  render: () => ({
    components: { AppStatusBadge },
    template: `
      <div class="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-xl">
        <h4 class="text-sm font-semibold text-gray-500">Holat Nishonlari (Avtomatik rang aniqlash)</h4>
        <div class="flex flex-wrap gap-2">
          <AppStatusBadge status="Faol" />
          <AppStatusBadge status="O'quvchi" />
          <AppStatusBadge status="To'langan" />
          <AppStatusBadge status="Sinov" />
          <AppStatusBadge status="Kutilmoqda" />
          <AppStatusBadge status="Qisman" />
          <AppStatusBadge status="Chetlatilgan" />
          <AppStatusBadge status="Nofaol" />
          <AppStatusBadge status="Qarzdor" />
          <AppStatusBadge status="Yangi" />
        </div>
        <h4 class="text-sm font-semibold text-gray-500 pt-2">Shakllar va O'lchamlar</h4>
        <div class="flex flex-wrap items-center gap-2">
          <AppStatusBadge status="Pill XS" size="xs" shape="pill" variant="success" />
          <AppStatusBadge status="Pill SM" size="sm" shape="pill" variant="success" />
          <AppStatusBadge status="Pill MD" size="md" shape="pill" variant="success" />
          <AppStatusBadge status="Rounded SM" size="sm" shape="rounded" variant="info" />
          <AppStatusBadge status="Dotsiz" :showDot="false" variant="neutral" />
        </div>
      </div>
    `,
  }),
};

export const GroupBadges = {
  render: () => ({
    components: { AppGroupBadge },
    template: `
      <div class="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-xl">
        <h4 class="text-sm font-semibold text-gray-500">Sinflar va Guruhlar (Guruh Nishonlari)</h4>
        <div class="flex flex-wrap gap-2">
          <AppGroupBadge name="7-A sinf" variant="blue" />
          <AppGroupBadge name="11-B sinf" variant="purple" />
          <AppGroupBadge name="Frontend Bootcamp #4" variant="emerald" />
          <AppGroupBadge name="Arxiv Guruh" variant="gray" />
        </div>
      </div>
    `,
  }),
};
