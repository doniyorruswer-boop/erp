<template>
  <div
    :class="[
      'rounded-xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden cursor-pointer group hover:shadow-lg hover:border-primary/60',
      'bg-white dark:bg-gray-800 border',
      month.isCurrent
        ? 'border-primary/60 dark:border-primary/70 shadow-md shadow-primary/5 ring-1 ring-primary/30'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-xs',
    ]"
    @click="goToDetail"
  >
    <!-- Yuqori qism: Oy nomi (chapda) va Tepa o'ngdagi holat belgisi (ikonka + badge) -->
    <div class="flex items-start justify-between gap-2 min-w-0 mb-3">
      <div class="min-w-0">
        <h3
          class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight truncate"
        >
          {{ month.name }}
        </h3>
        <p class="text-xs text-gray-400 font-medium font-mono mt-0.5">
          {{ month.year }}
        </p>
      </div>

      <!-- Tepa o'ng tomondagi ikonka va holat nishoni (responsive moslashgan) -->
      <div class="flex items-center gap-1.5 shrink-0">
        <span
          :class="[
            'text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md border whitespace-nowrap',
            badgeClass,
          ]"
        >
          {{ badgeLabel }}
        </span>

        <div
          :class="[
            'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base shrink-0 shadow-2xs transition-transform duration-200 hover:scale-105',
            iconBgClass,
          ]"
          :title="badgeLabel"
        >
          <Icon :icon="iconName" />
        </div>
      </div>
    </div>

    <!-- O'rta qism: Reja va Fakt ko'rsatkichlari -->
    <div
      class="my-4 space-y-2.5 border-t border-gray-100 dark:border-gray-700/80 pt-3 text-xs sm:text-sm"
    >
      <div class="flex justify-between items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400">Reja:</span>
        <span class="font-bold text-gray-900 dark:text-gray-100 tracking-tight text-right">
          {{ formatUZS(month.plan) }}
        </span>
      </div>
      <div class="flex justify-between items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400">Fakt:</span>
        <span
          :class="[
            'font-bold tracking-tight text-right',
            month.fact > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-gray-400 dark:text-gray-500',
          ]"
        >
          {{ formatUZS(month.fact) }}
        </span>
      </div>
    </div>

    <!-- Pastki qism: Bajarilish foizi va Progress Bar -->
    <div class="pt-2 border-t border-gray-100 dark:border-gray-700/80">
      <div class="flex justify-between items-center text-xs mb-1.5">
        <span class="text-gray-500 dark:text-gray-400">Bajarilish</span>
        <span :class="['font-bold text-xs sm:text-sm', percentTextColor]">
          {{ month.percent }}%
        </span>
      </div>
      <!-- Rangli progress bar -->
      <div class="w-full h-1.5 sm:h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700"
          :class="progressBarColor"
          :style="{ width: `${Math.min(100, Math.max(2, month.percent))}%` }"
        ></div>
      </div>
      <!-- Pastki qism: Batafsil tahlil tugmasi -->
      <div
        class="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between text-xs font-semibold text-gray-500 group-hover:text-primary transition-colors"
      >
        <span>Batafsil ko'rish</span>
        <Icon
          icon="solar:arrow-right-linear"
          class="text-sm transition-transform group-hover:translate-x-1"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "PaymentMonthCard",
  components: {
    Icon,
  },
  props: {
    month: {
      type: Object,
      required: true,
    },
  },
  computed: {
    badgeLabel() {
      if (this.month.isCurrent) return "Joriy oy";
      if (this.month.percent >= 100) return "Bajarildi";
      if (this.month.percent >= 80) return "Yuqori";
      if (this.month.percent >= 50) return "O'rtacha";
      if (this.month.percent > 0) return "Past";
      if (this.month.isPast) return "Qarzdor";
      return "Kutilmoqda";
    },
    badgeClass() {
      if (this.month.isCurrent) {
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30";
      }
      if (this.month.percent >= 80) {
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      }
      if (this.month.percent >= 50) {
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      }
      if (this.month.percent > 0) {
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30";
      }
      if (this.month.isPast) {
        return "bg-red-500/10 text-red-500 border-red-500/30";
      }
      return "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600";
    },
    iconName() {
      if (this.month.isCurrent) return "solar:calendar-date-bold";
      if (this.month.percent >= 100) return "solar:cup-star-bold";
      if (this.month.percent >= 80) return "solar:check-circle-bold";
      if (this.month.percent >= 50) return "solar:chart-2-bold";
      if (this.month.percent > 0) return "solar:pie-chart-2-bold";
      if (this.month.isPast) return "solar:danger-triangle-bold";
      return "solar:hourglass-line-bold";
    },
    iconBgClass() {
      if (this.month.isCurrent) {
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/25";
      }
      if (this.month.percent >= 80) {
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25";
      }
      if (this.month.percent >= 50) {
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25";
      }
      if (this.month.percent > 0) {
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/25";
      }
      if (this.month.isPast) {
        return "bg-red-500/10 text-red-500 border border-red-500/25";
      }
      return "bg-gray-100 dark:bg-gray-700 text-gray-400 border border-gray-200 dark:border-gray-600";
    },
    percentTextColor() {
      if (this.month.percent >= 80) return "text-emerald-500 dark:text-emerald-400";
      if (this.month.percent >= 50) return "text-amber-500 dark:text-amber-400";
      return "text-red-500 dark:text-red-400";
    },
    progressBarColor() {
      if (this.month.percent >= 80) return "bg-emerald-500";
      if (this.month.percent >= 50) return "bg-amber-500";
      return "bg-red-500";
    },
  },
  methods: {
    goToDetail() {
      const key = this.month?.key || this.month?.name || "Okt";
      this.$router.push({
        path: `/payment-stats/month/${key}`,
        query: {
          name: this.month.name,
          year: this.month.year,
          plan: this.month.plan,
          fact: this.month.fact,
          percent: this.month.percent,
        },
      });
    },
    formatUZS(val) {
      if (!val) return "0 so'm";
      return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
    },
  },
};
</script>
