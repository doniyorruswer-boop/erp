/**
 * EduHub Core Security — Permission Adapter
 * Bridges backend RBAC (PermissionsGuard) into frontend state
 */
import { ref } from "vue";

import type { PermissionCode, UserPermissionContext } from "./permission.types";

/**
 * Backend fallback permissions for built-in roles (matches backend DEFAULT_ROLE_PERMISSIONS 1:1)
 */
export const BACKEND_DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
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

export class PermissionAdapter {
  private activePermissions = ref<string[]>([]);

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage(): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const user = JSON.parse(rawUser) as UserPermissionContext;
        this.syncFromUser(user);
      }
    } catch {
      // Ignore storage parse error
    }
  }

  public setPermissions(permissions: string[]): void {
    this.activePermissions.value = Array.isArray(permissions) ? [...permissions] : [];
  }

  public getPermissions(): string[] {
    return [...this.activePermissions.value];
  }

  public hasPermission(required: PermissionCode): boolean {
    if (!required) return true;
    const list = this.activePermissions.value;
    if (list.length === 0) return false;

    return list.some((granted) => {
      if (granted === "*") return true;
      if (granted === required) return true;
      if (granted.endsWith(".*")) {
        const prefix = granted.slice(0, -2);
        return required.startsWith(prefix + ".");
      }
      return false;
    });
  }

  public hasAnyPermission(permissions: PermissionCode[]): boolean {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some((p) => this.hasPermission(p));
  }

  public hasAllPermissions(permissions: PermissionCode[]): boolean {
    if (!permissions || permissions.length === 0) return true;
    return permissions.every((p) => this.hasPermission(p));
  }

  public syncFromUser(user: UserPermissionContext | null): void {
    if (!user) {
      this.reset();
      return;
    }

    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
      this.setPermissions(user.permissions);
      return;
    }

    if (user.role && BACKEND_DEFAULT_ROLE_PERMISSIONS[user.role]) {
      this.setPermissions(BACKEND_DEFAULT_ROLE_PERMISSIONS[user.role]);
      return;
    }

    this.reset();
  }

  public reset(): void {
    this.activePermissions.value = [];
  }
}

export const permissionAdapter = new PermissionAdapter();
export default permissionAdapter;
