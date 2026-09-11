<template>
  <Vmodal
    :model-value="modelValue"
    title="Vidjetni yuklab olish"
    subtitle="Tanlangan vidjetni grafik yoki rasm formatida saqlash"
    icon="solar:download-minimalistic-bold"
    width="max-w-lg"
    :hide-button="true"
    @update:model-value="close"
  >
    <!-- Body -->
    <template #body>
      <div class="space-y-4 text-left">
        <!-- Widget Selection -->
        <div>
          <label
            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2.5"
          >
            Vidjetni tanlang
          </label>
          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <label
              v-for="w in widgets"
              :key="w.id"
              :class="[
                'flex items-center gap-2.5 p-2.5 rounded-lg border transition cursor-pointer text-xs font-medium',
                selectedWidget === w.id
                  ? 'border-primary bg-primary/10 text-primary dark:border-primary dark:bg-primary/20 dark:text-primary'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/40',
              ]"
            >
              <input
                v-model="selectedWidget"
                type="radio"
                name="selected_widget"
                :value="w.id"
                class="accent-primary w-3.5 h-3.5 cursor-pointer"
              />
              <span>{{ w.name }}</span>
            </label>
          </div>
        </div>

        <!-- Format Selection -->
        <div>
          <label
            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2"
          >
            Format
          </label>
          <div class="flex items-center gap-2">
            <button
              v-for="fmt in formats"
              :key="fmt"
              type="button"
              :class="[
                'px-4 py-1.5 rounded text-xs font-semibold transition cursor-pointer uppercase tracking-wider',
                selectedFormat === fmt
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
              ]"
              @click="selectedFormat = fmt"
            >
              {{ fmt }}
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {{ formatHint }}
          </p>
        </div>
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-end gap-2.5 w-full">
        <button
          type="button"
          class="py-2 px-3.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition cursor-pointer shadow-2xs bg-white dark:bg-gray-800"
          @click="close"
        >
          Bekor qilish
        </button>
        <button
          type="button"
          :disabled="downloading"
          class="inline-flex items-center gap-1.5 py-2 px-4 rounded bg-primary hover:bg-primary/90 active:opacity-95 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
          @click="handleDownload"
        >
          <Icon
            v-if="downloading"
            icon="solar:refresh-circle-linear"
            class="animate-spin text-sm"
          />
          <Icon v-else icon="solar:download-minimalistic-bold" class="text-sm" />
          <span>{{ downloading ? "Yuklanmoqda..." : "Yuklab olish" }}</span>
        </button>
      </div>
    </template>
  </Vmodal>
</template>

<script>
import { Icon } from "@iconify/vue";

import vmodal from "@/components/common/AppModal.vue";

export default {
  name: "DownloadWidgetModal",
  components: {
    Icon,
    vmodal,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    targetMonth: {
      type: String,
      default: "Oktabr",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      selectedWidget: "salesFunnel",
      selectedFormat: "PNG",
      downloading: false,
      formats: ["PNG", "PDF", "SVG"],
      widgets: [
        { id: "financialCards", name: "Moliyaviy ko'rsatkich kartalari" },
        { id: "monthlyEvents", name: "Oylik hodisalar (Lidlar, Sinov, To'lov)" },
        { id: "salesFunnel", name: "Sotuv voronkasi (Kaskad & Matritsa)" },
        { id: "classOccupancy", name: "Sinflar va xonalar to'lganligi" },
        { id: "financialCharts", name: "Oylik to'lovlar tahliliy grafigi" },
        { id: "topDebtors", name: "Top qarzdorlar ro'yxati" },
        { id: "recentPayments", name: "So'nggi to'lovlar reestri" },
      ],
    };
  },
  computed: {
    formatHint() {
      if (this.selectedFormat === "PNG")
        return "Yuqori aniqlikdagi tasvir (prezentatsiya va hisobotlar uchun)";
      if (this.selectedFormat === "PDF") return "Chop etish va rasmiy hujjatlar uchun mos format";
      return "Vektorli sifatni yo'qotmaydigan grafik format";
    },
  },
  methods: {
    close() {
      this.$emit("update:modelValue", false);
    },
    async handleDownload() {
      this.downloading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const widgetName = this.widgets.find((w) => w.id === this.selectedWidget)?.name || "Vidjet";
        const filename = `${widgetName}_${this.targetMonth}.${this.selectedFormat.toLowerCase()}`;

        // Simulyatsiya qilingan yuklab olish fayli
        const blob = new Blob([`EduHub CRM - ${widgetName} (${this.targetMonth})`], {
          type: "text/plain",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.close();
      } finally {
        this.downloading = false;
      }
    },
  },
};
</script>
