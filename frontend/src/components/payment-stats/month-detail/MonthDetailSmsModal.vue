<template>
  <Vmodal
    ref="smsModal"
    title="Qarzdor Ota-onalarga SMS Eslatma Yuborish"
    width="max-w-lg"
    hide-footer
    hide-button
  >
    <template #body>
      <div class="space-y-4">
        <div
          class="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-200"
        >
          Ushbu modul orqali {{ monthName }} oyi bo'yicha to'lov qilmagan jami
          <strong>{{ debtorsCount }} ta</strong> o'quvchining ota-onalariga avtomatik qarz eslatmasi
          yuboriladi.
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
            >SMS Xabar Shabloni:</label
          >
          <textarea
            v-model="smsTemplate"
            rows="4"
            class="w-full p-3 text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
          ></textarea>
          <p class="text-[11px] text-gray-400 mt-1">
            Belgilar soni: {{ smsTemplate.length }} ta (1 ta SMS segmenti)
          </p>
        </div>

        <div class="pt-3 border-t dark:border-gray-700 flex items-center justify-end gap-2">
          <AppButton variant="outline" @click="close"> Bekor qilish </AppButton>
          <AppButton variant="primary" icon="solar:plain-bold" :loading="isSending" @click="send">
            SMS Xabarnomani Yuborish
          </AppButton>
        </div>
      </div>
    </template>
  </Vmodal>
</template>

<script>
import AppButton from "@/components/common/AppButton.vue";
import vmodal from "@/components/common/AppModal.vue";

export default {
  name: "MonthDetailSmsModal",
  components: { AppButton, vmodal },
  props: {
    monthName: {
      type: String,
      default: "",
    },
    debtorsCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["sms-sent"],
  data() {
    return {
      isSending: false,
      smsTemplate:
        "Hurmatli ota-ona! Farzandingizning joriy oy uchun ta'lim to'lovi muddati yetib keldi. Iltimos, to'lovni amalga oshirishingizni so'raymiz. EduHub Administratsiyasi.",
    };
  },
  methods: {
    open() {
      if (this.$refs.smsModal) {
        this.$refs.smsModal.open();
      }
    },
    close() {
      if (this.$refs.smsModal) {
        this.$refs.smsModal.close();
      }
    },
    send() {
      this.isSending = true;
      setTimeout(() => {
        this.isSending = false;
        this.close();
        this.$emit("sms-sent", this.debtorsCount);
      }, 1000);
    },
  },
};
</script>
