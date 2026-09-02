<template>
  <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
    <transition-group name="toast-slide">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all duration-300"
        :class="getToastClasses(t.type)"
      >
        <div class="shrink-0 mt-0.5">
          <Icon :icon="getToastIcon(t.type)" class="w-6 h-6" :class="getIconColorClass(t.type)" />
        </div>
        <div class="flex-1 min-w-0 pr-1">
          <h4 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {{ t.title }}
          </h4>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-normal break-words">
            {{ t.message }}
          </p>
        </div>
        <button
          @click="removeToast(t.id)"
          class="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <Icon icon="solar:close-circle-linear" class="w-5 h-5" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import { toast } from "@/utils/toast";

export default {
  name: "ToastContainer",
  components: { Icon },
  computed: {
    toasts() {
      return toast.getToasts();
    },
  },
  methods: {
    removeToast(id) {
      toast.remove(id);
    },
    getToastClasses(type) {
      const map = {
        success: "bg-white/95 dark:bg-gray-850/95 border-emerald-500/30 shadow-emerald-500/10",
        error: "bg-white/95 dark:bg-gray-850/95 border-rose-500/40 shadow-rose-500/10",
        warning: "bg-white/95 dark:bg-gray-850/95 border-amber-500/30 shadow-amber-500/10",
        info: "bg-white/95 dark:bg-gray-850/95 border-blue-500/30 shadow-blue-500/10",
      };
      return map[type] || map.info;
    },
    getToastIcon(type) {
      const map = {
        success: "solar:check-circle-bold",
        error: "solar:danger-circle-bold",
        warning: "solar:shield-warning-bold",
        info: "solar:info-circle-bold",
      };
      return map[type] || map.info;
    },
    getIconColorClass(type) {
      const map = {
        success: "text-emerald-500",
        error: "text-rose-500",
        warning: "text-amber-500",
        info: "text-blue-500",
      };
      return map[type] || map.info;
    },
  },
};
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(80%) scale(0.9);
}
</style>
