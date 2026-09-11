import { defineStore } from "pinia";

export const useLayoutStore = defineStore("layout", {
  state: () => ({
    sidebarOpen: false,
    sidebarCollapsed: false,
    globalLoading: false,
  }),

  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },

    setSidebarOpen(value) {
      this.sidebarOpen = Boolean(value);
    },

    toggleSidebarCollapse() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    setGlobalLoading(value) {
      this.globalLoading = Boolean(value);
    },
  },
});
