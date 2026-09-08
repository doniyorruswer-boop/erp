<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 font-lexend">
    <!-- Header: Sarlavha va Umumiy konversiya nishoni -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-700/60">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon icon="solar:funnel-bold" class="text-base" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-gray-800 dark:text-gray-100">
              Sotuv voronkasi
            </h3>
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
              Kaskad & Matritsa
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Bosqichni bosing — tegishli o'quvchilar ro'yxati va holatini ko'rishingiz mumkin
          </p>
        </div>
      </div>

      <!-- O'ng tomondagi umumiy konversiya xulosasi -->
      <div class="flex items-center gap-2 shrink-0">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
          <Icon icon="solar:check-circle-bold" class="text-sm text-emerald-600 dark:text-emerald-400" />
          <span>Konversiya: <strong class="text-emerald-800 dark:text-emerald-200 text-sm font-bold">{{ overallPercent }}%</strong></span>
        </div>
      </div>
    </div>

    <!-- Asosiy 2 ustunli maydon (Chap tomon: 1-rasmdagi Waterfall, O'ng tomon: 2-rasmdagi Matritsa) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
      <!-- CHAP YARMI: 1-rasm — Waterfall Kaskad Ustunlar -->
      <div class="flex flex-col justify-between p-3.5 sm:p-4 bg-gray-50/60 dark:bg-gray-700/20 rounded-2xl border border-gray-200/80 dark:border-gray-700 relative overflow-hidden">
        <!-- Ichki mini sarlavha -->
        <div class="flex items-center justify-between pb-2 mb-1 border-b border-gray-200/60 dark:border-gray-700/60">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Kaskad Ustunlar Oqimi</span>
          </div>
          <span class="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Bosqichma-bosqich o'tish
          </span>
        </div>

        <!-- Ustunlar va drop-off ko'priklari -->
        <div class="h-60 sm:h-64 flex items-end justify-between gap-1.5 sm:gap-3 px-1 sm:px-3 pt-6 pb-2 relative">
          <!-- Orqa fondagi to'r chiziqlari (Grid lines) -->
          <div class="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-20 dark:opacity-10">
            <div class="border-b border-gray-400 border-dashed w-full"></div>
            <div class="border-b border-gray-400 border-dashed w-full"></div>
            <div class="border-b border-gray-400 border-dashed w-full"></div>
            <div class="border-b border-gray-400 border-dashed w-full"></div>
          </div>

          <!-- 1. Ustun: Lidlar -->
          <div class="flex-1 flex flex-col items-center h-full justify-end relative z-10">
            <div class="text-center mb-1.5">
              <span class="text-xs sm:text-sm font-black text-gray-800 dark:text-white block">
                {{ formatNumber(funnelData.inquiries ?? 0) }}
              </span>
              <span class="text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                100%
              </span>
            </div>

            <div
              @click="openModal('inquiries', 'Murojaatlar', 'bg-slate-500')"
              class="w-full max-w-[68px] sm:max-w-[76px] h-[100%] rounded-t-xl bg-gradient-to-t from-slate-600 to-slate-400 dark:from-slate-700 dark:to-slate-500 shadow-xs hover:shadow-md hover:brightness-110 transition-all duration-300 cursor-pointer flex flex-col justify-between p-1.5 sm:p-2 text-white text-center group"
              title="Murojaatlar (Lidlar)"
            >
              <div class="w-5 h-5 sm:w-6 sm:h-6 mx-auto rounded-full bg-white/20 flex items-center justify-center text-[10px] sm:text-xs">
                <Icon icon="solar:inbox-line-bold" />
              </div>
              <span class="text-[10px] sm:text-xs font-semibold truncate">Lidlar</span>
            </div>
          </div>

          <!-- Bridge 1 -> 2: Drop-off ko'rsatkichi -->
          <div class="flex flex-col items-center justify-center pb-6 sm:pb-8 z-10 px-0.5 text-center shrink-0">
            <div class="px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 shadow-2xs">
              <div class="text-[9px] sm:text-[10px] font-black">↘ {{ funnelData.trialsPercent ?? 0 }}%</div>
              <div class="text-[8px] sm:text-[9px] text-rose-500 font-semibold">-{{ droppedTrials }} ta</div>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" class="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5" />
          </div>

          <!-- 2. Ustun: Sinov -->
          <div class="flex-1 flex flex-col items-center h-full justify-end relative z-10">
            <div class="text-center mb-1.5">
              <span class="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 block">
                {{ formatNumber(funnelData.trials ?? 0) }}
              </span>
              <span class="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                {{ barTrialsHeight }}%
              </span>
            </div>

            <div
              @click="openModal('trials', 'Sinov darslari', 'bg-amber-500')"
              class="w-full max-w-[68px] sm:max-w-[76px] rounded-t-xl bg-gradient-to-t from-amber-600 to-amber-400 shadow-xs hover:shadow-md hover:brightness-110 transition-all duration-300 cursor-pointer flex flex-col justify-between p-1.5 sm:p-2 text-white text-center group"
              :style="{ height: `${barTrialsHeight}%` }"
              title="Sinov darslari"
            >
              <div class="w-5 h-5 sm:w-6 sm:h-6 mx-auto rounded-full bg-white/20 flex items-center justify-center text-[10px] sm:text-xs">
                <Icon icon="solar:presentation-graph-bold" />
              </div>
              <span class="text-[10px] sm:text-xs font-semibold truncate">Sinov</span>
            </div>
          </div>

          <!-- Bridge 2 -> 3: Drop-off ko'rsatkichi -->
          <div class="flex flex-col items-center justify-center pb-6 sm:pb-8 z-10 px-0.5 text-center shrink-0">
            <div class="px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 shadow-2xs">
              <div class="text-[9px] sm:text-[10px] font-black">↘ {{ funnelData.contractsPercent ?? 0 }}%</div>
              <div class="text-[8px] sm:text-[9px] text-rose-500 font-semibold">-{{ droppedContracts }} ta</div>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" class="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5" />
          </div>

          <!-- 3. Ustun: Shartnoma -->
          <div class="flex-1 flex flex-col items-center h-full justify-end relative z-10">
            <div class="text-center mb-1.5">
              <span class="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 block">
                {{ formatNumber(funnelData.contracts ?? 0) }}
              </span>
              <span class="text-[9px] sm:text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-1.5 py-0.5 rounded">
                {{ barContractsHeight }}%
              </span>
            </div>

            <div
              @click="openModal('contracts', 'Shartnomalar', 'bg-blue-600')"
              class="w-full max-w-[68px] sm:max-w-[76px] rounded-t-xl bg-gradient-to-t from-blue-700 to-blue-500 shadow-xs hover:shadow-md hover:brightness-110 transition-all duration-300 cursor-pointer flex flex-col justify-between p-1.5 sm:p-2 text-white text-center group"
              :style="{ height: `${barContractsHeight}%` }"
              title="Shartnomalar"
            >
              <div class="w-5 h-5 sm:w-6 sm:h-6 mx-auto rounded-full bg-white/20 flex items-center justify-center text-[10px] sm:text-xs">
                <Icon icon="solar:document-text-bold" />
              </div>
              <span class="text-[10px] sm:text-xs font-semibold truncate">Shartnoma</span>
            </div>
          </div>

          <!-- Bridge 3 -> 4: Drop-off ko'rsatkichi -->
          <div class="flex flex-col items-center justify-center pb-6 sm:pb-8 z-10 px-0.5 text-center shrink-0">
            <div class="px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-md bg-primary/10 border border-primary/20 text-primary shadow-2xs">
              <div class="text-[9px] sm:text-[10px] font-black">↘ {{ funnelData.paymentsPercent ?? 0 }}%</div>
              <div class="text-[8px] sm:text-[9px] text-rose-500 font-semibold">-{{ droppedPayments }} ta</div>
            </div>
            <Icon icon="solar:arrow-right-linear" class="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5" />
          </div>

          <!-- 4. Ustun: To'lov -->
          <div class="flex-1 flex flex-col items-center h-full justify-end relative z-10">
            <div class="text-center mb-1.5">
              <span class="text-xs sm:text-sm font-black text-primary block">
                {{ formatNumber(funnelData.payments ?? 0) }}
              </span>
              <span class="text-[9px] sm:text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded">
                {{ overallPercent }}%
              </span>
            </div>

            <div
              @click="openModal('payments', 'To\'lovlar', 'bg-primary')"
              class="w-full max-w-[68px] sm:max-w-[76px] rounded-t-xl bg-gradient-to-t from-indigo-700 to-indigo-500 shadow-xs hover:shadow-md hover:brightness-110 transition-all duration-300 cursor-pointer flex flex-col justify-between p-1.5 sm:p-2 text-white text-center group"
              :style="{ height: `${overallPercent}%` }"
              title="To'lovlar (Yakun)"
            >
              <div class="w-5 h-5 sm:w-6 sm:h-6 mx-auto rounded-full bg-white/20 flex items-center justify-center text-[10px] sm:text-xs">
                <Icon icon="solar:wallet-money-bold" />
              </div>
              <span class="text-[10px] sm:text-xs font-semibold truncate">To'lov</span>
            </div>
          </div>
        </div>
      </div>

      <!-- O'NG YARMI: CRM Konversiya Bosqichlari Matritsasi -->
      <div class="flex flex-col justify-between p-3.5 sm:p-4 bg-gray-50/60 dark:bg-gray-700/20 rounded-2xl border border-gray-200/80 dark:border-gray-700 space-y-2.5">
        <!-- Ichki mini sarlavha -->
        <div class="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-gray-700/60">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Bosqichlar va Konversiya Matritsasi</span>
          </div>
          <span class="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            4 bosqichli tahlil
          </span>
        </div>

        <!-- 1. Murojaatlar -->
        <div
          @click="openModal('inquiries', 'Murojaatlar', 'bg-slate-500')"
          class="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 hover:border-slate-400 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Icon icon="solar:inbox-line-bold" class="text-base" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-800 dark:text-white truncate">1. Murojaatlar (Lidlar)</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">100%</span>
              </div>
              <div class="h-1.5 w-28 sm:w-44 bg-slate-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                <div class="h-full bg-slate-500 rounded-full w-full"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2.5 sm:gap-3 shrink-0 text-right">
            <div>
              <div class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {{ formatNumber(funnelData.inquiries ?? 0) }}
              </div>
              <div class="text-[10px] text-gray-400">100% baza</div>
            </div>
            <span class="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center text-gray-400 text-xs transition">
              <Icon icon="solar:alt-arrow-right-linear" />
            </span>
          </div>
        </div>

        <!-- 2. Sinov darslari -->
        <div
          @click="openModal('trials', 'Sinov darslari', 'bg-amber-500')"
          class="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 hover:border-amber-400 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div class="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Icon icon="solar:presentation-graph-bold" class="text-base" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-800 dark:text-white truncate">2. Sinov darslari</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 shrink-0">↘ {{ funnelData.trialsPercent ?? 0 }}%</span>
              </div>
              <div class="h-1.5 w-28 sm:w-44 bg-amber-100/60 dark:bg-amber-950/50 rounded-full mt-1.5 overflow-hidden">
                <div class="h-full bg-amber-500 rounded-full" :style="{ width: `${funnelData.trialsPercent ?? 0}%` }"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2.5 sm:gap-3 shrink-0 text-right">
            <div>
              <div class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {{ formatNumber(funnelData.trials ?? 0) }}
              </div>
              <div class="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Yo'qotish: {{ droppedTrials }} ta</div>
            </div>
            <span class="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 group-hover:bg-amber-100 group-hover:text-amber-600 flex items-center justify-center text-gray-400 text-xs transition">
              <Icon icon="solar:alt-arrow-right-linear" />
            </span>
          </div>
        </div>

        <!-- 3. Shartnomalar -->
        <div
          @click="openModal('contracts', 'Shartnomalar', 'bg-blue-600')"
          class="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 hover:border-blue-400 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div class="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Icon icon="solar:document-text-bold" class="text-base" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-800 dark:text-white truncate">3. Shartnomalar</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 shrink-0">↘ {{ funnelData.contractsPercent ?? 0 }}%</span>
              </div>
              <div class="h-1.5 w-28 sm:w-44 bg-blue-100/60 dark:bg-blue-950/50 rounded-full mt-1.5 overflow-hidden">
                <div class="h-full bg-blue-600 rounded-full" :style="{ width: `${funnelData.contractsPercent ?? 0}%` }"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2.5 sm:gap-3 shrink-0 text-right">
            <div>
              <div class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {{ formatNumber(funnelData.contracts ?? 0) }}
              </div>
              <div class="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Yo'qotish: {{ droppedContracts }} ta</div>
            </div>
            <span class="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center text-gray-400 text-xs transition">
              <Icon icon="solar:alt-arrow-right-linear" />
            </span>
          </div>
        </div>

        <!-- 4. To'lovlar -->
        <div
          @click="openModal('payments', 'To\'lovlar', 'bg-primary')"
          class="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 hover:border-primary/50 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon icon="solar:wallet-money-bold" class="text-base" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-800 dark:text-white truncate">4. To'lovlar (Yakun)</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary shrink-0">↘ {{ funnelData.paymentsPercent ?? 0 }}%</span>
              </div>
              <div class="h-1.5 w-28 sm:w-44 bg-primary/15 rounded-full mt-1.5 overflow-hidden">
                <div class="h-full bg-primary rounded-full" :style="{ width: `${funnelData.paymentsPercent ?? 0}%` }"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2.5 sm:gap-3 shrink-0 text-right">
            <div>
              <div class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {{ formatNumber(funnelData.payments ?? 0) }}
              </div>
              <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">To'landi ({{ funnelData.paymentsPercent ?? 0 }}%)</div>
            </div>
            <span class="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 group-hover:bg-primary/15 group-hover:text-primary flex items-center justify-center text-gray-400 text-xs transition">
              <Icon icon="solar:alt-arrow-right-linear" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "SalesFunnelWidget",
  components: { Icon },
  props: {
    funnelData: {
      type: Object,
      default: () => ({
        inquiries: 0,
        trials: 0,
        trialsPercent: 0,
        contracts: 0,
        contractsPercent: 0,
        payments: 0,
        paymentsPercent: 0,
      }),
    },
  },
  emits: ["open-stage-modal"],
  computed: {
    overallPercent() {
      const inq = this.funnelData?.inquiries || 0;
      const pay = this.funnelData?.payments || 0;
      if (!inq) return "0.0";
      return ((pay / inq) * 100).toFixed(1);
    },
    barTrialsHeight() {
      const inq = this.funnelData?.inquiries || 0;
      const tri = this.funnelData?.trials || 0;
      if (!inq) return 0;
      return Math.min(100, Math.max(12, ((tri / inq) * 100).toFixed(1)));
    },
    barContractsHeight() {
      const inq = this.funnelData?.inquiries || 0;
      const con = this.funnelData?.contracts || 0;
      if (!inq) return 0;
      return Math.min(100, Math.max(12, ((con / inq) * 100).toFixed(1)));
    },
    droppedTrials() {
      const inq = this.funnelData?.inquiries || 0;
      const tri = this.funnelData?.trials || 0;
      return Math.max(0, inq - tri);
    },
    droppedContracts() {
      const tri = this.funnelData?.trials || 0;
      const con = this.funnelData?.contracts || 0;
      return Math.max(0, tri - con);
    },
    droppedPayments() {
      const con = this.funnelData?.contracts || 0;
      const pay = this.funnelData?.payments || 0;
      return Math.max(0, con - pay);
    },
  },
  methods: {
    openModal(key, label, color) {
      this.$emit("open-stage-modal", { key, label, color });
    },
    formatNumber(val) {
      if (val === null || val === undefined) return "0";
      return Number(val).toLocaleString("uz-UZ");
    },
  },
};
</script>
