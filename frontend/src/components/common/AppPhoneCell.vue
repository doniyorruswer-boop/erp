<template>
  <div class="inline-flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm select-none">
    <template v-if="formattedPhone">
      <a
        v-if="clickable"
        :href="'tel:' + rawPhone"
        class="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors font-medium cursor-pointer group"
        :title="'Qo\'ng\'iroq qilish: ' + formattedPhone"
        @click.stop
      >
        <Icon
          v-if="showIcon"
          icon="solar:phone-calling-linear"
          class="text-xs text-gray-400 group-hover:text-primary transition-colors shrink-0"
        />
        <span class="group-hover:underline">{{ formattedPhone }}</span>
      </a>
      <span
        v-else
        class="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium"
      >
        <Icon
          v-if="showIcon"
          icon="solar:phone-calling-linear"
          class="text-xs text-gray-400 shrink-0"
        />
        <span>{{ formattedPhone }}</span>
      </span>
    </template>
    <span v-else class="text-gray-400 dark:text-gray-500">{{ emptyText }}</span>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AppPhoneCell",
  components: {
    Icon
  },
  props: {
    phone: {
      type: [String, Number],
      default: ""
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    clickable: {
      type: Boolean,
      default: true
    },
    emptyText: {
      type: String,
      default: "—"
    }
  },
  computed: {
    rawPhone() {
      if (!this.phone) return "";
      let digits = String(this.phone).replace(/\D/g, "");
      if (digits.length === 13 && digits.startsWith("9989")) {
        digits = "998" + digits.slice(4);
      }
      return digits.startsWith("998") ? "+" + digits : "+998" + digits;
    },
    formattedPhone() {
      if (!this.phone) return "";
      let digits = String(this.phone).replace(/\D/g, "");
      if (digits.length === 13 && digits.startsWith("9989")) {
        digits = "998" + digits.slice(4);
      }
      if (digits.length === 9) {
        return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
      }
      if (digits.length === 12 && digits.startsWith("998")) {
        return `+998 (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
      }
      return String(this.phone);
    }
  }
};
</script>
