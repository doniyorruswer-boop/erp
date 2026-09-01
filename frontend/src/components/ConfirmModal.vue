<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 font-lexend"
        @click.self="close"
      >
        <div class="bg-white dark:bg-gray-800 rounded-md max-w-sm w-full p-5 border dark:border-gray-700 shadow-xl">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-primary'"
            >
              <Icon :icon="isDanger ? 'solar:danger-triangle-bold' : 'solar:info-circle-bold'" class="text-2xl" />
            </div>
            <div>
              <h3 class="font-bold text-gray-800 dark:text-gray-100 text-base">{{ title }}</h3>
              <p class="text-xs text-gray-400 mt-0.5">{{ message }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-5">
            <button
              type="button"
              @click="close"
              class="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              @click="confirm"
              class="px-3 py-1.5 text-xs text-white rounded-md shadow-sm"
              :class="isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-opacity-90'"
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
