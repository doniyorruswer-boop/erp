<template>
  <Vmodal
    :model-value="modelValue"
    title="Dashboard vidjetlarini sozlash"
    icon="solar:settings-bold"
    width="max-w-2xl"
    :hide-button="true"
    @update:model-value="close"
  >
    <!-- Body -->
    <template #body>
      <div class="space-y-4 font-lexend">
        <!-- Biznes turi bo'yicha tezkor shablonlar (Tugmalar shaklida, subtitlersiz) -->
        <div
          class="p-3 rounded-md bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
            >
              <Icon icon="solar:magic-stick-3-bold" class="text-primary text-sm" />
              <span>Biznes turi shablonlari</span>
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="preset in presets"
              :key="preset.key"
              type="button"
              :class="[
                'min-h-[44px] py-1.5 px-2 rounded-md border text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs text-center',
                activePresetKey === preset.key
                  ? 'border-primary bg-primary text-white shadow-xs'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200',
              ]"
              @click="applyPreset(preset.key)"
            >
              <Icon :icon="preset.icon" class="text-base shrink-0" />
              <span class="leading-tight text-center">{{ preset.label }}</span>
            </button>
          </div>
        </div>

        <!-- Tezkor amallar (Barchasini yoqish / o'chirish) -->
        <div class="flex items-center justify-between px-1 text-sm">
          <div class="text-gray-500 dark:text-gray-400">
            Yoqilgan vidjetlar:
            <span class="font-bold text-primary">{{ enabledCount }}</span> / {{ totalWidgetsCount }}
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="text-sm font-medium text-primary hover:underline cursor-pointer"
              @click="toggleAll(true)"
            >
              Barchasini yoqish
            </button>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <button
              type="button"
              class="text-sm font-medium text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400 hover:underline cursor-pointer"
              @click="toggleAll(false)"
            >
              Barchasini o'chirish
            </button>
          </div>
        </div>

        <!-- Kategoriyalangan Vidjetlar Ro'yxati -->
        <div class="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
          <div v-for="group in categorizedWidgets" :key="group.title" class="space-y-1.5">
            <!-- Category Title Header -->
            <div
              class="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2 border-t border-gray-100 dark:border-gray-700/60 first:border-0 first:pt-0"
            >
              <Icon :icon="group.icon" class="text-primary text-sm" />
              <span>{{ group.title }}</span>
            </div>

            <!-- Widget Items in Group (rounded-md) -->
            <div
              class="divide-y divide-gray-100 dark:divide-gray-700/50 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
            >
              <div
                v-for="w in group.items"
                :key="w.key"
                class="py-2.5 px-3 flex items-center justify-between gap-3 hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition cursor-pointer select-none"
                @click="toggleWidget(w.key)"
              >
                <!-- Info & Badges (Pastdagi subtitle olib tashlandi) -->
                <div class="min-w-0 pr-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {{ w.label }}
                    </span>
                    <span
                      v-for="b in w.badges"
                      :key="b"
                      class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {{ b }}
                    </span>
                  </div>
                </div>

                <!-- Toggle Switch (Standard: h-6 w-11) -->
                <div class="flex items-center shrink-0" @click.stop>
                  <input
                    :id="`check-${w.key}`"
                    type="checkbox"
                    :checked="!!localSettings[w.key]"
                    class="sr-only"
                    @change="toggleWidget(w.key)"
                  />
                  <button
                    type="button"
                    :class="localSettings[w.key] ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none shadow-xs"
                    :aria-pressed="!!localSettings[w.key]"
                    :title="
                      localSettings[w.key] ? 'O\'chirish uchun bosing' : 'Yoqish uchun bosing'
                    "
                    @click="toggleWidget(w.key)"
                  >
                    <span
                      :class="localSettings[w.key] ? 'translate-x-6' : 'translate-x-1'"
                      class="pointer-events-none flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out"
                    >
                      <Icon
                        v-if="localSettings[w.key]"
                        icon="solar:check-bold"
                        class="text-[10px] text-primary font-bold"
                      />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Footer: Standart o'lchamdagi tugmalar (py-2 px-4 text-sm font-medium rounded-md) -->
    <template #footer>
      <div class="flex items-center justify-between gap-3 w-full font-lexend">
        <button
          type="button"
          class="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary underline font-medium cursor-pointer"
          @click="resetDefaults"
        >
          Asliga qaytarish
        </button>
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="py-2 px-4 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium transition cursor-pointer shadow-2xs bg-white dark:bg-gray-800"
            @click="close"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            class="py-2 px-4 rounded-md bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-xs transition cursor-pointer flex items-center gap-1.5"
            @click="saveSettings"
          >
            <Icon icon="solar:check-circle-bold" class="text-base" />
            <span>Saqlash</span>
          </button>
        </div>
      </div>
    </template>
  </Vmodal>
</template>

<script>
import { Icon } from "@iconify/vue";

import vmodal from "@/components/common/AppModal.vue";

export default {
  name: "WidgetSettingsModal",
  components: {
    Icon,
    vmodal,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    settings: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue", "save"],
  data() {
    return {
      activePresetKey: localStorage.getItem("eduhub_widget_active_preset") || "course_center",
      localSettings: { ...this.defaultSettingsState(), ...this.settings },
      presets: [
        {
          key: "course_center",
          label: "O'quv markazi",
          icon: "solar:book-bookmark-bold",
          activeKeys: [
            "financialCards",
            "salesFunnel",
            "monthlyEvents",
            "classOccupancy",
            "financialCharts",
            "paymentMethods",
            "topDebtors",
            "recentPayments",
            "topTeachers",
          ],
        },
        {
          key: "school",
          label: "Xususiy maktab",
          icon: "solar:city-bold",
          activeKeys: [
            "financialCards",
            "attendance",
            "todaySchedule",
            "classOccupancy",
            "financialCharts",
            "topTeachers",
            "topDebtors",
            "recentPayments",
            "expenseCategories",
          ],
        },
        {
          key: "kindergarten",
          label: "Xususiy bog'cha",
          icon: "solar:smile-circle-bold",
          activeKeys: [
            "financialCards",
            "attendance",
            "classOccupancy",
            "monthlyEvents",
            "financialCharts",
            "expenseCategories",
            "topDebtors",
            "recentPayments",
          ],
        },
        {
          key: "universal",
          label: "Universal / Servis",
          icon: "solar:case-round-bold",
          activeKeys: [
            "financialCards",
            "salesFunnel",
            "financialCharts",
            "paymentMethods",
            "expenseCategories",
            "topDebtors",
            "recentPayments",
          ],
        },
      ],
      categorizedWidgets: [
        {
          title: "Moliya & Kassa",
          icon: "solar:wallet-money-bold",
          items: [
            {
              key: "financialCards",
              label: "Moliyaviy KPI kartochkalar",
              desc: "Oylik reja, yig'ilgan summa, qarzdorlar soni va umumiy qarz",
              badges: ["Universal", "Moliya"],
            },
            {
              key: "financialCharts",
              label: "Oylik to'lovlar grafigi",
              desc: "12 oy bo'yicha kutilayotgan reja va haqiqiy tushumlar grafigi",
              badges: ["Universal", "Grafik"],
            },
            {
              key: "paymentMethods",
              label: "To'lov usullari taqsimoti",
              desc: "Naqd pul, karta (terminal), Payme, Click va bank o'tkazmalari ulushi",
              badges: ["Moliya", "Kassa"],
            },
            {
              key: "expenseCategories",
              label: "Xarajatlar tahlili",
              desc: "Oylik maoshlar, ijara, marketing va xo'jalik xarajatlari sarfi",
              badges: ["Maktab", "Bog'cha", "Moliya"],
            },
            {
              key: "topDebtors",
              label: "Top-5 qarzdorlik",
              desc: "Eng yuqori qarzdor o'quvchilar va mijozlar ro'yxati",
              badges: ["Universal", "Qarz"],
            },
            {
              key: "recentPayments",
              label: "So'nggi 10 ta to'lov",
              desc: "Qabul qilingan oxirgi to'lovlar kvitansiyalari ro'yxati",
              badges: ["Universal", "Kassa"],
            },
          ],
        },
        {
          title: "Mijozlar & CRM",
          icon: "solar:tuning-square-2-bold",
          items: [
            {
              key: "salesFunnel",
              label: "Sotuv voronkasi (CRM)",
              desc: "Murojaatlardan to'lovgacha bo'lgan konversiya zanjiri va bosqichlar",
              badges: ["O'quv markazi", "Servis", "CRM"],
            },
            {
              key: "monthlyEvents",
              label: "Oylik operatsion hodisalar",
              desc: "Yangi lidlar, sinov darslari, shartnomalar, to'lovlar va faol o'quvchilar",
              badges: ["O'quv markazi", "Bog'cha"],
            },
          ],
        },
        {
          title: "Akademik & Ta'lim",
          icon: "solar:school-bold",
          items: [
            {
              key: "attendance",
              label: "Kunlik davomat tahlili",
              desc: "Bugungi davomat foizi, kelgan, kechikkan va kelmaganlar hisob-kitobi",
              badges: ["Maktab", "Bog'cha", "Muhim"],
            },
            {
              key: "classOccupancy",
              label: "Sinflar / Xonalar to'lganligi",
              desc: "Guruhlar va auditoriyalar sig'imi hamda bo'sh o'rinlar ko'rsatkichi",
              badges: ["Maktab", "Bog'cha", "O'quv markazi"],
            },
            {
              key: "todaySchedule",
              label: "Bugungi dars jadvali",
              desc: "Bugungi auditoriyalar, sinflar va o'qituvchilar bo'yicha darslar jadvali",
              badges: ["Maktab", "O'quv markazi"],
            },
            {
              key: "topTeachers",
              label: "O'qituvchilar / Tarbiyachilar yuklamasi",
              desc: "O'qituvchilar va tarbiyachilar faolligi, guruhlari va o'quvchilari soni",
              badges: ["Maktab", "O'quv markazi", "Bog'cha"],
            },
          ],
        },
      ],
    };
  },
  computed: {
    allWidgetKeys() {
      const keys = [];
      this.categorizedWidgets.forEach((g) => {
        g.items.forEach((item) => keys.push(item.key));
      });
      return keys;
    },
    totalWidgetsCount() {
      return this.allWidgetKeys.length;
    },
    enabledCount() {
      return this.allWidgetKeys.filter((k) => !!this.localSettings[k]).length;
    },
  },
  watch: {
    modelValue(isOpen) {
      if (isOpen) {
        this.reloadFromPropsOrStorage();
      }
    },
    settings: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.localSettings = { ...this.defaultSettingsState(), ...newVal };
        }
      },
    },
  },
  methods: {
    defaultSettingsState() {
      return {
        financialCards: true,
        monthlyEvents: true,
        salesFunnel: true,
        classOccupancy: true,
        financialCharts: true,
        topDebtors: true,
        recentPayments: true,
        attendance: true,
        todaySchedule: false,
        paymentMethods: true,
        expenseCategories: false,
        topTeachers: true,
      };
    },
    reloadFromPropsOrStorage() {
      let current = { ...this.defaultSettingsState(), ...this.settings };
      try {
        const saved = localStorage.getItem("eduhub_widget_settings");
        if (saved) {
          current = { ...current, ...JSON.parse(saved) };
        }
        const savedPreset = localStorage.getItem("eduhub_widget_active_preset");
        if (savedPreset) {
          this.activePresetKey = savedPreset;
        } else if (!this.activePresetKey) {
          this.activePresetKey = "course_center";
        }
      } catch (e) {
        console.warn("Could not reload widget settings", e);
      }
      this.localSettings = current;
    },
    toggleWidget(key) {
      // Faqat modal ichida o'zgaradi, tanlangan biznes turi active holatda saqlanib qoladi
      this.localSettings = {
        ...this.localSettings,
        [key]: !this.localSettings[key],
      };
    },
    applyPreset(presetKey) {
      this.activePresetKey = presetKey;
      const found = this.presets.find((p) => p.key === presetKey);
      if (found) {
        const nextSettings = {};
        this.allWidgetKeys.forEach((key) => {
          nextSettings[key] = found.activeKeys.includes(key);
        });
        this.localSettings = nextSettings;
      }
    },
    toggleAll(enabled) {
      const nextSettings = {};
      this.allWidgetKeys.forEach((key) => {
        nextSettings[key] = enabled;
      });
      this.localSettings = nextSettings;
    },
    resetDefaults() {
      this.activePresetKey = "course_center";
      this.applyPreset("course_center");
    },
    close() {
      // Bekor qilish: o'zgarishlar saqlanmasdan yopiladi va asl holiga qaytariladi
      this.reloadFromPropsOrStorage();
      this.$emit("update:modelValue", false);
    },
    saveSettings() {
      // FAQAT Saqlash tugmasi bosilganda saqlanadi
      const finalSettings = { ...this.localSettings };
      try {
        localStorage.setItem("eduhub_widget_settings", JSON.stringify(finalSettings));
        if (this.activePresetKey) {
          localStorage.setItem("eduhub_widget_active_preset", this.activePresetKey);
        }
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }
      this.$emit("save", finalSettings);
      this.$emit("update:modelValue", false);
    },
  },
};
</script>
