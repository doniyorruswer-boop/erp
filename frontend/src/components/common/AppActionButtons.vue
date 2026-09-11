<template>
  <div class="inline-flex items-center justify-end gap-1.5 whitespace-nowrap select-none">
    <slot>
      <template v-for="act in resolvedActions" :key="act.key">
        <!-- Matnli tugma (masalan: Tiklash) -->
        <button
          v-if="act.text"
          type="button"
          class="h-8 px-3 rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          :class="act.btnClass"
          :title="act.title"
          @click.stop="handleAction(act.key)"
        >
          <Icon v-if="act.icon" :icon="act.icon" class="text-sm" />
          <span>{{ act.text }}</span>
        </button>

        <!-- Kichik 32x32px ikonka tugma -->
        <button
          v-else
          type="button"
          class="w-8 h-8 rounded-lg inline-flex items-center justify-center border transition shadow-2xs cursor-pointer"
          :class="act.btnClass"
          :title="act.title"
          @click.stop="handleAction(act.key)"
        >
          <Icon :icon="act.icon" class="text-base" />
        </button>
      </template>
    </slot>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AppActionButtons",
  components: {
    Icon,
  },
  props: {
    // String array: masalan ['view', 'sms', 'edit', 'delete']
    // yoki Object array: [{ key: 'custom', icon: '...', title: '...' }]
    actions: {
      type: Array,
      default: () => [],
    },
    // Row ma'lumoti emit bo'lganda birga qaytishi uchun
    row: {
      type: Object,
      default: null,
    },
  },
  emits: ["action", "view", "edit", "delete", "sms", "pay", "password", "restore"],
  computed: {
    resolvedActions() {
      return this.actions.map((item) => {
        if (typeof item === "object" && item !== null) {
          return item;
        }
        return this.getDefaultConfig(item);
      });
    },
  },
  methods: {
    getDefaultConfig(key) {
      switch (key) {
        case "view":
          return {
            key: "view",
            icon: "solar:eye-linear",
            title: "Ko'rish / Profil",
            btnClass:
              "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5",
          };
        case "edit":
          return {
            key: "edit",
            icon: "solar:pen-2-linear",
            title: "Tahrirlash",
            btnClass:
              "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5",
          };
        case "delete":
          return {
            key: "delete",
            icon: "solar:trash-bin-2-linear",
            title: "O'chirish",
            btnClass:
              "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30",
          };
        case "sms":
          return {
            key: "sms",
            icon: "solar:letter-linear",
            title: "SMS xabar yuborish",
            btnClass:
              "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5",
          };
        case "pay":
        case "wallet":
          return {
            key: "pay",
            icon: "solar:wallet-money-bold",
            title: "To'lov qilish",
            btnClass:
              "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
          };
        case "password":
        case "key":
          return {
            key: "password",
            icon: "solar:key-linear",
            title: "Parolni o'zgartirish",
            btnClass:
              "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30",
          };
        case "restore":
          return {
            key: "restore",
            icon: "solar:restart-circle-bold",
            text: "Qayta tiklash",
            title: "O'quvchilar safiga qayta tiklash",
            btnClass: "bg-primary hover:bg-primary/90 text-white",
          };
        default:
          return {
            key,
            icon: "solar:menu-dots-bold",
            title: key,
            btnClass:
              "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500",
          };
      }
    },
    handleAction(actionKey) {
      this.$emit("action", actionKey, this.row);
      this.$emit(actionKey, this.row);
    },
  },
};
</script>
