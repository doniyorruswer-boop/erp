# PHASE 3 — RBAC + PERMISSION + SCOPE HARDENING

PHASE 1 — STRICT MULTI-TENANCY has been completed.

PHASE 2 — STRICT BRANCH ISOLATION has been completed.

Now implement PHASE 3.

This is a SECURITY-CRITICAL authorization phase.

DO NOT add new business features.

DO NOT implement Education-specific features.

DO NOT implement Driving School features.

DO NOT redesign or replace the Windzo UI.

DO NOT rewrite the architecture unnecessarily.

Preserve all security guarantees from PHASE 1 and PHASE 2.

---

# PRIMARY OBJECTIVE

Create a reliable authorization system based on:

```text
Authenticated User
        ↓
Organization
        ↓
Branch Access
        ↓
Role
        ↓
Permission
        ↓
Permission Scope
        ↓
Resource / Action
```

Authentication answers:
"Who is the user?"

Multi-tenancy answers:
"Which organization does the user belong to?"

Branch isolation answers:
"Which branches can the user access?"

RBAC answers:
"What can the user do?"

Permission scope answers:
"Where can the user perform that action?"

All four layers must work together.

---

# CRITICAL SECURITY RULE

Frontend authorization is NOT security.

The following are only UI conveniences:
* hiding menu items
* hiding buttons
* disabling buttons
* route guards
* checking Pinia state
* checking localStorage
* checking frontend permissions

The backend MUST remain authoritative.

Every protected API endpoint must enforce authorization server-side.

---

# STEP 1 — AUDIT CURRENT RBAC

Before changing anything, inspect the actual repository.

Find and document:
* RolesGuard
* PermissionsGuard
* decorators
* @Roles
* @Permissions
* Permission model
* PermissionScope
* Role model
* CustomRole
* UserRole
* User permissions
* branch permissions
* organization permissions
* JWT claims
* authentication guards
* authorization guards

Do NOT assume existing architecture.
Use the actual repository.

---

# STEP 2 — DOCUMENT CURRENT AUTHORIZATION FLOW

Create the actual current flow:

```text
Request
 ↓
JWT
 ↓
Authenticated User
 ↓
Organization
 ↓
Branch Access
 ↓
Role
 ↓
Permission
 ↓
Controller
 ↓
Service
 ↓
Database
```

Identify where authorization currently happens.
Identify where authorization is missing.
Do NOT immediately rewrite the system.

---

# STEP 3 — PERMISSION INVENTORY

Build a complete permission inventory from the existing project.

Inspect modules such as:
* users
* roles
* students
* parents
* teachers
* courses
* groups
* attendance
* contracts
* payments
* invoices
* expenses
* CRM
* customers
* leads
* pipelines
* activities
* tasks
* resources
* rooms
* scheduling
* notifications
* reports
* dashboard
* settings
* custom fields
* import/export
* subscriptions
* workflow

Use existing permission naming conventions where available.
Do not create hundreds of unnecessary permissions.

---

# STEP 4 — PERMISSION FORMAT

Prefer granular permissions following the existing architecture.

Conceptually:
```text
students.view
students.create
students.update
students.delete
students.export

groups.view
groups.create
groups.update
groups.delete

attendance.view
attendance.create
attendance.update

payments.view
payments.create
payments.refund

invoices.view
invoices.create
invoices.update

reports.view
settings.manage
users.manage
roles.manage
```

Do NOT blindly create these exact permissions if the repository already has a different convention.
Preserve existing terminology where possible.

---

# STEP 5 — SEPARATE ROLE FROM PERMISSION

Do NOT use role names as the primary security mechanism.

Avoid architecture such as:
```typescript
if (user.role === 'TEACHER') {
   ...
}
```
when a permission system can express the requirement.

Prefer:
```text
permission:
students.view
```
and:
```text
permission:
attendance.update
```

Roles should group permissions.
Custom roles must work through the same permission mechanism.

---

# STEP 6 — PERMISSION SCOPE

