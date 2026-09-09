<template>
  <!-- sidebar -->
  <nav class="sidebar bg-white dark:bg-gray-800">
    <!-- sidebar head -->
    <div class="sidebar-head p-4">
      <RouterLink to="/" exact class="flex">
        <img src="../assets/logo/logo.svg" :alt="$brand.name" class="w-8 h-8 rounded-lg mt-1" />
        <h2 class="text-2xl font-bold ml-3 mt-1 text-gray-800 dark:text-gray-200" translate="no">
          {{ $brand.prefix }}<span class="text-primary">{{ $brand.suffix }}</span>
        </h2>
      </RouterLink>
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
          {{
            tenantStore.isSchool
              ? "Maktab Boshqaruvi"
              : tenantStore.isKindergarten
                ? "Bog'cha Boshqaruvi"
                : "EduHub Menu"
          }}
        </p>
        <div class="wrap-item mt-4 dark:text-gray-500">
          <div class="item">
            <RouterLink
              to="/"
              exact
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="bxs:dashboard" /></span>
              <span class="w-full"> Dashboard </span>
            </RouterLink>
          </div>

          <!-- To'lovlar statistikasi -->
          <div class="item mt-2">
            <RouterLink
              to="/payment-stats"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:chart-2-bold" /></span>
              <span class="w-full"> To'lovlar statistikasi </span>
            </RouterLink>
          </div>

          <!-- Lidlar & Kanban -->
          <div class="item mt-2">
            <RouterLink
              to="/leads"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:tuning-square-2-bold" /></span>
              <span class="w-full"> Lidlar & Kanban </span>
            </RouterLink>
          </div>

          <!-- Ta'lim (Obucheniye Accordion) -->
          <div class="item mt-2">
            <div
              class="w-full flex items-center justify-between text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition select-none"
              :class="{
                'bg-gray-200/70 dark:bg-gray-700/60 font-semibold':
                  isEducationOpen || isEducationRouteActive,
              }"
              @click="toggleEducationMenu"
            >
              <div class="flex items-center">
                <span class="mr-3 text-xl"><Icon icon="solar:users-group-rounded-bold" /></span>
                <span>Ta'lim</span>
              </div>
              <Icon
                icon="solar:alt-arrow-down-linear"
                class="text-xs text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': isEducationOpen }"
              />
            </div>

            <!-- Submenu -->
            <Transition name="fade">
              <div v-show="isEducationOpen" class="mt-1 space-y-1 pl-3 pr-1 py-1">
                <!-- Sinflar (Asosiy faol bo'lim) -->
                <RouterLink
                  to="/school/classes"
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  active-class="bg-primary/10 text-primary font-bold dark:bg-primary/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 shrink-0"></span>
                  <span class="w-full">{{ tenantStore.classesLabel }}</span>
                </RouterLink>

                <!-- Darajalar va to'garaklar (Faol bo'lim) -->
                <RouterLink
                  to="/school/levels"
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  active-class="bg-primary/10 text-primary font-bold dark:bg-primary/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 shrink-0"></span>
                  <span class="w-full">{{
                    tenantStore.isSchool ? "Darajalar" : "Bosqich guruhlari"
                  }}</span>
                </RouterLink>
                <RouterLink
                  to="/school/students"
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  active-class="bg-primary/10 text-primary font-bold dark:bg-primary/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 shrink-0"></span>
                  <span class="w-full">{{
                    tenantStore.isKindergarten ? "Tarbiyalanuvchilar" : "O'quvchilar"
                  }}</span>
                </RouterLink>
                <RouterLink
                  to="/school/parents"
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  active-class="bg-primary/10 text-primary font-bold dark:bg-primary/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 shrink-0"></span>
                  <span class="w-full">Ota-onalar</span>
                </RouterLink>
                <RouterLink
                  to="/school/dropped"
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  active-class="bg-primary/10 text-primary font-bold dark:bg-primary/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 shrink-0"></span>
                  <span class="w-full">Chetlatilganlar</span>
                </RouterLink>
                <div
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2.5 shrink-0"></span>
                  <span>Arxiv</span>
                </div>
                <div
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2.5 shrink-0"></span>
                  <span>Ota-onalar arxivi</span>
                </div>
              </div>
            </Transition>
          </div>

          <!-- O'quv jarayoni (Учебный процесс Accordion) -->
          <div class="item mt-2">
            <div
              class="w-full flex items-center justify-between text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition select-none"
              :class="{
                'bg-gray-200/70 dark:bg-gray-700/60 font-semibold':
                  isProcessOpen || isProcessRouteActive,
              }"
              @click="toggleProcessMenu"
            >
              <div class="flex items-center">
                <span class="mr-3 text-xl text-primary"
                  ><Icon icon="solar:calendar-date-bold"
                /></span>
                <span>O'quv jarayoni</span>
              </div>
              <Icon
                icon="solar:alt-arrow-down-linear"
                class="text-xs text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': isProcessOpen }"
              />
            </div>

            <!-- Submenu -->
            <Transition name="fade">
              <div v-show="isProcessOpen" class="mt-1 space-y-1 pl-3 pr-1 py-1">
                <!-- Dars jadvali -->
                <RouterLink
                  to="/education/schedule"
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  active-class="bg-primary/10 text-primary font-bold dark:bg-primary/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 shrink-0"></span>
                  <span class="w-full">Dars jadvali</span>
                </RouterLink>

                <!-- O'qituvchini almashtirish -->
                <RouterLink
                  to="/education/replace-teacher"
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  active-class="bg-primary/10 text-primary font-bold dark:bg-primary/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 shrink-0"></span>
                  <span class="w-full">O'qituvchini almashtirish</span>
                </RouterLink>

                <!-- Baholar jurnali -->
                <RouterLink
                  to="/education/gradebook"
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  active-class="bg-primary/10 text-primary font-bold dark:bg-primary/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 shrink-0"></span>
                  <span class="w-full">Baholar jurnali</span>
                </RouterLink>

                <!-- Yakuniy baholar -->
                <RouterLink
                  to="/education/final-grades"
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  active-class="bg-primary/10 text-primary font-bold dark:bg-primary/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 shrink-0"></span>
                  <span class="w-full">Yakuniy baholar</span>
                </RouterLink>

                <!-- Akademik harakatlar -->
                <RouterLink
                  to="/education/academic-actions"
                  class="w-full flex items-center text-left rounded-md box-border py-2 px-3 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  active-class="bg-primary/10 text-primary font-bold dark:bg-primary/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 shrink-0"></span>
                  <span class="w-full">Akademik harakatlar</span>
                </RouterLink>
              </div>
            </Transition>
          </div>

          <!-- Students (Dynamic Module) -->
          <div v-for="item in studentNavItems" :key="item.id" class="item mt-2">
            <RouterLink
              :to="item.path"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon :icon="item.icon" /></span>
              <span class="w-full"> {{ item.label }} </span>
            </RouterLink>
          </div>

          <!-- Groups (If Course Center or Kindergarten) -->
          <div v-if="!tenantStore.isSchool" class="item mt-2">
            <RouterLink
              to="/groups"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="ri:team-fill" /></span>
              <span class="w-full"> Guruhlar </span>
            </RouterLink>
          </div>

          <!-- Courses -->
          <div v-if="tenantStore.isCourseCenter" class="item mt-2">
            <RouterLink
              to="/courses"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:book-bookmark-bold" /></span>
              <span class="w-full"> Kurslar </span>
            </RouterLink>
          </div>

          <!-- Contracts -->
          <div class="item mt-2">
            <RouterLink
              to="/contracts"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:document-text-bold" /></span>
              <span class="w-full"> Shartnomalar </span>
            </RouterLink>
          </div>

          <!-- Attendance (Dynamic Module) -->
          <div v-for="item in attendanceNavItems" :key="item.id" class="item mt-2">
            <RouterLink
              :to="item.path"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon :icon="item.icon" /></span>
              <span class="w-full"> {{ item.label }} </span>
            </RouterLink>
          </div>

          <!-- Finance (Dynamic Module) -->
          <div v-for="item in financeNavItems" :key="item.id" class="item mt-2">
            <RouterLink
              :to="item.path"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon :icon="item.icon" /></span>
              <span class="w-full"> {{ item.label }} </span>
            </RouterLink>
          </div>

          <!-- Xodimlar & HR -->
          <div class="item mt-2">
            <RouterLink
              to="/employees"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:users-group-two-rounded-bold" /></span>
              <span class="w-full"> Xodimlar & Oylik </span>
            </RouterLink>
          </div>

          <!-- Calendar -->
          <div class="item mt-2">
            <RouterLink
              to="/calendar"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:calendar-mark-bold" /></span>
              <span class="w-full"> Taqvim & Tadbirlar </span>
            </RouterLink>
          </div>

          <!-- Xabarnomalar Markazi -->
          <div class="item mt-2">
            <RouterLink
              to="/notifications"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:bell-bold" /></span>
              <span class="w-full"> Xabarnomalar </span>
            </RouterLink>
          </div>

          <!-- Boshqaruv & Xavfsizlik Section -->
          <div class="item mt-3 pt-3 border-t dark:border-gray-700">
            <p class="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Boshqaruv & RBAC
            </p>

            <!-- Users -->
            <RouterLink
              to="/users"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700 mb-1"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:users-group-rounded-bold" /></span>
              <span class="w-full"> Foydalanuvchilar </span>
            </RouterLink>

            <!-- Roles -->
            <RouterLink
              to="/roles"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700 mb-1"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:shield-check-bold" /></span>
              <span class="w-full"> Rollar & Ruxsatlar </span>
            </RouterLink>

            <!-- Audit Log -->
            <RouterLink
              to="/audit"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700 mb-1"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:history-bold" /></span>
              <span class="w-full"> Xavfsizlik Jurnali </span>
            </RouterLink>

            <!-- Subscriptions -->
            <RouterLink
              to="/subscriptions"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700 mb-1"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:star-fall-bold" /></span>
              <span class="w-full"> Tariflar & Obuna </span>
            </RouterLink>

            <!-- CRM & System Settings -->
            <RouterLink
              to="/crm/settings"
              class="w-full flex text-left rounded-md box-border p-3 hover:bg-gray-200 dark:hover:bg-gray-700 mb-1"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:settings-minimalistic-bold" /></span>
              <span class="w-full"> Tizim Sozlamalari </span>
            </RouterLink>
          </div>

          <!-- Setup Wizard Link (Quick Access / Configuration) -->
          <div class="item mt-2">
            <RouterLink
              to="/setup"
              class="w-full flex text-left rounded-md box-border p-3 bg-primary/10 text-primary hover:bg-primary/20 transition font-semibold"
            >
              <span class="mr-3 text-xl"><Icon icon="solar:settings-bold" /></span>
              <span class="w-full"> Setup Wizard </span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { Icon } from "@iconify/vue";

