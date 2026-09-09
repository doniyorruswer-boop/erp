import type { RouteRecordRaw } from "vue-router";

import BRAND_CONFIG from "@/config/brand.config";

const appname = ` - ${BRAND_CONFIG.name}`;

export const studentsRoutes: RouteRecordRaw[] = [
  {
    path: "/students",
    name: "Students",
    component: () => import(/* webpackChunkName: "students" */ "@/views/students/StudentsList.vue"),
    meta: {
      title: "O'quvchilar" + appname,
      permission: "students.view",
      moduleId: "STUDENTS",
    },
  },
  {
    path: "/students/create",
    name: "StudentCreate",
    component: () =>
      import(/* webpackChunkName: "students" */ "@/views/students/StudentCreate.vue"),
    meta: {
      title: "O'quvchini qo'shish" + appname,
      permission: "students.create",
      moduleId: "STUDENTS",
    },
  },
  {
    path: "/students/:id",
    name: "StudentProfile",
    component: () =>
      import(/* webpackChunkName: "students" */ "@/views/students/StudentProfile.vue"),
    meta: {
      title: "O'quvchi Profili" + appname,
      permission: "students.view",
      moduleId: "STUDENTS",
    },
  },
];

export default studentsRoutes;
