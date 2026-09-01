import { createRouter, createWebHistory } from "vue-router";

// EduCRM Pages
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
import CrmSettings from "../views/settings/CrmSettings.vue";

// Component Pages
import Valert from "../views/components/alert.vue";
import Vaccrodion from "../views/components/accordion.vue";
import Vbadges from "../views/components/badges.vue";
import Vbreadcumb from "../views/components/breadcumbs.vue";
import Vbutton from "../views/components/button.vue";
import Vcard from "../views/components/card.vue";
import Vdropdown from "../views/components/dropdown.vue";
import Vmodal from "../views/components/modal.vue";
import Login from "../views/layouts/auth/Login.vue";
import Register from "../views/layouts/auth/Register.vue";
import ForgotPassword from "../views/layouts/auth/forgot-password.vue";

// layouts
import Blank from "../views/layouts/Blank.vue";

// error page
import Page404 from "../views/layouts/error/404.vue";
import Page500 from "../views/layouts/error/500.vue";
import PageMaintenance from "../views/layouts/error/maintenance.vue";
import Tables from "../views/tables.vue";

var appname = " - EduHub";

const routes = [
  // EduCRM Core Routes
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
    path: "/setup",
    name: "SetupWizard",
    component: SetupWizard,
    meta: { title: "Setup Wizard" + appname, hideNav: true },
  },

  // Components based Routes
  {
    path: "/component/alert",
    name: "Valert",
    component: Valert,
    meta: { title: "Alert" + appname },
  },
  {
    path: "/component/accordion",
    name: "Vaccordion",
    component: Vaccrodion,
    meta: { title: "Accordion" + appname },
  },
  {
    path: "/component/badge",
    name: "Vbadge",
    component: Vbadges,
    meta: { title: "Badge" + appname },
  },
  {
    path: "/component/breadcumb",
    name: "Vbreadcumb",
    component: Vbreadcumb,
    meta: { title: "Breadcumb" + appname },
  },
  {
    path: "/component/button",
    name: "Vbutton",
    component: Vbutton,
    meta: { title: "Button" + appname },
  },
  {
    path: "/component/card",
    name: "Vcard",
    component: Vcard,
    meta: { title: "Card" + appname },
  },
  {
    path: "/component/dropdown",
    name: "Vdropdown",
    component: Vdropdown,
    meta: { title: "Dropdown" + appname },
  },
  {
    path: "/component/modal",
    name: "Vmodal",
    component: Vmodal,
    meta: { title: "Modal" + appname },
  },

  // Layouts & Auth
  {
    path: "/blank",
    name: "Blank Page",
    component: Blank,
    meta: { title: "Blank Page" + appname },
  },
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
    path: "/tables",
    name: "Tables",
    component: Tables,
    meta: { title: "Tables" + appname },
  },
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
  document.title = to.meta.title || "EduHub";

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
