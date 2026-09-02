# 🛡️ PHASE 3: STEP 1 — RBAC AUDIT & ARCHITECTURE INVENTORY

## 1. Audit of Existing RBAC Components

### Guards & Decorators
| Component | File Path | Current Status | Finding / Action Required |
| :--- | :--- | :--- | :--- |
| **`PermissionsGuard`** | `backend/src/auth/permissions.guard.ts` | **Active** (Used across all controllers) | Authoritative guard. Checks DB `customRole` first, then falls back to `defaultRolePerms`. <br>⚠️ **Vulnerability found:** Line 162 sets `isOrgAdmin = dominantScope === PermissionScope.ORGANIZATION`, which inadvertently gave CASHIER org-admin bypass. Must be restricted strictly to `SUPER_ADMIN` and `ADMIN`. |
| **`RolesGuard`** | `backend/src/auth/roles.guard.ts` | **Dead Code** (Registered in `auth.module.ts`, but 0 controllers use it) | High risk of accidental usage bypassing granular permissions. **Action:** Remove or absorb into `PermissionsGuard`. |
| **`@RequirePermissions`** | `backend/src/auth/permissions.decorator.ts` | **Active** (130+ endpoints decorated) | Sets metadata `PERMISSIONS_KEY = 'permissions'`. |
| **`@Roles`** | `backend/src/auth/roles.decorator.ts` | **Dead Code** (0 usages) | **Action:** Deprecate/remove to prevent confusion with `@RequirePermissions`. |
| **`@CurrentTenant`** | `backend/src/auth/tenant.decorator.ts` | **Hardened in Phase 1** | Reads strictly from `request.user.organizationId`. |
| **`@CurrentBranch`** | `backend/src/auth/branch.decorator.ts` | **Hardened in Phase 2** | Extracts secure `BranchContext`. |

---

## 2. Database Models & Schema Audit (`prisma/schema.prisma`)

1. **`Role` Enum**:
   ```prisma
   enum Role {
     SUPER_ADMIN
     ADMIN
     BRANCH_MANAGER
     MANAGER
     TEACHER
     CASHIER
     STUDENT
   }
   ```
2. **`PermissionScope` Enum**:
   ```prisma
   enum PermissionScope {
     ORGANIZATION  // Access across entire tenant
     BRANCH        // Access restricted to user's assigned branches
     OWN           // Access restricted to user's own resources
   }
   ```
3. **`model CustomRole`**:
   - Fields: `id`, `organizationId`, `name`, `description`, `isSystem`, `permissions: RolePermission[]`, `users: User[]`.
   - Tenant-isolated via `organizationId`.
4. **`model Permission`**:
   - Fields: `id`, `code` (e.g. `'students.view'`), `module` (e.g. `'STUDENTS'`), `description`.
5. **`model RolePermission`**:
   - Fields: `id`, `roleId`, `permissionId`, `scope: PermissionScope` (Default: `ORGANIZATION`).

---

## 3. Current Authorization Flow

```text
HTTP Request
     ↓
JwtAuthGuard (Validates Bearer token, populates request.user: { id, email, organizationId, role })
     ↓
CurrentTenant Decorator (Ensures request.user.organizationId exists)
     ↓
PermissionsGuard
     ├── 1. If user.role in [SUPER_ADMIN, ADMIN]
     │      → Grants org-wide bypass (permissionScope = ORGANIZATION, isOrgAdmin = true)
     │
     ├── 2. Fetch dbUser from Database (with customRole.permissions & userBranches)
     │
     ├── 3. Determine Granted Permission Codes:
     │      ├── Priority A: dbUser.customRole exists → ONLY read permissions from DB (customRole.permissions)
     │      └── Priority B: dbUser.customRole is null → Fallback to hardcoded defaultRolePerms
     │
     ├── 4. Evaluate Required Permissions against Granted Codes (supports '*' and module.* wildcards)
     │      └── If missing → 403 Forbidden ("Sizda ushbu amalni bajarish uchun ruxsat yo'q")
     │
     └── 5. Set request.permissionScope & request.userBranches
     ↓
CurrentBranch Decorator (Generates BranchContext from request.permissionScope & request.userBranches)
     ↓
Controller Handler
     ↓
Service Method (Enforces mandatory orgId, branchWhere, assertBranchAccess, and cross-branch relations)
     ↓
Database Query (Prisma)
```

---

## 4. Complete Permission Inventory (from `roles.service.ts` & Controllers)

### Students Module (`STUDENTS`)
- `students.view` — View student profiles, details, progress, balance
- `students.create` — Register new students
- `students.update` — Edit student details, freeze, unfreeze, graduate
- `students.delete` — Soft delete & restore students
- `students.export` — Export student data to CSV/Excel

### Groups Module (`GROUPS`)
- `groups.view` — View groups, rosters, group details
- `groups.create` — Create new group
- `groups.update` — Update group, change room, add/remove/transfer students
- `groups.delete` — Soft delete & restore groups

### Courses Module (`COURSES`)
- `courses.view` — View courses and curriculum
- `courses.create` — Create new course
- `courses.update` — Edit course details, price, lessons
- `courses.delete` — Soft delete & restore courses

### Finance & Payments Module (`FINANCE`)
- `payments.view` — View payments, cashboxes, invoices, transactions
- `payments.create` — Accept payments, generate receipts
- `payments.refund` — Issue payment refunds
- `payments.delete` — Void payments, delete invoices, remove cashboxes

### Attendance Module (`ATTENDANCE`)
- `attendance.view` — View daily & monthly attendance
- `attendance.create` — Take attendance, mark present/absent/late

### CRM & Leads Module (`CRM`)
- `leads.view` — View leads and sales pipeline kanban
- `leads.create` — Create new leads
- `leads.update` — Update lead details, change stages
- `leads.delete` — Delete/restore leads
- `crm.view` — View customer profiles, notes, activities
- `crm.create` — Create customers, tasks, notes
- `crm.update` — Edit customer profiles, tasks
- `crm.delete` — Delete CRM records
- `crm.pipelines` — Manage pipelines and stages
- `crm.convert` — Convert lead into customer and student

### Branches & Resources Module (`BRANCHES` / `RESOURCES`)
- `branches.view` — View branch list and details
- `branches.create` — Create/update branches, assign staff
- `rooms.manage` — Manage rooms, equipment, vehicles

### Reports, Analytics & Settings (`REPORTS` / `SETTINGS`)
- `reports.view` — View financial reports, academic dashboard, widgets
- `settings.manage` — Organization settings, user management, custom roles & permissions

---

## 5. Specific Vulnerabilities Identified to Resolve in Phase 3

1. **Dead `RolesGuard` Removal / Unification**:
   - `roles.guard.ts` should be retired and removed from `auth.module.ts` providers/exports to prevent future bypasses of granular permissions.
2. **`isOrgAdmin` Flaw in `permissions.guard.ts`**:
   - Line 162 currently says `request.isOrgAdmin = dominantScope === PermissionScope.ORGANIZATION;`.
   - This must be corrected so that only real tenant administrators (`Role.SUPER_ADMIN`, `Role.ADMIN`) have `isOrgAdmin = true`.
3. **Privilege Escalation in `users.service.ts`**:
   - Block assigning `SUPER_ADMIN` or `ADMIN` roles unless the caller themselves is an authorized administrator.
   - Block users from modifying their own roles.
4. **Dual Source of Truth Priority Verification**:
   - Test and guarantee that when `customRole` is present on a user, the system strictly uses the DB role permissions and never leaks back to `defaultRolePerms`.
