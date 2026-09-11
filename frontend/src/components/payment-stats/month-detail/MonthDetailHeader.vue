<template>
  <div class="space-y-4">
    <!-- Breadcrumb -->
    <Breadcrumb
      :items="[
        { title: 'Moliya', to: '/payment-stats' },
        { title: 'To\'lovlar statistikasi', to: '/payment-stats' },
        { title: `${monthInfo.name} ${monthInfo.year} tahlili` },
      ]"
    />

    <!-- Header Section -->
    <div
      class="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs"
    >
      <div>
        <div class="flex items-center gap-3 flex-wrap">
          <PageTitle size="md">
            {{ monthInfo.name }} {{ monthInfo.year }} - To'lovlar tahlili
          </PageTitle>
          <span
            :class="[
              'px-2.5 py-0.5 rounded-md text-xs font-semibold border',
              monthInfo.percent >= 80
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                : monthInfo.percent >= 50
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
            ]"
          >
            {{
              monthInfo.percent >= 80
                ? "Reja a'lo darajada bajarildi"
                : monthInfo.percent >= 50
                  ? "O'rtacha bajarilish"
                  : "To'lovlar yig'ilmoqda"
            }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ushbu oy uchun kutilgan reja, faktik tushum, to'lov usullari taqsimoti va qarzdorlar
          tahlili
        </p>
      </div>

      <!-- Action buttons using AppButton -->
      <div class="flex items-center gap-2 flex-wrap">
        <AppButton variant="outline" icon="solar:arrow-left-linear" to="/payment-stats">
          Ortga
        </AppButton>

        <AppButton variant="outline" icon="solar:export-linear" @click="$emit('export-excel')">
          Excel export
        </AppButton>

        <AppButton variant="outline" icon="solar:printer-linear" @click="$emit('print-summary')">
          Chop etish
        </AppButton>

        <AppButton variant="primary" icon="solar:chat-round-dots-linear" @click="$emit('open-sms')">
          Qarzdorlarga SMS ({{ debtorsCount }})
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";
import PageTitle from "@/components/common/PageTitle.vue";

export default {
  name: "MonthDetailHeader",
  components: {
    Breadcrumb,
    PageTitle,
    AppButton,
  },
  props: {
    monthInfo: {
      type: Object,
      required: true,
    },
    debtorsCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["export-excel", "print-summary", "open-sms"],
};
</script>