Inspect the existing PermissionScope implementation.

Determine whether the project supports concepts such as:
```text
GLOBAL
ORGANIZATION
BRANCH
OWN
```
or equivalent.

Do NOT invent a new scope system if an existing one is sufficient.
Document the actual scope model.

---

# STEP 7 — ORGANIZATION SCOPE

A permission does NOT allow cross-organization access.

Example:
User:
```text
Organization A
```
Permission:
```text
students.view
```
must still only allow:
```text
Organization A students
```
It must NEVER grant access to:
```text
Organization B students
```
PHASE 1 tenant isolation remains mandatory.

---

# STEP 8 — BRANCH SCOPE

A permission does NOT automatically grant access to every branch.

Example:
User:
```text
Organization A
Branch A
```
Permission:
```text
students.view
```
must mean:
```text
students.view
+
authorized branch
```
not:
```text
students.view
+
all branches
```
unless the user's role/branch scope explicitly allows that.
PHASE 2 guarantees must remain intact.

---

# STEP 9 — SCOPE MATRIX

Create an authorization matrix using the actual project.

Example:
```text
Role             Permission          Scope
------------------------------------------------
Org Admin        students.view       ORGANIZATION
Branch Manager   students.view       BRANCH
Teacher          students.view       OWN/BRANCH
Accountant       payments.view       BRANCH
Custom Role      groups.update       BRANCH
```

Do not guess.
Base the final matrix on the actual business architecture.

---

# STEP 10 — GUARD ARCHITECTURE

Inspect current:
```text
RolesGuard
PermissionsGuard
```
and related guards.

Reuse them if they are structurally sound.
If improvements are needed, make the smallest safe changes.
Do NOT create multiple competing authorization systems.
The goal is one clear authorization pipeline.

---

# STEP 11 — DECORATORS

Inspect existing decorators.

Examples:
```text
@Roles(...)
@Permissions(...)
```

Make sure decorators are:
* type-safe
* consistent
* server-side
* reusable
* easy to audit

Do not use frontend-only metadata as security.

---

# STEP 12 — CONTROLLER PROTECTION

Audit every protected controller.

Every sensitive endpoint must have appropriate authorization.

Examples:
```text
GET students
POST students
PATCH students/:id
DELETE students/:id

GET payments
POST payments
POST payments/:id/refund

GET reports
GET dashboard

POST users
PATCH users/:id

POST roles
PATCH roles/:id
```

Do not add permission guards to public/auth endpoints incorrectly.

---

# STEP 13 — SERVICE-LEVEL AUTHORIZATION

Controller guards alone are not always sufficient.

Important cross-entity operations must also validate authorization.

Example:
```text
Teacher
   ↓
students.update
   ↓
Student belongs to authorized branch
   ↓
ALLOW
```

Do not allow a controller-level permission check to bypass branch/entity ownership.

---

# STEP 14 — CRUD PERMISSION CONSISTENCY

For each business resource verify:
```text
VIEW
CREATE
UPDATE
DELETE
RESTORE
EXPORT
SPECIAL ACTION
```
where applicable.

Example:
A user with:
```text
students.view
```
must NOT automatically be able to:
```text
students.update
students.delete
students.export
```
unless explicitly authorized.

---

# STEP 15 — SPECIAL FINANCIAL PERMISSIONS

Financial actions require special attention.

Audit:
* payment creation
* refund
* void
* invoice modification
* expense creation
* expense approval
* cashbox operations
* transaction operations

Do not treat:
```text
payments.view
```
as equivalent to:
```text
payments.refund
```

Separate sensitive financial actions.

---

# STEP 16 — USER / ROLE MANAGEMENT

Protect:
* create user
* update user
* deactivate user
* assign role
* remove role
* create custom role
* modify custom role
* assign permissions

A normal employee must not be able to escalate their own permissions.

---

# STEP 17 — PRIVILEGE ESCALATION PROTECTION

Test attacks such as:
```json
{
  "role": "SUPER_ADMIN"
}
```
or:
```json
{
  "permissions": ["*"]
}
```
or:
```json
{
  "scope": "GLOBAL"
}
```

