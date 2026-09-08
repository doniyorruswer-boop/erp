<template>
  <div class="space-y-5">
    <!-- Qisqacha Moliyaviy Kartochkalar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-1.5 shadow-xs">
        <span class="text-gray-500 dark:text-gray-400 font-semibold text-sm">Umumiy shartnoma rejasi:</span>
        <div class="text-2xl font-extrabold text-gray-900 dark:text-white">
          {{ formatMoneyUZS(classInfo.plan || 1499400000) }}
        </div>
        <span class="text-xs text-gray-400">{{ students.length }} ta o'quvchi bo'yicha yillik reja</span>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-1.5 shadow-xs">
        <span class="text-gray-500 dark:text-gray-400 font-semibold text-sm">To'langan (Tushum):</span>
        <div class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
          {{ formatMoneyUZS(classInfo.fact || 725374500) }}
        </div>
        <span class="text-xs text-emerald-600 dark:text-emerald-400 font-bold">48.4% bajarildi</span>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-1.5 shadow-xs">
        <span class="text-gray-500 dark:text-gray-400 font-semibold text-sm">Mavjud qarzdorlik:</span>
        <div class="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
          {{ formatMoneyUZS((classInfo.plan || 1499400000) - (classInfo.fact || 725374500)) }}
        </div>
        <span class="text-xs text-rose-500 font-bold">Qarzdor o'quvchilar: 6 nafar</span>
      </div>
    </div>

    <!-- To'lovlar ro'yxati jadvali -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-xs">
      <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="font-bold text-base text-gray-900 dark:text-white">
          Sinf o'quvchilari to'lov varaqasi (2025-2026)
        </h3>
        <button
          type="button"
          @click="$emit('print')"
          class="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 shadow-2xs hover:bg-primary/90 transition cursor-pointer"
        >
          <Icon icon="solar:printer-linear" class="text-base" />
          <span>Chop etish</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase text-xs sm:text-sm">
            <tr>
              <th class="py-3.5 px-3.5 text-center">#</th>
              <th class="py-3.5 px-4">O'quvchi FISH</th>
              <th class="py-3.5 px-4">Shartnoma summasi</th>
              <th class="py-3.5 px-4">To'langan summa</th>
              <th class="py-3.5 px-4">Qarzdorlik</th>
              <th class="py-3.5 px-4 text-center">Holati</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="(st, idx) in students" :key="st.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition">
              <td class="py-3.5 px-3.5 text-center font-bold text-gray-400">{{ idx + 1 }}</td>
              <td class="py-3.5 px-4 font-bold text-gray-900 dark:text-gray-100">{{ st.fullName }}</td>
              <td class="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">{{ formatMoneyUZS(st.contractPlan || 53500000) }}</td>
              <td class="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{{ formatMoneyUZS(st.contractPaid || 26750000) }}</td>
              <td class="py-3.5 px-4 font-bold" :class="(st.contractPlan || 53500000) - (st.contractPaid || 26750000) > 0 ? 'text-rose-500' : 'text-emerald-500'">
                {{ formatMoneyUZS(Math.max(0, (st.contractPlan || 53500000) - (st.contractPaid || 26750000))) }}
              </td>
              <td class="py-3.5 px-4 text-center">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-bold border',
                    (st.contractPlan || 53500000) <= (st.contractPaid || 26750000)
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  ]"
                >
                  {{ (st.contractPlan || 53500000) <= (st.contractPaid || 26750000) ? "To'langan" : "Qarzdor" }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "SchoolClassPaymentsTab",
  components: {
    Icon,
  },
  props: {
    classInfo: {
      type: Object,
      required: true,
    },
    students: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["print"],
  methods: {
    formatMoneyUZS(val) {
      if (!val) return "0 UZS";
      return new Intl.NumberFormat("uz-UZ").format(val) + " UZS";
    },
  },
};
</script>
