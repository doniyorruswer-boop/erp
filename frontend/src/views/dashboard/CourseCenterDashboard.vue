<template>
  <div class="course-center-dashboard space-y-5">
    <!-- 4 Top KPI Cards (Reusable StatCard Component) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Oylik Tushum"
        :value="formatUZS(stats.totalRevenue)"
        icon="solar:wallet-money-bold"
        variant="amber"
        delta="+18.4%"
        delta-label="o'tgan oyga nisbatan"
      />

      <StatCard
        title="Faol O'quvchilar"
        :value="`${stats.totalStudents} ta`"
        icon="ph:student-fill"
        variant="blue"
        delta="+12.8%"
        delta-label="yangi qo'shilganlar"
      />

      <StatCard
        title="Faol Guruhlar"
        :value="`${stats.activeGroups} ta`"
        icon="solar:users-group-two-rounded-bold"
        variant="indigo"
        :subtext="`${stats.coursesCount} ta kurs yo'nalishi`"
        subicon="solar:layers-minimalistic-linear"
      />

      <StatCard
        title="Sotuv Voronkasi"
        :value="`${stats.totalLeads || 42} ta lid`"
        icon="solar:tuning-square-2-bold"
        variant="purple"
        delta="38.5%"
        delta-type="success"
        delta-label="konversiya"
      />
    </div>

    <!-- MAIN ROW: Big Revenue Area Chart (2/3) + Top Mentors (1/3) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Main Revenue Chart -->
      <div class="lg:col-span-2 card bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase text-primary tracking-wider">MOLIYAVIY DINAMIKA</span>
                <span class="px-2 py-0.5 text-[11px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-full">
                  +24.5% O'sish
                </span>
              </div>
              <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mt-0.5">
                Oylik Tushum va Kutilgan Reja Dinamikasi
              </h3>
            </div>

            <div class="flex items-center gap-2">
              <select
                v-model="revenueTimeframe"
                class="py-1.5 px-3 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                <option value="12">Oxirgi 12 oy</option>
                <option value="6">Oxirgi 6 oy</option>
              </select>
            </div>
          </div>

          <!-- Apex Area Chart -->
          <div class="w-full">
            <apexchart
              type="area"
              height="300"
              :options="revenueChartOptions"
              :series="revenueChartSeries"
            ></apexchart>
          </div>
        </div>

        <div class="pt-3 border-t dark:border-gray-700/60 flex items-center justify-between flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-primary inline-block"></span>
              <span>Haqiqiy Tushum (so'm)</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
              <span>Kutilgan Reja</span>
            </span>
          </div>
          <router-link to="/finance" class="text-primary font-semibold hover:underline flex items-center gap-1">
            <span>To'liq Moliya hisoboti</span>
            <Icon icon="solar:arrow-right-linear" />
          </router-link>
        </div>
      </div>

      <!-- Top Mentors & Teachers -->
      <div class="card bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4 pb-2 border-b dark:border-gray-700">
            <div>
              <h3 class="font-bold text-gray-800 dark:text-gray-100 text-base">Top Mentorlar & O'qituvchilar</h3>
              <p class="text-xs text-gray-400">O'quvchilar soni va yuklama bo'yicha</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
              {{ topTeachers.length }} ta
            </span>
          </div>

          <div v-if="topTeachers.length > 0" class="space-y-3">
            <div
              v-for="(t, idx) in topTeachers"
              :key="t.id"
              class="p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs text-white shrink-0 shadow-xs"
                  :class="teacherAvatarColors[idx % teacherAvatarColors.length]"
                >
                  {{ getInitials(t.name) }}
                </div>
                <div>
                  <h4 class="font-bold text-xs text-gray-800 dark:text-gray-100">{{ t.name }}</h4>
                  <p class="text-[11px] text-gray-400">{{ t.subject || 'Asosiy Mentor' }} • {{ t.groupsCount || 1 }} ta guruh</p>
                </div>
              </div>

              <div class="text-right">
                <span class="text-xs font-bold text-primary">{{ t.studentsCount }} o'quvchi</span>
                <div class="text-[10px] text-green-600 font-medium flex items-center justify-end gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span>{{ t.status || 'Faol' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="py-12 text-center text-gray-400 text-xs">
            Hozircha o'qituvchilar kiritilmagan.
          </div>
        </div>

        <div class="pt-3 mt-4 border-t dark:border-gray-700 text-center">
          <router-link to="/groups" class="text-xs text-primary font-semibold hover:underline flex items-center justify-center gap-1">
            <span>Barcha guruhlar va jadvallar</span>
            <Icon icon="solar:alt-arrow-right-linear" />
          </router-link>
        </div>
      </div>
    </div>

    <!-- 3 CHARTS ROW: Students Flow + Leads Growth + Distribution -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- 1. Students Flow (Dual Bar) -->
      <div class="card bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="text-xs font-bold text-primary uppercase tracking-wide">O'QUVCHILAR OQIMI</div>
              <h3 class="font-bold text-sm text-gray-800 dark:text-gray-100">Yangi vs Bitiruvchilar</h3>
            </div>
            <span class="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              +27.9% ↑
            </span>
          </div>

          <apexchart
            type="bar"
            height="210"
            :options="studentsFlowChartOptions"
            :series="studentsFlowChartSeries"
          ></apexchart>
        </div>

        <div class="pt-2 border-t dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
          <span>Oxirgi 6 oy dinamikasi</span>
          <router-link to="/students" class="text-primary font-medium hover:underline">O'quvchilar ro'yxati</router-link>
        </div>
      </div>

      <!-- 2. Leads Growth Spline Area -->
      <div class="card bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="text-xs font-bold text-purple-600 uppercase tracking-wide">SOTUV VORONKASI</div>
              <h3 class="font-bold text-sm text-gray-800 dark:text-gray-100">Haftalik Lidlar Oqimi</h3>
            </div>
            <span class="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
              +47.9% ↑
            </span>
          </div>

          <apexchart
            type="area"
            height="210"
            :options="leadsGrowthChartOptions"
            :series="leadsGrowthChartSeries"
          ></apexchart>
        </div>

        <div class="pt-2 border-t dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
          <span>Haftalik yangi murojaatlar</span>
          <router-link to="/leads" class="text-purple-600 font-medium hover:underline">Voronka doskasi</router-link>
        </div>
      </div>

      <!-- 3. Payment Methods Distribution -->
      <div class="card bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="text-xs font-bold text-amber-500 uppercase tracking-wide">ULUSHLAR TAHLILI</div>
              <h3 class="font-bold text-sm text-gray-800 dark:text-gray-100">To'lov Usullari Bo'yicha</h3>
            </div>
            <span class="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              Kassa
            </span>
          </div>

          <div class="py-1">
            <apexchart
              type="donut"
              height="210"
              :options="distributionChartOptions"
              :series="distributionChartSeries"
            ></apexchart>
          </div>
        </div>

        <div class="pt-2 border-t dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
          <span>Taqsimot ulushi (%)</span>
          <router-link to="/finance" class="text-amber-500 font-medium hover:underline">Moliya hisoboti</router-link>
        </div>
      </div>
    </div>

    <!-- Recent Payments Table -->
    <div class="card bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-xs">
      <div class="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b dark:border-gray-700">
        <div>
          <h3 class="font-bold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Icon icon="solar:bill-list-bold" class="text-primary text-lg" />
            <span>So'nggi Tranzaksiyalar va Qabul Qilingan To'lovlar</span>
          </h3>
        </div>

        <router-link
          to="/finance"
          class="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition flex items-center gap-1"
        >
          <span>Barcha To'lovlar & Kassa</span>
          <Icon icon="solar:arrow-right-linear" />
        </router-link>
      </div>

      <div v-if="stats.recentPayments && stats.recentPayments.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 font-semibold uppercase">
              <th class="p-3">O'quvchi / Mijoz</th>
              <th class="p-3">Sana & Vaqt</th>
              <th class="p-3">To'lov Usuli</th>
              <th class="p-3">Chek Raqami</th>
              <th class="p-3 text-right">Summa (UZS)</th>
              <th class="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="p in stats.recentPayments"
              :key="p.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
            >
              <td class="p-3 font-semibold text-gray-800 dark:text-gray-200">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                    {{ p.student?.firstName?.[0] || 'T' }}
                  </div>
                  <div>
                    <div>{{ p.student?.firstName }} {{ p.student?.lastName }}</div>
                    <div class="text-[10px] text-gray-400">{{ p.student?.phone || '—' }}</div>
                  </div>
                </div>
              </td>
              <td class="p-3 text-gray-500 dark:text-gray-400">
                {{ formatDate(p.paymentDate || p.createdAt) }}
              </td>
              <td class="p-3">
                <span
                  class="px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1"
                  :class="getMethodBadgeClass(p.method)"
                >
                  <Icon :icon="getMethodIcon(p.method)" />
                  <span>{{ p.method || 'CASH' }}</span>
                </span>
              </td>
              <td class="p-3 font-mono text-gray-400">
                {{ p.receiptNumber || 'CHK-8921' }}
              </td>
              <td class="p-3 text-right font-bold text-green-600 dark:text-green-400 text-sm">
                +{{ formatUZS(p.amount) }}
              </td>
              <td class="p-3 text-center">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                  Qabul qilindi
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="py-2">
        <EmptyState title="Hozircha tizimda to'lovlar mavjud emas" />
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import EmptyState from "@/components/EmptyState.vue";
import { formatUZS } from "@/helper/formatters";

export default {
  name: "CourseCenterDashboard",
  components: {
    Icon,
    StatCard,
    EmptyState,
  },
  props: {
    stats: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      revenueTimeframe: "12",
      teacherAvatarColors: [
        "bg-primary",
        "bg-emerald-500",
        "bg-indigo-500",
        "bg-amber-500",
        "bg-purple-500",
      ],
    };
  },
  computed: {
    topTeachers() {
      return this.stats.topTeachers || [];
    },
    revenueChartOptions() {
      const rawCategories = this.stats.monthlyRevenue?.categories || [
        "Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"
      ];
      const categories = this.revenueTimeframe === "6" ? rawCategories.slice(-6) : rawCategories;

      return {
        chart: {
          type: "area",
          toolbar: { show: false },
          fontFamily: "Lexend, sans-serif",
          zoom: { enabled: false },
        },
        colors: ["#4F46E5", "#10B981"],
        dataLabels: { enabled: false },
        stroke: {
          curve: "smooth",
          width: [3, 2],
          dashArray: [0, 5],
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.35,
            opacityTo: 0.05,
            stops: [0, 90, 100],
          },
        },
        xaxis: {
          categories,
          labels: { style: { colors: "#9CA3AF", fontSize: "11px" } },
          axisBorder: { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: "#9CA3AF", fontSize: "11px" },
            formatter: (val) => `${new Intl.NumberFormat("uz-UZ").format(val)}`,
          },
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 4,
          yaxis: { lines: { show: true } },
        },
        tooltip: {
          y: {
            formatter: (val) => `${new Intl.NumberFormat("uz-UZ").format(val)} so'm`,
          },
        },
      };
    },
    revenueChartSeries() {
      const actual = this.stats.monthlyRevenue?.actual || [0, 0, 0, 0, 0, 0];
      const target = this.stats.monthlyRevenue?.target || [0, 0, 0, 0, 0, 0];

      return [
        {
          name: "Haqiqiy Tushum",
          data: this.revenueTimeframe === "6" ? actual.slice(-6) : actual,
        },
        {
          name: "Kutilgan Reja",
          data: this.revenueTimeframe === "6" ? target.slice(-6) : target,
        },
      ];
    },
    studentsFlowChartOptions() {
      return {
        chart: {
          type: "bar",
          toolbar: { show: false },
          fontFamily: "Lexend, sans-serif",
        },
        colors: ["#6366F1", "#F43F5E"],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "50%",
            borderRadius: 3,
          },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ["transparent"] },
        xaxis: {
          categories: this.stats.studentsFlow?.categories || ["Fev", "Mar", "Apr", "May", "Iyun", "Iyul"],
          labels: { style: { colors: "#9CA3AF", fontSize: "10px" } },
        },
        yaxis: {
          labels: { style: { colors: "#9CA3AF", fontSize: "10px" } },
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          fontSize: "11px",
        },
      };
    },
    studentsFlowChartSeries() {
      return [
        {
          name: "Yangi O'quvchilar",
          data: this.stats.studentsFlow?.newStudents || [0, 0, 0, 0, 0, 0],
        },
        {
          name: "Bitiruvchilar",
          data: this.stats.studentsFlow?.graduates || [0, 0, 0, 0, 0, 0],
        },
      ];
    },
    leadsGrowthChartOptions() {
      return {
        chart: {
          type: "area",
          toolbar: { show: false },
          fontFamily: "Lexend, sans-serif",
        },
        colors: ["#8B5CF6"],
        stroke: { curve: "smooth", width: 2.5 },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.05,
            stops: [0, 95, 100],
          },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: this.stats.leadsGrowth?.categories || ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"],
          labels: { style: { colors: "#9CA3AF", fontSize: "10px" } },
        },
        yaxis: {
          labels: { style: { colors: "#9CA3AF", fontSize: "10px" } },
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      };
    },
    leadsGrowthChartSeries() {
      return [
        {
          name: "Yangi Murojaatlar",
          data: this.stats.leadsGrowth?.leads || [0, 0, 0, 0, 0, 0, 0],
        },
      ];
    },
    distributionChartOptions() {
      return {
        chart: {
          type: "donut",
          fontFamily: "Lexend, sans-serif",
        },
        colors: ["#00E396", "#008FFB", "#FEB019", "#775DD0"],
        labels: this.stats.paymentMethods?.labels || ["Payme", "Click", "Naqd pul", "Karta (Terminal)"],
        dataLabels: { enabled: false },
        legend: {
          position: "bottom",
          fontSize: "11px",
          labels: { colors: "#6B7280" },
        },
        plotOptions: {
          pie: {
            donut: {
              size: "70%",
            },
          },
        },
      };
    },
    distributionChartSeries() {
      return this.stats.paymentMethods?.series || [45, 30, 15, 10];
    },
  },
  methods: {
    formatUZS,
    getInitials(name) {
      if (!name) return "AD";
      const parts = name.split(" ");
      return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2).toUpperCase();
    },
    formatDate(d) {
      if (!d) return "Bugun";
      const dt = new Date(d);
      return dt.toLocaleDateString("uz-UZ", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    getMethodBadgeClass(method) {
      const map = {
        PAYME: "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300",
        CLICK: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
        CASH: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
        CARD: "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
        UZUM: "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-300",
      };
      return map[method] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    },
    getMethodIcon(method) {
      const map = {
        PAYME: "solar:smartphone-2-bold",
        CLICK: "solar:card-transfer-bold",
        CASH: "solar:banknote-bold",
        CARD: "solar:card-2-bold",
        UZUM: "solar:shop-2-bold",
      };
      return map[method] || "solar:wallet-money-bold";
    },
  },
};
</script>
