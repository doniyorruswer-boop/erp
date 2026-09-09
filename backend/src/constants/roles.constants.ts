/**
 * EduHub Backend User Roles Constants
 */

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  BRANCH_MANAGER: "BRANCH_MANAGER",
  MANAGER: "MANAGER",
  TEACHER: "TEACHER",
  MENTOR: "MENTOR",
  CASHIER: "CASHIER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
  STAFF: "STAFF",
  RECEPTIONIST: "RECEPTIONIST",
  GUEST: "GUEST",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["*"],
  BRANCH_MANAGER: [
    "students.*",
    "groups.*",
    "courses.*",
    "attendance.*",
    "payments.*",
    "leads.*",
    "crm.*",
    "rooms.*",
    "reports.view",
    "branches.view",
    "notifications.view",
  ],
  MANAGER: [
    "students.view",
    "students.create",
    "students.update",
    "groups.view",
    "courses.view",
    "attendance.view",
    "leads.view",
    "leads.create",
    "leads.update",
    "crm.view",
    "crm.create",
    "crm.update",
    "crm.convert",
    "payments.view",
    "payments.create",
    "reports.view",
    "rooms.manage",
    "notifications.view",
  ],
  TEACHER: [
    "groups.view",
    "attendance.view",
    "attendance.create",
    "students.view",
    "courses.view",
    "notifications.view",
  ],
  CASHIER: [
    "payments.view",
    "payments.create",
    "students.view",
    "groups.view",
    "reports.view",
    "notifications.view",
  ],
  STUDENT: ["students.view", "groups.view", "attendance.view", "notifications.view"],
};

export default USER_ROLES;
