import { createRouter, createWebHistory } from "vue-router";

// EduHub Pages
import Dashboard from "../views/Dashboard.vue";
import StudentsList from "../views/students/StudentsList.vue";
import StudentCreate from "../views/students/StudentCreate.vue";
import StudentProfile from "../views/students/StudentProfile.vue";
import LeadsKanban from "../views/leads/LeadsKanban.vue";
import GroupsList from "../views/groups/GroupsList.vue";
import CoursesList from "../views/courses/CoursesList.vue";
import AttendanceView from "../views/attendance/AttendanceView.vue";
import FinanceView from "../views/finance/FinanceView.vue";
import CalendarView from "../views/calendar/CalendarView.vue";
import SetupWizard from "../views/setup/SetupWizard.vue";
import SchoolClassesView from "../views/school/SchoolClassesView.vue";
import ContractsList from "../views/contracts/ContractsList.vue";
import EmployeesList from "../views/hr/EmployeesList.vue";
import CrmSettings from "../views/settings/CrmSettings.vue";
import UsersList from "../views/users/UsersList.vue";
import RolesList from "../views/roles/RolesList.vue";
import AuditLogsList from "../views/audit/AuditLogsList.vue";
import NotificationsList from "../views/notifications/NotificationsList.vue";
import SubscriptionsView from "../views/subscriptions/SubscriptionsView.vue";

// Auth & Error Pages
import Login from "../views/layouts/auth/Login.vue";
import Register from "../views/layouts/auth/Register.vue";
import ForgotPassword from "../views/layouts/auth/forgot-password.vue";
import Page404 from "../views/layouts/error/404.vue";
import Page500 from "../views/layouts/error/500.vue";
import PageMaintenance from "../views/layouts/error/maintenance.vue";

import BRAND_CONFIG from "@/config/brand.config";

const appname = ` - ${BRAND_CONFIG.name}`;

const routes = [
  // EduHub Core Routes
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: { title: "Dashboard" + appname },
  },
  {
    path: "/students",
    name: "Students",
    component: StudentsList,
    meta: { title: "O'quvchilar" + appname },
  },
  {
    path: "/students/create",
    name: "StudentCreate",
    component: StudentCreate,
    meta: { title: "O'quvchini qo'shish" + appname },
  },
  {
    path: "/students/:id",
    name: "StudentProfile",
    component: StudentProfile,
    meta: { title: "O'quvchi Profili" + appname },
  },
  {
    path: "/leads",
    name: "Leads",
    component: LeadsKanban,
    meta: { title: "Lidlar & Kanban" + appname },
  },
  {
    path: "/crm/settings",
    name: "CrmSettings",
    component: CrmSettings,
    meta: { title: "CRM Sozlamalari" + appname },
  },
  {
    path: "/settings/crm",
    redirect: "/crm/settings",
  },
  {
    path: "/groups",
    name: "Groups",
    component: GroupsList,
    meta: { title: "Guruhlar" + appname },
  },
  {
    path: "/courses",
    name: "Courses",
    component: CoursesList,
    meta: { title: "Kurslar" + appname },
  },
  {
    path: "/attendance",
    name: "Attendance",
    component: AttendanceView,
    meta: { title: "Davomat" + appname },
  },
  {
    path: "/finance",
    name: "Finance",
    component: FinanceView,
    meta: { title: "Moliya & Kassa" + appname },
  },
  {
    path: "/employees",
    name: "Employees",
    component: EmployeesList,
    meta: { title: "Xodimlar & Oylik" + appname },
  },
  {
    path: "/contracts",
    name: "Contracts",
    component: ContractsList,
    meta: { title: "O'quv Shartnomalari" + appname },
  },
  {
    path: "/school/classes",
    name: "SchoolClasses",
    component: SchoolClassesView,
    meta: { title: "Maktab Sinflari & Fanlar" + appname },
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: CalendarView,
    meta: { title: "Taqvim va Topshiriqlar" + appname },
  },
  {
    path: "/users",
    name: "Users",
    component: UsersList,
    meta: { title: "Foydalanuvchilar" + appname },
  },
  {
    path: "/roles",
    name: "Roles",
    component: RolesList,
    meta: { title: "Rollar & Ruxsatlar" + appname },
  },
  {
    path: "/audit",
    name: "AuditLogs",
    component: AuditLogsList,
    meta: { title: "Xavfsizlik Jurnali (Audit)" + appname },
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: NotificationsList,
    meta: { title: "Xabarnomalar Markazi" + appname },
  },
  {
    path: "/subscriptions",
    name: "Subscriptions",
    component: SubscriptionsView,
    meta: { title: "Tariflar & Obuna" + appname },
  },
  {
    path: "/settings",
    redirect: "/crm/settings",
  },
  {
    path: "/setup",
    name: "SetupWizard",
    component: SetupWizard,
    meta: { title: "Setup Wizard" + appname, hideNav: true },
  },

  // Auth
  {
    path: "/auth/login",
    name: "Login",
    component: Login,
    meta: { title: "Login" + appname, hideNav: true },
  },
  {
    path: "/auth/register",
    name: "Register",
    component: Register,
    meta: { title: "Register" + appname, hideNav: true },
  },
  {
    path: "/auth/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
    meta: { title: "Forgot Password" + appname, hideNav: true },
  },

  // Error pages
  {
    path: "/500",
    name: "Page500",
    component: Page500,
    meta: { title: "Server internal Error" + appname, hideNav: true },
  },
  {
    path: "/maintenance",
    name: "maintenance",
    component: PageMaintenance,
    meta: { title: "Maintenance" + appname, hideNav: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "Page404",
    component: Page404,
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

  const token = localStorage.getItem("token");
  const isAuthRoute = to.path.startsWith("/auth") || to.path === "/500" || to.path === "/maintenance";

  if (!token && !isAuthRoute) {
    // Unauthenticated user attempting to access protected route -> redirect to clean login url
    return next({ path: "/auth/login" });
  }

  if (token && (to.path === "/auth/login" || to.path === "/auth/register")) {
    // Already authenticated user visiting login/register -> redirect to dashboard
    return next({ path: "/" });
  }

  next();
});

export default router;
