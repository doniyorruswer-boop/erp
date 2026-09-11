<script>
import { Icon } from "@iconify/vue";

import AppButton from "@/components/common/AppButton.vue";

let _uid = 0;

export default {
  name: "AppModal",
  components: { Icon, AppButton },
  props: {
    // v-model qo'llab-quvvatlash
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    title: {
      type: String,
      default: "Modal Title",
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
      default: "bg-primary/10 text-primary",
    },
    btnType: {
      type: String,
      default: "submit",
    },
    btnTextSubmit: {
      type: String,
      default: "Submit",
    },
    btnTextClose: {
      type: String,
      default: "Cancel",
    },
    btnColorSubmit: {
      type: String,
      default: "bg-primary",
    },
    btnVariantSubmit: {
      type: String,
      default: "",
    },
    backdrop: {
      type: Boolean,
      default: true,
    },
    width: {
      type: String,
      default: "max-w-lg",
    },
    maxWidth: {
      type: String,
      default: "",
    },
    btnColor: {
      type: String,
      default: "bg-primary",
    },
    btnText: {
      type: String,
      default: "Show Modal",
    },
    btnIcon: {
      type: String,
      default: "ic:round-add",
    },
    hideButton: {
      type: Boolean,
      default: false,
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
    hideFooter: {
      type: Boolean,
      default: false,
    },
    bodyClass: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "submit", "submitForm", "close"],
  data() {
    _uid += 1;
    return {
      id: `modal-num-${_uid}`,
      internalOpen: false,
    };
  },
  computed: {
    isOpen: {
      get() {
        return this.modelValue !== undefined ? this.modelValue : this.internalOpen;
      },
      set(val) {
        this.internalOpen = val;
        this.$emit("update:modelValue", val);
        if (!val) {
          this.$emit("close");
        }
      },
    },
    modalWidthClass() {
      return this.maxWidth || this.width || "max-w-lg";
    },
    shouldShowButton() {
      if (this.hideButton) return false;
      // Agar modelValue uzatilgan bo'lsa, tugma tashqaridan boshqariladi
      return this.modelValue === undefined;
    },
    submitBtnVariant() {
      if (this.btnVariantSubmit) return this.btnVariantSubmit;
      if (this.btnColorSubmit) {
        if (this.btnColorSubmit.includes("red") || this.btnColorSubmit.includes("danger")) {
          return "danger";
        }
        if (
          this.btnColorSubmit.includes("emerald") ||
          this.btnColorSubmit.includes("green") ||
          this.btnColorSubmit.includes("success")
        ) {
          return "success";
        }
        if (this.btnColorSubmit.includes("amber") || this.btnColorSubmit.includes("warning")) {
          return "warning";
        }
      }
      return "primary";
    },
  },
  watch: {
    modelValue(newVal) {
      this.internalOpen = newVal;
    },
  },
  methods: {
    close() {
      this.isOpen = false;
    },
    open() {
      this.isOpen = true;
    },
    handleFormSubmit() {
      this.$emit("submit");
      this.$emit("submitForm");
    },
  },
};
</script>

<template>
  <div>
    <Teleport to="body">
      <Transition name="slide-up">
        <div
          v-show="isOpen"
          :class="{
            'bg-gray-800/50 backdrop-blur-xs': backdrop,
            'bg-transparent': !backdrop,
          }"
          class="modal-overlay p-3 sm:p-5 flex items-center justify-center overflow-y-auto"
          @click.self="close"
        >
          <div :class="modalWidthClass" class="container mx-auto my-auto py-6">
            <div
              class="modal bg-white border dark:border-gray-600 dark:bg-gray-800 w-full shadow-2xl rounded-md overflow-hidden font-lexend"
              @click.stop
            >
              <!-- Modal Head -->
              <div v-if="!hideHeader" class="modal-head p-5 border-b dark:border-gray-700">
                <div class="heading flex items-start justify-between gap-4">
                  <div class="flex items-start gap-3 min-w-0">
                    <!-- Icon: Slot or Prop -->
                    <div v-if="$slots.Icon" class="shrink-0">
                      <slot name="Icon" />
                    </div>
                    <div
                      v-else-if="icon"
                      class="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                      :class="iconBgClass"
                    >
                      <Icon :icon="icon" />
                    </div>

                    <div class="min-w-0">
                      <slot name="title">
                        <h2
                          class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate"
                        >
                          {{ title }}
                        </h2>
                      </slot>
                      <p v-if="subtitle" class="subtitle text-xs text-gray-400 mt-0.5">
                        {{ subtitle }}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer shrink-0"
                    @click="close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-width="2"
                        d="M6 18L18 6m0 12L6 6"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="modal-body dark:text-white" :class="bodyClass">
                <slot name="body" />
                <slot />
              </div>

              <!-- Modal Footer -->
              <div v-if="!hideFooter" class="modal-footer">
                <slot name="footer" :close="close">
                  <div class="flex items-center justify-between gap-3 w-full">
                    <div class="order-1"></div>
                    <div class="space-x-3 order-2 flex items-center">
                      <AppButton v-if="btnTextClose" variant="outline" size="sm" @click="close">
                        {{ btnTextClose }}
                      </AppButton>
                      <AppButton
                        v-if="btnTextSubmit"
                        :type="btnType"
                        :variant="submitBtnVariant"
                        size="sm"
                        @click="handleFormSubmit"
                      >
                        {{ btnTextSubmit }}
                      </AppButton>
                    </div>
                  </div>
                </slot>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Trigger Button (Kanban AppButton) -->
    <AppButton
      v-if="shouldShowButton"
      variant="primary"
      :icon="btnIcon"
      icon-class="text-lg"
      @click="isOpen = true"
    >
      {{ btnText }}
    </AppButton>
  </div>
</template>

<style>
.heading {
  @apply text-xl sm:text-2xl font-semibold text-gray-800;
}
.heading .subtitle {
  @apply text-xs sm:text-sm font-normal text-gray-400;
}
.modal-overlay {
  @apply font-lexend w-full h-screen fixed top-0 inset-0 z-50;
}
.modal-body {
  @apply p-4 sm:p-5 max-h-[75vh] overflow-y-auto;
}
.modal-footer {
  @apply p-4 bg-gray-50 dark:bg-gray-700/60 border-t dark:border-gray-700;
}

/* Slide-up Transition */
.slide-up-enter-active {
  transition: all 0.25s ease-out;
}

.slide-up-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
