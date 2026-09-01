<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-lexend"
        @click.self="handleBackdropClick"
      >
        <div
          :class="['modal-window relative w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 flex flex-col overflow-hidden', maxWidthClass]"
          @click.stop
        >
          <!-- Header -->
          <div
            v-if="!hideHeader"
            class="p-4 sm:px-6 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50/70 dark:bg-gray-800/80"
          >
            <div class="flex items-center gap-3">
              <div
                v-if="icon"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                :class="iconBgClass"
              >
                <Icon :icon="icon" />
              </div>
              <div>
                <slot name="title">
                  <h2 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">
                    {{ title }}
                  </h2>
                </slot>
                <p v-if="subtitle" class="text-xs text-gray-400">
                  {{ subtitle }}
                </p>
              </div>
            </div>

            <button
              v-if="!hideClose"
              type="button"
              @click="close"
              class="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <Icon icon="mdi:close" class="text-xl" />
            </button>
          </div>

          <!-- Body Content -->
          <div class="flex-1 overflow-y-auto max-h-[75vh]" :class="bodyClass">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="p-4 border-t dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/80 flex items-center justify-between gap-3"
          >
            <slot name="footer" :close="close" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AppModal",
  components: {
    Icon,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    iconBgClass: {
      type: String,
      default: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    maxWidth: {
      type: String,
      default: "max-w-4xl", // max-w-md | max-w-lg | max-w-2xl | max-w-4xl | max-w-5xl
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
    hideClose: {
      type: Boolean,
      default: false,
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true,
    },
    bodyClass: {
      type: String,
      default: "p-4",
    },
  },
  emits: ["update:modelValue", "close"],
  computed: {
    maxWidthClass() {
      return this.maxWidth;
    },
  },
  methods: {
    close() {
      this.$emit("update:modelValue", false);
      this.$emit("close");
    },
    handleBackdropClick() {
      if (this.closeOnBackdrop) {
        this.close();
      }
    },
  },
};
</script>

<style scoped>
/* Smooth Scale-Zoom and Backdrop Fade Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-window {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-leave-active .modal-window {
  transition: all 0.2s cubic-bezier(0.7, 0, 0.84, 0);
}

.modal-fade-enter-from .modal-window {
  opacity: 0;
  transform: scale(0.94) translateY(-14px);
}

.modal-fade-leave-to .modal-window {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
