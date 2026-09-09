/**
 * EduHub Core Security — Permission Types
 * Synced 1:1 with backend Permission.code format (docs/MODULE_PERMISSION_CONTRACT.md)
 */

export type CanonicalPermissionCode =
  | "*"
  | "students.*"
  | "students.view"
  | "students.create"
  | "students.update"
  | "students.delete"
  | "students.export"
  | "groups.*"
  | "groups.view"
  | "groups.create"
  | "groups.update"
  | "groups.delete"
  | "courses.*"
  | "courses.view"
  | "courses.create"
  | "courses.update"
  | "courses.delete"
  | "payments.*"
  | "payments.view"
  | "payments.create"
  | "payments.refund"
  | "payments.delete"
  | "attendance.*"
  | "attendance.view"
  | "attendance.create"
  | "attendance.update"
  | "leads.*"
  | "leads.view"
  | "leads.create"
  | "leads.update"
  | "leads.delete"
  | "crm.*"
  | "crm.view"
  | "crm.create"
  | "crm.update"
  | "crm.delete"
  | "crm.pipelines"
  | "crm.convert"
  | "branches.*"
  | "branches.view"
  | "branches.create"
  | "rooms.manage"
  | "reports.view"
  | "notifications.view"
  | "settings.manage";

export type PermissionCode = CanonicalPermissionCode | string;

export interface UserPermissionContext {
  id?: string;
  role?: string;
  permissions?: string[];
}

export interface PermissionCheckOptions {
  requireAll?: boolean;
}