The client must NEVER be able to grant itself elevated authorization.
Role and permission assignment must be server-authorized.

---

# STEP 18 — BRANCH + PERMISSION COMBINATION

This is mandatory.

Example:
User:
```text
Role: Branch Manager
Branch: A
Permission: students.update
```
Request:
```text
Student belongs to Branch A
```
→ ALLOW

Request:
```text
Student belongs to Branch B
```
→ DENY

Even though the user has:
```text
students.update
```

---

# STEP 19 — ORGANIZATION + BRANCH + PERMISSION ATTACK

Test:
```text
User:
Organization A
Branch A
Permission: students.update
```
Attempt:
```text
Organization B
Branch B
Student B
```
Expected:
```text
DENIED
```

All three security layers must hold:
```text
Tenant
+
Branch
+
Permission
```

---

# STEP 20 — CUSTOM ROLES

Verify custom roles.

Example:
```text
Custom Role:
Receptionist
```
Permissions:
```text
students.view
students.create
payments.view
```
No permission:
```text
payments.refund
users.manage
roles.manage
```

The custom role must behave exactly according to its permissions.

---

# STEP 21 — SYSTEM ADMIN / SUPER ADMIN

Inspect whether the application has a system-level administrator.

If it exists:
* document it
* determine whether it is cross-organization
* protect it separately
* prevent normal organization admins from becoming system admins

Do NOT accidentally weaken tenant isolation for convenience.

---

# STEP 22 — FRONTEND PERMISSION SYSTEM

Audit frontend permission handling.

Frontend may:
* hide menus
* hide buttons
* disable actions
* protect routes
but backend remains authoritative.

Do not duplicate complex authorization logic unnecessarily in Vue.
Use frontend permissions primarily for UX.

---

# STEP 23 — API RESPONSE SECURITY

Check unauthorized resources.

For example:
User requests:
```text
GET /students/other-tenant-id
```
Do not leak:
* organization existence
* branch existence
* sensitive metadata
* internal IDs where avoidable

Use the project's established:
```text
403
```
or:
```text
404
```
security convention.
Be consistent.

---

# STEP 24 — AUDIT LOG

Sensitive authorization changes should be auditable.

Audit:
* role assignment
* permission changes
* custom role changes
* branch access changes
* user activation/deactivation
* refund permission usage
* sensitive financial actions

Reuse the existing AuditLog from previous phases.
Do NOT create a second audit system.

---

# STEP 25 — SEARCH FOR UNSAFE ROLE CHECKS

Search the backend for:
```text
user.role ===
user.role ==
role ===
isAdmin
isSuperAdmin
```
and equivalent patterns.

Review each occurrence.
Do not blindly remove them.
For each occurrence determine:
1. Is this authorization?
2. Is this business logic?
3. Can it use permissions instead?
4. Is the role check legitimate?

---

# STEP 26 — SEARCH FOR UNSAFE FRONTEND-ONLY AUTHORIZATION

Search frontend for critical actions that are protected ONLY by UI logic.

Examples:
```text
if (canDelete)
if (isAdmin)
v-if="isAdmin"
```

These are acceptable for UI visibility.
But verify corresponding backend authorization exists.

---

# STEP 27 — TYPESCRIPT SAFETY

Do NOT weaken TypeScript.

Do NOT use:
```text
any
@ts-ignore
as any
!
```
to bypass authorization errors.

If authorization context is required, type it explicitly.

---

# STEP 28 — SECURITY TEST MATRIX

Create automated tests:
* Authentication: Unauthenticated $\rightarrow$ DENY
* Organization: Cross-organization $\rightarrow$ DENY
* Branch: Cross-branch without scope $\rightarrow$ DENY
* Permission: Specific action requires explicit permission code
* Financial: Sensitive financial operations (refund, void) isolated
* Role escalation: Self-escalation to `SUPER_ADMIN` or `*` blocked
* Custom role: Granular permissions enforced strictly
* Cross-tenant + permission: Permission never bypasses tenant barrier

