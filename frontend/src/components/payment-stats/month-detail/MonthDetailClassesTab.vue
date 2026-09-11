<template>
  <div class="space-y-0">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[850px]">
        <thead
          class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b dark:border-gray-700"
        >
          <tr>
            <th class="py-3 px-4 w-12 text-center">#</th>
            <th class="py-3 px-4">Sinf / Guruh</th>
            <th class="py-3 px-4 text-center">O'quvchilar</th>
            <th class="py-3 px-4">Oylik Reja</th>
            <th class="py-3 px-4">Tushum</th>
            <th class="py-3 px-4">Qarzdorlik</th>
            <th class="py-3 px-4 min-w-[170px]">Ijro Ko'rsatkichi</th>
            <th class="py-3 px-4">Mas'ul Ustoz</th>
            <th class="py-3 px-4 text-right">To'lovlar tabeli</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs sm:text-sm">
          <tr
            v-for="(c, idx) in paginatedClasses"
            :key="c.id"
            class="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
          >
            <td class="py-3 px-4 text-center text-gray-400 font-medium">
              {{ (currentPage - 1) * perPage + idx + 1 }}
            </td>
            <td class="py-3 px-4 font-bold text-gray-900 dark:text-white">
              <span>{{ c.name }}</span>
              <span class="block text-[11px] font-normal text-gray-400">{{ c.courseName }}</span>
            </td>
            <td class="py-3 px-4 text-center">
              <span
                class="inline-flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300"
              >
                {{ c.studentsCount }} ta
              </span>
            </td>
            <td class="py-3 px-4 font-bold text-gray-800 dark:text-gray-200">
              {{ formatUZS(c.plan) }}
            </td>
            <td class="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
              {{ formatUZS(c.fact) }}
            </td>
            <td
              class="py-3 px-4 font-bold"
              :class="c.debt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'"
            >
              {{ formatUZS(c.debt) }}
            </td>
            <td class="py-3 px-4">
              <div class="space-y-1">
                <div class="flex justify-between text-xs font-semibold">
                  <span>{{ c.percent }}%</span>
                  <span
                    :class="
                      c.percent >= 80
                        ? 'text-emerald-600'
                        : c.percent >= 50
                          ? 'text-amber-500'
                          : 'text-rose-600'
                    "
                  >
                    {{ c.percent >= 80 ? "A'lo" : c.percent >= 50 ? "Qoniqarli" : "Past" }}
                  </span>
                </div>
                <div class="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="
                      c.percent >= 80
                        ? 'bg-emerald-500'
                        : c.percent >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    "
                    :style="{ width: `${Math.min(100, Math.max(3, c.percent))}%` }"
                  ></div>
                </div>
              </div>
            </td>
            <td class="py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">
              {{ c.teacherName }}
            </td>
            <td class="py-3 px-4 text-right">
              <RouterLink :to="`/school/classes/${c.id}?tab=payments`">
                <AppButton
                  size="sm"
                  variant="outline"
                  icon="solar:document-text-linear"
                  title="Sinf to'lov tabelini ochish"
                >
                  To'lov varaqasi
                </AppButton>
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <AppPagination
      v-model="currentPage"
      :total-items="classes.length"
      :per-page="perPage"
      item-label="sinf / guruh"
    />
  </div>
</template>

<script>
import AppButton from "@/components/common/AppButton.vue";
import AppPagination from "@/components/common/AppPagination.vue";
import { formatUZS } from "@/helper/formatters";

export default {
  name: "MonthDetailClassesTab",
  components: { AppButton, AppPagination },
  props: {
    classes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      currentPage: 1,
      perPage: 10,
    };
  },
  computed: {
    paginatedClasses() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.classes.slice(start, start + this.perPage);
    },
  },
  methods: {
    formatUZS,
  },
};
</script>
