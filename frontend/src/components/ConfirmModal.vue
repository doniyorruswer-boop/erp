<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-lexend"
        @click.self="close"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-2xl animate-scale-up">
          <div class="flex items-start gap-3.5">
            <!-- Danger / Warning Icon Badge -->
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5"
              :class="isDanger ? 'bg-red-50 text-red-600 dark:bg-red-950/40 border border-red-200 dark:border-red-800' : 'bg-primary/10 text-primary border border-primary/20'"
            >
              <Icon :icon="isDanger ? 'solar:trash-bin-trash-bold' : 'solar:info-circle-bold'" class="text-2xl" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-800 dark:text-gray-100 text-base leading-snug">
                {{ title }}
              </h3>
              <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed break-words">
                {{ message }}
              </p>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-xs sm:text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer shadow-2xs"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              @click="confirm"
              class="px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-lg shadow-2xs transition cursor-pointer"
              :class="isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-primary hover:bg-opacity-90'"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "ConfirmModal",
  components: { Icon },
  props: {
    title: {
      type: String,
      default: "Tasdiqlaysizmi?",
    },
    message: {
      type: String,
      default: "Ushbu amalni ortga qaytarib bo'lmaydi.",
    },
    confirmText: {
      type: String,
      default: "Ha, davom etish",
    },
    cancelText: {
      type: String,
      default: "Bekor qilish",
    },
    isDanger: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["confirm", "cancel"],
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
      this.$emit("cancel");
    },
    confirm() {
      this.isOpen = false;
      this.$emit("confirm");
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scale-up {
  animation: scaleUp 0.15s ease-out forwards;
}
</style>
