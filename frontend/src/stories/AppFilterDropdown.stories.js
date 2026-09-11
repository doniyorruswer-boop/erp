import { ref } from "vue";

import AppFilterDropdown from "../components/common/AppFilterDropdown.vue";

export default {
  title: "Design System/AppFilterDropdown",
  component: AppFilterDropdown,
  tags: ["autodocs"],
};

export const ClassFilter = {
  render: () => ({
    components: { AppFilterDropdown },
    setup() {
      const selectedClass = ref("all");
      const classOptions = [
        { value: "all", label: "Barcha sinflar" },
        { value: "7-a", label: "7-A sinf" },
        { value: "7-b", label: "7-B sinf" },
        { value: "8-a", label: "8-A sinf" },
        { value: "9-a", label: "9-A sinf" },
        { value: "11-b", label: "11-B sinf" },
      ];
      return { selectedClass, classOptions };
    },
    template: `
      <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[300px]">
        <div class="flex items-center gap-3">
          <AppFilterDropdown
            v-model="selectedClass"
            :options="classOptions"
            label="Sinf"
            icon="solar:users-group-two-rounded-linear"
            allLabel="Barcha sinflar"
            allValue="all"
          />
          <span class="text-xs text-gray-500">Tanlangan qiymat: <b>{{ selectedClass }}</b></span>
        </div>
      </div>
    `,
  }),
};

export const StatusFilter = {
  render: () => ({
    components: { AppFilterDropdown },
    setup() {
      const selectedStatus = ref("active");
      const statusOptions = [
        { value: "all", label: "Barcha holatlar" },
        { value: "active", label: "Faol o'quvchilar" },
        { value: "trial", label: "Sinov muddati" },
        { value: "debtor", label: "Qarzdorlar" },
        { value: "archived", label: "Arxivlanganlar" },
      ];
      return { selectedStatus, statusOptions };
    },
    template: `
      <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[300px]">
        <div class="flex items-center gap-3">
          <AppFilterDropdown
            v-model="selectedStatus"
            :options="statusOptions"
            label="Holati"
            icon="solar:check-circle-linear"
            allLabel="Barcha holatlar"
            allValue="all"
          />
          <span class="text-xs text-gray-500">Tanlangan qiymat: <b>{{ selectedStatus }}</b></span>
        </div>
      </div>
    `,
  }),
};
