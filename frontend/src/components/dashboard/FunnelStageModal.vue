<template>
  <vmodal
    :model-value="modelValue"
    @update:model-value="close"
    :title="stageInfo?.label || 'Voronka'"
    :subtitle="'Ushbu bosqichdagi o\'quvchilar va ularning joriy holati'"
    icon="solar:filter-bold"
    width="max-w-2xl"
    :hide-button="true"
    body-class="p-0"
  >
    <!-- Body -->
    <template #body>
      <!-- Search & Filters -->
      <div class="px-5 py-2.5 border-b border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800 flex items-center gap-3">
        <div class="relative flex-1">
          <Icon icon="solar:magnifer-linear" class="absolute left-2.5 top-2.5 text-gray-400 text-sm" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Qidirish (F.I.O, telefon, kurs...)"
            class="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded outline-none focus:border-primary text-gray-700 dark:text-gray-200"
          />
        </div>
      </div>

      <!-- Table / List -->
      <div class="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
        <div
          v-if="filteredStudents.length === 0"
          class="py-10 text-center text-gray-400 text-xs"
        >
          O'quvchi topilmadi
        </div>
        <div
          v-for="s in filteredStudents"
          :key="s.id"
          class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
              {{ s.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <div class="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                {{ s.name }}
              </div>
              <div class="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-2 mt-0.5">
                <span>{{ s.phone }}</span>
                <span>•</span>
                <span class="text-primary font-medium">{{ s.course }}</span>
              </div>
            </div>
          </div>
          <div class="text-right shrink-0">
            <span
              class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold"
              :class="s.statusClass"
            >
              {{ s.statusLabel }}
            </span>
            <div class="text-[10px] text-gray-400 mt-0.5">
              {{ s.date }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-end w-full">
        <button
          type="button"
          @click="close"
          class="py-2 px-4 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition cursor-pointer shadow-2xs bg-white dark:bg-gray-800"
        >
          Yopish
        </button>
      </div>
    </template>
  </vmodal>
</template>

<script>
import { Icon } from "@iconify/vue";
import vmodal from "@/components/modal.vue";

export default {
  name: "FunnelStageModal",
  components: {
    Icon,
    vmodal,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    stageInfo: {
      type: Object,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      searchQuery: "",
    };
  },
  computed: {
    students() {
      if (this.stageInfo?.items && Array.isArray(this.stageInfo.items)) {
        return this.stageInfo.items;
      }
      return [];
    },
    filteredStudents() {
      if (!this.searchQuery.trim()) return this.students;
      const q = this.searchQuery.toLowerCase();
      return this.students.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.phone || "").toLowerCase().includes(q) ||
          (s.course || "").toLowerCase().includes(q)
      );
    },
  },
  methods: {
    close() {
      this.$emit("update:modelValue", false);
    },
  },
};
</script>
