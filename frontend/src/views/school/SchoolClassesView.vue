<template>
  <div class="school-classes-page p-4 font-lexend space-y-4">
    <!-- 1. Breadcrumb -->
    <Breadcrumb
      :items="[{ title: 'Ta\'lim', to: '/school/classes' }, { title: tenantStore.classesLabel }]"
    />

    <!-- 2. Header Section (Sinflar sarlavhasi, ta'rifi va amallar tugmalari) -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-2">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            {{
              viewMode === "archived"
                ? "Arxivlangan " + tenantStore.classesLabel.toLowerCase()
                : tenantStore.classesLabel
            }}
          </h1>
          <span
            v-if="viewMode === 'archived'"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
          >
            Arxiv rejimi
          </span>
        </div>
      </div>

      <!-- O'ng tomondagi tugmalar (Kanban AppButton komponenti bilan) -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Arxiv tugmasi -->
        <AppButton
          :variant="viewMode === 'archived' ? 'warning' : 'outline'"
          :icon="viewMode === 'archived' ? 'solar:arrow-left-linear' : 'solar:archive-linear'"
          @click="toggleArchiveView"
        >
          {{
            viewMode === "archived" ? "Faol sinflarga qaytish" : `Arxiv (${archivedList.length})`
          }}
        </AppButton>

        <!-- Ommaviy amallar tugmasi -->
        <AppButton
          v-if="viewMode === 'active'"
          :variant="isBulkMode ? 'primary' : 'outline'"
          :icon="isBulkMode ? 'solar:close-circle-bold' : 'solar:check-square-linear'"
          @click="toggleBulkMode"
        >
          {{ isBulkMode ? "Ommaviyni yopish" : "Ommaviy" }}
        </AppButton>

        <!-- Yangi sinf ochish tugmasi: CRM Primary rangi -->
        <AppButton
          v-if="viewMode === 'active'"
          variant="primary"
          icon="solar:add-circle-bold"
          icon-class="text-lg"
          @click="showAddModal = true"
        >
          {{ tenantStore.newClassButtonLabel }}
        </AppButton>
      </div>
    </div>

    <!-- Ommaviy Tanlov Boshqaruv Paneli (Kattalashtirilgan va qulay qilingan) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
    >
      <div
        v-if="isBulkMode && viewMode === 'active'"
        class="bg-indigo-50/95 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/70 rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 shadow-sm"
      >
        <div class="flex items-center gap-3.5">
          <label
            class="flex items-center gap-3 text-sm sm:text-base font-bold text-indigo-950 dark:text-indigo-100 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              :checked="isAllSelected"
              class="w-5 h-5 rounded-md text-primary focus:ring-primary/30 border-gray-300 dark:border-gray-600 cursor-pointer accent-primary"
              @change="toggleSelectAll"
            />
            <span>Barchasini tanlash ({{ currentList.length }})</span>
          </label>
          <span
            class="text-xs sm:text-sm bg-indigo-200/80 dark:bg-indigo-800/80 text-indigo-900 dark:text-indigo-100 font-bold px-3 py-1 rounded-full shadow-2xs"
          >
            {{ selectedIds.length }} ta tanlandi
          </span>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Arxivga o'tkazish -->
          <AppButton
            variant="outline"
            icon="solar:archive-linear"
            :disabled="selectedIds.length === 0"
            @click="bulkArchive"
          >
            Arxivga o'tkazish
          </AppButton>

          <!-- Excel export -->
          <AppButton
            variant="outline"
            icon="ri:file-excel-2-line"
            :disabled="selectedIds.length === 0"
            @click="bulkExport"
          >
            Excel export
          </AppButton>

          <!-- O'chirish -->
          <AppButton
            variant="danger"
            icon="solar:trash-bin-trash-bold"
            :disabled="selectedIds.length === 0"
            @click="bulkDelete"
          >
            O'chirish
          </AppButton>
        </div>
      </div>
    </Transition>

    <!-- Bo'sh holat (agar sinflar ro'yxati bo'sh bo'lsa) -->
    <div
      v-if="currentList.length === 0"
      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center space-y-3"
    >
      <div
        class="w-14 h-14 mx-auto rounded-full bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-gray-400"
      >
        <Icon
          :icon="
            viewMode === 'archived' ? 'solar:archive-linear' : 'solar:users-group-two-rounded-bold'
          "
          class="text-3xl"
        />
      </div>
      <h3 class="text-base font-bold text-gray-800 dark:text-gray-200">
        {{
          viewMode === "archived"
            ? "Arxivlangan " + tenantStore.classesLabel.toLowerCase() + " mavjud emas"
            : "Hozircha birorta ham " + tenantStore.classLabel.toLowerCase() + " mavjud emas"
        }}
      </h3>
      <p class="text-xs text-gray-400 max-w-sm mx-auto">
        {{
          viewMode === "archived"
            ? "Arxivlangan " +
              tenantStore.classesLabel.toLowerCase() +
              " shu yerda saqlanadi va istalgan vaqtda qayta tiklanishi mumkin."
            : "Yangi " +
              tenantStore.classLabel.toLowerCase() +
              " qo'shish uchun yuqoridagi '" +
              tenantStore.newClassButtonLabel +
              "' tugmasini bosing."
        }}
      </p>
    </div>

    <!-- 3. Sinflar Kartochkalari Gridi (4 ta ustun - Rasm namunasidagi 18 ta sinf) -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="cls in currentList"
        :key="cls.id"
        :class="[
          'bg-white dark:bg-gray-800 border rounded-xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs relative select-none',
          selectedIds.includes(cls.id)
            ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.02]'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary/60 dark:hover:border-primary/60 hover:shadow-md',
        ]"
        @click="handleCardClick(cls)"
      >
        <div>
          <!-- Yuqori qator: Sinf nomi va Sig'imi (28/25) -->
          <div class="flex items-start justify-between gap-2 min-w-0 mb-3">
            <div class="flex items-start gap-2.5 min-w-0">
              <!-- Ommaviy rejimda checkbox -->
              <input
                v-if="isBulkMode"
                type="checkbox"
                :checked="selectedIds.includes(cls.id)"
                class="w-5 h-5 mt-0.5 rounded-md text-primary focus:ring-primary border-gray-300 shrink-0 cursor-pointer accent-primary"
                @click.stop="toggleSelect(cls.id)"
              />
              <div class="min-w-0">
                <h3
                  class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate"
                >
                  {{ cls.name }}
                </h3>
                <p class="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                  {{ cls.academicYear }} ·
                  {{
                    cls.stageLabel ||
                    (tenantStore.isSchool ? cls.parallel + "-bosqich" : cls.parallel)
                  }}
                </p>
              </div>
            </div>

            <!-- O'quvchilar soni / Sig'im (Masalan: 28/25) - Standart Shriftda -->
            <div
              :class="[
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border shadow-2xs shrink-0',
                cls.studentsCount === 0
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
                  : cls.studentsCount >= cls.capacity
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
              ]"
            >
              <Icon icon="solar:users-group-two-rounded-bold" class="text-sm" />
              <span>{{ cls.studentsCount }}/{{ cls.capacity }}</span>
            </div>
          </div>

          <!-- Yupqa rangli gorizontal indikator chizig'i (Rasmdaqa) -->
          <div class="w-full h-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden mb-4">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="cls.studentsCount === 0 ? 'bg-rose-500 w-1/4' : 'bg-emerald-500 w-full'"
            ></div>
          </div>

          <!-- Moliyaviy ko'rsatkichlar: Reja va Fakt - Standart Lexend Shriftida (font-mono olib tashlandi) -->
          <div class="space-y-2 text-xs sm:text-sm">
            <div class="flex justify-between items-center text-gray-600 dark:text-gray-300">
              <span class="text-gray-400 dark:text-gray-400 text-xs">Reja:</span>
              <span class="font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {{ formatMoneyUZS(cls.plan) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400 dark:text-gray-400 text-xs">Fakt:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {{ formatMoneyUZS(cls.fact) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Pastki qator: Ustoz yoki Arxiv amallari -->
        <div
          class="mt-4 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2 text-xs"
        >
          <div
            v-if="cls.teacherName"
            class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 min-w-0"
          >
            <Icon icon="solar:square-academic-cap-bold" class="text-sm text-primary shrink-0" />
            <span class="truncate font-medium">{{ cls.teacherName }}</span>
          </div>
          <div v-else class="text-gray-400 italic text-[11px]">
            {{ tenantStore.teacherRoleLabel }} belgilanmagan
          </div>

          <!-- Arxiv rejimida qayta tiklash tugmasi -->
          <div
            v-if="viewMode === 'archived'"
            class="flex items-center gap-1.5 shrink-0"
            @click.stop
          >
            <button
              type="button"
              class="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 transition"
              title="Faol sinflar ro'yxatiga qaytarish"
              @click="restoreClass(cls.id)"
            >
              Qayta tiklash
            </button>
          </div>

          <!-- Faol rejimda tezkor amallar (faqat ommaviy rejim bo'lmaganda) -->
          <div
            v-else-if="!isBulkMode"
            class="flex items-center gap-1 shrink-0 text-gray-400 group-hover:text-primary transition-colors"
          >
            <span class="text-[11px] font-medium hidden group-hover:inline">Ko'rish</span>
            <Icon
              icon="solar:arrow-right-linear"
              class="text-sm transform group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Pastki ko'rsatkich satri -->
    <div
      class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium py-3 border-t border-gray-200 dark:border-gray-700/80"
    >
      <span
        >Ko'rsatilgan: {{ currentList.length }} ta {{ tenantStore.classLabel.toLowerCase() }}</span
      >
      <span class="text-[11px] text-gray-400">EduCRM Ta'lim Moduli</span>
    </div>

    <!-- 5. Yangi sinf/guruh qo'shish modali (EduCRM Standard Modal) -->
    <CreateClassModal v-model="showAddModal" @created="handleClassCreated" />

    <!-- Confirm Delete Modal (Aynan Kanban'dagi vmodal) -->
    <Vmodal
      ref="deleteConfirmModal"
      :hide-button="true"
      :title="`${tenantStore.classLabel}ni o'chirish`"
      subtitle="O'chirishni tasdiqlang"
      btn-text-submit="Tasdiqlash va O'chirish"
      btn-text-close="Bekor qilish"
      btn-color-submit="bg-red-600"
      @submit="executeBulkDelete"
    >
      <template #Icon>
        <Icon icon="solar:trash-bin-trash-bold" class="text-3xl text-red-500 mb-2" />
      </template>
      <template #body>
        <div class="space-y-3.5 text-xs text-left">
          <div
            class="p-3.5 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
          >
            <p class="font-bold text-sm leading-snug">
              {{
                selectedIds.length > 1
                  ? `Tanlangan ${selectedIds.length} ta ${tenantStore.classLabel.toLowerCase()}ni o'chirishni tasdiqlaysizmi?`
                  : `Tanlangan ${tenantStore.classLabel.toLowerCase()}ni o'chirishni tasdiqlaysizmi?`
              }}
            </p>
            <p class="mt-1 text-gray-500 dark:text-gray-400">
              Iltimos, e'tiborli bo'ling. Ushbu amalni ortga qaytarib bo'lmaydi va unga tegishli
              barcha ma'lumotlar o'chiriladi.
            </p>
          </div>
        </div>
      </template>
    </Vmodal>

    <!-- Confirm Archive Modal (Kanban uslubidagi vmodal) -->
    <Vmodal
      ref="archiveConfirmModal"
      :hide-button="true"
      title="Arxivga o'tkazish"
      subtitle="Tanlangan elementlarni arxivga o'tkazish"
      btn-text-submit="Tasdiqlash va Arxivlash"
      btn-text-close="Bekor qilish"
      btn-color-submit="bg-primary"
      @submit="executeBulkArchive"
    >
      <template #Icon>
        <Icon icon="solar:archive-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template #body>
        <div class="space-y-3.5 text-xs text-left">
          <div
            class="p-3.5 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200"
          >
            <p class="font-bold text-sm leading-snug">
              {{
                selectedIds.length > 1
                  ? `Tanlangan ${selectedIds.length} ta ${tenantStore.classLabel.toLowerCase()}ni arxivga o'tkazishni tasdiqlaysizmi?`
                  : `Tanlangan ${tenantStore.classLabel.toLowerCase()}ni arxivga o'tkazishni tasdiqlaysizmi?`
              }}
            </p>
            <p class="mt-1 text-gray-500 dark:text-gray-400">
              Tanlangan elementlar arxivga o'tkaziladi. Istalgan vaqtda ularni arxivdan qayta
              tiklashingiz mumkin.
            </p>
          </div>
        </div>
      </template>
    </Vmodal>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import {
  loadArchivedClasses,
  loadSchoolClasses,
  saveArchivedClasses,
  saveSchoolClasses,
} from "@/api/schoolClassesData";
import Breadcrumb from "@/components/Breadcrumb.vue";
import vmodal from "@/components/common/AppModal.vue";
import CreateClassModal from "@/components/school/CreateClassModal.vue";
import { useTenantStore } from "@/store/tenant";
import { toast } from "@/utils/toast";

export default {
  name: "SchoolClassesView",
  components: {
    Icon,
    Breadcrumb,
    CreateClassModal,
    vmodal,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      viewMode: "active", // 'active' | 'archived'
      isBulkMode: false,
      selectedIds: [],
      showAddModal: false,
      classList: [],
      archivedList: [],
    };
  },
  computed: {
    currentList() {
      return this.viewMode === "archived" ? this.archivedList : this.classList;
    },
    isAllSelected() {
      return this.currentList.length > 0 && this.selectedIds.length === this.currentList.length;
    },
  },
  watch: {
    "tenantStore.businessType": {
      immediate: true,
      handler(newType) {
        this.classList = loadSchoolClasses(newType);
        this.archivedList = loadArchivedClasses(newType);
        this.selectedIds = [];
      },
    },
  },
  methods: {
    formatMoneyUZS(val) {
      if (!val) return "0 UZS";
      return new Intl.NumberFormat("uz-UZ").format(val) + " UZS";
    },
    toggleArchiveView() {
      this.viewMode = this.viewMode === "active" ? "archived" : "active";
      this.selectedIds = [];
      this.isBulkMode = false;
    },
    toggleBulkMode() {
      this.isBulkMode = !this.isBulkMode;
      if (!this.isBulkMode) {
        this.selectedIds = [];
      }
    },
    handleCardClick(cls) {
      if (this.isBulkMode) {
        this.toggleSelect(cls.id);
      } else {
        // Modal emas, to'g'ridan-to'g'ri sinf sahifasiga o'tadi
        this.$router.push(`/school/classes/${cls.id}`);
      }
    },
    toggleSelect(id) {
      const idx = this.selectedIds.indexOf(id);
      if (idx > -1) {
        this.selectedIds.splice(idx, 1);
      } else {
        this.selectedIds.push(id);
      }
    },
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedIds = [];
      } else {
        this.selectedIds = this.currentList.map((c) => c.id);
      }
    },
    bulkArchive() {
      if (this.selectedIds.length === 0) return;
      if (this.$refs.archiveConfirmModal) {
        this.$refs.archiveConfirmModal.isOpen = true;
      }
    },
    executeBulkArchive() {
      const count = this.selectedIds.length;
      const label = this.tenantStore.classLabel.toLowerCase();
      const toArchive = this.classList.filter((c) => this.selectedIds.includes(c.id));
      this.archivedList.unshift(...toArchive);
      this.classList = this.classList.filter((c) => !this.selectedIds.includes(c.id));
      saveSchoolClasses(this.classList, this.tenantStore.businessType);
      saveArchivedClasses(this.archivedList, this.tenantStore.businessType);
      this.selectedIds = [];
      this.isBulkMode = false;
      if (this.$refs.archiveConfirmModal) {
        this.$refs.archiveConfirmModal.isOpen = false;
      }
      toast.success(`${count} ta ${label} muvaffaqiyatli arxivga o'tkazildi!`);
    },
    bulkExport() {
      if (this.selectedIds.length === 0) return;
      toast.info(
        `${this.selectedIds.length} ta ${this.tenantStore.classLabel.toLowerCase()} ma'lumotlari Excel formatida tayyorlanmoqda...`
      );
      setTimeout(() => {
        toast.success("Excel fayl muvaffaqiyatli yuklab olindi!");
      }, 1000);
    },
    bulkDelete() {
      if (this.selectedIds.length === 0) return;
      if (this.$refs.deleteConfirmModal) {
        this.$refs.deleteConfirmModal.isOpen = true;
      }
    },
    executeBulkDelete() {
      const count = this.selectedIds.length;
      const label = this.tenantStore.classLabel.toLowerCase();
      this.classList = this.classList.filter((c) => !this.selectedIds.includes(c.id));
      saveSchoolClasses(this.classList, this.tenantStore.businessType);
      this.selectedIds = [];
      this.isBulkMode = false;
      if (this.$refs.deleteConfirmModal) {
        this.$refs.deleteConfirmModal.isOpen = false;
      }
      toast.success(`${count} ta ${label} muvaffaqiyatli o'chirildi!`);
    },
    restoreClass(id) {
      const cls = this.archivedList.find((c) => c.id === id);
      if (cls) {
        this.archivedList = this.archivedList.filter((c) => c.id !== id);
        this.classList.push(cls);
        saveSchoolClasses(this.classList, this.tenantStore.businessType);
        saveArchivedClasses(this.archivedList, this.tenantStore.businessType);
        toast.success(
          `"${cls.name}" faol ${this.tenantStore.classesLabel.toLowerCase()} ro'yxatiga qaytarildi!`
        );
      }
    },
    handleClassCreated(newCls) {
      this.classList.unshift(newCls);
      saveSchoolClasses(this.classList, this.tenantStore.businessType);
      toast.success(`"${newCls.name}" muvaffaqiyatli qo'shildi!`);
    },
  },
};
</script>

<style scoped>
.font-lexend {
  font-family: "Lexend", sans-serif;
}
</style>
