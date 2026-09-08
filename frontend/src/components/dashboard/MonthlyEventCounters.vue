<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3 font-lexend">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <p class="text-sm text-gray-600 dark:text-gray-300">
        <span class="font-bold text-gray-800 dark:text-white">{{ displayHeading }}</span> hodisalari: qancha yangi lidlar, sinov darslari, shartnomalar va to'lovlar amalga oshirildi.
      </p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
      <!-- 1. Yangi lidlar -->
      <div class="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 hover:border-gray-200 transition">
        <div class="flex items-center justify-between text-gray-400 mb-2">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">Yangi lidlar</span>
          <div class="w-7 h-7 rounded-lg bg-gray-200/70 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-200">
            <Icon icon="solar:user-plus-bold" class="text-sm" />
          </div>
        </div>
        <div class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          {{ events.newLeads ?? 0 }}
        </div>
      </div>

      <!-- 2. Sinov darsiga -->
      <div class="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 hover:border-amber-200 transition">
        <div class="flex items-center justify-between text-amber-500 mb-2">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">Sinov darsiga</span>
          <div class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Icon icon="solar:bell-bold" class="text-sm" />
          </div>
        </div>
        <div class="text-xl sm:text-2xl font-bold text-amber-500">
          {{ events.trialLessons ?? 0 }}
        </div>
      </div>

      <!-- 3. Shartnoma -->
      <div class="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 hover:border-blue-200 transition">
        <div class="flex items-center justify-between text-blue-500 mb-2">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">Shartnoma</span>
          <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Icon icon="solar:document-text-bold" class="text-sm" />
          </div>
        </div>
        <div class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          {{ events.contracts ?? 0 }}
        </div>
      </div>

      <!-- 4. Yangi to'lovlar -->
      <div class="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 hover:border-primary/30 transition">
        <div class="flex items-center justify-between text-primary mb-2">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">Yangi to'lovlar</span>
          <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Icon icon="solar:wallet-money-bold" class="text-sm" />
          </div>
        </div>
        <div class="text-xl sm:text-2xl font-bold text-primary">
          {{ events.newPayments ?? 0 }}
        </div>
      </div>

      <!-- 5. O'quvchilar -->
      <div class="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 hover:border-primary/30 transition">
        <div class="flex items-center justify-between text-primary mb-2">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">O'quvchilar</span>
          <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Icon icon="solar:square-academic-cap-bold" class="text-sm" />
          </div>
        </div>
        <div class="text-xl sm:text-2xl font-bold text-primary">
          {{ events.activeStudents ?? 0 }}
        </div>
        <span class="text-xs text-gray-500 block mt-0.5">hozir faol</span>
      </div>

      <!-- 6. Chiqib ketganlar -->
      <div class="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 hover:border-rose-200 transition">
        <div class="flex items-center justify-between text-rose-500 mb-2">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">Chiqib ketganlar</span>
          <div class="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Icon icon="solar:logout-2-bold" class="text-sm" />
          </div>
        </div>
        <div class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          {{ events.droppedOut ?? 0 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "MonthlyEventCounters",
  components: { Icon },
  props: {
    monthLabel: {
      type: String,
      default: "Joriy oy",
    },
    events: {
      type: Object,
      default: () => ({
        newLeads: 0,
        trialLessons: 0,
        contracts: 0,
        newPayments: 0,
        activeStudents: 0,
        droppedOut: 0,
      }),
    },
  },
  computed: {
    displayHeading() {
      if (!this.monthLabel) return "Davr";
      const lbl = this.monthLabel.trim();
      if (
        lbl.endsWith("oyi") ||
        lbl.endsWith("yili") ||
        lbl === "Bugun" ||
        lbl === "Kecha" ||
        lbl.includes("kun")
      ) {
        return lbl;
      }
      return `${lbl} oyi`;
    },
  },
};
</script>
