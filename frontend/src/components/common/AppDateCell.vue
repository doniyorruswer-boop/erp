<template>
  <div class="inline-flex flex-col whitespace-nowrap text-xs sm:text-sm select-none">
    <template v-if="isValidDate">
      <div class="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
        <Icon
          v-if="showIcon"
          icon="solar:calendar-linear"
          class="text-xs text-gray-400 shrink-0"
        />
        <span class="font-medium text-xs">{{ formattedDate }}</span>
      </div>

      <!-- Ixtiyoriy yosh nishoni (Tug'ilgan sana uchun) -->
      <div v-if="showAge && age !== null" class="mt-0.5">
        <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          {{ age }} yosh
        </span>
      </div>
    </template>
    <span v-else class="text-gray-400 dark:text-gray-500 text-xs">{{ emptyText }}</span>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AppDateCell",
  components: {
    Icon
  },
  props: {
    date: {
      type: [String, Date, Number],
      default: ""
    },
    withTime: {
      type: Boolean,
      default: false
    },
    showAge: {
      type: Boolean,
      default: false
    },
    showIcon: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: "—"
    }
  },
  computed: {
    dateObj() {
      if (!this.date) return null;
      if (this.date instanceof Date) return isNaN(this.date) ? null : this.date;

      const str = String(this.date).trim();
      // YYYY-MM-DD or ISO
      let d = new Date(str);
      if (!isNaN(d.getTime())) return d;

      // DD.MM.YYYY or DD/MM/YYYY
      const parts = str.split(/[./-]/);
      if (parts.length === 3) {
        if (parts[0].length === 2 && parts[2].length === 4) {
          d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(d.getTime())) return d;
        }
      }
      return null;
    },
    isValidDate() {
      return Boolean(this.dateObj);
    },
    formattedDate() {
      if (!this.dateObj) return String(this.date || "");
      const d = this.dateObj;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();

      if (this.withTime) {
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${day}.${month}.${year} ${hours}:${minutes}`;
      }
      return `${day}.${month}.${year}`;
    },
    age() {
      if (!this.dateObj) return null;
      const today = new Date();
      let age = today.getFullYear() - this.dateObj.getFullYear();
      const m = today.getMonth() - this.dateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < this.dateObj.getDate())) {
        age--;
      }
      return age >= 0 && age < 120 ? age : null;
    }
  }
};
</script>
