import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import VueApexCharts from "vue3-apexcharts";
import PerfectScrollbar from "vue3-perfect-scrollbar";
import "vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css";
import { createPinia } from "pinia";
// import "flowbite";
import "./assets/tailwind.css";
import "./assets/animate.css";
import "./assets/sass/css/eduhub.css";
import vClickOutside from "click-outside-vue3";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import FormDatePicker from "@/components/FormDatePicker.vue";
import FormCurrencyInput from "@/components/FormCurrencyInput.vue";
import FormTimePicker from "@/components/FormTimePicker.vue";
import BRAND_CONFIG from "@/config/brand.config";
import { APP_CONFIG, formatMoney, formatDateUz, formatPhone } from "@/config/app.config";
import { loadPrimaryColor, loadDarkMode } from "@/helper/theme";

loadPrimaryColor();
loadDarkMode();

const app = createApp(App);
app.component("LoadingSpinner", LoadingSpinner);
app.component("Spinner", LoadingSpinner);
app.component("FormDatePicker", FormDatePicker);
app.component("DatePicker", FormDatePicker);
app.component("FormCurrencyInput", FormCurrencyInput);
app.component("CurrencyInput", FormCurrencyInput);
app.component("FormTimePicker", FormTimePicker);
app.component("TimePicker", FormTimePicker);

import toast from "@/utils/toast";

// Global properties
app.config.globalProperties.$toast = toast;
app.config.globalProperties.$brand = BRAND_CONFIG;
app.config.globalProperties.$appConfig = APP_CONFIG;
app.config.globalProperties.$formatMoney = formatMoney;
app.config.globalProperties.$formatDate = formatDateUz;
app.config.globalProperties.$formatPhone = formatPhone;

app.use(router);
app.use(createPinia());
app.use(VueApexCharts);
app.use(PerfectScrollbar);
app.use(vClickOutside);
app.mount("#app");
