<template>
  <div class="app-dropzone font-lexend select-none">
    <!-- 1. Hali fayl tanlanmagan holat: Drag & Drop qabul qiluvchi zona -->
    <div
      v-if="!selectedFile"
      class="relative flex flex-col items-center justify-center p-7 sm:p-9 border-2 border-dashed rounded-xl transition-all cursor-pointer text-center group"
      :class="[
        isDragging
          ? 'border-primary bg-primary/10 ring-4 ring-primary/20 scale-[0.99]'
          : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/40 hover:border-primary hover:bg-primary/[0.03]',
      ]"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        class="hidden"
        @change="onFileInputChange"
      />

      <!-- Icon -->
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform"
        :class="[
          isDragging
            ? 'bg-primary text-white scale-110 shadow-md'
            : 'bg-primary/10 text-primary group-hover:scale-105',
        ]"
      >
        <Icon :icon="icon" class="text-2xl" />
      </div>

      <!-- Sarlavhalar -->
      <p
        class="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors"
      >
        {{ title }}
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
        {{ subtitle }}
      </p>

      <!-- Qo'shimcha Tugmacha -->
      <span
        class="mt-3.5 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-2xs group-hover:border-primary transition"
      >
        <Icon icon="solar:folder-open-linear" class="text-sm text-primary" />
        Faylni kompyuterdan tanlash
      </span>
    </div>

    <!-- 2. Fayl tanlangan holat: Preview va O'chirish kartasi -->
    <div
      v-else
      class="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xs animate-fade-in"
    >
      <div class="flex items-center gap-3 min-w-0">
        <!-- File Icon -->
        <div
          class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
        >
          <Icon :icon="fileTypeIcon" class="text-xl" />
        </div>

        <!-- Fayl nomi va hajmi -->
        <div class="min-w-0">
          <p
            class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate"
            :title="selectedFile.name"
          >
            {{ selectedFile.name }}
          </p>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ formattedFileSize }}
          </p>
        </div>
      </div>

      <!-- O'chirish / Boshqasini tanlash -->
      <button
        type="button"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer shrink-0 ml-2"
        title="Faylni olib tashlash"
        @click="clearFile"
      >
        <Icon icon="solar:trash-bin-trash-linear" class="text-lg" />
      </button>
    </div>

    <!-- Xatolik xabari -->
    <p
      v-if="errorMessage"
      class="text-xs text-rose-500 font-semibold mt-2 flex items-center gap-1 animate-fade-in"
    >
      <Icon icon="solar:danger-circle-bold" class="text-sm shrink-0" />
      <span>{{ errorMessage }}</span>
    </p>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "AppDropzone",
  components: { Icon },
  props: {
    modelValue: {
      type: [File, Object],
      default: null,
    },
    accept: {
      type: String,
      default: ".xlsx, .csv, .xls",
    },
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024, // 10 MB
    },
    title: {
      type: String,
      default: "Faylni shu yerga tortib keling yoki bosing",
    },
    subtitle: {
      type: String,
      default: "Qo'llab-quvvatlanadigan formatlar: .xlsx, .csv, .xls (maksimal 10 MB)",
    },
    icon: {
      type: String,
      default: "solar:upload-track-2-bold",
    },
  },
  emits: ["update:modelValue", "change", "error"],
  data() {
    return {
      isDragging: false,
      selectedFile: this.modelValue || null,
      errorMessage: "",
    };
  },
  computed: {
    formattedFileSize() {
      if (!this.selectedFile || !this.selectedFile.size) return "0 KB";
      const bytes = this.selectedFile.size;
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    },
    fileTypeIcon() {
      if (!this.selectedFile) return "solar:file-linear";
      const name = this.selectedFile.name.toLowerCase();
      if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
        return "solar:file-spreadsheet-bold";
      }
      if (name.endsWith(".pdf")) {
        return "solar:document-text-bold";
      }
      if (name.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
        return "solar:gallery-bold";
      }
      return "solar:file-linear";
    },
  },
  watch: {
    modelValue(val) {
      this.selectedFile = val;
    },
  },
  methods: {
    triggerFileInput() {
      if (this.$refs.fileInputRef) {
        this.$refs.fileInputRef.click();
      }
    },
    onDragEnter() {
      this.isDragging = true;
    },
    onDragOver() {
      this.isDragging = true;
    },
    onDragLeave() {
      this.isDragging = false;
    },
    onDrop(e) {
      this.isDragging = false;
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
    },
    onFileInputChange(e) {
      const files = e.target?.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
    },
    processFile(file) {
      this.errorMessage = "";
      if (this.maxSize && file.size > this.maxSize) {
        const maxMb = Math.round(this.maxSize / (1024 * 1024));
        this.errorMessage = `Fayl hajmi juda katta. Maksimal ruxsat etilgan hajm: ${maxMb} MB`;
        this.$emit("error", this.errorMessage);
        return;
      }
      this.selectedFile = file;
      this.$emit("update:modelValue", file);
      this.$emit("change", file);
    },
    clearFile() {
      this.selectedFile = null;
      this.errorMessage = "";
      if (this.$refs.fileInputRef) {
        this.$refs.fileInputRef.value = "";
      }
      this.$emit("update:modelValue", null);
      this.$emit("change", null);
    },
  },
};
</script>
