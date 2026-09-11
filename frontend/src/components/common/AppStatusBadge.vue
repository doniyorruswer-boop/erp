<template>
  <div class="inline-flex items-center justify-center whitespace-nowrap select-none">
    <span
      class="inline-flex items-center gap-1.5 font-semibold transition-colors border"
      :class="[shapeClasses, colorClasses]"
    >
      <!-- Rangli nuqtacha -->
      <span v-if="showDot" class="w-1.5 h-1.5 rounded-full shrink-0" :class="dotColorClass" />
      <span>{{ label || status }}</span>
    </span>
  </div>
</template>

<script>
export default {
  name: "AppStatusBadge",
  props: {
    status: {
      type: [String, Boolean],
      default: "",
    },
    // Agar status kalit bo'lib alohida o'zbekcha yozuv chiqarmoqchi bo'linsa
    label: {
      type: String,
      default: "",
    },
    variant: {
      type: String,
      default: "auto",
      validator: (v) => ["auto", "success", "warning", "danger", "info", "neutral"].includes(v),
    },
    shape: {
      type: String,
      default: "pill", // 'pill' | 'rounded'
      validator: (v) => ["pill", "rounded"].includes(v),
    },
    showDot: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String,
      default: "sm",
      validator: (v) => ["xs", "sm", "md"].includes(v),
    },
  },
  computed: {
    resolvedVariant() {
      if (this.variant !== "auto") return this.variant;
      const s = String(this.status).toLowerCase().trim();

      if (
        ["o'quvchi", "o'qimoqda", "faol", "active", "ha", "to'langan", "paid", "true"].includes(s)
      ) {
        return "success";
      }
      if (["sinov", "on_leave", "kutilmoqda", "pending", "qisman", "partial"].includes(s)) {
        return "warning";
      }
      if (
        [
          "chetlatilgan",
          "nofaol",
          "terminated",
          "false",
          "rad etildi",
          "rejected",
          "qarzdor",
        ].includes(s)
      ) {
        return "danger";
      }
      if (["yangi", "new", "qabul", "info"].includes(s)) {
        return "info";
      }
      return "neutral";
    },
    shapeClasses() {
      const radius = this.shape === "pill" ? "rounded-full" : "rounded-md";
      const sizePad =
        this.size === "xs"
          ? "px-2 py-0.5 text-[10px]"
          : this.size === "md"
            ? "px-3 py-1 text-sm"
            : "px-2.5 py-0.5 text-xs";
      return `${radius} ${sizePad}`;
    },
    colorClasses() {
      switch (this.resolvedVariant) {
        case "success":
          return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60";
        case "warning":
          return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60";
        case "danger":
          return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60";
        case "info":
          return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60";
        case "neutral":
        default:
          return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
      }
    },
    dotColorClass() {
      switch (this.resolvedVariant) {
        case "success":
          return "bg-emerald-500";
        case "warning":
          return "bg-amber-500";
        case "danger":
          return "bg-rose-500";
        case "info":
          return "bg-blue-500";
        case "neutral":
        default:
          return "bg-gray-400";
      }
    },
  },
};
</script>
