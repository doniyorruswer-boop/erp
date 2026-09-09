/**
 * EduHub Core Security — usePermission Composable
 * Vue 3 Composition API utility for checking user permissions in components
 */
import { computed } from "vue";

import { permissionAdapter } from "./permission.adapter";
import type { PermissionCode } from "./permission.types";

export function usePermission() {
  const permissions = computed<string[]>(() => permissionAdapter.getPermissions());

  const hasPermission = (code: PermissionCode): boolean => {
    return permissionAdapter.hasPermission(code);
  };

  const hasAnyPermission = (codes: PermissionCode[]): boolean => {
    return permissionAdapter.hasAnyPermission(codes);
  };

  const hasAllPermissions = (codes: PermissionCode[]): boolean => {
    return permissionAdapter.hasAllPermissions(codes);
  };

  const isSuperAdmin = computed<boolean>(() => {
    return permissionAdapter.hasPermission("*");
  });

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can: hasPermission,
    isSuperAdmin,
  };
}

export default usePermission;
