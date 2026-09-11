<template>
  <div class="school-dropped-page p-4 font-lexend space-y-5">
    <!-- 1. Breadcrumb Navigatsiyasi -->
    <Breadcrumb
      :items="[{ title: 'Ta\'lim', to: '/school/classes' }, { title: 'Chetlatilganlar' }]"
    />

    <!-- 2. Header Section (Sarlavha va amallar) -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Chetlatilganlar
        </h1>
      </div>

      <!-- O'ng tomondagi amallar -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <AppButton variant="outline" icon="ri:file-excel-2-line" @click="exportToExcel">
          Export Excel
        </AppButton>

        <AppButton variant="primary" icon="solar:user-minus-bold" @click="openExcludeModal">
          O'quvchini chetlatish
        </AppButton>
      </div>
    </div>

    <!-- 3. Sana filtri paneli (Standart chiplar va AppDateRangePicker) -->
    <div
      class="bg-white dark:bg-gray-800 p-3 sm:p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between flex-wrap gap-3"
    >
      <!-- Chap tomondagi tezkor sana chiplari (Segmented pill andozasi) -->
      <div class="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
        <span class="text-gray-500 dark:text-gray-400 font-semibold mr-1">Chetlatilgan:</span>
        <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700/60 p-1">
          <button
            v-for="chip in dateChips"
            :key="chip.id"
            type="button"
            :class="[
              'px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer select-none',
              activeDateChip === chip.id
                ? 'bg-white dark:bg-gray-800 text-primary shadow-2xs font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
            ]"
            @click="setDateChip(chip.id)"
          >
            {{ chip.label }}
          </button>
        </div>
      </div>

      <!-- O'ng tomondagi Dashboard DateRange Picker komponenti -->
      <AppDateRangePicker
        :start-date="dateFrom"
        :end-date="dateTo"
        align="right"
        @update:start-date="
          (val) => {
            dateFrom = val;
            onCustomDateChange();
          }
        "
        @update:end-date="
          (val) => {
            dateTo = val;
            onCustomDateChange();
          }
        "
        @change="handleDateRangePickerChange"
      />
    </div>

    <!-- 4. Qidiruv va Filtrlar paneli -->
    <div
      class="bg-white dark:bg-gray-800 p-3 sm:p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between flex-wrap gap-3"
    >
      <div class="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
        <!-- Qidiruv inputi -->
        <div class="relative w-full sm:w-72">
          <Icon
            icon="solar:magnifer-linear"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="F.I.SH bo'yicha qidirish..."
            class="w-full pl-9 pr-3.5 h-9 sm:h-9.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-2xs"
          />
        </div>

        <!-- Sinf/Guruh dropdown -->
        <AppFilterDropdown
          v-model="selectedClass"
          :options="classFilterOptions"
          label="Sinf"
          all-label="Barcha sinflar"
          all-value="ALL"
          icon="solar:users-group-rounded-bold"
          min-width="min-w-[190px]"
        />

        <!-- Tozalash tugmasi -->
        <button
          v-if="isFiltered"
          type="button"
          class="h-9 sm:h-9.5 px-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5 transition cursor-pointer"
          title="Filtrlarni tozalash"
          @click="resetAllFilters"
        >
          <Icon icon="solar:restart-linear" class="text-sm" />
          <span>Tozalash</span>
        </button>
      </div>
    </div>

    <!-- 5. Yagona Universal AppTable Komponenti -->
    <AppTable
      v-model="selectedStudentIds"
      :columns="tableColumns"
      :data="filteredStudents"
      :selectable="true"
      :show-index="true"
      index-label="№"
      :per-page="perPage"
      item-label="o'quvchi"
      empty-text="Chetlatilgan o'quvchilar topilmadi"
      empty-description="Qidiruv yoki sana parametrlarini o'zgartiring yoki filtrlarni tozalang."
    >
      <!-- Ommaviy amallar sloti -->
      <template #bulkActions>
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg border border-primary/30 bg-white dark:bg-gray-800 text-primary text-xs font-semibold hover:bg-primary hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          @click="openBulkRestoreModal"
        >
          <Icon icon="solar:restart-circle-bold" class="text-sm" />
          <span>Ommaviy qayta tiklash</span>
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg border border-rose-300 bg-white dark:bg-gray-800 text-rose-600 text-xs font-semibold hover:bg-rose-600 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          @click="openBulkDeleteModal"
        >
          <Icon icon="solar:trash-bin-2-linear" class="text-sm" />
          <span>O'chirish</span>
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          @click="exportSelectedToExcel"
        >
          <Icon icon="ri:file-excel-2-line" class="text-sm" />
          <span>Export Excel</span>
        </button>
      </template>

      <!-- F.I.SH ustuni (Universal AppUserCell - 1-rasm standarti) -->
      <template #cell(fullName)="{ row }">
        <AppUserCell :name="row.fullName" :image="row.avatar" @click="openDetail(row)" />
      </template>

      <!-- Sinf ustuni (Universal AppGroupBadge) -->
      <template #cell(className)="{ row }">
        <AppGroupBadge :name="row.className" />
      </template>

      <!-- Telefon ustuni (Universal AppPhoneCell) -->
      <template #cell(phone)="{ row }">
        <AppPhoneCell :phone="row.phone" />
      </template>

      <!-- Chetlatilgan sana ustuni (Universal AppDateCell) -->
      <template #cell(droppedDate)="{ row }">
        <AppDateCell :date="row.droppedDate" />
      </template>

      <!-- Sababi ustuni -->
      <template #cell(reason)="{ row }">
        <div class="text-xs text-gray-700 dark:text-gray-200 max-w-md leading-relaxed">
          {{ row.reason }}
        </div>
      </template>

      <!-- Amallar ustuni -->
      <template #actions="{ row }">
        <div class="inline-flex items-center justify-end gap-2">
          <!-- Tiklash (Primary rangda) -->
          <button
            type="button"
            class="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 active:bg-primary text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer select-none"
            title="O'quvchilar safiga qayta tiklash"
            @click="initiateRestore(row)"
          >
            <Icon icon="solar:restart-circle-bold" class="text-sm" />
            <span>Qayta tiklash</span>
          </button>

          <!-- O'chirish (Qizil rangda) -->
          <button
            type="button"
            class="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer select-none"
            title="Butunlay o'chirish"
            @click="initiateDelete(row)"
          >
            <Icon icon="solar:trash-bin-trash-bold" class="text-sm" />
            <span>O'chirish</span>
          </button>
        </div>
      </template>
    </AppTable>

    <!-- 6. Modallar -->

    <!-- Qayta tiklash modali (vmodal) -->
    <Vmodal
      ref="restoreModalRef"
      :hide-button="true"
      title="O'quvchini qayta tiklash"
      subtitle="O'quvchini faol holatga va sinf safiga qaytarish"
      btn-text-submit="Qayta tiklash"
      btn-text-close="Bekor qilish"
      btn-color-submit="bg-primary hover:bg-primary/90 text-white"
      @submit="confirmRestore"
    >
      <template #Icon>
        <Icon icon="solar:restart-circle-bold" class="text-3xl text-primary mb-2" />
      </template>

      <template #body>
        <div v-if="selectedStudentToRestore" class="space-y-4 text-left text-xs font-lexend">
          <div
            class="p-3.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl space-y-1"
          >
            <div class="font-bold text-sm text-gray-900 dark:text-white">
              {{ selectedStudentToRestore.fullName }}
            </div>
            <div class="text-gray-600 dark:text-gray-300">
              Telefon: {{ selectedStudentToRestore.phone }}
            </div>
            <div class="text-gray-500 dark:text-gray-400 text-[11px]">
              Chetlatilgan sana: {{ formatDate(selectedStudentToRestore.droppedDate) }}
            </div>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Qaysi {{ tenantStore.classLabel.toLowerCase() }}ga tiklansin?
            </label>
            <select
              v-model="targetRestoreClass"
              class="w-full h-9 sm:h-9.5 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            >
              <option v-for="cls in availableClasses" :key="cls" :value="cls">
                {{ cls }}
              </option>
            </select>
          </div>

          <p class="text-gray-500 dark:text-gray-400 text-[11px] leading-relaxed">
            Tasdiqlangach, o'quvchi chetlatilganlar ro'yxatidan chiqariladi va faol o'quvchilar
            ro'yxatida ko'rina boshlaydi.
          </p>
        </div>
      </template>
    </Vmodal>

    <!-- Ommaviy qayta tiklash modali -->
    <Vmodal
      ref="bulkRestoreModalRef"
      :hide-button="true"
      title="Ommaviy qayta tiklash"
      subtitle="Tanlangan o'quvchilarni faol saflarga qaytarish"
      btn-text-submit="Barchasini tiklash"
      btn-text-close="Bekor qilish"
      btn-color-submit="bg-primary hover:bg-primary/90 text-white"
      @submit="confirmBulkRestore"
    >
      <template #Icon>
        <Icon icon="solar:restart-circle-bold" class="text-3xl text-primary mb-2" />
      </template>

      <template #body>
        <div class="space-y-3 text-left text-xs font-lexend">
          <p class="text-gray-700 dark:text-gray-200">
            Haqiqatan ham tanlangan <b>{{ selectedStudentIds.length }}</b> ta o'quvchini faol
            saflarga qaytarmoqchimisiz?
          </p>
          <p class="text-[11px] text-gray-400">
            Har bir o'quvchi avvalgi sinfiga tiklanadi va holati «Faol»ga o'zgartiriladi.
          </p>
        </div>
      </template>
    </Vmodal>

    <!-- Yakkama-yakka o'chirish tasdiq modali (AppConfirmModal) -->
    <AppConfirmModal
      ref="deleteConfirmModalRef"
      title="O'quvchini butunlay o'chirish"
      :message="
        selectedStudentToDelete
          ? selectedStudentToDelete.fullName + ' ni tizimdan butunlay o\'chirmoqchimisiz?'
          : ''
      "
      description="Ushbu amalni ortga qaytarib bo'lmaydi. O'quvchining barcha yozuvlari bazadan to'liq o'chiriladi."
      confirm-text="Ha, o'chirilsin"
      cancel-text="Bekor qilish"
      variant="danger"
      @confirm="confirmDelete"
    />

    <!-- Ommaviy o'chirish tasdiq modali (AppConfirmModal) -->
    <AppConfirmModal
      ref="bulkDeleteConfirmModalRef"
      title="Tanlangan o'quvchilarni o'chirish"
      :message="
        'Tanlangan ' +
        selectedStudentIds.length +
        ' ta o\'quvchini butunlay o\'chirib tashlamoqchimisiz?'
      "
      description="Bu amal tanlangan barcha o'quvchilar yozuvlarini bazadan o'chiradi va uni ortga qaytarib bo'lmaydi."
      confirm-text="Ha, barchasi o'chirilsin"
      cancel-text="Bekor qilish"
      variant="danger"
      @confirm="confirmBulkDelete"
    />

    <!-- Qo'lda o'quvchini chetlatish modali -->
    <Vmodal
      ref="excludeModalRef"
      :hide-button="true"
      title="O'quvchini chetlatish"
      subtitle="Faol o'quvchini chetlatilganlar ro'yxatiga o'tkazish"
      btn-text-submit="Chetlatish"
      btn-text-close="Bekor qilish"
      btn-color-submit="bg-red-600 hover:bg-red-700 text-white"
      @submit="submitExclude"
    >
      <template #Icon>
        <Icon icon="solar:user-minus-bold" class="text-3xl text-rose-600 mb-2" />
      </template>

      <template #body>
        <div class="space-y-3.5 text-left text-xs font-lexend">
          <div>
            <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              O'quvchini tanlang <span class="text-red-500">*</span>
            </label>
            <select
              v-model="excludeForm.studentId"
              class="w-full h-9 sm:h-9.5 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              @change="onActiveStudentSelect"
            >
              <option value="" disabled>O'quvchini tanlang...</option>
              <option v-for="st in activeStudentsOptions" :key="st.id" :value="st.id">
                {{ st.fullName }} ({{ st.className }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {{ tenantStore.classLabel }}
              </label>
              <input
                v-model="excludeForm.className"
                type="text"
                disabled
                class="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs outline-none"
              />
            </div>

            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Chetlatilgan sana <span class="text-red-500">*</span>
              </label>
              <input
                v-model="excludeForm.droppedDate"
                type="date"
                class="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Chetlatish toifasi <span class="text-red-500">*</span>
            </label>
            <select
              v-model="excludeForm.reasonCategory"
              class="w-full h-9 sm:h-9.5 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            >
              <option value="Boshqa shaharga ko'chish">Boshqa shaharga ko'chish</option>
              <option value="Boshqa ta'lim muassasasiga o'tish">
                Boshqa ta'lim muassasasiga o'tish
              </option>
              <option value="O'qish narxi / Shartnoma">O'qish narxi / Shartnoma to'lanmagan</option>
              <option value="Salomatlik sababli">Salomatlik sababli</option>
              <option value="Intizom qoidalari buzilishi">Intizom qoidalari buzilishi</option>
              <option value="Oilaviy sharoit">Oilaviy sharoit</option>
              <option value="O'z xohishiga ko'ra">O'z xohishiga ko'ra</option>
              <option value="Boshqa sabab">Boshqa sabab</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Batafsil sabab va izoh <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="excludeForm.reason"
              rows="3"
              placeholder="Masalan: Boshqa shaharga ko'chish: Oilasi bilan boshqa viloyatga ko'chib ketmoqda..."
              class="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            ></textarea>
          </div>
        </div>
      </template>
    </Vmodal>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import { courseCenterGroups, schoolClasses } from "@/api/schoolClassesData";
import {
  addDroppedStudent,
  deleteDroppedStudent,
  loadSchoolDroppedStudents,
  restoreDroppedStudent,
} from "@/api/schoolDroppedData";
import { initialSchoolStudents } from "@/api/schoolStudentsData";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";
import AppConfirmModal from "@/components/common/AppConfirmModal.vue";
import AppDateRangePicker from "@/components/common/AppDateRangePicker.vue";
import AppFilterDropdown from "@/components/common/AppFilterDropdown.vue";
import vmodal from "@/components/common/AppModal.vue";
import AppTable from "@/components/common/AppTable.vue";
import { useTenantStore } from "@/store/tenant";
import toast from "@/utils/toast";

export default {
  name: "SchoolDroppedView",
  components: {
    Icon,
    Breadcrumb,
    AppButton,
    AppFilterDropdown,
    AppTable,
    AppConfirmModal,
    AppDateRangePicker,
    vmodal,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      droppedList: [],
      searchQuery: "",
      selectedClass: "ALL",

      // Sana filtri va chiplar (Ota-onalar sahifasi andozasida)
      activeDateChip: "ALL",
      dateFrom: "",
      dateTo: "",
      dateChips: [
        { id: "TODAY", label: "Bugun" },
        { id: "YESTERDAY", label: "Kecha" },
        { id: "7DAYS", label: "7 kun" },
        { id: "MONTH", label: "Oy" },
        { id: "YEAR", label: "Yil" },
        { id: "ALL", label: "Barchasi" },
      ],

      // Sahifalash
      perPage: 10,

      // Tanlangan student ID lar (AppTable v-model orqali)
      selectedStudentIds: [],

      // Yakkama-yakka tiklash
      selectedStudentToRestore: null,
      targetRestoreClass: "",

      // Yakkama-yakka o'chirish
      selectedStudentToDelete: null,

      // Chetlatish modali
      activeStudentsOptions: [],
      excludeForm: {
        studentId: "",
        fullName: "",
        className: "",
        phone: "",
        droppedDate: new Date().toISOString().split("T")[0],
        reasonCategory: "Boshqa shaharga ko'chish",
        reason: "",
      },
    };
  },
  computed: {
    tableColumns() {
      return [
        { key: "fullName", label: "F.I.SH", thClass: "py-3.5 px-4 min-w-[200px]" },
        {
          key: "className",
          label: this.tenantStore.classLabel,
          thClass: "py-3.5 px-4 min-w-[100px]",
        },
        { key: "phone", label: "Telefon", thClass: "py-3.5 px-4 min-w-[160px]" },
        { key: "droppedDate", label: "Chetlatilgan sana", thClass: "py-3.5 px-4 min-w-[140px]" },
        { key: "reason", label: "Sababi", thClass: "py-3.5 px-4 min-w-[260px]" },
      ];
    },
    availableClasses() {
      if (this.tenantStore.isSchool) {
        return schoolClasses.map((c) => c.name);
      } else {
        return courseCenterGroups.map((g) => g.name);
      }
    },
    classFilterOptions() {
      return this.availableClasses.map((c) => ({
        label: c,
        value: c,
      }));
    },
    isFiltered() {
      return (
        !!this.searchQuery.trim() ||
        this.selectedClass !== "ALL" ||
        this.activeDateChip !== "ALL" ||
        !!this.dateFrom ||
        !!this.dateTo
      );
    },
    filteredStudents() {
      return this.droppedList.filter((st) => {
        // Search
        if (this.searchQuery.trim()) {
          const q = this.searchQuery.toLowerCase().trim();
          const matchName = st.fullName && st.fullName.toLowerCase().includes(q);
          const matchPhone = st.phone && st.phone.includes(q);
          const matchId = st.studentId && st.studentId.includes(q);
          const matchReason = st.reason && st.reason.toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchId && !matchReason) return false;
        }

        // Class
        if (this.selectedClass !== "ALL") {
          if (st.className !== this.selectedClass) return false;
        }

        // Date range
        if (this.dateFrom) {
          if (st.droppedDate < this.dateFrom) return false;
        }
        if (this.dateTo) {
          if (st.droppedDate > this.dateTo) return false;
        }

        return true;
      });
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.droppedList = loadSchoolDroppedStudents();
      this.activeStudentsOptions = initialSchoolStudents.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        className: s.className,
        phone: s.phone,
      }));
    },
    formatDate(dateStr) {
      if (!dateStr) return "—";
      try {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
      } catch (e) {
        return dateStr;
      }
    },
    cleanPhone(phone) {
      if (!phone) return "";
      return phone.replace(/[^\d+]/g, "");
    },
    setDateChip(chipId) {
      this.activeDateChip = chipId;
      const today = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      if (chipId === "TODAY") {
        this.dateFrom = fmt(today);
        this.dateTo = fmt(today);
      } else if (chipId === "YESTERDAY") {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        this.dateFrom = fmt(y);
        this.dateTo = fmt(y);
      } else if (chipId === "7DAYS") {
        const past = new Date();
        past.setDate(past.getDate() - 6);
        this.dateFrom = fmt(past);
        this.dateTo = fmt(today);
      } else if (chipId === "MONTH") {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.dateFrom = fmt(first);
        this.dateTo = fmt(last);
      } else if (chipId === "YEAR") {
        const first = new Date(today.getFullYear(), 0, 1);
        this.dateFrom = fmt(first);
        this.dateTo = fmt(today);
      } else if (chipId === "ALL") {
        this.dateFrom = "";
        this.dateTo = "";
      }
    },
    onCustomDateChange() {
      this.activeDateChip = "CUSTOM";
    },
    handleDateRangePickerChange(payload) {
      this.dateFrom = payload.start;
      this.dateTo = payload.end;
      if (payload.rangeKey && payload.rangeKey !== "custom") {
        const keyMap = {
          today: "TODAY",
          yesterday: "YESTERDAY",
          "7days": "7DAYS",
          month: "MONTH",
          this_month: "MONTH",
          year: "YEAR",
          all: "ALL",
        };
        this.activeDateChip = keyMap[payload.rangeKey] || "CUSTOM";
      } else if (payload.start || payload.end) {
        this.activeDateChip = "CUSTOM";
      } else {
        this.activeDateChip = "ALL";
      }
    },
    resetAllFilters() {
      this.searchQuery = "";
      this.selectedClass = "ALL";
      this.activeDateChip = "ALL";
      this.dateFrom = "";
      this.dateTo = "";
    },
    openDetail(student) {
      this.initiateRestore(student);
    },
    // Yakkama-yakka tiklash
    initiateRestore(student) {
      this.selectedStudentToRestore = student;
      this.targetRestoreClass = student.className;
      if (this.$refs.restoreModalRef) {
        this.$refs.restoreModalRef.open();
      }
    },
    confirmRestore() {
      if (!this.selectedStudentToRestore) return;
      const student = this.selectedStudentToRestore;
      restoreDroppedStudent(student.id, this.targetRestoreClass);
      this.selectedStudentIds = this.selectedStudentIds.filter((id) => id !== student.id);
      this.loadData();
      if (this.$refs.restoreModalRef) {
        this.$refs.restoreModalRef.close();
      }
      this.notifySuccess(
        `${student.fullName} muvaffaqiyatli qayta tiklandi va ${this.targetRestoreClass}ga qo'shildi`
      );
    },
    // Ommaviy tiklash
    openBulkRestoreModal() {
      if (this.$refs.bulkRestoreModalRef) {
        this.$refs.bulkRestoreModalRef.open();
      }
    },
    confirmBulkRestore() {
      const count = this.selectedStudentIds.length;
      for (const id of this.selectedStudentIds) {
        restoreDroppedStudent(id);
      }
      this.selectedStudentIds = [];
      this.loadData();
      if (this.$refs.bulkRestoreModalRef) {
        this.$refs.bulkRestoreModalRef.close();
      }
      this.notifySuccess(`${count} ta o'quvchi muvaffaqiyatli qayta tiklandi`);
    },
    // Yakkama-yakka o'chirish
    initiateDelete(student) {
      this.selectedStudentToDelete = student;
      if (this.$refs.deleteConfirmModalRef) {
        this.$refs.deleteConfirmModalRef.open();
      }
    },
    confirmDelete() {
      if (!this.selectedStudentToDelete) return;
      const student = this.selectedStudentToDelete;
      deleteDroppedStudent(student.id);
      this.selectedStudentIds = this.selectedStudentIds.filter((id) => id !== student.id);
      this.loadData();
      if (this.$refs.deleteConfirmModalRef) {
        this.$refs.deleteConfirmModalRef.close();
      }
      this.notifySuccess(`${student.fullName} ro'yxatdan butunlay o'chirildi`);
    },
    // Ommaviy o'chirish
    openBulkDeleteModal() {
      if (this.$refs.bulkDeleteConfirmModalRef) {
        this.$refs.bulkDeleteConfirmModalRef.open();
      }
    },
    confirmBulkDelete() {
      const count = this.selectedStudentIds.length;
      for (const id of this.selectedStudentIds) {
        deleteDroppedStudent(id);
      }
      this.selectedStudentIds = [];
      this.loadData();
      if (this.$refs.bulkDeleteConfirmModalRef) {
        this.$refs.bulkDeleteConfirmModalRef.close();
      }
      this.notifySuccess(`${count} ta o'quvchi ro'yxatdan butunlay o'chirildi`);
    },
    // Chetlatish amali
    openExcludeModal() {
      this.excludeForm = {
        studentId: "",
        fullName: "",
        className: "",
        phone: "",
        droppedDate: new Date().toISOString().split("T")[0],
        reasonCategory: "Boshqa shaharga ko'chish",
        reason: "",
      };
      if (this.$refs.excludeModalRef) {
        this.$refs.excludeModalRef.open();
      }
    },
    onActiveStudentSelect() {
      const found = this.activeStudentsOptions.find((s) => s.id === this.excludeForm.studentId);
      if (found) {
        this.excludeForm.fullName = found.fullName;
        this.excludeForm.className = found.className;
        this.excludeForm.phone = found.phone;
        if (!this.excludeForm.reason) {
          this.excludeForm.reason = `${this.excludeForm.reasonCategory}: `;
        }
      }
    },
    submitExclude() {
      if (!this.excludeForm.studentId || !this.excludeForm.fullName) {
        alert("Iltimos, o'quvchini tanlang");
        return;
      }
      if (!this.excludeForm.reason) {
        alert("Iltimos, chetlatish sababini kiriting");
        return;
      }
      addDroppedStudent({
        studentId: this.excludeForm.studentId,
        fullName: this.excludeForm.fullName,
        className: this.excludeForm.className,
        phone: this.excludeForm.phone,
        droppedDate: this.excludeForm.droppedDate,
        reasonCategory: this.excludeForm.reasonCategory,
        reason: this.excludeForm.reason,
      });
      this.loadData();
      if (this.$refs.excludeModalRef) {
        this.$refs.excludeModalRef.close();
      }
      this.notifySuccess(`${this.excludeForm.fullName} chetlatilganlar ro'yxatiga qo'shildi`);
    },
    exportToExcel() {
      this.downloadCsv(
        this.filteredStudents,
        `chetlatilganlar_${new Date().toISOString().split("T")[0]}.csv`
      );
      this.notifySuccess("Excel export muvaffaqiyatli amalga oshirildi");
    },
    exportSelectedToExcel() {
      const selected = this.droppedList.filter((s) => this.selectedStudentIds.includes(s.id));
      this.downloadCsv(
        selected,
        `tanlangan_chetlatilganlar_${new Date().toISOString().split("T")[0]}.csv`
      );
      this.notifySuccess("Tanlangan o'quvchilar muvaffaqiyatli export qilindi");
    },
    downloadCsv(list, filename) {
      const rows = [
        ["ID", "F.I.SH", "Sinf/Guruh", "Telefon", "Chetlatilgan sana", "Sababi"],
        ...list.map((s) => [
          s.studentId,
          s.fullName,
          s.className,
          s.phone,
          s.droppedDate,
          s.reason,
        ]),
      ];

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        rows
          .map((e) => e.map((i) => `"${(i || "").toString().replace(/"/g, '""')}"`).join(","))
          .join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    notifySuccess(msg) {
      if (this.$toast && this.$toast.success) {
        this.$toast.success(msg);
      } else {
        toast.success(msg);
      }
    },
  },
};
</script>
