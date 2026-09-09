import { createRouter, createWebHistory } from "vue-router";

import BRAND_CONFIG from "@/config/brand.config";
import { STORAGE_KEYS } from "@/constants/storage.constants";
import { loadModuleRoutes, routerRegistry } from "@/core/router";
import { safeJsonParse } from "@/utils/storage";

const appname = ` - ${BRAND_CONFIG.name}`;

// Dynamically load pilot module routes (Students, Attendance, Finance)
const moduleRoutes = loadModuleRoutes();

const routes = [
  // EduHub Core Routes
  {
    path: "/",
    name: "Dashboard",
    component: () => import(/* webpackChunkName: "dashboard" */ "../views/Dashboard.vue"),
    meta: { title: "Dashboard" + appname },
  },
  ...moduleRoutes,
  {
    path: "/leads",
    name: "Leads",
    component: () => import(/* webpackChunkName: "leads" */ "../views/leads/LeadsKanban.vue"),
    meta: { title: "Lidlar & Kanban" + appname },
  },
  {
    path: "/crm/settings",
    name: "CrmSettings",
    component: () => import(/* webpackChunkName: "settings" */ "../views/settings/CrmSettings.vue"),
    meta: { title: "CRM Sozlamalari" + appname },
  },
  {
    path: "/settings/crm",
    redirect: "/crm/settings",
  },
  {
    path: "/groups",
    name: "Groups",
    component: () => import(/* webpackChunkName: "groups" */ "../views/groups/GroupsList.vue"),
    meta: { title: "Guruhlar" + appname },
  },
  {
    path: "/courses",
    name: "Courses",
    component: () => import(/* webpackChunkName: "courses" */ "../views/courses/CoursesList.vue"),
    meta: { title: "Kurslar" + appname },
  },
  {
    path: "/employees",
    name: "Employees",
    component: () => import(/* webpackChunkName: "employees" */ "../views/hr/EmployeesList.vue"),
    meta: { title: "Xodimlar & Oylik" + appname },
  },
  {
    path: "/contracts",
    name: "Contracts",
    component: () =>
      import(/* webpackChunkName: "contracts" */ "../views/contracts/ContractsList.vue"),
    meta: { title: "O'quv Shartnomalari" + appname },
  },
  {
    path: "/school/classes",
    alias: ["/education/classes"],
    name: "SchoolClasses",
    component: () =>
      import(/* webpackChunkName: "school" */ "../views/school/SchoolClassesView.vue"),
    meta: { title: "Sinflar" + appname },
  },
  {
    path: "/school/classes/:id",
    alias: ["/education/classes/:id"],
    name: "SchoolClassDetail",
    component: () =>
      import(/* webpackChunkName: "school" */ "../views/school/SchoolClassDetailView.vue"),
    meta: { title: "O'quvchilar ro'yxati" + appname },
  },
  {
    path: "/school/levels",
    alias: ["/levels", "/education/levels", "/school/groups"],
    name: "SchoolLevels",
    component: () =>
      import(/* webpackChunkName: "school" */ "../views/school/SchoolLevelsView.vue"),
    meta: { title: "Darajalar va to'garaklar" + appname },
  },
  {
    path: "/school/students",
    alias: ["/education/students"],
    name: "SchoolStudents",
    component: () =>
      import(/* webpackChunkName: "school" */ "../views/school/SchoolStudentsView.vue"),
    meta: { title: "O'quvchilar" + appname },
  },
  {
    path: "/school/parents",
    alias: ["/parents", "/education/parents"],
    name: "SchoolParents",
    component: () =>
      import(/* webpackChunkName: "school" */ "../views/school/SchoolParentsView.vue"),
    meta: { title: "Ota-onalar" + appname },
  },
  {
    path: "/school/dropped",
    alias: ["/dropped", "/school/withdrawn", "/education/dropped", "/school/chetlatilganlar"],
    name: "SchoolDroppedStudents",
    component: () =>
      import(/* webpackChunkName: "school" */ "../views/school/SchoolDroppedView.vue"),
    meta: { title: "Chetlatilganlar" + appname },
  },
  {
    path: "/education/schedule",
    alias: ["/school/schedule", "/schedule"],
    name: "EducationSchedule",
    component: () =>
      import(/* webpackChunkName: "education" */ "../views/education/ScheduleView.vue"),
    meta: { title: "Dars jadvali" + appname },
  },
  {
    path: "/education/schedule/class/:classId",
    alias: [
      "/education/class-schedule/:classId",
      "/education/class-schedule/:quarter/:dates/:classId",
    ],
    name: "EducationClassScheduleDetail",
    component: () =>
      import(/* webpackChunkName: "education" */ "../views/education/ClassScheduleView.vue"),
    meta: { title: "Dars jadvali - Sinf ko'rinishi" + appname },
  },
  {
    path: "/education/replace-teacher",
    alias: ["/school/replace-teacher"],
    name: "EducationReplaceTeacher",
    component: () =>
      import(/* webpackChunkName: "education" */ "../views/education/ReplaceTeacherView.vue"),
    meta: { title: "O'qituvchini almashtirish" + appname },
  },
  {
    path: "/education/gradebook",
    alias: ["/school/gradebook"],
    name: "EducationGradebook",
    component: () =>
      import(/* webpackChunkName: "education" */ "../views/education/GradebookView.vue"),
    meta: { title: "Baholar jurnali" + appname },
  },
  {
    path: "/education/final-grades",
    alias: ["/school/final-grades"],
    name: "EducationFinalGrades",
    component: () =>
      import(/* webpackChunkName: "education" */ "../views/education/FinalGradesView.vue"),
    meta: { title: "Yakuniy baholar" + appname },
  },
  {
    path: "/education/academic-actions",
    alias: ["/school/academic-actions"],
    name: "EducationAcademicActions",
    component: () =>
      import(/* webpackChunkName: "education" */ "../views/education/AcademicActionsView.vue"),
    meta: { title: "Akademik harakatlar" + appname },
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () =>
      import(/* webpackChunkName: "calendar" */ "../views/calendar/CalendarView.vue"),
    meta: { title: "Taqvim va Topshiriqlar" + appname },
  },
  {
    path: "/users",
    name: "Users",
    component: () => import(/* webpackChunkName: "users" */ "../views/users/UsersList.vue"),
    meta: { title: "Foydalanuvchilar" + appname },
  },
  {
    path: "/roles",
    name: "Roles",
    component: () => import(/* webpackChunkName: "roles" */ "../views/roles/RolesList.vue"),
    meta: { title: "Rollar & Ruxsatlar" + appname },
  },
  {
    path: "/audit",
    name: "AuditLogs",
    component: () => import(/* webpackChunkName: "audit" */ "../views/audit/AuditLogsList.vue"),
    meta: { title: "Xavfsizlik Jurnali (Audit)" + appname },
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: () =>
      import(
        /* webpackChunkName: "notifications" */ "../views/notifications/NotificationsList.vue"
      ),
    meta: { title: "Xabarnomalar Markazi" + appname },
  },
  {
    path: "/subscriptions",
    name: "Subscriptions",
    component: () =>
      import(
        /* webpackChunkName: "subscriptions" */ "../views/subscriptions/SubscriptionsView.vue"
      ),
    meta: { title: "Tariflar & Obuna" + appname },
  },
  {
    path: "/settings",
    redirect: "/crm/settings",
  },
  {
    path: "/setup",
    name: "SetupWizard",
    component: () => import(/* webpackChunkName: "setup" */ "../views/setup/SetupWizard.vue"),
    meta: { title: "Setup Wizard" + appname, hideNav: true },
  },

  // Auth
  {
    path: "/auth/login",
    name: "Login",
    component: () => import(/* webpackChunkName: "auth" */ "../views/layouts/auth/Login.vue"),
    meta: { title: "Login" + appname, hideNav: true },
  },
  {
    path: "/auth/register",
    name: "Register",
    component: () => import(/* webpackChunkName: "auth" */ "../views/layouts/auth/Register.vue"),
    meta: { title: "Register" + appname, hideNav: true },
  },
  {
    path: "/auth/forgot-password",
    name: "ForgotPassword",
    component: () =>
      import(/* webpackChunkName: "auth" */ "../views/layouts/auth/ForgotPassword.vue"),
    meta: { title: "Forgot Password" + appname, hideNav: true },
  },

  // Error pages
  {
    path: "/403",
    name: "Page403",
    component: () => import(/* webpackChunkName: "error" */ "../views/layouts/error/403.vue"),
    meta: { title: "Ruxsat Berilmagan" + appname, hideNav: true },
  },
  {
    path: "/500",
    name: "Page500",
    component: () => import(/* webpackChunkName: "error" */ "../views/layouts/error/500.vue"),
    meta: { title: "Server internal Error" + appname, hideNav: true },
  },
  {
    path: "/maintenance",
    name: "maintenance",
    component: () =>
      import(/* webpackChunkName: "error" */ "../views/layouts/error/maintenance.vue"),
    meta: { title: "Maintenance" + appname, hideNav: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "Page404",
    component: () => import(/* webpackChunkName: "error" */ "../views/layouts/error/404.vue"),
    meta: { title: "404" + appname, hideNav: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkExactActiveClass: "exact-active",
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || BRAND_CONFIG.name;

  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const isAuthRoute =
    to.path.startsWith("/auth") ||
    to.path === "/403" ||
    to.path === "/500" ||
    to.path === "/maintenance";

  if (!token && !isAuthRoute) {
    // Unauthenticated user attempting to access protected route -> redirect to clean login url
    return next({ path: "/auth/login" });
  }

  if (token && (to.path === "/auth/login" || to.path === "/auth/register")) {
    // Already authenticated user visiting login/register -> redirect to dashboard
    return next({ path: "/" });
  }

  // Check if route belongs to a module that is disabled for this tenant
  const savedEnabledModules = safeJsonParse(
    localStorage.getItem(STORAGE_KEYS.ENABLED_MODULES),
    null
  );
  if (!routerRegistry.isRouteAllowed(to, savedEnabledModules)) {
    return next({ path: "/403" });
  }

  next();
});

export default router;
