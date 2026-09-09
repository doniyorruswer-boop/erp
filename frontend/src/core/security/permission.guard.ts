/**
 * EduHub Core Security — Route Permission Guard
 * Checks route metadata (meta.permission / meta.permissions) against PermissionAdapter
 */
import type { RouteLocationNormalized } from "vue-router";

import { permissionAdapter } from "./permission.adapter";
import type { PermissionCode } from "./permission.types";

/**
 * Checks if current user has necessary permissions for the target route.
 * @param to Target route location
 * @returns true if allowed, false if forbidden
 */
export function isRoutePermitted(to: RouteLocationNormalized): boolean {
  const singlePerm = to.meta?.permission as PermissionCode | undefined;
  if (singlePerm) {
    return permissionAdapter.hasPermission(singlePerm);
  }

  const multiPerms = to.meta?.permissions as PermissionCode[] | undefined;
  if (Array.isArray(multiPerms) && multiPerms.length > 0) {
    return permissionAdapter.hasAnyPermission(multiPerms);
  }

  return true;
}

export default isRoutePermitted;
