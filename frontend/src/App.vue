<template>
  <!-- App -->
  <div class="flex bg-gray-50 font-lexend dark:bg-gray-900 min-h-screen">
    <!-- Mobile Backdrop Overlay with Fade Transition -->
    <transition name="fade">
      <div
        v-if="!$route.meta.hideNav && sidebar"
        @click="close"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
      ></div>
    </transition>

    <!-- Desktop Static Sidebar -->
    <div
      v-if="!$route.meta.hideNav"
      class="lg:block hidden shrink-0"
    >
      <div
        class="w-sidebar bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-auto h-screen relative"
      >
        <perfect-scrollbar class="h-screen">
          <Sidebar
            v-if="!$route.meta.hideNav"
            @sidebarToggle="close"
          />
        </perfect-scrollbar>
      </div>
    </div>

    <!-- Mobile Drawer Sidebar with Slide Transition -->
    <transition name="sidebar-slide">
      <div
        v-if="!$route.meta.hideNav && sidebar"
        class="fixed inset-y-0 left-0 z-50 shadow-2xl block lg:hidden"
      >
        <div
          class="w-sidebar bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-auto h-screen relative"
        >
          <perfect-scrollbar class="h-screen">
            <Sidebar
              @sidebarToggle="close"
            />
          </perfect-scrollbar>
        </div>
      </div>
    </transition>

    <!-- Main Content Area -->
    <div class="flex-auto w-full flex flex-col h-screen overflow-hidden transition-colors min-w-0">
      <Header
        v-if="!$route.meta.hideNav"
        @sidebarToggle="open"
      />

      <div
        class="flex-auto w-full overflow-y-auto"
        id="body-scroll"
      >
        <transition
          name="slide-up"
          mode="out-in"
        >
          <router-view />
        </transition>
      </div>
    </div>

    <!-- Global Reactive Toast Notifications -->
    <ToastContainer />
  </div>
  <!-- End app -->
</template>

<script>
  import Sidebar from "@/components/Sidebar";
  import Header from "@/components/Header";
  import ToastContainer from "@/components/common/ToastContainer.vue";
  import Scrollbar from "smooth-scrollbar";

  export default {
    name: "App",
    data() {
      return {
        sidebarDark: false,
        sidebar: false,
      };
    },
    components: {
      Header,
      Sidebar,
      ToastContainer,
    },
    methods: {
      open() {
        this.sidebar = true;
      },
      close() {
        this.sidebar = false;
      },
    },
    watch: {
      $route() {
        this.sidebar = false;
      },
    },
    mounted() {
      Scrollbar.init(document.querySelector("#body-scroll"));
    },
  };
</script>

<style>
  /* Mobile Sidebar Slide Transition */
  .sidebar-slide-enter-active,
  .sidebar-slide-leave-active {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sidebar-slide-enter-from,
  .sidebar-slide-leave-to {
    transform: translateX(-100%);
  }

  /* Backdrop Fade Transition */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* Main View Slide-Up Transition */
  .slide-up-enter-active {
    transition: all 0.3s ease-out;
  }
  .slide-up-leave-active {
    transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
  }
  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }
</style>
