import { ref } from "vue";

import AppButton from "../components/common/AppButton.vue";
import AppConfirmModal from "../components/common/AppConfirmModal.vue";

export default {
  title: "Design System/AppConfirmModal",
  component: AppConfirmModal,
  tags: ["autodocs"],
};

export const DangerAction = {
  render: () => ({
    components: { AppConfirmModal, AppButton },
    setup() {
      const modalRef = ref(null);
      const openModal = () => {
        if (modalRef.value) {
          modalRef.value.$refs.modalRef.open();
        }
      };
      const onConfirm = () => {
        alert("Tasdiqlandi va o'chirildi!");
      };
      return { modalRef, openModal, onConfirm };
    },
    template: `
      <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[250px]">
        <AppButton variant="danger" icon="solar:trash-bin-trash-linear" @click="openModal">
          O'quvchini o'chirish
        </AppButton>

        <AppConfirmModal
          ref="modalRef"
          title="O'quvchini o'chirish"
          message="Haqiqatan ham ushbu o'quvchini tizimdan butunlay o'chirmoqchimisiz?"
          description="Ushbu amalni ortga qaytarib bo'lmaydi. Barcha unga bog'liq to'lovlar va davomatlar arxivlanadi."
          confirmText="Ha, o'chirilsin"
          cancelText="Bekor qilish"
          variant="danger"
          @submit="onConfirm"
        />
      </div>
    `,
  }),
};

export const WarningAction = {
  render: () => ({
    components: { AppConfirmModal, AppButton },
    setup() {
      const modalRef = ref(null);
      const openModal = () => {
        if (modalRef.value) {
          modalRef.value.$refs.modalRef.open();
        }
      };
      const onConfirm = () => {
        alert("Arxivlandi!");
      };
      return { modalRef, openModal, onConfirm };
    },
    template: `
      <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[250px]">
        <AppButton variant="warning" icon="solar:archive-linear" @click="openModal">
          Guruhni arxivlash
        </AppButton>

        <AppConfirmModal
          ref="modalRef"
          title="Guruhni arxivlash"
          message="Ushbu guruh dars jadvali va jurnaldan olib tashlanadi."
          description="Keyinchalik guruh sozlamalaridan uni yana qayta faollashtirishingiz mumkin."
          confirmText="Arxivlash"
          cancelText="Yopish"
          variant="warning"
          @submit="onConfirm"
        />
      </div>
    `,
  }),
};
