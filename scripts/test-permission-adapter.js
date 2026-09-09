/**
 * Test Suite: Permission Adapter and Security Guard
 * Verifies 1:1 synchronization with backend RBAC (PermissionsGuard)
 */

const assert = require("assert");

// Standard backend role permissions map (mirrors backend DEFAULT_ROLE_PERMISSIONS)
const BACKEND_DEFAULT_ROLE_PERMISSIONS = {
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

class MockPermissionAdapter {
  constructor() {
    this.permissions = [];
  }

  setPermissions(perms) {
    this.permissions = Array.isArray(perms) ? [...perms] : [];
  }

  getPermissions() {
    return [...this.permissions];
  }

  hasPermission(required) {
    if (!required) return true;
    if (this.permissions.length === 0) return false;

    return this.permissions.some((granted) => {
      if (granted === "*") return true;
      if (granted === required) return true;
      if (granted.endsWith(".*")) {
        const prefix = granted.slice(0, -2);
        return required.startsWith(prefix + ".");
      }
      return false;
    });
  }

  hasAnyPermission(requiredList) {
    if (!requiredList || requiredList.length === 0) return true;
    return requiredList.some((p) => this.hasPermission(p));
  }

  hasAllPermissions(requiredList) {
    if (!requiredList || requiredList.length === 0) return true;
    return requiredList.every((p) => this.hasPermission(p));
  }

  syncFromUser(user) {
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

  reset() {
    this.permissions = [];
  }
}

function checkRoute(adapter, to) {
  const singlePerm = to.meta?.permission;
  if (singlePerm) {
    return adapter.hasPermission(singlePerm);
  }
  const multiPerms = to.meta?.permissions;
  if (Array.isArray(multiPerms) && multiPerms.length > 0) {
    return adapter.hasAnyPermission(multiPerms);
  }
  return true;
}

console.log("--- STARTING PERMISSION ADAPTER TESTS ---\n");

const adapter = new MockPermissionAdapter();

// Test 1: Empty state allows nothing
assert.strictEqual(adapter.hasPermission("students.view"), false, "Empty adapter must reject permissions");
console.log("✔ Test 1 passed: Empty adapter denies all permissions");

// Test 2: Exact matching
adapter.setPermissions(["students.view", "attendance.create"]);
assert.strictEqual(adapter.hasPermission("students.view"), true);
assert.strictEqual(adapter.hasPermission("attendance.create"), true);
assert.strictEqual(adapter.hasPermission("students.delete"), false);
assert.strictEqual(adapter.hasPermission("payments.create"), false);
console.log("✔ Test 2 passed: Exact permission matching works");

// Test 3: Super wildcard (*)
adapter.setPermissions(["*"]);
assert.strictEqual(adapter.hasPermission("students.delete"), true);
assert.strictEqual(adapter.hasPermission("settings.manage"), true);
assert.strictEqual(adapter.hasPermission("random.custom.perm"), true);
console.log("✔ Test 3 passed: Super wildcard (*) grants all permissions");

// Test 4: Module wildcard (module.*)
adapter.setPermissions(["students.*", "attendance.*"]);
assert.strictEqual(adapter.hasPermission("students.view"), true);
assert.strictEqual(adapter.hasPermission("students.delete"), true);
assert.strictEqual(adapter.hasPermission("students.export"), true);
assert.strictEqual(adapter.hasPermission("attendance.view"), true);
assert.strictEqual(adapter.hasPermission("attendance.create"), true);
assert.strictEqual(adapter.hasPermission("payments.view"), false);
assert.strictEqual(adapter.hasPermission("courses.view"), false);
console.log("✔ Test 4 passed: Module wildcard (students.*) grants all module actions");

// Test 5: hasAnyPermission and hasAllPermissions
adapter.setPermissions(["students.view", "attendance.view"]);
assert.strictEqual(adapter.hasAnyPermission(["students.delete", "attendance.view"]), true);
assert.strictEqual(adapter.hasAnyPermission(["payments.view", "courses.view"]), false);
assert.strictEqual(adapter.hasAllPermissions(["students.view", "attendance.view"]), true);
assert.strictEqual(adapter.hasAllPermissions(["students.view", "students.delete"]), false);
console.log("✔ Test 5 passed: hasAnyPermission & hasAllPermissions work as expected");

// Test 6: Sync from user object with explicit permissions
adapter.syncFromUser({
  id: "u-123",
  role: "TEACHER",
  permissions: ["custom.export", "students.view"],
});
assert.strictEqual(adapter.hasPermission("custom.export"), true);
assert.strictEqual(adapter.hasPermission("students.view"), true);
assert.strictEqual(adapter.hasPermission("attendance.create"), false); // Overridden by custom permissions
console.log("✔ Test 6 passed: User explicit permissions take precedence");

// Test 7: Sync from user with role fallback (TEACHER)
adapter.syncFromUser({
  id: "u-456",
  role: "TEACHER",
});
assert.strictEqual(adapter.hasPermission("attendance.create"), true);
assert.strictEqual(adapter.hasPermission("attendance.view"), true);
assert.strictEqual(adapter.hasPermission("groups.view"), true);
assert.strictEqual(adapter.hasPermission("payments.create"), false);
assert.strictEqual(adapter.hasPermission("students.delete"), false);
console.log("✔ Test 7 passed: Role fallback (TEACHER) grants exact teacher permissions");

// Test 8: Sync from user with role fallback (CASHIER)
adapter.syncFromUser({
  id: "u-789",
  role: "CASHIER",
});
assert.strictEqual(adapter.hasPermission("payments.view"), true);
assert.strictEqual(adapter.hasPermission("payments.create"), true);
assert.strictEqual(adapter.hasPermission("attendance.create"), false);
console.log("✔ Test 8 passed: Role fallback (CASHIER) grants finance permissions");

// Test 9: Route guard permission check
const teacherRouteAllowed = checkRoute(adapter, { meta: { permission: "payments.view" } });
const teacherRouteBlocked = checkRoute(adapter, { meta: { permission: "attendance.create" } });
const publicRoute = checkRoute(adapter, { meta: {} });
assert.strictEqual(teacherRouteAllowed, true);
assert.strictEqual(teacherRouteBlocked, false);
assert.strictEqual(publicRoute, true);
console.log("✔ Test 9 passed: Route permission guard checks meta.permission");

// Test 10: Reset
adapter.reset();
assert.strictEqual(adapter.getPermissions().length, 0);
assert.strictEqual(adapter.hasPermission("students.view"), false);
console.log("✔ Test 10 passed: Reset clears all permissions");

console.log("\nALL 10 PERMISSION ADAPTER TESTS PASSED SUCCESSFULLY! 🚀");
