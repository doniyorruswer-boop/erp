<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <!-- Left: Kunbay tushum dinamikasi (2 ustun) -->
    <div class="lg:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
            Kunbay tushum dinamikasi (1 - 31 sanalar)
          </h3>
          <p class="text-xs text-gray-400">
            Ushbu oy davomida har bir kunda qancha mablag' tushganligi ko'rsatkichi
          </p>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
          {{ monthName }} oyi bo'yicha
        </span>
      </div>
      <div class="h-64 sm:h-72">
        <apexchart
          type="bar"
          height="100%"
          :options="dailyChartOptions"
          :series="dailyChartSeries"
        />
      </div>
    </div>

    <!-- Right: To'lov usullari ulushi (Donut Chart) -->
    <div class="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3 flex flex-col justify-between">
      <div>
        <h3 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
          To'lov usullari taqsimoti
        </h3>
        <p class="text-xs text-gray-400">
          Mablag'lar qaysi to'lov tizimlari orqali kelib tushgani
        </p>
      </div>
      <div class="h-56 sm:h-60 flex items-center justify-center">
        <apexchart
          type="donut"
          height="100%"
          :options="methodsChartOptions"
          :series="methodsChartSeries"
        />
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100 dark:border-gray-700">
        <div v-for="pm in methodsDistribution" :key="pm.code || pm.name" class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: pm.color }"></span>
          <span class="text-gray-600 dark:text-gray-300 font-medium truncate">{{ pm.name }}:</span>
          <span class="font-bold text-gray-900 dark:text-white ml-auto">{{ pm.percent }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatUZS } from "@/helper/formatters";

export default {
  name: "MonthDetailCharts",
  props: {
    monthName: {
      type: String,
      default: "",
    },
    dailyData: {
      type: Array,
      default: () => [],
    },
    methodsDistribution: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    dailyChartOptions() {
      return {
        chart: {
          type: "bar",
          toolbar: { show: false },
          fontFamily: "Lexend, sans-serif",
        },
        colors: ["#4F46E5"],
        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: "55%",
          },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
          title: { text: "Oy sanalari", style: { fontSize: "11px", color: "#9CA3AF" } },
        },
        yaxis: {
          labels: {
            formatter: (v) => `${Math.round(v / 1000000)}M`,
          },
        },
        tooltip: {
          y: { formatter: (v) => formatUZS(v) },
        },
      };
    },
    dailyChartSeries() {
      return [
        {
          name: "Kunlik tushum (UZS)",
          data: this.dailyData,
        },
      ];
    },
    methodsChartOptions() {
      return {
        chart: {
          type: "donut",
          fontFamily: "Lexend, sans-serif",
        },
        colors: this.methodsDistribution.map((m) => m.color),
        labels: this.methodsDistribution.map((m) => m.name),
        dataLabels: { enabled: false },
        legend: { show: false },
        stroke: { width: 2, colors: ["#ffffff"] },
        tooltip: {
          y: { formatter: (val) => `${val}%` },
        },
      };
    },
    methodsChartSeries() {
      return this.methodsDistribution.map((m) => m.percent);
    },
  },
};
</script>