import { navigationService } from "@/core/navigation";
import { useTenantStore } from "@/store/tenant";

export default {
  name: "AppSidebar",
  components: {
    Icon,
  },
  emits: ["sidebarToggle"],
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      isEducationOpen: true,
      isProcessOpen: true,
    };
  },
  computed: {
    studentNavItems() {
      return navigationService.getNavItemsForModule("STUDENTS", this.tenantStore.enabledModules);
    },
    attendanceNavItems() {
      return navigationService.getNavItemsForModule("ATTENDANCE", this.tenantStore.enabledModules);
    },
    financeNavItems() {
      return navigationService.getNavItemsForModule("FINANCE", this.tenantStore.enabledModules);
    },
    isEducationRouteActive() {
      return (
        this.$route.path.startsWith("/school") ||
        this.$route.path.startsWith("/education/classes") ||
        this.$route.path.startsWith("/education/students") ||
        this.$route.path.startsWith("/education/levels") ||
        this.$route.path.startsWith("/education/parents") ||
        this.$route.path.startsWith("/education/dropped")
      );
    },
    isProcessRouteActive() {
      return (
        this.$route.path.startsWith("/education/schedule") ||
        this.$route.path.startsWith("/education/replace-teacher") ||
        this.$route.path.startsWith("/education/gradebook") ||
        this.$route.path.startsWith("/education/final-grades") ||
        this.$route.path.startsWith("/education/academic-actions") ||
        this.$route.path.startsWith("/school/schedule") ||
        this.$route.path.startsWith("/schedule")
      );
    },
  },
  mounted() {
    this.tenantStore.fetchTenantConfig();
    if (this.isEducationRouteActive) {
      this.isEducationOpen = true;
    }
    if (this.isProcessRouteActive) {
      this.isProcessOpen = true;
    }
  },
  methods: {
    toggleEducationMenu() {
      this.isEducationOpen = !this.isEducationOpen;
    },
    toggleProcessMenu() {
      this.isProcessOpen = !this.isProcessOpen;
    },
  },
};
</script>
