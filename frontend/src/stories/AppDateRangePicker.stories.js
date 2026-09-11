import { ref } from "vue";

import AppDateRangePicker from "../components/common/AppDateRangePicker.vue";

export default {
  title: "Design System/AppDateRangePicker",
  component: AppDateRangePicker,
  tags: ["autodocs"],
};

export const Default = {
  render: () => ({
    components: { AppDateRangePicker },
    setup() {
      const startDate = ref("2026-09-01");
      const endDate = ref("2026-09-30");
      return { startDate, endDate };
    },
    template: `
      <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[380px]">
        <div class="space-y-2">
          <p class="text-xs text-gray-500 font-medium">Tanlangan davr: {{ startDate }} dan {{ endDate }} gacha</p>
          <AppDateRangePicker
            :startDate="startDate"
            :endDate="endDate"
            align="left"
            @update:startDate="val => startDate = val"
            @update:endDate="val => endDate = val"
          />
        </div>
      </div>
    `,
  }),
};

export const HeaderAligned = {
  render: () => ({
    components: { AppDateRangePicker },
    setup() {
      const startDate = ref("2026-09-01");
      const endDate = ref("2026-09-09");
      return { startDate, endDate };
    },
    template: `
      <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[380px] flex justify-end">
        <AppDateRangePicker
          :startDate="startDate"
          :endDate="endDate"
          align="right"
          size="sm"
          @update:startDate="val => startDate = val"
          @update:endDate="val => endDate = val"
        />
      </div>
    `,
  }),
};
