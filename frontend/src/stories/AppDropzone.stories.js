import { ref } from "vue";

import AppDropzone from "../components/common/AppDropzone.vue";

export default {
  title: "Design System/AppDropzone",
  component: AppDropzone,
  tags: ["autodocs"],
};

export const ExcelImport = {
  render: () => ({
    components: { AppDropzone },
    setup() {
      const file = ref(null);
      return { file };
    },
    template: `
      <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl max-w-lg">
        <h4 class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">O'quvchilar ro'yxatini import qilish</h4>
        <AppDropzone
          v-model="file"
          accept=".xlsx, .csv, .xls"
          title="Excel yoki CSV faylni shu yerga tashlang"
          subtitle="Faqat .xlsx, .csv, .xls fayllar qabul qilinadi (maksimal 10 MB)"
          @change="f => console.log('Tanlangan fayl:', f)"
        />
      </div>
    `,
  }),
};

export const ImageUpload = {
  render: () => ({
    components: { AppDropzone },
    setup() {
      const file = ref(null);
      return { file };
    },
    template: `
      <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl max-w-lg">
        <h4 class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">O'quvchi rasmini yuklash</h4>
        <AppDropzone
          v-model="file"
          accept="image/*"
          icon="solar:gallery-bold"
          title="Rasmni bu yerga sudrab keling"
          subtitle="PNG, JPG, WEBP formatlar (maksimal 5 MB)"
          :maxSize="5 * 1024 * 1024"
        />
      </div>
    `,
  }),
};
