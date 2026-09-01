<template>
  <!-- sidebar -->
  <nav class="sidebar bg-white dark:bg-gray-800">
    <!-- sidebar head -->
    <div class="sidebar-head p-4">
      <router-link
        to="/"
        exact
        class="flex"
      >
        <img
          src="../assets/logo/logo.svg"
          alt="EduHUB"
          class="w-8 h-8 rounded-lg mt-1"
        />
        <h2
          class="text-2xl font-bold ml-3 mt-1 text-gray-800 dark:text-gray-200"
          translate="no"
        >
          Edu<span class="text-primary">HUB</span>
        </h2>
      </router-link>
      <div
        class="bg-gray-700 absolute mt-3 dark:block hidden rounded-md py-1 px-2 text-xs text-gray-200"
      >
        Dark mode
      </div>
      <button
        class="lg:hidden block dark:text-gray-400 float-right -mt-7"
        @click="$emit('sidebarToggle')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          role="img"
          width="25px"
          height="25px"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 32 32"
        >
          <path
            fill="currentColor"
            d="M7.219 5.781L5.78 7.22L14.563 16L5.78 24.781l1.44 1.439L16 17.437l8.781 8.782l1.438-1.438L17.437 16l8.782-8.781L24.78 5.78L16 14.563z"
          />
        </svg>
      </button>
    </div>
    <!-- sidebar list -->
    <div class="sidebar-list p-4 mt-4 divide-y dark:divide-gray-700">
      <div class="pb-5">
        <p class="font-medium text-gray-400 dark:text-gray-400">
          {{ tenantStore.isSchool ? "Maktab Boshqaruvi" : tenantStore.isKindergarten ? "Bog'cha Boshqaruvi" : "EduHub Menu" }}
        </p>
        <div class="wrap-item mt-4 dark:text-gray-500">
          <div class="item">
            <router-link
              to="/"
              exact
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="bxs:dashboard" /></span>
              <span class="w-full"> Dashboard </span>
            </router-link>
          </div>

          <!-- Lidlar & Kanban -->
          <div class="item mt-2">
            <router-link
              to="/leads"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:tuning-square-2-bold" /></span>
              <span class="w-full"> Lidlar & Kanban </span>
            </router-link>
          </div>

          <!-- CRM Sozlamalar -->
          <div class="item mt-1">
            <router-link
              to="/crm/settings"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <span class="mr-3 text-xl text-primary"><Icon icon="solar:settings-minimalistic-bold" /></span>
              <span class="w-full"> CRM Sozlamalar </span>
            </router-link>
          </div>

          <!-- Students -->
          <div class="item mt-2">
            <router-link
              to="/students"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="ph:student-fill" /></span>
              <span class="w-full"> O'quvchilar </span>
            </router-link>
          </div>

          <!-- School Classes (If School) -->
          <div v-if="tenantStore.isSchool" class="item mt-2">
            <router-link
              to="/school/classes"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:buildings-3-bold" /></span>
              <span class="w-full"> Maktab Sinflari </span>
            </router-link>
          </div>

          <!-- Groups (If Course Center or Kindergarten) -->
          <div v-if="!tenantStore.isSchool" class="item mt-2">
            <router-link
              to="/groups"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="ri:team-fill" /></span>
              <span class="w-full"> Guruhlar </span>
            </router-link>
          </div>

          <!-- Courses -->
          <div v-if="tenantStore.isCourseCenter" class="item mt-2">
            <router-link
              to="/courses"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:book-bookmark-bold" /></span>
              <span class="w-full"> Kurslar </span>
            </router-link>
          </div>

          <!-- Contracts -->
          <div class="item mt-2">
            <router-link
              to="/contracts"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:document-text-bold" /></span>
              <span class="w-full"> Shartnomalar </span>
            </router-link>
          </div>

          <!-- Attendance -->
          <div class="item mt-2">
            <router-link
              to="/attendance"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="fluent:calendar-checkmark-24-filled" /></span>
              <span class="w-full"> Davomat </span>
            </router-link>
          </div>

          <!-- Finance -->
          <div class="item mt-2">
            <router-link
              to="/finance"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:wallet-money-bold" /></span>
              <span class="w-full"> Moliya & Kassa </span>
            </router-link>
          </div>

          <!-- Calendar -->
          <div class="item mt-2">
            <router-link
              to="/calendar"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:calendar-mark-bold" /></span>
              <span class="w-full"> Taqvim & Tadbirlar </span>
            </router-link>
          </div>

          <!-- Setup Wizard Link (Quick Access / Configuration) -->
          <div class="item mt-3 pt-3 border-t dark:border-gray-700">
            <router-link
              to="/setup"
              class="w-full flex text-left rounded-md box-border p-3 bg-primary/10 text-primary hover:bg-primary/20 transition font-semibold"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:settings-bold" /></span>
              <span class="w-full"> Setup & Sozlash </span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { Icon } from "@iconify/vue";
import { useTenantStore } from "@/store/tenant";

export default {
  name: "Sidebar",
  components: {
    Icon,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  mounted() {
    this.tenantStore.fetchTenantConfig();
  },
};
</script>
