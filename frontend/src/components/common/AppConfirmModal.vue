<template>
  <vmodal
    ref="modalRef"
    :hideButton="true"
    :title="title"
    :subtitle="subtitle"
    :btnTextSubmit="confirmText"
    :btnTextClose="cancelText"
    :btnColorSubmit="submitButtonColor"
    :btnVariantSubmit="variant"
    :width="width"
    @submit="handleConfirm"
    @close="handleCancel"
  >
    <template v-slot:Icon>
      <Icon :icon="displayIcon" :class="['text-3xl mb-2', iconColorClass]" />
    </template>
    <template v-slot:body>
      <div class="space-y-3.5 text-xs text-left" v-if="message">
        <div :class="['p-3.5 rounded-xl border', boxClasses]">
          <p class="font-bold text-sm leading-snug">
            {{ message }}
          </p>
          <p v-if="description" class="mt-1.5 text-gray-500 dark:text-gray-400">
            {{ description }}
          </p>
        </div>
      </div>
      <slot />
    </template>
  </vmodal>
</template>

<script>
import { Icon } from "@iconify/vue";
import vmodal from "@/components/modal.vue";

export default {
  name: "AppConfirmModal",
  components: {
    Icon,
    vmodal,
  },
  props: {
    title: {
      type: String,
      default: "Tasdiqlaysizmi?",
    },
    subtitle: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    confirmText: {
      type: String,
      default: "Tasdiqlash va O'chirish",
    },
    cancelText: {
      type: String,
      default: "Bekor qilish",
    },
    variant: {
      type: String,
      default: "danger", // 'danger' | 'warning' | 'primary' | 'success'
    },
    icon: {
      type: String,
      default: "",
    },
    width: {
      type: String,
      default: "max-w-md",
    },
  },
  emits: ["confirm", "cancel"],
  computed: {
    displayIcon() {
      if (this.icon) return this.icon;
      if (this.variant === "danger") return "solar:trash-bin-trash-bold";
      if (this.variant === "warning") return "solar:danger-triangle-bold";
      if (this.variant === "success") return "solar:check-circle-bold";
      return "solar:info-circle-bold";
    },
    iconColorClass() {
      if (this.variant === "danger") return "text-red-500";
      if (this.variant === "warning") return "text-amber-500";
      if (this.variant === "success") return "text-emerald-500";
      return "text-primary";
    },
    boxClasses() {
      if (this.variant === "danger") {
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200";
      }
      if (this.variant === "warning") {
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200";
      }
      if (this.variant === "success") {
        return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200";
      }
      return "bg-primary/5 border-primary/20 text-primary";
    },
    submitButtonColor() {
      if (this.variant === "danger") return "bg-red-600";
      if (this.variant === "warning") return "bg-amber-500";
      if (this.variant === "success") return "bg-emerald-600";
      return "bg-primary";
    },
  },
  methods: {
    open() {
      if (this.$refs.modalRef) {
        this.$refs.modalRef.open();
      }
    },
    close() {
      if (this.$refs.modalRef) {
        this.$refs.modalRef.close();
      }
    },
    handleConfirm() {
      this.$emit("confirm");
    },
    handleCancel() {
      this.$emit("cancel");
    },
  },
};
</script>
