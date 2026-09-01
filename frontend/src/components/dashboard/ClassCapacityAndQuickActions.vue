<template>
  <div class="class-capacity-and-quick-actions font-lexend space-y-3">
    <!-- Top Row Headers for both columns -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-1">
      <!-- Left Column Header -->
      <div class="lg:col-span-7 flex items-center justify-between">
        <h3 class="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
          {{ isKindergarten ? "GURUHLAR BO'YICHA BOLALAR VA SIG'IM" : "SINFLAR BO'YICHA O'QUVCHILAR SONI & SIG'IMI" }}
        </h3>
        <router-link
          :to="isKindergarten ? '/students' : '/school/classes'"
          class="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer transition"
        >
          <span>{{ isKindergarten ? "Barcha guruhlar" : "Sinflar boshqaruvi" }}</span>
          <Icon icon="solar:arrow-right-linear" />
        </router-link>
      </div>

      <!-- Right Column Header -->
      <div class="lg:col-span-5 flex items-center justify-between">
        <h3 class="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
          TEZKOR AMALLAR
        </h3>
      </div>
    </div>

    <!-- Main 2-Column Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      <!-- Left Column (7/12): Sinflar / Guruhlar Sig'imi (Modern Clean Table Layout) -->
      <div class="lg:col-span-7 card bg-white dark:bg-gray-800 p-5 rounded-2xl border dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <!-- Summary Header Bar -->
          <div class="flex items-center justify-between flex-wrap gap-2 pb-3 mb-3 border-b dark:border-gray-700/60 text-xs">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-xs">
                {{ items.length }} ta {{ isKindergarten ? "guruh" : "sinf" }}
              </span>
              <span class="text-gray-500 dark:text-gray-400">
                Jami sig'im: <b>{{ totalCapacity }}</b> o'rin
              </span>
            </div>
            <div class="flex items-center gap-3 font-semibold">
              <span class="text-emerald-600 dark:text-emerald-400">
                ● Band: <b>{{ totalOccupied }}</b> ({{ occupancyPercentage }}%)
              </span>
              <span class="text-gray-400">
                ● Bo'sh: <b>{{ totalCapacity - totalOccupied }}</b>
              </span>
            </div>
          </div>

          <!-- Elegant Class Capacity Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/80 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px] border-y dark:border-gray-700/60">
                  <th class="py-2.5 px-3">{{ isKindergarten ? "GURUH" : "SINF" }}</th>
                  <th class="py-2.5 px-3">{{ isKindergarten ? "TARBIYACHI" : "RAHBAR" }}</th>
                  <th class="py-2.5 px-3 text-center">{{ isKindergarten ? "BOLALAR" : "O'QUVCHILAR" }}</th>
                  <th class="py-2.5 px-3">SIG'IM VA BANDLIK</th>
                  <th class="py-2.5 px-3 text-right">FOIZ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
                <tr
                  v-for="item in items"
                  :key="item.id"
                  class="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition"
                >
                  <!-- 1. Sinf / Guruh nomi -->
                  <td class="py-2.5 px-3">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                      <span class="font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                        {{ formatItemName(item.name) }}
                      </span>
                    </div>
                  </td>

                  <!-- 2. Rahbar / Tarbiyachi -->
                  <td class="py-2.5 px-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {{ item.teacher }}
                  </td>

                  <!-- 3. Bolalar / O'quvchilar soni & jinsi -->
                  <td class="py-2.5 px-3 text-center whitespace-nowrap">
                    <span class="font-bold text-gray-800 dark:text-gray-100">{{ item.studentsCount }} ta</span>
                    <span class="text-[10px] text-gray-400 block font-normal">
                      {{ item.boys || Math.round(item.studentsCount * 0.52) }} o'g'il, {{ item.girls || Math.round(item.studentsCount * 0.48) }} qiz
                    </span>
                  </td>

                  <!-- 4. Sig'im Progress Bar -->
                  <td class="py-2.5 px-3 min-w-[130px]">
                    <div class="flex items-center justify-between text-[10px] mb-1 font-semibold text-gray-600 dark:text-gray-300">
                      <span>{{ item.studentsCount }}/{{ item.capacity }} o'rin</span>
                      <span :class="item.studentsCount >= item.capacity ? 'text-rose-500' : 'text-emerald-500'">
                        {{ item.studentsCount >= item.capacity ? 'To\'lgan' : `${item.capacity - item.studentsCount} ta bo'sh` }}
                      </span>
                    </div>
                    <div class="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="item.studentsCount >= item.capacity ? 'bg-rose-500' : 'bg-primary'"
                        :style="{ width: `${Math.min(100, Math.round((item.studentsCount / item.capacity) * 100))}%` }"
                      ></div>
                    </div>
                  </td>

                  <!-- 5. To'lganlik Foizi -->
                  <td class="py-2.5 px-3 text-right whitespace-nowrap">
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      :class="item.studentsCount >= item.capacity ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'"
                    >
                      {{ Math.round((item.studentsCount / item.capacity) * 100) }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Clean Footer Link -->
        <div class="pt-3 mt-2 border-t dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
          <span>{{ isKindergarten ? "Sig'im va bolalar balansi" : "Sig'im va o'quvchilar balansi" }}</span>
          <router-link :to="isKindergarten ? '/students' : '/school/classes'" class="text-primary font-bold hover:underline flex items-center gap-1">
            <span>{{ isKindergarten ? "Barcha guruhlar" : "Barcha sinflar" }}</span>
            <Icon icon="solar:arrow-right-linear" />
          </router-link>
        </div>
      </div>

      <!-- Right Column (5/12): Tezkor Amallar -->
      <div class="lg:col-span-5 card bg-white dark:bg-gray-800 p-5 rounded-2xl border dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <!-- Subtitle Header -->
          <div class="pb-3 mb-3 border-b dark:border-gray-700/60 flex items-center justify-between text-xs">
            <span class="text-gray-500 dark:text-gray-400">Tezkor amallar vositalari</span>
            <span class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Faol</span>
            </span>
          </div>

          <!-- 6 Action Tiles (Clean 2-Column Grid) -->
          <div class="grid grid-cols-2 gap-3">
            <!-- 1. Yangi o'quvchi -->
            <button
              type="button"
              @click="$emit('add-student')"
              class="p-3 rounded-xl border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 hover:bg-white dark:hover:bg-gray-700 hover:border-primary/40 hover:shadow-xs transition text-left flex items-center gap-3 cursor-pointer group"
            >
              <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                <Icon icon="solar:user-plus-bold" />
              </div>
              <div class="min-w-0">
                <h4 class="font-bold text-xs text-gray-800 dark:text-gray-100 group-hover:text-primary transition truncate">
                  {{ isKindergarten ? "Yangi bola" : "Yangi o'quvchi" }}
                </h4>
                <p class="text-[11px] text-gray-400 truncate">Qabul qilish</p>
              </div>
            </button>

            <!-- 2. Yangi xodim -->
            <router-link
              to="/employees"
              class="p-3 rounded-xl border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 hover:bg-white dark:hover:bg-gray-700 hover:border-primary/40 hover:shadow-xs transition text-left flex items-center gap-3 cursor-pointer group"
            >
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                <Icon icon="solar:user-check-bold" />
              </div>
              <div class="min-w-0">
                <h4 class="font-bold text-xs text-gray-800 dark:text-gray-100 group-hover:text-primary transition truncate">
                  Yangi xodim
                </h4>
                <p class="text-[11px] text-gray-400 truncate">Ishga olish</p>
              </div>
            </router-link>

            <!-- 3. Shartnoma -->
            <router-link
              to="/contracts"
              class="p-3 rounded-xl border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 hover:bg-white dark:hover:bg-gray-700 hover:border-primary/40 hover:shadow-xs transition text-left flex items-center gap-3 cursor-pointer group"
            >
              <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                <Icon icon="solar:document-add-bold" />
              </div>
              <div class="min-w-0">
                <h4 class="font-bold text-xs text-gray-800 dark:text-gray-100 group-hover:text-primary transition truncate">
                  Shartnoma tuzish
                </h4>
                <p class="text-[11px] text-gray-400 truncate">Yangi shartnoma</p>
              </div>
            </router-link>

            <!-- 4. Tushum -->
            <router-link
              to="/finance"
              class="p-3 rounded-xl border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 hover:bg-white dark:hover:bg-gray-700 hover:border-primary/40 hover:shadow-xs transition text-left flex items-center gap-3 cursor-pointer group"
            >
              <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                <Icon icon="solar:wallet-money-bold" />
              </div>
              <div class="min-w-0">
                <h4 class="font-bold text-xs text-gray-800 dark:text-gray-100 group-hover:text-primary transition truncate">
                  Tushum
                </h4>
                <p class="text-[11px] text-gray-400 truncate">Tushumni kiritish</p>
              </div>
            </router-link>

            <!-- 5. Davomat -->
            <router-link
              to="/attendance"
              class="p-3 rounded-xl border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 hover:bg-white dark:hover:bg-gray-700 hover:border-primary/40 hover:shadow-xs transition text-left flex items-center gap-3 cursor-pointer group"
            >
              <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                <Icon icon="solar:calendar-mark-bold" />
              </div>
              <div class="min-w-0">
                <h4 class="font-bold text-xs text-gray-800 dark:text-gray-100 group-hover:text-primary transition truncate">
                  Davomat
                </h4>
                <p class="text-[11px] text-gray-400 truncate">Davomatni sozlash</p>
              </div>
            </router-link>

            <!-- 6. SMS Xabarnoma -->
            <router-link
              to="/sms"
              class="p-3 rounded-xl border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 hover:bg-white dark:hover:bg-gray-700 hover:border-primary/40 hover:shadow-xs transition text-left flex items-center gap-3 cursor-pointer group"
            >
              <div class="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                <Icon icon="solar:chat-round-dots-bold" />
              </div>
              <div class="min-w-0">
                <h4 class="font-bold text-xs text-gray-800 dark:text-gray-100 group-hover:text-primary transition truncate">
                  SMS Xabarnoma
                </h4>
                <p class="text-[11px] text-gray-400 truncate">Xabar yuborish</p>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Clean Footer Button -->
        <div class="pt-3 mt-2 border-t dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
          <span>O'quvchini ro'yxatga olish</span>
          <button
            type="button"
            @click="$emit('add-student')"
            class="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>+ Yangi o'quvchi</span>
            <Icon icon="solar:arrow-right-linear" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "ClassCapacityAndQuickActions",
  components: {
    Icon,
  },
  props: {
    isKindergarten: {
      type: Boolean,
      default: false,
    },
    classList: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    items() {
      if (this.classList && this.classList.length > 0) {
        return this.classList;
      }
      if (this.isKindergarten) {
        return [
          { id: 1, name: "Kichkintoylar", teacher: "Zulayho Karimova", capacity: 20, studentsCount: 18, boys: 10, girls: 8 },
          { id: 2, name: "Mittivoylar", teacher: "Nigora Aliyeva", capacity: 25, studentsCount: 24, boys: 12, girls: 12 },
          { id: 3, name: "Bilimdonlar", teacher: "Shahnoza Yusupova", capacity: 25, studentsCount: 25, boys: 13, girls: 12 },
          { id: 4, name: "Alpomishlar", teacher: "Feruza Rasulova", capacity: 25, studentsCount: 25, boys: 14, girls: 11 },
        ];
      }
      return [
        { id: 1, name: "1-A", teacher: "Matluba Rahimova", capacity: 20, studentsCount: 15, boys: 8, girls: 7 },
        { id: 2, name: "2-A", teacher: "Gulbahor Saidova", capacity: 20, studentsCount: 15, boys: 9, girls: 6 },
        { id: 3, name: "3-B", teacher: "Dilshod Ergashev", capacity: 20, studentsCount: 14, boys: 7, girls: 7 },
        { id: 4, name: "5-A", teacher: "Nilufar Azimova", capacity: 20, studentsCount: 16, boys: 8, girls: 8 },
      ];
    },
    totalCapacity() {
      return this.items.reduce((sum, item) => sum + (item.capacity || 0), 0);
    },
    totalOccupied() {
      return this.items.reduce((sum, item) => sum + (item.studentsCount || 0), 0);
    },
    occupancyPercentage() {
      if (!this.totalCapacity) return 0;
      return Math.round((this.totalOccupied / this.totalCapacity) * 100);
    },
  },
  methods: {
    formatItemName(name) {
      if (!name) return "";
      if (this.isKindergarten) {
        return name.toLowerCase().includes("guruh") ? name : `${name} guruhi`;
      }
      return name.includes("-") || name.toLowerCase().includes("sinf") ? name : `${name}-sinf`;
    },
  },
};
</script>
