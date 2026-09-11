import "../src/assets/tailwind.css";
import "../src/assets/animate.css";
import "../src/assets/sass/css/eduhub.css";
import { setup } from "@storybook/vue3";
import { createPinia } from "pinia";
import BRAND_CONFIG from "../src/config/brand.config";
import { APP_CONFIG, formatMoney, formatDateUz, formatPhone } from "../src/config/app.config";
import toast from "../src/utils/toast";

setup((app) => {
  app.use(createPinia());
  app.config.globalProperties.$toast = toast;
  app.config.globalProperties.$brand = BRAND_CONFIG;
  app.config.globalProperties.$appConfig = APP_CONFIG;
  app.config.globalProperties.$formatMoney = formatMoney;
  app.config.globalProperties.$formatDate = formatDateUz;
  app.config.globalProperties.$formatPhone = formatPhone;
});

/** @type { import('@storybook/vue3').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f8fafc" },
        { name: "dark", value: "#0f172a" },
      ],
    },
  },
};

export default preview;
