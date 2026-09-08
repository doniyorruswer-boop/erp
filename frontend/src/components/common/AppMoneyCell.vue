<template>
  <div
    class="whitespace-nowrap select-none text-xs sm:text-sm"
    :class="[alignClass, colorClass]"
  >
    <span>{{ formattedAmount }}</span>
    <span v-if="currency" class="ml-1">{{ currency }}</span>
  </div>
</template>

<script>
export default {
  name: "AppMoneyCell",
  props: {
    amount: {
      type: [Number, String],
      default: 0
    },
    type: {
      type: String,
      default: "regular", // 'regular' | 'debt' | 'income'
      validator: (v) => ["regular", "debt", "income"].includes(v)
    },
    currency: {
      type: String,
      default: "so'm"
    },
    align: {
      type: String,
      default: "left",
      validator: (v) => ["left", "center", "right"].includes(v)
    }
  },
  computed: {
    numericAmount() {
      if (typeof this.amount === "number") return this.amount;
      const parsed = parseFloat(String(this.amount).replace(/\s/g, "").replace(/,/g, "."));
      return isNaN(parsed) ? 0 : parsed;
    },
    formattedAmount() {
      return this.numericAmount.toLocaleString("ru-RU").replace(/,/g, " ");
    },
    alignClass() {
      return this.align === "right"
        ? "text-right"
        : this.align === "center"
        ? "text-center"
        : "text-left";
    },
    colorClass() {
      if (this.type === "debt") {
        return this.numericAmount > 0
          ? "text-red-500 dark:text-red-400 font-bold"
          : "text-gray-400 dark:text-gray-500 font-normal";
      }
      if (this.type === "income") {
        return "text-emerald-600 dark:text-emerald-400 font-semibold";
      }
      return "text-gray-700 dark:text-gray-300 font-medium";
    }
  }
};
</script>
