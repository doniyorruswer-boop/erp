<template>
  <div class="p-4 space-y-4">
    <!-- Debtor banner -->
    <div
      class="flex items-center justify-between flex-wrap gap-3 bg-rose-50/80 dark:bg-rose-950/40 p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 text-xs sm:text-sm"
    >
      <div class="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-semibold">
        <Icon icon="solar:danger-triangle-bold" class="text-lg text-rose-600" />
        <span
          >Ushbu oy bo'yicha jami {{ debtors.length }} ta o'quvchi to'lov qilmagan. Umumiy qarz:
          <strong>{{ formatUZS(totalDebt) }}</strong></span
        >
      </div>
      <AppButton variant="danger" icon="solar:chat-round-dots-bold" @click="$emit('open-sms')">
        Barchasiga SMS Eslatma Yuborish
      </AppButton>
    </div>

    <!-- Debtors table -->
    <div class="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
      <table class="w-full text-left border-collapse min-w-[850px]">
        <thead
          class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b dark:border-gray-700"
        >
          <tr>
            <th class="py-3 px-3.5 w-12 text-center">#</th>
            <th class="py-3 px-4">O'quvchi FISH</th>
            <th class="py-3 px-4 text-center">Sinf</th>
            <th class="py-3 px-4">Qarzdorlik</th>
            <th class="py-3 px-4">Ota-onasi</th>
            <th class="py-3 px-4">Telefon Raqami</th>
            <th class="py-3 px-4 text-center">Kechikkan Kunlar</th>
            <th class="py-3 px-4 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs sm:text-sm">
          <tr
            v-for="(d, idx) in paginatedDebtors"
            :key="d.studentId"
            class="hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition-colors"
          >
            <td class="py-3 px-3.5 text-center text-gray-400 font-medium">
              {{ (currentPage - 1) * perPage + idx + 1 }}
            </td>
            <td class="py-3 px-4">
              <RouterLink
                :to="`/students/${d.studentId}`"
                class="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors"
              >
                {{ d.studentName }}
              </RouterLink>
              <span class="block text-[11px] text-gray-400">ID: {{ d.studentId }}</span>
            </td>
            <td class="py-3 px-4 text-center font-bold text-gray-700 dark:text-gray-300">
              {{ d.className }}
            </td>
            <td class="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">
              {{ formatUZS(d.debtAmount) }}
            </td>
            <td class="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">
              {{ d.parentName }}
            </td>
            <td class="py-3 px-4">
              <a
                :href="`tel:${d.parentPhone}`"
                class="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <Icon icon="solar:phone-calling-linear" class="text-sm" />
                {{ d.parentPhone }}
              </a>
            </td>
            <td class="py-3 px-4 text-center">
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
              >
                {{ d.delayDays }} kun kechikkan
              </span>
            </td>
            <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
              <AppButton
                size="sm"
                variant="outline"
                icon="solar:chat-round-dots-linear"
                @click="$emit('send-single-sms', d)"
              >
                SMS
              </AppButton>
              <RouterLink :to="`/students/${d.studentId}`">
                <AppButton size="sm" variant="outline" icon="solar:user-id-linear">
                  Profil
                </AppButton>
              </RouterLink>
            </td>
          </tr>
          <tr v-if="debtors.length === 0">
            <td colspan="8" class="py-8 text-center text-emerald-600 font-medium">
              Ushbu oy bo'yicha qarzdorlar mavjud emas!
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <AppPagination
        v-model="currentPage"
        :total-items="debtors.length"
        :per-page="perPage"
        item-label="qarzdor o'quvchi"
      />
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import AppButton from "@/components/common/AppButton.vue";
import AppPagination from "@/components/common/AppPagination.vue";
import { formatUZS } from "@/helper/formatters";

export default {
  name: "MonthDetailDebtorsTab",
  components: { Icon, AppButton, AppPagination },
  props: {
    debtors: {
      type: Array,
      default: () => [],
    },
    totalDebt: {
      type: Number,
      default: 0,
    },
  },
  emits: ["open-sms", "send-single-sms"],
  data() {
    return {
      currentPage: 1,
      perPage: 10,
    };
  },
  computed: {
    paginatedDebtors() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.debtors.slice(start, start + this.perPage);
    },
  },
  methods: {
    formatUZS,
  },
};
</script>
