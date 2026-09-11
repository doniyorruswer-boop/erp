<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition shadow-xs flex flex-col justify-between"
  >
    <div>
      <!-- Sinf / Guruh Nomi va O'quvchilar soni -->
      <div class="flex items-start justify-between gap-2 min-w-0">
        <div class="min-w-0">
          <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 truncate">
            {{ item.name }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {{ item.courseName }}
          </p>
        </div>
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs shrink-0 whitespace-nowrap"
        >
          <Icon icon="solar:users-group-two-rounded-bold" class="text-sm" />
          {{ item.studentsCount }} o'quvchi
        </span>
      </div>

      <!-- Ustoz / Mentor -->
      <div class="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Icon icon="solar:user-circle-linear" class="text-sm shrink-0" />
        <span class="truncate"
          >Ustoz:
          <strong class="text-gray-700 dark:text-gray-300">{{ item.teacherName }}</strong></span
        >
      </div>

      <!-- Reja, Tushum va Qarz -->
      <div
        class="my-4 space-y-2 border-t border-b border-gray-100 dark:border-gray-700/80 py-3 text-xs sm:text-sm"
      >
        <div class="flex justify-between items-center gap-2">
          <span class="text-gray-500 dark:text-gray-400">Oylik Reja:</span>
          <span class="font-bold text-gray-900 dark:text-gray-100 tracking-tight">{{
            formatUZS(item.plan)
          }}</span>
        </div>
        <div class="flex justify-between items-center gap-2">
          <span class="text-gray-500 dark:text-gray-400">Tushum:</span>
          <span class="font-bold text-emerald-500 tracking-tight">{{ formatUZS(item.fact) }}</span>
        </div>
        <div class="flex justify-between items-center gap-2">
          <span class="text-gray-500 dark:text-gray-400">Qarzdorlik:</span>
          <span
            :class="['font-bold tracking-tight', item.debt > 0 ? 'text-red-500' : 'text-gray-400']"
          >
            {{ formatUZS(item.debt) }}
            <span v-if="item.debtorsCount > 0" class="text-[11px] text-gray-400 font-normal"
              >({{ item.debtorsCount }})</span
            >
          </span>
        </div>
      </div>
    </div>

    <!-- Bajarilish progressi -->
    <div>
      <div class="flex justify-between items-center text-xs mb-1.5">
        <span class="text-gray-500 dark:text-gray-400">Ijro darajasi</span>
        <span :class="['font-bold text-xs sm:text-sm', percentTextColor]">
          {{ item.percent }}%
        </span>
      </div>
      <div class="w-full h-1.5 sm:h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700"
          :class="progressBarColor"
          :style="{ width: `${Math.min(100, Math.max(2, item.percent))}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "PaymentClassCard",
  components: {
    Icon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    percentTextColor() {
      if (this.item.percent >= 80) return "text-emerald-500 dark:text-emerald-400";
      if (this.item.percent >= 50) return "text-amber-500 dark:text-amber-400";
      return "text-red-500 dark:text-red-400";
    },
    progressBarColor() {
      if (this.item.percent >= 80) return "bg-emerald-500";
      if (this.item.percent >= 50) return "bg-amber-500";
      return "bg-red-500";
    },
  },
  methods: {
    formatUZS(val) {
      if (!val) return "0 so'm";
      return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
    },
  },
};
</script>
