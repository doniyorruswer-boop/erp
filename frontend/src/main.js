import "vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css";
import "./assets/tailwind.css";
import "./assets/animate.css";
import "./assets/sass/css/eduhub.css";

import vClickOutside from "click-outside-vue3";
import { createPinia } from "pinia";
import { createApp } from "vue";
import VueApexCharts from "vue3-apexcharts";
import PerfectScrollbar from "vue3-perfect-scrollbar";

import AppActionButtons from "@/components/common/AppActionButtons.vue";
import AppButton from "@/components/common/AppButton.vue";
import AppConfirmModal from "@/components/common/AppConfirmModal.vue";
import AppCopyCell from "@/components/common/AppCopyCell.vue";
import AppDateCell from "@/components/common/AppDateCell.vue";
import AppDateRangePicker from "@/components/common/AppDateRangePicker.vue";
import AppDocCell from "@/components/common/AppDocCell.vue";
import AppDropzone from "@/components/common/AppDropzone.vue";
import AppFilterDropdown from "@/components/common/AppFilterDropdown.vue";
import AppGroupBadge from "@/components/common/AppGroupBadge.vue";
import modal from "@/components/common/AppModal.vue";
import AppMoneyCell from "@/components/common/AppMoneyCell.vue";
import AppPagination from "@/components/common/AppPagination.vue";
import AppPhoneCell from "@/components/common/AppPhoneCell.vue";
import AppStatusBadge from "@/components/common/AppStatusBadge.vue";
import AppTable from "@/components/common/AppTable.vue";
import AppUserCell from "@/components/common/AppUserCell.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import FilterSelect from "@/components/common/FilterSelect.vue";
import FormFieldError from "@/components/common/FormFieldError.vue";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FormCurrencyInput from "@/components/FormCurrencyInput.vue";
import FormDatePicker from "@/components/FormDatePicker.vue";
import FormTimePicker from "@/components/FormTimePicker.vue";
import { APP_CONFIG, formatDateUz, formatMoney, formatPhone } from "@/config/app.config";
import BRAND_CONFIG from "@/config/brand.config";
import { vPermission } from "@/core/security";
import { loadDarkMode, loadPrimaryColor } from "@/helper/theme";
import toast from "@/utils/toast";
import { rules, validateField, validateForm } from "@/utils/validators";

import App from "./App.vue";
import router from "./router";

loadPrimaryColor();
loadDarkMode();

const app = createApp(App);

// Universal Global Komponentlar
app.component("LoadingSpinner", LoadingSpinner);
app.component("Spinner", LoadingSpinner);
app.component("FormDatePicker", FormDatePicker);
app.component("DatePicker", FormDatePicker);
app.component("FormCurrencyInput", FormCurrencyInput);
app.component("CurrencyInput", FormCurrencyInput);
app.component("FormTimePicker", FormTimePicker);
app.component("TimePicker", FormTimePicker);
app.component("Vmodal", modal);
app.component("Modal", modal);
app.component("AppModal", modal);
app.component("AppButton", AppButton);
app.component("AppTable", AppTable);
app.component("DataTable", AppTable);
app.component("EmptyState", EmptyState);
app.component("FilterSelect", FilterSelect);
app.component("AppConfirmModal", AppConfirmModal);
app.component("ConfirmModal", ConfirmModal);
app.component("AppPagination", AppPagination);
app.component("AppFilterDropdown", AppFilterDropdown);
app.component("FilterDropdown", AppFilterDropdown);
app.component("AppDateRangePicker", AppDateRangePicker);
app.component("DateRangePicker", AppDateRangePicker);
app.component("Pagination", AppPagination);
app.component("PageTitle", PageTitle);
app.component("CrmButton", AppButton);
app.component("AppUserCell", AppUserCell);
app.component("UserCell", AppUserCell);
app.component("AppPhoneCell", AppPhoneCell);
app.component("PhoneCell", AppPhoneCell);
app.component("AppGroupBadge", AppGroupBadge);
app.component("GroupBadge", AppGroupBadge);
app.component("AppStatusBadge", AppStatusBadge);
app.component("StatusBadge", AppStatusBadge);
app.component("AppMoneyCell", AppMoneyCell);
app.component("MoneyCell", AppMoneyCell);
app.component("AppDateCell", AppDateCell);
app.component("DateCell", AppDateCell);
app.component("AppCopyCell", AppCopyCell);
app.component("CopyCell", AppCopyCell);
app.component("AppDocCell", AppDocCell);
app.component("DocCell", AppDocCell);
app.component("AppActionButtons", AppActionButtons);
app.component("ActionButtons", AppActionButtons);
app.component("AppDropzone", AppDropzone);
app.component("FormFieldError", FormFieldError);

// Universal Global Yordamchilar va Validatsiya
app.config.globalProperties.$toast = toast;
app.config.globalProperties.$brand = BRAND_CONFIG;
app.config.globalProperties.$appConfig = APP_CONFIG;
app.config.globalProperties.$formatMoney = formatMoney;
app.config.globalProperties.$formatDate = formatDateUz;
app.config.globalProperties.$formatPhone = formatPhone;
app.config.globalProperties.$validateForm = validateForm;
app.config.globalProperties.$validateField = validateField;
app.config.globalProperties.$rules = rules;

// Directives
app.directive("permission", vPermission);

app.use(router);
app.use(createPinia());
app.use(VueApexCharts);
app.use(PerfectScrollbar);
app.use(vClickOutside);
app.mount("#app");
