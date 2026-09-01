<template>
  <div class="monthly-contracts-statistics font-lexend space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-2 pt-2">
      <h3 class="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
        OYLAR KESIMIDA SHARTNOMALAR VA TO'LOVLAR STATISTIKASI
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

    <!-- Main Full-Width Table Card (Exact Replica of User Screenshot) -->
    <div class="card bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/80 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b dark:border-gray-700">
              <th class="py-3.5 px-4 font-bold">OY</th>
              <th class="py-3.5 px-3 font-bold">SONI</th>
              <th class="py-3.5 px-3 font-bold">SUMMA</th>
              <th class="py-3.5 px-3 font-bold">CHEGIRMA</th>
              <th class="py-3.5 px-3 font-bold">CHEGIRMALI TO'LOV MIQDORI</th>
              <th class="py-3.5 px-3 font-bold">TO'LOV</th>
              <th class="py-3.5 px-3 font-bold">QARZDORLIK</th>
              <th class="py-3.5 px-4 font-bold text-center">TO'LOV FOIZI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
            <tr
              v-for="row in monthlyTableData"
              :key="row.month"
              class="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition"
            >
              <!-- 1. OY -->
              <td class="py-3 px-4 font-bold text-gray-800 dark:text-gray-100">
                {{ row.monthName }}
              </td>

              <!-- 2. SONI -->
              <td class="py-3 px-3">
                <span class="flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <b>{{ row.count }}</b> ta
                </span>
              </td>

              <!-- 3. SUMMA -->
              <td class="py-3 px-3 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{{ formatNumber(row.sum) }}</span>
                  <span class="text-[10px] font-normal text-gray-400">so'm</span>
                </span>
              </td>

              <!-- 4. CHEGIRMA -->
              <td class="py-3 px-3 text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
                <span v-if="row.discount > 0" class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>{{ formatNumber(row.discount) }}</span>
                  <span class="text-[10px] font-normal text-gray-400">so'm</span>
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>

              <!-- 5. CHEGIRMALI TO'LOV MIQDORI -->
              <td class="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>{{ formatNumber(row.discountedSum) }}</span>
                  <span class="text-[10px] font-normal text-gray-400">so'm</span>
                </span>
              </td>

              <!-- 6. TO'LOV (Yashil) -->
              <td class="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{{ formatNumber(row.payment) }}</span>
                  <span class="text-[10px] font-normal text-gray-400">so'm</span>
                </span>
              </td>

              <!-- 7. QARZDORLIK (Qizil) -->
              <td class="py-3 px-3 text-rose-600 dark:text-rose-400 font-bold whitespace-nowrap">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>{{ formatNumber(row.debt) }}</span>
                  <span class="text-[10px] font-normal text-gray-400">so'm</span>
                </span>
              </td>

              <!-- 8. TO'LOV FOIZI (Progress bar + Foiz) -->
              <td class="py-3 px-4 min-w-[130px]">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all bg-blue-500"
                      :style="{ width: `${row.percentage}%` }"
                    ></div>
                  </div>
                  <span class="text-[11px] font-bold text-gray-700 dark:text-gray-200 w-9 text-right">
                    {{ row.percentage }}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Table Footer (Jami) -->
          <tfoot>
            <tr class="bg-gray-50 dark:bg-gray-700/80 font-bold text-xs border-t-2 border-gray-200 dark:border-gray-700">
              <td class="py-3.5 px-4 text-gray-900 dark:text-white uppercase">
                Jami
              </td>
              <td class="py-3.5 px-3 text-gray-900 dark:text-white">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                  <b>160</b> ta
                </span>
              </td>
              <td class="py-3.5 px-3 text-blue-600 dark:text-blue-400 whitespace-nowrap">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>3 566 226 609,03</span>
                  <span class="text-[10px] font-normal text-gray-400">so'm</span>
                </span>
              </td>
              <td class="py-3.5 px-3 text-amber-600 dark:text-amber-400 whitespace-nowrap">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>37 510 010</span>
                  <span class="text-[10px] font-normal text-gray-400">so'm</span>
                </span>
              </td>
              <td class="py-3.5 px-3 text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>3 528 716 599,03</span>
                  <span class="text-[10px] font-normal text-gray-400">so'm</span>
                </span>
              </td>
              <td class="py-3.5 px-3 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>1 592 559 849,91</span>
                  <span class="text-[10px] font-normal text-gray-400">so'm</span>
                </span>
              </td>
              <td class="py-3.5 px-3 text-rose-600 dark:text-rose-400 whitespace-nowrap">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>1 936 156 749,12</span>
                  <span class="text-[10px] font-normal text-gray-400">so'm</span>
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-blue-600" style="width: 45.13%;"></div>
                  </div>
                  <span class="text-xs font-bold text-gray-900 dark:text-white">45.13%</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import FilterSelect from "@/components/common/FilterSelect.vue";

export default {
  name: "MonthlyContractsStatistics",
  components: {
    FilterSelect,
  },
  data() {
    return {
      selectedYear: "2025-2026",
      academicYears: [
        { label: "2025-2026", value: "2025-2026" },
        { label: "2024-2025", value: "2024-2025" },
        { label: "2023-2024", value: "2023-2024" },
      ],
      monthlyTableData: [
        { monthName: "Sentyabr", count: 98, sum: 276235758, discount: 4780010, discountedSum: 271455748, payment: 186429990, debt: 85025758, percentage: 69 },
        { monthName: "Oktabr", count: 106, sum: 312536816, discount: 4780000, discountedSum: 307756816, payment: 206453913, debt: 101302903, percentage: 67 },
        { monthName: "Noyabr", count: 107, sum: 320000000, discount: 4270000, discountedSum: 315730000, payment: 212040000, debt: 103690000, percentage: 67 },
        { monthName: "Dekabr", count: 109, sum: 324500000, discount: 4590000, discountedSum: 319910000, payment: 215524348, debt: 104385652, percentage: 67 },
        { monthName: "Yanvar", count: 111, sum: 329870968, discount: 3250000, discountedSum: 326620968, payment: 219930968, debt: 106690000, percentage: 67 },
        { monthName: "Fevral", count: 113, sum: 336557143, discount: 3250000, discountedSum: 333307143, payment: 210252730, debt: 123054413, percentage: 63 },
        { monthName: "Mart", count: 127, sum: 374529032, discount: 3970000, discountedSum: 370559032, payment: 132940651, debt: 237618381, percentage: 36 },
        { monthName: "Aprel", count: 147, sum: 426014545, discount: 3760000, discountedSum: 422254545, payment: 96582470, debt: 325672076, percentage: 23 },
        { monthName: "May", count: 154, sum: 460686636, discount: 4860000, discountedSum: 455826636, payment: 84119066, debt: 371707570, percentage: 18 },
        { monthName: "Iyun", count: 42, sum: 132226667, discount: 0, discountedSum: 132226667, payment: 17000000, debt: 115226667, percentage: 13 },
        { monthName: "Iyul", count: 45, sum: 133778261, discount: 0, discountedSum: 133778261, payment: 7285714, debt: 126492547, percentage: 5 },
        { monthName: "Avgust", count: 46, sum: 139290783, discount: 0, discountedSum: 139290783, payment: 4000000, debt: 135290783, percentage: 3 },
      ],
    };
  },
  methods: {
    formatNumber(val) {
      if (!val && val !== 0) return "0";
      return new Intl.NumberFormat("uz-UZ").format(val);
    },
  },
};
</script>
