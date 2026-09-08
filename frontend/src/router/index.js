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
import PaymentStatsView from "../views/finance/PaymentStatsView.vue";
import PaymentMonthDetailView from "../views/finance/PaymentMonthDetailView.vue";
import CalendarView from "../views/calendar/CalendarView.vue";
import SetupWizard from "../views/setup/SetupWizard.vue";
import SchoolClassesView from "../views/school/SchoolClassesView.vue";
import SchoolClassDetailView from "../views/school/SchoolClassDetailView.vue";
import SchoolLevelsView from "../views/school/SchoolLevelsView.vue";
import SchoolStudentsView from "../views/school/SchoolStudentsView.vue";
import SchoolParentsView from "../views/school/SchoolParentsView.vue";
import SchoolDroppedView from "../views/school/SchoolDroppedView.vue";
import ContractsList from "../views/contracts/ContractsList.vue";
import EmployeesList from "../views/hr/EmployeesList.vue";
import CrmSettings from "../views/settings/CrmSettings.vue";
import UsersList from "../views/users/UsersList.vue";
import RolesList from "../views/roles/RolesList.vue";
import AuditLogsList from "../views/audit/AuditLogsList.vue";
import NotificationsList from "../views/notifications/NotificationsList.vue";
import SubscriptionsView from "../views/subscriptions/SubscriptionsView.vue";
import ScheduleView from "../views/education/ScheduleView.vue";
import ClassScheduleView from "../views/education/ClassScheduleView.vue";
import ReplaceTeacherView from "../views/education/ReplaceTeacherView.vue";
import GradebookView from "../views/education/GradebookView.vue";
import FinalGradesView from "../views/education/FinalGradesView.vue";
import AcademicActionsView from "../views/education/AcademicActionsView.vue";

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
    path: "/payment-stats",
    name: "PaymentStats",
    component: PaymentStatsView,
    meta: { title: "To'lovlar statistikasi" + appname },
  },
  {
    path: "/payment-stats/month/:monthKey",
    name: "PaymentMonthDetail",
    component: PaymentMonthDetailView,
    meta: { title: "Oylik To'lovlar Tahlili" + appname },
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
    alias: ["/education/classes"],
    name: "SchoolClasses",
    component: SchoolClassesView,
    meta: { title: "Sinflar" + appname },
  },
  {
    path: "/school/classes/:id",
    alias: ["/education/classes/:id"],
    name: "SchoolClassDetail",
    component: SchoolClassDetailView,
    meta: { title: "O'quvchilar ro'yxati" + appname },
  },
  {
    path: "/school/levels",
    alias: ["/levels", "/education/levels", "/school/groups"],
    name: "SchoolLevels",
    component: SchoolLevelsView,
    meta: { title: "Darajalar va to'garaklar" + appname },
  },
  {
    path: "/school/students",
    alias: ["/education/students"],
    name: "SchoolStudents",
    component: SchoolStudentsView,
    meta: { title: "O'quvchilar" + appname },
  },
  {
    path: "/school/parents",
    alias: ["/parents", "/education/parents"],
    name: "SchoolParents",
    component: SchoolParentsView,
    meta: { title: "Ota-onalar" + appname },
  },
  {
    path: "/school/dropped",
    alias: ["/dropped", "/school/withdrawn", "/education/dropped", "/school/chetlatilganlar"],
    name: "SchoolDroppedStudents",
    component: SchoolDroppedView,
    meta: { title: "Chetlatilganlar" + appname },
  },
  {
    path: "/education/schedule",
    alias: ["/school/schedule", "/schedule"],
    name: "EducationSchedule",
    component: ScheduleView,
    meta: { title: "Dars jadvali" + appname },
  },
  {
    path: "/education/schedule/class/:classId",
    alias: [
      "/education/class-schedule/:classId",
      "/education/class-schedule/:quarter/:dates/:classId",
    ],
    name: "EducationClassScheduleDetail",
    component: ClassScheduleView,
    meta: { title: "Dars jadvali - Sinf ko'rinishi" + appname },
  },
  {
    path: "/education/replace-teacher",
    alias: ["/school/replace-teacher"],
    name: "EducationReplaceTeacher",
    component: ReplaceTeacherView,
    meta: { title: "O'qituvchini almashtirish" + appname },
  },
  {
    path: "/education/gradebook",
    alias: ["/school/gradebook"],
    name: "EducationGradebook",
    component: GradebookView,
    meta: { title: "Baholar jurnali" + appname },
  },
  {
    path: "/education/final-grades",
    alias: ["/school/final-grades"],
    name: "EducationFinalGrades",
    component: FinalGradesView,
    meta: { title: "Yakuniy baholar" + appname },
  },
  {
    path: "/education/academic-actions",
    alias: ["/school/academic-actions"],
    name: "EducationAcademicActions",
    component: AcademicActionsView,
    meta: { title: "Akademik harakatlar" + appname },
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
