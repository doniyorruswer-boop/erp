<template>
  <!-- Header (Sticky on scroll) -->
  <header class="sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-3 sm:px-4 py-2 border-b dark:border-gray-700 shadow-xs font-lexend transition-colors">
    <div class="wrap-header flex items-center justify-between gap-2 sm:gap-4 flex-nowrap w-full">
      <!-- Left side: Hamburger button + Search -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          @click="$emit('sidebarToggle', true)"
          aria-label="Menyu"
        >
          <Icon icon="heroicons:bars-3" class="text-2xl" />
        </button>

        <div
          class="input-box border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg hidden xl:flex items-center focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:focus-within:border-primary px-3.5 py-1.5 bg-gray-50/70 dark:bg-gray-900/60 transition shadow-2xs w-72"
        >
          <span class="text-lg text-gray-400 shrink-0">
            <Icon icon="solar:magnifer-linear" />
          </span>
          <input
            type="text"
            placeholder="Qidiruv..."
            class="py-1 px-2.5 w-full bg-transparent dark:text-gray-200 outline-none text-xs sm:text-sm text-gray-700"
          />
        </div>
      </div>

      <!-- Right side controls -->
      <div class="flex items-center gap-1 sm:gap-2 shrink-0">
        <!-- Branch / Tenant Selector Dropdown (Real Database Multi-Tenancy) -->
        <div class="relative" v-click-outside="closeBranchMenu">
          <button
            @click="branchMenu = !branchMenu"
            class="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 transition cursor-pointer text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 shadow-xs"
            title="Muassasa / Filialni almashtirish"
          >
            <Icon icon="solar:buildings-2-bold" class="text-primary text-base sm:text-lg shrink-0" />
            <span class="max-w-[120px] sm:max-w-[200px] truncate font-medium">{{ tenantStore.orgName }}</span>
            <Icon icon="solar:alt-arrow-down-linear" class="text-gray-400 text-xs sm:text-sm ml-0.5 shrink-0" />
          </button>

          <transition name="fade">
            <div
              v-show="branchMenu"
              class="absolute right-0 mt-2 z-50 w-80 sm:w-88 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-2xl divide-y dark:divide-gray-700 overflow-hidden"
            >
              <!-- Header -->
              <div class="px-4 py-3 bg-gray-50/90 dark:bg-gray-700/50 flex items-center justify-between">
                <span class="font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Muassasalar & Filiallar</span>
                <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {{ tenantStore.organizations.length }} ta
                </span>
              </div>

              <!-- List -->
              <div class="py-1 max-h-80 overflow-y-auto divide-y dark:divide-gray-700/50">
                <button
                  v-for="org in tenantStore.organizations"
                  :key="org.id"
                  @click="chooseOrganization(org)"
                  :class="[
                    'w-full text-left px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition cursor-pointer flex items-center justify-between gap-3',
                    tenantStore.organization?.id === org.id ? 'bg-primary/5 text-primary' : 'text-gray-700 dark:text-gray-200'
                  ]"
                >
                  <div class="truncate">
                    <div
                      class="text-sm font-bold truncate"
                      :class="tenantStore.organization?.id === org.id ? 'text-primary' : 'text-gray-800 dark:text-gray-100'"
                    >
                      {{ org.name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                      <span
                        class="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 shrink-0 shadow-xs"
                        :style="{ backgroundColor: org.primaryColor || '#4F46E5' }"
                      ></span>
                      <span class="font-medium">{{ getBusinessTypeLabel(org.businessType) }}</span>
                    </div>
                  </div>
                  <Icon
                    v-if="tenantStore.organization?.id === org.id"
                    icon="solar:check-circle-bold"
                    class="text-primary text-xl shrink-0 drop-shadow-xs"
                  />
                </button>
              </div>

              <!-- Quick Setup / Add Branch link -->
              <div class="p-3 bg-gray-50/60 dark:bg-gray-800/80">
                <router-link
                  to="/setup"
                  @click="branchMenu = false"
                  class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs sm:text-sm transition shadow-2xs"
                >
                  <Icon icon="solar:add-circle-bold" class="text-lg" />
                  <span>Yangi Muassasa / Filial qo'shish</span>
                </router-link>
              </div>
            </div>
          </transition>
        </div>

        <!-- Web / Public Portal Button -->
        <a
          href="#"
          @click.prevent="openPortal"
          class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer"
          title="Veb-sayt / Portal"
        >
          <Icon icon="solar:global-linear" class="text-xl" />
        </a>

        <!-- Fullscreen Button -->
        <button
          @click="fullscreenToggle"
          class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer"
          title="To'liq ekran"
        >
          <Icon v-if="!fullscreenMode" icon="solar:full-screen-linear" class="text-xl" />
          <Icon v-else icon="solar:quit-full-screen-linear" class="text-xl" />
        </button>

        <!-- Dark Mode Toggle -->
        <button
          @click="setTheme(true)"
          class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer"
          v-if="!darkMode"
          title="Tungi rejim"
        >
          <Icon icon="solar:sun-2-linear" class="text-xl" />
        </button>
        <button
          @click="setTheme(false)"
          v-else
          class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer"
          title="Kunduzgi rejim"
        >
          <Icon icon="solar:moon-linear" class="text-xl text-amber-400" />
        </button>

        <!-- Notifications -->
        <div class="relative" v-click-outside="closeNotif">
          <button
            @click="notifToggle"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer"
            title="Bildirishnomalar"
          >
            <span class="bg-red-500 rounded-full w-2 h-2 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-gray-800"></span>
            <Icon icon="solar:bell-linear" class="text-xl" />
          </button>

          <transition name="fade">
            <div
              v-show="notification"
              class="block absolute right-0 mt-2 z-50 w-80 sm:w-88 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md divide-y dark:divide-gray-700 shadow-xl text-xs"
            >
              <!-- Top Header -->
              <div class="flex justify-between items-center px-4 py-3 text-gray-800 dark:text-gray-200">
                <h2 class="font-bold text-sm">Bildirishnomalar</h2>
                <button
                  @click="markAllRead"
                  class="text-primary text-xs font-semibold hover:underline cursor-pointer"
                >
                  Barchasini o'qildi qilish
                </button>
              </div>

              <!-- Notifications List with clean icons -->
              <div class="divide-y dark:divide-gray-700 max-h-72 overflow-y-auto">
                <div
                  v-if="notifList.length === 0"
                  class="py-8 text-center text-gray-400 text-xs"
                >
                  Yangi bildirishnomalar mavjud emas
                </div>

                <div
                  v-for="(item, index) in notifList"
                  :key="index"
                  class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                >
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                    :class="item.bgClass || 'bg-blue-50 dark:bg-blue-900/30 text-primary'"
                  >
                    <Icon :icon="item.icon" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-1">
                      <h3 class="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{{ item.name }}</h3>
                      <span class="text-xs text-gray-400 shrink-0">{{ item.hours }}</span>
                    </div>
                    <p class="text-xs text-gray-400 truncate mt-0.5">{{ item.message }}</p>
                  </div>
                </div>
              </div>

              <!-- Bottom Footer -->
              <div class="py-2.5 px-4 text-center">
                <button
                  @click="notification = false"
                  class="text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-primary transition cursor-pointer"
                >
                  Barchasini ko'rish
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- User Profile Dropdown -->
        <div class="relative" v-click-outside="closeMenu">
          <button
            @click="menuToggle"
            class="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer"
          >
            <div class="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs shadow-xs ring-2 ring-primary/20">
              AD
            </div>
            <div class="text-left hidden sm:block">
              <h2 class="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">Administrator</h2>
              <p class="text-[10px] text-gray-400 mt-0.5">{{ $brand.name }} Administrator</p>
            </div>
          </button>

          <transition name="fade">
            <div
              v-show="menu"
              class="block absolute right-0 mt-2 z-50 w-56 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-xl divide-y dark:divide-gray-700 text-sm"
            >
              <!-- User Info -->
              <div class="px-4 py-3">
                <p class="font-semibold text-sm text-gray-800 dark:text-gray-200">Administrator</p>
                <p class="text-gray-400 text-xs truncate mt-0.5">{{ $brand.adminEmail }}</p>
              </div>

              <!-- Menu Links -->
              <div class="py-1.5 text-gray-700 dark:text-gray-200">
                <router-link
                  to="/"
                  @click="menu = false"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary transition font-medium"
                >
                  <Icon icon="solar:widget-linear" class="text-lg text-gray-400" />
                  <span>Dashboard</span>
                </router-link>

                <router-link
                  to="/students"
                  @click="menu = false"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary transition font-medium"
                >
                  <Icon icon="solar:users-group-rounded-linear" class="text-lg text-gray-400" />
                  <span>O'quvchilar</span>
                </router-link>

                <router-link
                  to="/leads"
                  @click="menu = false"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary transition font-medium"
                >
                  <Icon icon="solar:tuning-square-linear" class="text-lg text-gray-400" />
                  <span>Voronka & Kanban</span>
                </router-link>

                <router-link
                  to="/finance"
                  @click="menu = false"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary transition font-medium"
                >
                  <Icon icon="solar:wallet-linear" class="text-lg text-gray-400" />
                  <span>Moliya & Kassa</span>
                </router-link>
              </div>

              <!-- Logout Section -->
              <div class="py-1.5">
                <a
                  href="#"
                  @click.prevent="logout"
                  class="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition cursor-pointer font-medium"
                >
                  <Icon icon="solar:logout-2-linear" class="text-lg" />
                  <span>Tizimdan chiqish</span>
                </a>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { Icon } from "@iconify/vue";
import { fullscreen } from "@/helper/fullscreen";
import { setDarkMode, loadDarkMode } from "@/helper/theme";
import { useTenantStore } from "@/store/tenant";
import { authApi, notificationsApi } from "@/api/services";

export default {
  name: "Header",
  components: {
    Icon,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      menu: false,
      darkMode: false,
      notification: false,
      fullscreenMode: false,
      branchMenu: false,
      notifList: [
        {
          name: "Yangi O'quvchi Qo'shildi",
          icon: "ph:student-fill",
          bgClass: "bg-blue-50 dark:bg-blue-900/30 text-primary",
          message: "Bobur Mirzayev IELTS 7.0 guruhiga muvaffaqiyatli qabul qilindi",
          hours: "10 daqiqa oldin",
        },
        {
          name: "To'lov Qabul Qilindi",
          icon: "solar:wallet-money-bold",
          bgClass: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600",
          message: "Payme orqali 650,000 UZS to'lov kassa hisobiga tushdi",
          hours: "45 daqiqa oldin",
        },
        {
          name: "Yangi Lid Murojaati",
          icon: "solar:tuning-square-bold",
          bgClass: "bg-purple-50 dark:bg-purple-900/30 text-purple-600",
          message: "Telegram orqali yangi o'quvchi kursga qiziqish bildirdi",
          hours: "2 soat oldin",
        },
      ],
    };
  },
  watch: {
    $route() {
      this.menu = false;
      this.notification = false;
      this.branchMenu = false;
    },
  },
  methods: {
    fullscreen,
    setDarkMode,
    loadDarkMode,

    closeBranchMenu() {
      this.branchMenu = false;
    },
    async chooseOrganization(org) {
      this.branchMenu = false;
      try {
        await this.tenantStore.switchOrganization(org.id);
      } catch (err) {
        alert("Filialni almashtirishda xatolik: " + err.message);
      }
    },
    getBusinessTypeLabel(type) {
      if (type === "SCHOOL") return "Xususiy Maktab";
      if (type === "KINDERGARTEN") return "Bog'cha";
      return "O'quv Markazi";
    },
    openPortal() {
      window.open(this.$brand.portalUrl, "_blank");
    },
    menuToggle() {
      this.menu = !this.menu;
    },
    closeMenu() {
      this.menu = false;
    },
    notifToggle() {
      this.notification = !this.notification;
      if (this.notification) {
        this.loadNotifications();
      }
    },
    closeNotif() {
      this.notification = false;
    },
    async loadNotifications() {
      try {
        const res = await notificationsApi.getAll({ limit: 10 });
        if (res && (res.data || Array.isArray(res))) {
          const list = res.data || res;
          if (list.length > 0) {
            this.notifList = list.map((n) => ({
              id: n.id,
              name: n.title || "Xabarnoma",
              message: n.body,
              icon: n.channel === "SMS" ? "solar:chat-round-dots-bold" : n.channel === "EMAIL" ? "solar:letter-bold" : "solar:bell-bold",
              bgClass: n.channel === "SMS" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600" : "bg-blue-50 dark:bg-blue-900/30 text-primary",
              hours: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isRead: n.isRead,
            }));
          }
        }
      } catch (err) {
        // keep existing fallback items
      }
    },
    async markAllRead() {
      try {
        await notificationsApi.markAllAsRead();
        await this.loadNotifications();
      } catch (err) {
        this.notifList = [];
      }
    },
    fullscreenToggle() {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      this.fullscreen(!isCurrentlyFullscreen);
    },
    setTheme(bool) {
      this.darkMode = bool;
      this.setDarkMode(bool);
    },
    async logout() {
      this.menu = false;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        await authApi.logout({ refreshToken });
      } catch (e) {
        console.warn("Logout error:", e);
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        this.$router.push("/auth/login");
      }
    },
  },
  mounted() {
    this.darkMode = this.loadDarkMode();
    this.loadNotifications();

    // Listen to browser fullscreen changes (e.g. when user presses ESC key)
    this.onFullscreenChange = () => {
      this.fullscreenMode = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", this.onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", this.onFullscreenChange);
    document.addEventListener("mozfullscreenchange", this.onFullscreenChange);
    document.addEventListener("MSFullscreenChange", this.onFullscreenChange);
  },
  beforeUnmount() {
    if (this.onFullscreenChange) {
      document.removeEventListener("fullscreenchange", this.onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", this.onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", this.onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", this.onFullscreenChange);
    }
  },
};
</script>
