/**
 * EduHub Core Security — v-permission Directive
 * Conditionally controls element visibility based on user permissions
 * Usage:
 *   <button v-permission="'students.create'">Add Student</button>
 *   <button v-permission="['students.export', 'students.view']">Export</button>
 */
import type { Directive, DirectiveBinding } from "vue";

import { permissionAdapter } from "./permission.adapter";
import type { PermissionCode } from "./permission.types";

function applyPermission(
  el: HTMLElement,
  binding: DirectiveBinding<PermissionCode | PermissionCode[]>
): void {
  const { value, modifiers } = binding;
  if (!value) return;

  const allowed = Array.isArray(value)
    ? permissionAdapter.hasAnyPermission(value)
    : permissionAdapter.hasPermission(value);

  if (!allowed) {
    if (modifiers.remove && el.parentNode) {
      el.parentNode.removeChild(el);
    } else {
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
    }
  } else if (el.style.display === "none") {
    el.style.display = "";
    el.removeAttribute("aria-hidden");
  }
}

export const vPermission: Directive<HTMLElement, PermissionCode | PermissionCode[]> = {
  mounted(el, binding) {
    applyPermission(el, binding);
  },
  updated(el, binding) {
    applyPermission(el, binding);
  },
};

export default vPermission;
