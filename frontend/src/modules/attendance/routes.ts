import type { RouteRecordRaw } from "vue-router";

import BRAND_CONFIG from "@/config/brand.config";

const appname = ` - ${BRAND_CONFIG.name}`;

export const attendanceRoutes: RouteRecordRaw[] = [
  {
    path: "/attendance",
    name: "Attendance",
    component: () =>
      import(/* webpackChunkName: "attendance" */ "@/views/attendance/AttendanceView.vue"),
    meta: {
      title: "Davomat" + appname,
      permission: "attendance.view",
      moduleId: "ATTENDANCE",
    },
  },
];

export default attendanceRoutes;
