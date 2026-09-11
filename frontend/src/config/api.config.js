/**
 * EduHub Central API Configuration & Endpoint Registry
 * Manages server base URLs, request timeouts, and complete endpoint routing.
 */

import { STORAGE_KEYS } from "@/constants/storage.constants";
import { TIME_CONSTANTS } from "@/constants/time.constants";

import { ENV_CONFIG } from "./env.config";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  DASHBOARD: {
    STATS: "/dashboard/stats",
    WIDGETS: "/dashboard/widgets",
    PAYMENT_STATS: "/dashboard/payment-stats",
  },
  STUDENTS: {
    BASE: "/students",
    RESTORE: (id) => `/students/${id}/restore`,
  },
  COURSES: {
    BASE: "/courses",
    RESTORE: (id) => `/courses/${id}/restore`,
  },
  GROUPS: {
    BASE: "/groups",
    RESTORE: (id) => `/groups/${id}/restore`,
    STUDENTS: (groupId) => `/groups/${groupId}/students`,
    STUDENT_DETAIL: (groupId, studentId) => `/groups/${groupId}/students/${studentId}`,
    GENERATE_LESSONS: (groupId) => `/groups/${groupId}/generate-lessons`,
  },
  ATTENDANCE: {
    BASE: "/attendance",
    MONTHLY: "/attendance/monthly",
  },
  PAYMENTS: {
    BASE: "/payments",
    SUMMARY: "/payments/summary",
    VOID: (id) => `/payments/${id}/void`,
    REFUND: (id) => `/payments/${id}/refund`,
  },
  CONTRACTS: {
    BASE: "/contracts",
  },
  LEADS: {
    BASE: "/leads",
    KANBAN: "/leads/kanban",
    STAGES: "/leads/stages",
  },
  USERS: {
    BASE: "/users",
  },
  ROLES: {
    BASE: "/roles",
  },
  ROOMS: {
    BASE: "/rooms",
  },
  EMPLOYEES: {
    BASE: "/employees",
  },
  CUSTOM_FIELDS: {
    BASE: "/custom-fields",
  },
  CRM: {
    PIPELINES: "/crm/pipelines",
    CUSTOMERS: "/crm/customers",
    ACTIVITIES: "/crm/activities",
    TASKS: "/crm/tasks",
    NOTES: "/crm/notes",
  },
  SETUP: {
    STATUS: "/setup/status",
    ORGANIZATIONS: "/setup/organizations",
    SWITCH: "/setup/switch",
    INITIALIZE: "/setup/initialize",
    CONFIG: "/setup/config",
  },
  AUDIT: {
    BASE: "/audit",
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
  },
  BRANCHES: {
    BASE: "/branches",
  },
  RESOURCES: {
    BASE: "/resources",
  },
  SCHEDULES: {
    BASE: "/schedules",
  },
  FINANCE: {
    BASE: "/finance",
    SUMMARY: "/finance/summary",
    INVOICES: "/finance/invoices",
    CASHBOXES: "/finance/cashboxes",
    EXPENSES: "/finance/expenses",
    CATALOG: "/finance/catalog",
    TRANSACTIONS: "/finance/transactions",
  },
  JOBS: {
    BASE: "/jobs",
  },
  DATA_TRANSFER: {
    IMPORT_PREVIEW: "/data-transfer/import/preview",
    IMPORT_CONFIRM: "/data-transfer/import/confirm",
    EXPORT: (entity) => `/data-transfer/export/${entity}`,
  },
  SUBSCRIPTIONS: {
    BASE: "/subscriptions",
    PLANS: "/subscriptions/plans",
    CURRENT: "/subscriptions/current",
  },
  WORKFLOWS: {
    BASE: "/workflows",
  },
  EXAMS: {
    BASE: "/exams",
  },
  LESSONS: {
    BASE: "/lessons",
  },
  PARENTS: {
    BASE: "/parents",
  },
};

export const EXTERNAL_URLS = {
  CRM_LEAD: ENV_CONFIG.CRM_LEAD_PORTAL_URL,
  CRM_LEAD_GENERATOR: (code) => `${ENV_CONFIG.CRM_LEAD_PORTAL_URL}?source=${code}`,
};

export const API_CONFIG = {
  // Asosiy Backend URL manzili
  BASE_URL:
    ENV_CONFIG.API_URL ||
    (typeof window !== "undefined" &&
      (localStorage.getItem(STORAGE_KEYS.API_URL) ||
        localStorage.getItem(STORAGE_KEYS.LEGACY_API_URL))) ||
    "http://localhost:3000/api",

  // So'rov kutish vaqti (ms)
  TIMEOUT: TIME_CONSTANTS.API_TIMEOUT,

  // Barcha API Endpointlari
  ENDPOINTS: API_ENDPOINTS,

  // Tashqi URL manzillar
  EXTERNAL_URLS,
};

export function getApiBaseUrl() {
  return API_CONFIG.BASE_URL;
}

export function setApiBaseUrl(newUrl) {
  if (!newUrl) return;
  API_CONFIG.BASE_URL = newUrl.replace(/\/+$/, "");
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.LEGACY_API_URL, API_CONFIG.BASE_URL);
  }
}

export default API_CONFIG;
