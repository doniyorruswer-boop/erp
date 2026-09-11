<template>
  <!-- App -->
  <div class="flex bg-gray-50 font-lexend dark:bg-gray-900 min-h-screen">
    <!-- Mobile Backdrop Overlay with Fade Transition -->
    <Transition name="fade">
      <div
        v-if="!$route.meta.hideNav && sidebar"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
        @click="close"
      ></div>
    </Transition>

    <!-- Desktop Static Sidebar -->
    <div v-if="!$route.meta.hideNav" class="lg:block hidden shrink-0">
      <div
        class="w-sidebar bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-auto h-screen relative"
      >
        <PerfectScrollbar class="h-screen">
          <AppSidebar v-if="!$route.meta.hideNav" @sidebar-toggle="close" />
        </PerfectScrollbar>
      </div>
    </div>

    <!-- Mobile Drawer Sidebar with Slide Transition -->
    <Transition name="sidebar-slide">
      <div
        v-if="!$route.meta.hideNav && sidebar"
        class="fixed inset-y-0 left-0 z-50 shadow-2xl block lg:hidden"
      >
        <div
          class="w-sidebar bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-auto h-screen relative"
        >
          <PerfectScrollbar class="h-screen">
            <AppSidebar @sidebar-toggle="close" />
          </PerfectScrollbar>
        </div>
      </div>
    </Transition>

    <!-- Main Content Area -->
    <div class="flex-auto w-full flex flex-col h-screen overflow-hidden transition-colors min-w-0">
      <AppHeader v-if="!$route.meta.hideNav" @sidebar-toggle="open" />

      <div id="body-scroll" class="flex-auto w-full overflow-y-auto">
        <Transition name="slide-up" mode="out-in">
          <RouterView />
        </Transition>
      </div>
    </div>

    <!-- Global Reactive Toast Notifications -->
    <ToastContainer />
  </div>
  <!-- End app -->
</template>

<script>
import Scrollbar from "smooth-scrollbar";

import ToastContainer from "@/components/common/ToastContainer.vue";
import AppHeader from "@/components/Header.vue";
import AppSidebar from "@/components/Sidebar.vue";

export default {
  name: "App",
  components: {
    AppHeader,
    AppSidebar,
    ToastContainer,
  },
  data() {
    return {
      sidebarDark: false,
      sidebar: false,
      scrollbarInstance: null,
    };
  },
  watch: {
    $route() {
      this.sidebar = false;
      if (this.scrollbarInstance) {
        this.scrollbarInstance.scrollTo(0, 0, 300);
      }
    },
  },
  mounted() {
    this.initScrollbar();
  },
  beforeUnmount() {
    if (this.scrollbarInstance) {
      this.scrollbarInstance.destroy();
    }
  },
  methods: {
    open() {
      this.sidebar = true;
    },
    close() {
      this.sidebar = false;
    },
    initScrollbar() {
      const container = document.querySelector("#body-scroll");
      if (container) {
        this.scrollbarInstance = Scrollbar.init(container, {
          damping: 0.08,
          renderByPixels: true,
          continuousScrolling: true,
        });
      }
    },
  },
};
</script>

<style>
/* Smooth Scrollbar Custom Track and Thumb */
.scrollbar-track {
  background: transparent !important;
  z-index: 30 !important;
}
.scrollbar-track-y {
  width: 6px !important;
}
.scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4) !important;
  border-radius: 9999px !important;
  transition: background 0.15s ease;
}
.scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7) !important;
}
.dark .scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5) !important;
}
.dark .scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.8) !important;
}

/* Fallback Global Custom Scrollbar for non-smooth containers */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.8);
}
</style>