---

# STEP 29 — BUILD + TEST

Run:
* backend typecheck
* backend build
* unit tests
* integration tests
* e2e tests if available
* frontend build if API contracts changed

Do NOT hide errors.
Do NOT weaken compiler settings.
Do NOT skip failing security tests.

---

# MANDATORY FINAL CHECKLIST

Before declaring PHASE 3 complete:
```text
[x] Existing RBAC fully audited
[x] Permission inventory created
[x] Role/permission separation verified
[x] Permission scopes documented
[x] Organization scope protected
[x] Branch scope protected
[x] Controllers protected
[x] Services protected where necessary
[x] CRUD permissions separated
[x] Financial sensitive actions protected
[x] User/role management protected
[x] Privilege escalation prevented
[x] Custom roles work
[x] System admin behavior documented
[x] Frontend is not treated as security
[x] API responses do not leak unauthorized data
[x] Authorization changes audited
[x] Unsafe role checks reviewed
[x] Security tests added
[x] Cross-tenant tests pass
[x] Cross-branch tests pass
[x] Permission tests pass
[x] Privilege escalation tests pass
[x] Backend typecheck passes
[x] Backend build passes
[x] Frontend build passes
```

---

# ⚠️ LOYIHAGA XOS ANIQ XAVFLAR VA QO'SHIMCHA KO'RSATMALAR

### 1. Ikkita parallel avtorizatsiya tizimi (`roles.guard.ts` vs `permissions.guard.ts`)
* `backend/src/auth/roles.guard.ts` $\rightarrow$ `RolesGuard` + `@Roles()` decorator.
* `backend/src/auth/permissions.guard.ts` $\rightarrow$ `PermissionsGuard` + `@RequirePermissions()` decorator (amalda ishlatilayotgani).
* `RolesGuard` auth.module'da provider sifatida ro'yxatdan o'tgan, lekin hech bir controllerda ishlatilmagan (o'lik kod).
* **Qat'iy ko'rsatma:** `roles.guard.ts` va `@Roles()` decoratorini yoki butunlay olib tashlang, yoki `PermissionsGuard` ichiga birlashtiring. Ikkita mustaqil guard qoldirmang — bu Step 10 talabini buzadi, kelajakda kimdir xato qilib `@Roles` ishlatib qo'yishi va granular ruxsatlarni chetlab o'tishi xavfi bor.

### 2. Ikkita manbali ruxsat tizimi (DB + hardcoded fallback ustuvorligi)
`permissions.guard.ts` ichida:
```typescript
if (dbUser.customRole && dbUser.customRole.permissions.length > 0) {
  grantedCodes = dbUser.customRole.permissions.map(...)   // DB'dan
} else {
  const defaultRolePerms: Record<Role, string[]> = { TEACHER: [...], CASHIER: [...] }  // kodga qotirilgan
  grantedCodes = ...
}
```
* **Qat'iy ko'rsatma:** `defaultRolePerms` fallback xaritasi va `customRole` DB-ruxsatlari o'rtasidagi ustuvorlikni aniq test qiling:
  - (a) `customRole` yo'q $\rightarrow$ standart fallback ishlaydi.
  - (b) `customRole` bor $\rightarrow$ faqat DB ruxsatlari ishlaydi, fallback butunlay e'tiborsiz qoldiriladi.

### 3. Dashboard'dagi rol tekshiruvlari va API xavfsizligi
* `dashboard.service.ts` da `if (role === 'TEACHER') { return widgets.filter(...) }` — bu faqat UI vidjet tanlash logikasi.
* **Qat'iy ko'rsatma:** Shu vidjetlar ichidagi ma'lumot (masalan `stats.revenue`) haqiqatan `PermissionsGuard` orqali himoyalangan endpointdan kelayotganini tasdiqlang — vidjet yashiringan bo'lsa-da, API orqali ruxsatsiz olinishi mumkin bo'lib qolmasin.
