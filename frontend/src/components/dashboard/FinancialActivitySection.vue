<template>
  <div class="financial-activity-section font-lexend space-y-3">
    <!-- Top Row Headers for both columns -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-1">
      <!-- Left Column Header: MOLIYAVIY TAHLIL with Academic Year Filter -->
      <div class="lg:col-span-7 flex items-center justify-between">
        <h3 class="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
          MOLIYAVIY TAHLIL
        </h3>
        <!-- Academic Year Dropdown Selector matching user screenshot -->
        <FilterSelect
          v-model="selectedYear"
          :options="academicYears"
          :all-label="''"
          border-variant="primary"
          icon=""
          min-width="min-w-[125px]"
          size="sm"
        />
      </div>

      <!-- Right Column Header: MOLIYAVIY FAOLLIK -->
      <div class="lg:col-span-5 flex items-center justify-between">
        <h3 class="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
          MOLIYAVIY FAOLLIK
        </h3>
        <button
          type="button"
          @click="openModal(activeTab)"
          class="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer transition"
        >
          <span>Barchasi</span>
          <Icon icon="solar:arrow-right-linear" />
        </button>
      </div>
    </div>

    <!-- Main 2-Column Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      <!-- Left Column (7/12): Financial Analysis Chart with Type Switcher -->
      <div class="lg:col-span-7 card bg-white dark:bg-gray-800 p-5 rounded-2xl border dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <!-- Chart Header & Interactive Switcher -->
          <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Oylik tushum, xarajatlar va qarzdorlik (mln so'm)
              </p>
            </div>

            <div class="flex items-center gap-3">
              <!-- Chart Type Toggle Switcher -->
              <div class="flex items-center bg-gray-100 dark:bg-gray-700/60 p-0.5 rounded-lg border dark:border-gray-600 text-xs">
                <button
                  type="button"
                  @click="chartType = 'area'"
                  :class="[
                    'px-2 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer text-[11px]',
                    chartType === 'area'
                      ? 'bg-white dark:bg-gray-800 text-primary shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-300'
                  ]"
                  title="To'lqinsimon (Area)"
                >
                  <Icon icon="solar:chart-2-bold" />
                  <span class="hidden sm:inline">To'lqinli</span>
                </button>

                <button
                  type="button"
                  @click="chartType = 'bar'"
                  :class="[
                    'px-2 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer text-[11px]',
                    chartType === 'bar'
                      ? 'bg-white dark:bg-gray-800 text-primary shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-300'
                  ]"
                  title="Guruhlangan Ustunli (Grouped Bar)"
                >
                  <Icon icon="solar:chart-square-bold" />
                  <span class="hidden sm:inline">Guruhlangan</span>
                </button>

                <button
                  type="button"
                  @click="chartType = 'stacked'"
                  :class="[
                    'px-2 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer text-[11px]',
                    chartType === 'stacked'
                      ? 'bg-white dark:bg-gray-800 text-primary shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-300'
                  ]"
                  title="To'plangan Ustunli (Stacked Bar)"
                >
                  <Icon icon="solar:layers-minimalistic-bold" />
                  <span class="hidden sm:inline">To'plangan</span>
                </button>
              </div>

              <!-- Chart Custom Legend -->
              <div class="hidden sm:flex items-center gap-2.5 text-xs font-semibold">
                <span class="flex items-center gap-1">
                  <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: themePrimaryColor }"></span>
                  <span class="text-gray-700 dark:text-gray-300 text-[11px]">Tushum</span>
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span class="text-gray-700 dark:text-gray-300 text-[11px]">Qarzdorlik</span>
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span class="text-gray-700 dark:text-gray-300 text-[11px]">Xarajatlar</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Apex Chart Container (Zero-Bug Multi-Type Switching) -->
          <div class="w-full min-h-[280px]">
            <apexchart
              v-if="chartType === 'area'"
              key="chart-area"
              type="area"
              height="280"
              :options="areaChartOptions"
              :series="chartSeries"
            ></apexchart>
            <apexchart
              v-else-if="chartType === 'bar'"
              key="chart-bar"
              type="bar"
              height="280"
              :options="barChartOptions"
              :series="chartSeries"
            ></apexchart>
            <apexchart
              v-else-if="chartType === 'stacked'"
              key="chart-stacked"
              type="bar"
              height="280"
              :options="stackedChartOptions"
              :series="chartSeries"
            ></apexchart>
          </div>
        </div>

        <div class="pt-2 border-t dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
          <span>O'quv yili oylari bo'yicha dinamik tahlil</span>
          <router-link to="/finance" class="text-primary font-semibold hover:underline flex items-center gap-1">
            <span>Batafsil moliya bo'limi</span>
            <Icon icon="solar:arrow-right-linear" />
          </router-link>
        </div>
      </div>

      <!-- Right Column (5/12): Financial Activity Card (Tabs + Top 5 Table) -->
      <div class="lg:col-span-5 card bg-white dark:bg-gray-800 p-5 rounded-2xl border dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <!-- Tab Navigation with Primary Setup Theme Colors -->
          <div class="flex items-center gap-1.5 sm:gap-2 pb-3 border-b dark:border-gray-700 overflow-x-auto">
            <!-- Tab 1: Qarzdor o'quvchilar -->
            <button
              type="button"
              @click="activeTab = 'debtorStudents'"
              :class="[
                'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer',
                activeTab === 'debtorStudents'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              ]"
            >
              <Icon icon="solar:user-bold" class="text-sm" />
              <span>{{ isKindergarten ? "Qarzdor bolalar" : "Qarzdor o'quvchilar" }}</span>
              <span class="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300">
                Top 5
              </span>
            </button>

            <!-- Tab 2: Qarzdor sinflar / guruhlar -->
            <button
              type="button"
              @click="activeTab = 'debtorClasses'"
              :class="[
                'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer',
                activeTab === 'debtorClasses'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              ]"
            >
              <Icon icon="solar:buildings-3-bold" class="text-sm" />
              <span>{{ isKindergarten ? "Qarzdor guruhlar" : "Qarzdor sinflar" }}</span>
              <span class="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300">
                Top 5
              </span>
            </button>

            <!-- Tab 3: Oxirgi to'lovlar -->
            <button
              type="button"
              @click="activeTab = 'recentPayments'"
              :class="[
                'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer',
                activeTab === 'recentPayments'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              ]"
            >
              <Icon icon="solar:bill-list-bold" class="text-sm" />
              <span>Oxirgi to'lovlar</span>
              <span class="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                1 Bugun
              </span>
            </button>
          </div>

          <!-- Table Header -->
          <div class="grid grid-cols-12 text-[11px] font-bold text-gray-400 dark:text-gray-400 py-2.5 uppercase tracking-wider border-b dark:border-gray-700/60">
            <div class="col-span-1 text-center">#</div>
            <div class="col-span-6">
              {{ activeTab === 'debtorClasses' ? (isKindergarten ? 'Guruh nomi' : 'Sinf / Rahbar') : (isKindergarten ? 'Bola ismi' : "O'quvchi") }}
            </div>
            <div class="col-span-2 text-center">
              {{ activeTab === 'recentPayments' ? 'Turi' : (activeTab === 'debtorClasses' ? 'Qarzdor' : 'Kun') }}
            </div>
            <div class="col-span-3 text-right">Miqdori</div>
          </div>

          <!-- Tab Content 1: Qarzdor O'quvchilar Top 5 -->
          <div v-if="activeTab === 'debtorStudents'">
            <div v-if="topDebtorStudents.length > 0" class="divide-y divide-gray-100 dark:divide-gray-700/60">
              <div
                v-for="(st, idx) in topDebtorStudents"
                :key="st.id"
                class="grid grid-cols-12 items-center py-3 text-xs hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition rounded-lg px-1"
              >
                <div class="col-span-1 text-center text-gray-400 font-bold">{{ idx + 1 }}</div>
                <div class="col-span-6 min-w-0 pr-2">
                  <p class="font-bold text-gray-800 dark:text-gray-100 truncate" :title="st.name">{{ st.name }}</p>
                  <p class="text-[10px] text-gray-400 truncate">{{ st.className }}</p>
                </div>
                <div class="col-span-2 text-center font-bold text-rose-500 text-[11px]">
                  {{ st.days }} kun
                </div>
                <div class="col-span-3 text-right font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                  {{ formatNumber(st.debtAmount) }}
                </div>
              </div>
            </div>
            <EmptyState v-else title="Qarzdor o'quvchilar yo'q" />
          </div>

          <!-- Tab Content 2: Qarzdor Sinflar Top 5 -->
          <div v-else-if="activeTab === 'debtorClasses'">
            <div v-if="topDebtorClasses.length > 0" class="divide-y divide-gray-100 dark:divide-gray-700/60">
              <div
                v-for="(cl, idx) in topDebtorClasses"
                :key="cl.id"
                class="grid grid-cols-12 items-center py-3 text-xs hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition rounded-lg px-1"
              >
                <div class="col-span-1 text-center text-gray-400 font-bold">{{ idx + 1 }}</div>
                <div class="col-span-6 min-w-0 pr-2">
                  <p class="font-bold text-gray-800 dark:text-gray-100 truncate">{{ cl.name }}</p>
                  <p class="text-[10px] text-gray-400 truncate">{{ cl.teacher }}</p>
                </div>
                <div class="col-span-2 text-center font-bold text-rose-500 text-[11px]">
                  {{ cl.debtorsCount }} ta
                </div>
                <div class="col-span-3 text-right font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                  {{ formatNumber(cl.debtAmount) }}
                </div>
              </div>
            </div>
            <EmptyState v-else title="Qarzdor sinflar yo'q" />
          </div>

          <!-- Tab Content 3: Oxirgi to'lovlar -->
          <div v-else-if="activeTab === 'recentPayments'">
            <div v-if="topRecentPayments.length > 0" class="divide-y divide-gray-100 dark:divide-gray-700/60">
              <div
                v-for="(p, idx) in topRecentPayments"
                :key="p.id"
                class="grid grid-cols-12 items-center py-3 text-xs hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition rounded-lg px-1"
              >
                <div class="col-span-1 text-center text-gray-400 font-bold">{{ idx + 1 }}</div>
                <div class="col-span-6 min-w-0 pr-2">
                  <p class="font-bold text-gray-800 dark:text-gray-100 truncate">{{ p.studentName }}</p>
                  <p class="text-[10px] text-gray-400 truncate">{{ p.className }} • {{ p.categoryLabel }}</p>
                </div>
                <div class="col-span-2 text-center text-[10px] font-semibold text-gray-500">
                  {{ p.method }}
                </div>
                <div class="col-span-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                  +{{ formatNumber(p.amount) }}
                </div>
              </div>
            </div>
            <EmptyState v-else title="To'lovlar topilmadi" />
          </div>
        </div>

        <!-- Right Box Footer -->
        <div class="pt-3 mt-2 border-t dark:border-gray-700/60 flex items-center justify-between text-xs">
          <span class="text-gray-500 dark:text-gray-400">
            Jami <b class="text-rose-500 font-bold">{{ totalDebtorsCount }} ta</b> kritik qarzdor bor
          </span>
          <button
            type="button"
            @click="openModal(activeTab)"
            class="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer transition"
          >
            <span>Barchasi</span>
            <Icon icon="solar:arrow-right-linear" />
          </button>
        </div>
      </div>
    </div>

    <!-- FULL MODAL WINDOW: Barcha Moliyaviy Faollik Ro'yxati using Windzo vmodal -->
    <vmodal
      :model-value="isModalOpen"
      @update:model-value="isModalOpen = $event"
      title="Moliyaviy Faollik — To'liq Ro'yxat"
      subtitle="Barcha qarzdorlar, sinflar va qabul qilingan to'lovlar reestri"
      icon="solar:bill-list-bold"
      icon-bg-class="bg-primary/10 text-primary"
      width="max-w-4xl"
      body-class="p-0"
      :hide-button="true"
    >
      <!-- Modal Search & Filter Bar -->
      <div class="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between flex-wrap gap-3">
        <!-- Search -->
        <div class="relative w-full sm:w-72">
          <Icon icon="solar:magnifer-linear" class="absolute left-3 top-2.5 text-gray-400 text-base" />
          <input
            type="text"
            v-model="modalSearch"
            placeholder="Ism yoki sinf bo'yicha qidiruv..."
            class="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:border-primary bg-white dark:bg-gray-900 dark:text-gray-200"
          />
        </div>

        <!-- Filter Tabs inside Modal -->
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click="modalTab = 'debtors'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
              modalTab === 'debtors'
                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 border border-rose-200 dark:border-rose-800'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100'
            ]"
          >
            Barcha Qarzdorlar ({{ allDebtorsList.length }})
          </button>

          <button
            type="button"
            @click="modalTab = 'payments'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
              modalTab === 'payments'
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100'
            ]"
          >
            Barcha To'lovlar ({{ allPaymentsList.length }})
          </button>
        </div>
      </div>

      <!-- Modal Table Body -->
      <div class="overflow-y-auto p-4 max-h-[60vh]">
        <!-- Debtors View -->
        <table v-if="modalTab === 'debtors'" class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 font-semibold uppercase">
              <th class="p-3">#</th>
              <th class="p-3">O'quvchi / Bola</th>
              <th class="p-3">Sinf / Guruh</th>
              <th class="p-3">Telefon</th>
              <th class="p-3 text-center">Muddati</th>
              <th class="p-3 text-right">Qarzdorlik</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="(st, idx) in filteredModalDebtors"
              :key="st.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
            >
              <td class="p-3 text-gray-400 font-bold">{{ idx + 1 }}</td>
              <td class="p-3 font-bold text-gray-800 dark:text-gray-100">{{ st.name }}</td>
              <td class="p-3 font-semibold text-primary">{{ st.className }}</td>
              <td class="p-3 text-gray-500">{{ st.phone || '+998 90 123-45-67' }}</td>
              <td class="p-3 text-center">
                <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-900/30">
                  {{ st.days }} kun
                </span>
              </td>
              <td class="p-3 text-right font-bold text-rose-600 dark:text-rose-400 text-sm">
                {{ formatNumber(st.debtAmount) }} so'm
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Payments View -->
        <table v-else class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 font-semibold uppercase">
              <th class="p-3">#</th>
              <th class="p-3">O'quvchi</th>
              <th class="p-3">Sinf / Guruh</th>
              <th class="p-3">Xizmat Toifasi</th>
              <th class="p-3">To'lov Turi</th>
              <th class="p-3 text-right">Summa</th>
              <th class="p-3 text-center">Sana</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="(p, idx) in filteredModalPayments"
              :key="p.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
            >
              <td class="p-3 text-gray-400 font-bold">{{ idx + 1 }}</td>
              <td class="p-3 font-bold text-gray-800 dark:text-gray-100">{{ p.studentName }}</td>
              <td class="p-3 font-semibold text-primary">{{ p.className }}</td>
              <td class="p-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {{ p.categoryLabel }}
                </span>
              </td>
              <td class="p-3 font-medium text-gray-600 dark:text-gray-300">{{ p.method }}</td>
              <td class="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                +{{ formatNumber(p.amount) }} so'm
              </td>
              <td class="p-3 text-center text-gray-400">{{ p.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer slot -->
      <template #footer="{ close }">
        <span class="text-xs text-gray-500">
          Ko'rsatilmoqda: <b>{{ modalTab === 'debtors' ? filteredModalDebtors.length : filteredModalPayments.length }}</b> ta yozuv
        </span>
        <button
          type="button"
          @click="close"
          class="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 transition cursor-pointer"
        >
          Yopish
        </button>
      </template>
    </vmodal>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import vmodal from "@/components/modal.vue";
import FilterSelect from "@/components/FilterSelect.vue";
import EmptyState from "@/components/EmptyState.vue";
import { dashboardApi, paymentsApi, studentsApi } from "@/api";

export default {
  name: "FinancialActivitySection",
  components: {
    Icon,
    vmodal,
    FilterSelect,
    EmptyState,
  },
  props: {
    isKindergarten: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeTab: "debtorStudents", // 'debtorStudents' | 'debtorClasses' | 'recentPayments'
      chartType: "area", // 'area' | 'bar' | 'stacked'
      isModalOpen: false,
      modalTab: "debtors", // 'debtors' | 'payments'
      modalSearch: "",
      totalDebtorsCount: 142,

      // Academic Year Filter for MOLIYAVIY TAHLIL
      selectedYear: "2025-2026",
      academicYears: [
        { value: "2025-2026", label: "2025-2026" },
        { value: "2024-2025", label: "2024-2025" },
        { value: "2023-2024", label: "2023-2024" },
      ],

      // Reactive Primary Brand Color (Matches current UI theme)
      themePrimaryColor: "#10B981",

      // Top 5 Debtor Students (Matches user screenshot)
      topDebtorStudents: [
        { id: 1, name: "Burxonov Otabek Suxrob o'g'li", className: "O'rta guruh sinf", days: 383, debtAmount: 68750000, phone: "+998 90 456-78-90" },
        { id: 2, name: "Sharipova Shahnoza Bekzod qizi", className: "Kichik sinf", days: 363, debtAmount: 36000000, phone: "+998 93 111-22-33" },
        { id: 3, name: "Nihil voluptas volup Nihil anim velit", className: "1-A sinf", days: 359, debtAmount: 35454545, phone: "+998 97 888-99-00" },
        { id: 4, name: "Jo'rayeva Yulduz Zohid qizi", className: "1-A sinf", days: 359, debtAmount: 35454545, phone: "+998 99 777-66-55" },
        { id: 5, name: "Rahmonov Dilshod Xudoyberdi o'g'li", className: "7-B sinf", days: 361, debtAmount: 33736667, phone: "+998 91 333-44-55" },
      ],

      // Top 5 Debtor Classes
      topDebtorClasses: [
        { id: 1, name: "1-A sinf", teacher: "Matluba Rahimova", debtorsCount: 8, debtAmount: 98400000 },
        { id: 2, name: "3-B sinf", teacher: "Dilshod Ergashev", debtorsCount: 6, debtAmount: 84200000 },
        { id: 3, name: "5-A sinf", teacher: "Nilufar Azimova", debtorsCount: 7, debtAmount: 76500000 },
        { id: 4, name: "7-B sinf", teacher: "Shavkat Qodirov", debtorsCount: 9, debtAmount: 68100000 },
        { id: 5, name: "10-A sinf", teacher: "Umida Karimova", debtorsCount: 5, debtAmount: 52738252 },
      ],

      // Top Recent Payments
      topRecentPayments: [
        { id: 1, studentName: "Jasur Bekmurodov", className: "1-A sinf", categoryLabel: "Ta'lim kontrakt", method: "Click", amount: 3200000, date: "Bugun 10:30" },
        { id: 2, studentName: "Madina Aliyeva", className: "3-B sinf", categoryLabel: "Oshxona", method: "Payme", amount: 650000, date: "Bugun 10:15" },
        { id: 3, studentName: "Sardor Yusupov", className: "5-A sinf", categoryLabel: "Transport", method: "Karta (Terminal)", amount: 400000, date: "Bugun 09:45" },
        { id: 4, studentName: "Laylo Sharipova", className: "2-A sinf", categoryLabel: "Ta'lim kontrakt", method: "Naqd pul", amount: 3200000, date: "Kecha 16:20" },
        { id: 5, studentName: "Bobur Mirzayev", className: "8-A sinf", categoryLabel: "To'garak", method: "Payme", amount: 350000, date: "Kecha 14:10" },
      ],

      // Full modal lists
      allDebtorsList: [
        { id: 1, name: "Burxonov Otabek Suxrob o'g'li", className: "O'rta guruh sinf", days: 383, debtAmount: 68750000, phone: "+998 90 456-78-90" },
        { id: 2, name: "Sharipova Shahnoza Bekzod qizi", className: "Kichik sinf", days: 363, debtAmount: 36000000, phone: "+998 93 111-22-33" },
        { id: 3, name: "Nihil voluptas volup Nihil anim velit", className: "1-A sinf", days: 359, debtAmount: 35454545, phone: "+998 97 888-99-00" },
        { id: 4, name: "Jo'rayeva Yulduz Zohid qizi", className: "1-A sinf", days: 359, debtAmount: 35454545, phone: "+998 99 777-66-55" },
        { id: 5, name: "Rahmonov Dilshod Xudoyberdi o'g'li", className: "7-B sinf", days: 361, debtAmount: 33736667, phone: "+998 91 333-44-55" },
        { id: 6, name: "Karimov Anvar Botir o'g'li", className: "3-B sinf", days: 340, debtAmount: 28500000, phone: "+998 90 555-44-33" },
        { id: 7, name: "Toshmatova Zilola Akbar qizi", className: "5-A sinf", days: 320, debtAmount: 24200000, phone: "+998 94 222-33-44" },
        { id: 8, name: "Azizov Jamshid Farhod o'g'li", className: "2-A sinf", days: 310, debtAmount: 22000000, phone: "+998 93 777-88-99" },
        { id: 9, name: "Yusupova Malika Sanjar qizi", className: "6-A sinf", days: 295, debtAmount: 19500000, phone: "+998 97 444-55-66" },
        { id: 10, name: "Saidov Rustam Erkin o'g'li", className: "8-B sinf", days: 280, debtAmount: 17800000, phone: "+998 90 123-99-88" },
      ],

      allPaymentsList: [
        { id: 1, studentName: "Jasur Bekmurodov", className: "1-A sinf", categoryLabel: "Ta'lim kontrakt", method: "Click", amount: 3200000, date: "Bugun 10:30" },
        { id: 2, studentName: "Madina Aliyeva", className: "3-B sinf", categoryLabel: "Oshxona", method: "Payme", amount: 650000, date: "Bugun 10:15" },
        { id: 3, studentName: "Sardor Yusupov", className: "5-A sinf", categoryLabel: "Transport", method: "Karta (Terminal)", amount: 400000, date: "Bugun 09:45" },
        { id: 4, studentName: "Laylo Sharipova", className: "2-A sinf", categoryLabel: "Ta'lim kontrakt", method: "Naqd pul", amount: 3200000, date: "Kecha 16:20" },
        { id: 5, studentName: "Bobur Mirzayev", className: "8-A sinf", categoryLabel: "To'garak", method: "Payme", amount: 350000, date: "Kecha 14:10" },
        { id: 6, studentName: "Nilufar Vohidova", className: "4-A sinf", categoryLabel: "Ta'lim kontrakt", method: "Click", amount: 3200000, date: "28-Avg 11:20" },
        { id: 7, studentName: "Davron Qobilov", className: "9-B sinf", categoryLabel: "Oshxona", method: "Payme", amount: 650000, date: "27-Avg 15:40" },
      ],
    };
  },
  async mounted() {
    this.$nextTick(() => {
      this.syncPrimaryColor();
    });
    if (typeof window !== "undefined") {
      window.addEventListener("theme-change", this.syncPrimaryColor);
    }
    await this.fetchFinancialData();
  },
  beforeUnmount() {
    if (typeof window !== "undefined") {
      window.removeEventListener("theme-change", this.syncPrimaryColor);
    }
  },
  computed: {
    areaChartOptions() {
      return {
        chart: {
          id: "financial-area-chart",
          type: "area",
          toolbar: { show: false },
          fontFamily: "Lexend, sans-serif",
        },
        colors: [this.themePrimaryColor || "#4F46E5", "#F43F5E", "#F59E0B"],
        stroke: {
          curve: "smooth",
          width: [3, 2.5, 2.5],
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [0, 90, 100],
          },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: ["Sen", "Okt", "Noy", "Dek", "Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg"],
          labels: { style: { colors: "#9CA3AF", fontSize: "10px" } },
        },
        yaxis: {
          labels: {
            style: { colors: "#9CA3AF", fontSize: "10px" },
            formatter: (val) => `${val}m`,
          },
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
        legend: { show: false },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: (val) => (val !== undefined ? `${val} mln so'm` : ""),
          },
        },
      };
    },
    barChartOptions() {
      return {
        chart: {
          id: "financial-bar-chart",
          type: "bar",
          toolbar: { show: false },
          fontFamily: "Lexend, sans-serif",
        },
        colors: [this.themePrimaryColor || "#4F46E5", "#F43F5E", "#F59E0B"],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "55%",
            borderRadius: 4,
          },
        },
        stroke: { show: true, width: 1, colors: ["transparent"] },
        dataLabels: { enabled: false },
        xaxis: {
          categories: ["Sen", "Okt", "Noy", "Dek", "Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg"],
          labels: { style: { colors: "#9CA3AF", fontSize: "10px" } },
        },
        yaxis: {
          labels: {
            style: { colors: "#9CA3AF", fontSize: "10px" },
            formatter: (val) => `${val}m`,
          },
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
        legend: { show: false },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: (val) => (val !== undefined ? `${val} mln so'm` : ""),
          },
        },
      };
    },
    stackedChartOptions() {
      return {
        chart: {
          id: "financial-stacked-chart",
          type: "bar",
          stacked: true,
          toolbar: { show: false },
          fontFamily: "Lexend, sans-serif",
        },
        colors: [this.themePrimaryColor || "#4F46E5", "#F43F5E", "#F59E0B"],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "45%",
            borderRadius: 3,
          },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: ["Sen", "Okt", "Noy", "Dek", "Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg"],
          labels: { style: { colors: "#9CA3AF", fontSize: "10px" } },
        },
        yaxis: {
          labels: {
            style: { colors: "#9CA3AF", fontSize: "10px" },
            formatter: (val) => `${val}m`,
          },
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
        legend: { show: false },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: (val) => (val !== undefined ? `${val} mln so'm` : ""),
          },
        },
      };
    },
    chartSeries() {
      return [
        {
          name: "Tushum",
          data: [185, 205, 212, 215, 218, 210, 132, 95, 84, 18, 8, 5],
        },
        {
          name: "Qarzdorlik",
          data: [85, 102, 105, 105, 106, 122, 237, 322, 368, 112, 123, 132],
        },
        {
          name: "Xarajatlar",
          data: [110, 155, 118, 166, 188, 226, 165, 16, 4, 21, 2, 15],
        },
      ];
    },
    filteredModalDebtors() {
      if (!this.modalSearch) return this.allDebtorsList;
      const q = this.modalSearch.toLowerCase();
      return this.allDebtorsList.filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.className.toLowerCase().includes(q) ||
          st.phone.includes(q)
      );
    },
    filteredModalPayments() {
      if (!this.modalSearch) return this.allPaymentsList;
      const q = this.modalSearch.toLowerCase();
      return this.allPaymentsList.filter(
        (p) =>
          p.studentName.toLowerCase().includes(q) ||
          p.className.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      );
    },
  },
  methods: {
    syncPrimaryColor() {
      if (typeof window !== "undefined") {
        const col = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim();
        if (col) {
          this.themePrimaryColor = col;
        }
      }
    },
    formatNumber(val) {
      if (!val) return "0";
      return new Intl.NumberFormat("uz-UZ").format(val);
    },
    openModal(tab) {
      if (tab === "recentPayments" || tab === "payments") {
        this.modalTab = "payments";
      } else {
        this.modalTab = "debtors";
      }
      this.isModalOpen = true;
    },
    async fetchFinancialData() {
      try {
        const type = this.isKindergarten ? "KINDERGARTEN" : "SCHOOL";
        const stats = await dashboardApi.getStats({ type });
        if (stats) {
          if (stats.recentPayments && Array.isArray(stats.recentPayments) && stats.recentPayments.length > 0) {
            this.topRecentPayments = stats.recentPayments.slice(0, 5);
            this.allPaymentsList = stats.recentPayments;
          }
          if (stats.debtorStudents && Array.isArray(stats.debtorStudents) && stats.debtorStudents.length > 0) {
            this.topDebtorStudents = stats.debtorStudents.slice(0, 5);
            this.allDebtorsList = stats.debtorStudents;
          }
        }
      } catch (err) {
        console.warn("Moliya API ma'lumotlari yuklanmadi:", err.message);
      }
    },
  },
};
</script>

<style scoped>
/* Modal Fade Backdrop Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-window {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-leave-active .modal-window {
  transition: all 0.2s cubic-bezier(0.7, 0, 0.84, 0);
}

.modal-fade-enter-from .modal-window {
  opacity: 0;
  transform: scale(0.94) translateY(-14px);
}

.modal-fade-leave-to .modal-window {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
