import type { RouteRecordRaw } from "vue-router";

import BRAND_CONFIG from "@/config/brand.config";

const appname = ` - ${BRAND_CONFIG.name}`;

export const financeRoutes: RouteRecordRaw[] = [
  {
    path: "/finance",
    name: "Finance",
    component: () => import(/* webpackChunkName: "finance" */ "@/views/finance/FinanceView.vue"),
    meta: {
      title: "Moliya & Kassa" + appname,
      permission: "payments.view",
      moduleId: "FINANCE",
    },
  },
  {
    path: "/payment-stats",
    name: "PaymentStats",
    component: () =>
      import(/* webpackChunkName: "payment-stats" */ "@/views/finance/PaymentStatsView.vue"),
    meta: {
      title: "To'lovlar statistikasi" + appname,
      permission: "payments.view",
      moduleId: "FINANCE",
    },
  },
  {
    path: "/payment-stats/month/:monthKey",
    name: "PaymentMonthDetail",
    component: () =>
      import(/* webpackChunkName: "payment-stats" */ "@/views/finance/PaymentMonthDetailView.vue"),
    meta: {
      title: "Oylik To'lovlar Tahlili" + appname,
      permission: "payments.view",
      moduleId: "FINANCE",
    },
  },
];

export default financeRoutes;
