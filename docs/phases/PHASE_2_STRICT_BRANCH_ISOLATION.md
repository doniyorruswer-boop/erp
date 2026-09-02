# PHASE 2 — STRICT BRANCH ISOLATION & BRANCH SCOPE

PHASE 1 — STRICT MULTI-TENANCY HARDENING has been completed successfully.

Now implement PHASE 2.

This is a SECURITY-CRITICAL authorization and data-isolation phase.

DO NOT add new business features.

DO NOT create Education-specific features.

DO NOT create Driving School features.

DO NOT redesign the Windzo UI.

DO NOT replace existing components.

DO NOT rewrite the architecture unnecessarily.

Preserve all working functionality from PHASE 1.

---

# PRIMARY OBJECTIVE

Implement reliable branch-level isolation inside an organization.

The hierarchy is:

```text
Organization
    ↓
Branches
    ↓
Branch-scoped business data
```

A user must NEVER access another branch's data unless their role/permissions explicitly authorize access to that branch.

Organization isolation from PHASE 1 MUST remain intact.

Branch authorization MUST NEVER weaken tenant isolation.

---

# SECURITY MODEL

The expected security hierarchy is:

```text
Authenticated User
        ↓
Organization Context
        ↓
Branch Access
        ↓
Permission
        ↓
Entity Access
```

Organization must always be validated FIRST.

Then branch access.

Then permission.

Never the opposite.

---

# STEP 1 — FULL REPOSITORY AUDIT

Before modifying code, inspect the actual repository.

Inspect:

* Prisma schema
* Branch model
* User model
* user-branch relations
* roles
* permissions
* PermissionScope
* JWT/auth context
* CurrentTenant
* existing branch decorators
* guards
* controllers
* services
* DTOs
* dashboard queries
* reports
* CRM
* finance
* scheduling
* resources
* students
* groups
* courses
* rooms
* notifications
* workflow
* custom fields
* imports
* exports

Do not assume how branch access currently works.

Document the actual implementation.

---

# STEP 2 — IDENTIFY THE BRANCH MODEL

Determine:

1. How Branch is represented.
2. How a User is associated with Branches.
3. Whether a user can belong to multiple branches.
4. Whether there is a primary branch.
5. How organization admins access branches.
6. How custom roles access branches.
7. Whether branch access is stored in UserBranch or another relation.
8. Whether branchId already exists on tenant-owned models.

Do NOT change the data model until the existing implementation is understood.

---

# STEP 3 — CLASSIFY EVERY BUSINESS ENTITY BY SCOPE

Create a scope matrix based on the actual project.

Every important model must be classified as:

### A. ORGANIZATION-SCOPED

Example conceptual:

```text
Organization
Organization Settings
Subscription
Global Course Catalog
```

### B. BRANCH-SCOPED

Example conceptual:

```text
Student
Group
Room
Resource
Schedule
Attendance
```

### C. USER ACCESS / MEMBERSHIP

Example:

```text
User
UserBranch
UserRole
```

### D. MIXED / SPECIAL CASE

If an entity can be organization-wide but optionally associated with a branch, document the exact behavior.

DO NOT guess.

DO NOT automatically add branchId to every model.

---

# STEP 4 — CREATE A BRANCH SCOPE MATRIX

Produce a table like:

```text
Model              Organization    Branch       Scope
---------------------------------------------------------
Student            required        required     BRANCH
Group              required        required     BRANCH
Course             required        optional     ORGANIZATION
Room               required        required     BRANCH
Resource           required        required     BRANCH
Payment            required        derived      BRANCH
...
```

Use the actual repository.

Before implementation, report the matrix.

Then implement according to it.

---

# STEP 5 — BRANCH CONTEXT

Determine the safest way to obtain branch context.

The server MUST NOT trust:

```text
request.body.branchId
request.query.branchId
request.headers.branchId
frontend-selected branchId
```

as proof of authorization.

A client-supplied branchId is only a REQUESTED TARGET.

The server must verify that the authenticated user has access to that branch.

---

# STEP 6 — BRANCH ACCESS SERVICE / HELPER

If the current architecture does not already provide one, introduce a minimal reusable mechanism such as:

```text
BranchAccessService
```

or equivalent.

It should support concepts such as:

```text
assertBranchAccess(userId, organizationId, branchId)
```

and, where needed:

```text
getAccessibleBranchIds(userId, organizationId)
```

Do not over-engineer this.

Follow the project's existing architecture.

---

# STEP 7 — USER BRANCH ACCESS

Implement/verify:

### Organization Admin

Can access all branches within their organization according to permissions.

### Branch Manager

Can access assigned branch(es).

### Employee/Teacher/Instructor

Can access only authorized branch(es).

### Custom Role

Access is determined by role + permission + branch assignment.

Do NOT hardcode role names if the project already has a permission system capable of expressing this.

---

# STEP 8 — BRANCH-SCOPED READ QUERIES

Every branch-scoped read must enforce branch access.

Example:

```typescript
findMany({
  where: {
    organizationId: orgId,
    branchId: branchId,
  },
});
```

But this alone is NOT sufficient.

The system must first verify:

```text
branchId belongs to organizationId
AND
user has access to branchId
```

---

# STEP 9 — MULTI-BRANCH USERS

If users can belong to multiple branches:

```text
User
 ├── Branch A
 ├── Branch B
 └── Branch C
```

the user may access all assigned branches.

If the user is restricted to Branch A:

```text
Branch A → ALLOW
Branch B → DENY
Branch C → DENY
```

Do not assume a user has only one branch unless the repository proves that.

---

# STEP 10 — CREATE OPERATIONS

For branch-scoped entities:

The client may request:

```json
{
  "branchId": "branch-B"
}
```

but the server MUST verify:

```text
branch-B belongs to current organization
AND
current user can access branch-B
```

If not:

```text
403 Forbidden
```

or the project's established equivalent.

Never allow branch reassignment by simply trusting the DTO.

---

# STEP 11 — UPDATE OPERATIONS

For update:

```text
Organization A
Branch A
Student X
```

A user from Branch B must NOT be able to update Student X.

Every update must validate:

```text
organizationId
+
branch authorization
+
permission
```

---

# STEP 12 — DELETE OPERATIONS

Same rule applies to:

* soft delete
* restore
* archive
* deactivate

A user cannot delete or restore records belonging to an unauthorized branch.

---

# STEP 13 — CROSS-BRANCH RELATION PROTECTION

This is mandatory.

Prevent relationships such as:

```text
Branch A
  Group A

Branch B
  Student B
```

then:

```text
Group A ← Student B
```

This MUST be rejected unless the actual business model explicitly allows cross-branch relationships.

Apply the same logic to:

* students
* groups
* courses
* rooms
* resources
* instructors
* schedules
* payments
* invoices
* customers
* CRM records
* custom fields
* files
* notifications
* workflow entities

Do not assume IDs belonging to the same organization are automatically compatible with the same branch.

---

# STEP 14 — DASHBOARD AND REPORTS

Audit ALL aggregate queries.

Examples:

```text
COUNT students
COUNT groups
SUM payments
SUM revenue
attendance
expenses
CRM pipeline
```

Branch users must receive only authorized branch data.

Example:

```text
Branch A manager:

students = Branch A only
revenue = Branch A only
attendance = Branch A only
expenses = Branch A only
```

Organization-level administrators may receive organization-wide totals if authorized.

---

# STEP 15 — SEARCH / FILTER / EXPORT

Audit:

* search
* filters
* pagination
* sorting
* exports
* reports

A user must not bypass branch restrictions by manipulating:

```text
?branchId=
?search=
?page=
?sort=
?filter=
```

or export parameters.

---

# STEP 16 — CUSTOM FIELDS

Verify Custom Fields respect their entity's scope.

For example:

Branch A entity:

```text
Field definitions/data
```

must not expose Branch B-specific data if the entity itself is branch-scoped.

Preserve organization isolation from PHASE 1.

---

# STEP 17 — NOTIFICATIONS

Audit notifications.

A user must not receive branch-specific notifications belonging to another branch.

This includes:

* in-app
* email
* SMS
* Telegram
* background notification jobs

---

# STEP 18 — BACKGROUND JOBS

Audit jobs/workflows that operate on branch-scoped entities.

Background workers must preserve:

```text
organizationId
branchId
```

where required.

Never allow a job to accidentally execute globally when the original operation was branch-scoped.

---

# STEP 19 — DO NOT BREAK ORGANIZATION-LEVEL DATA

Some data is intentionally organization-wide.

Do NOT force branch filtering onto organization-level entities.

Instead document:

```text
Organization scope
vs
Branch scope
```

and enforce the correct level.

---

# STEP 20 — TEST MATRIX

Create automated tests.

## Organization + Branch

### Test 1

User belongs to Organization A + Branch A.

Access Branch A.

Expected:

```text
PASS
```

### Test 2

User belongs to Organization A + Branch A.

Access Branch B.

Expected:

```text
DENIED
```

### Test 3

User belongs to Organization A.

Attempt access to Organization B + Branch B.

Expected:

```text
DENIED
```

This confirms PHASE 1 remains intact.

---

## CRUD TESTS

Test branch isolation for:

* create
* read
* update
* delete
* restore

---

## RELATION TESTS

Test:

```text
Branch A Group
+
Branch B Student
```

Expected:

```text
DENIED
```

---

## QUERY BYPASS TESTS

Attempt:

```text
?branchId=unauthorized-branch
```

Expected:

```text
DENIED / empty according to security convention
```

No unauthorized data.

---

## EXPORT TEST

Attempt to export another branch.

Expected:

```text
DENIED
```

---

## DASHBOARD TEST

Branch A user must never receive Branch B totals.

---

# STEP 21 — SEARCH FOR UNSAFE PATTERNS

After implementation search the entire backend for:

```text
branchId?: string
```

Review every occurrence.

Also search for:

```text
request.body.branchId
request.query.branchId
request.headers.branchId
```

and equivalent patterns.

Also search for branch-scoped Prisma queries that do not verify authorization.

Do not blindly remove every optional branchId.

For each remaining occurrence explain:

1. file
2. method
3. why optional
4. scope
5. security implications

---

# STEP 22 — TYPE SAFETY

Where branch context is mandatory, prefer:

```typescript
branchId: string
```

instead of:

```typescript
branchId?: string
```

Use TypeScript to force callers to provide required branch context.

Do NOT solve resulting errors with:

```typescript
as string
```

```typescript
!
```

```typescript
@ts-ignore
```

or `any`.

---

# STEP 23 — BUILD AND TEST

Run:

* backend typecheck
* backend build
* unit tests
* integration tests
* e2e tests if available
* frontend build if API contracts changed

Do not hide failures.

Do not weaken TypeScript.

Do not skip security tests.

---

# MANDATORY FINAL CHECKLIST

Before declaring PHASE 2 complete:

```text
[x] Organization isolation from PHASE 1 still works
[x] Branch model fully audited
[x] User branch access fully audited
[x] Scope matrix created
[x] Organization-scoped models identified
[x] Branch-scoped models identified
[x] Mixed-scope models identified
[x] Branch access is server-side
[x] Client branchId is never trusted as authorization
[x] Branch ownership is verified
[x] Branch permission is verified
[x] CREATE protected
[x] READ protected
[x] UPDATE protected
[x] DELETE protected
[x] RESTORE protected
[x] Cross-branch relations protected
[x] Dashboard protected
[x] Reports protected
[x] Search protected
[x] Filters protected
[x] Export protected
[x] Notifications protected
[x] Background jobs audited
[x] Custom fields audited
[x] Required branchId is strongly typed where appropriate
[x] No unsafe TypeScript bypasses
[x] Security tests added
[x] Backend build passes
[x] Tests pass
```

---

# FINAL REPORT

Return a detailed report.

## 1. Branch Architecture

Explain current implementation.

## 2. Scope Matrix

Provide the complete model scope table.

## 3. Branch Access

Explain how users obtain branch access.

## 4. Security Changes

List every modified file and why.

## 5. Cross-Branch Protection

List protected relations.

## 6. Dashboard / Reports

List audited queries.

## 7. Unsafe Pattern Audit

```text
branchId?: string
Found:
Fixed:
Remaining:
```

## 8. Security Tests

```text
Total:
Passed:
Failed:
Skipped:
```

## 9. Build

```text
Typecheck:
PASS / FAIL

Backend:
PASS / FAIL

Frontend:
PASS / FAIL
```

## 10. Remaining Risks

List every unresolved issue.

## 11. Final Status

```text
PHASE 2 — STRICT BRANCH ISOLATION

PASS
or
NOT READY
```

STOP.

Do NOT continue to PHASE 3 automatically.

Wait for review before proceeding.

---

# ⚠️ LOYIHAGA XOS ANIQ XAVFLAR VA QO'SHIMCHA KO'RSATMALAR

Koddagi amaldagi arxitektura va avvalgi audit xulosalariga asoslangan holda, Phase 2 ijrosida quyidagi 5 ta muhim qoidaga qat'iy rioya qilinishi shart:

### 1. PermissionsGuard bilan ziddiyat xavfi
Loyihada allaqachon `permissions.guard.ts` ichida `request.userBranches` va `request.permissionScope` (`ORGANIZATION` vs `BRANCH`) hisoblanadi. 
Agar Phase 2 buni ko'rmasdan parallel yangi `BranchAccessService` yozsa — ikkita mustaqil "kim qayerga kira oladi" logikasi paydo bo'ladi, ular kelajakda bir-biridan farqlanib ketishi (drift) ehtimoli bor.
> **Qat'iy ko'rsatma:** Yangi `BranchAccessService` yozishdan oldin, mavjud `permissions.guard.ts` dagi `userBranches` / `permissionScope` mexanizmini o'rganib, o'shani kengaytiring yoki unga integratsiya qiling. Hech qachon parallel/duplikat tekshiruv tizimini yaratmang.

### 2. `tenant.decorator.ts` dagi xato takrorlanmasligi kerak
Agar Phase 2 `@CurrentBranch()` degan yangi decorator yaratsa — u ham xuddi Phase 1 gacha bo'lgan tuzoqqa tushmasligi kerak (ya'ni header/query/body'dan kelgan `branchId` ni ko'r-ko'rona "ruxsat berilgan" deb hisoblash mutlaqo taqiqlanadi). 
> **Qat'iy ko'rsatma:** Decorator faqat so'ralgan maqsad (`requestedTargetBranchId`) ni qaytarsin yoki serverda foydalanuvchining ruxsat etilgan filiallari bilan `assertBranchAccess()` orqali tekshirilsin. Haqiqiy ruxsat har doim serverda autentifikatsiya qilingan foydalanuvchi doirasida tekshiriladi.

### 3. Parametr portlashi (Parameter Explosion) xavfi
Phase 1'da servis metodlarida `orgId: string` majburiy qilindi. Endi Phase 2 shu fayllarning ko'pchiligiga yana `branchId?: string` qo'shsa, natijada har bir service metodida 2-3-4 ta parametr yig'ilib ketadi (`orgId, branchId, userId, ...`) — bu xatoga moyil va noqulay.
> **Qat'iy ko'rsatma:** Har bir service metodiga alohida `orgId`, `branchId` o'rniga, bitta kontekst obyekti:
> ```typescript
> export interface TenantContext {
>   organizationId: string;
>   branchId?: string;
>   accessibleBranchIds: string[];
>   isOrgAdmin: boolean;
> }
> ```
> yoki tartibli parametrlar tizimini qo'llashni ko'rib chiqing. Bu kodni toza saqlaydi va kelajakdagi xatolarni kamaytiradi.

### 4. Dashboard'dagi xatoliklar va aggregatlar
Avvalgi auditda `dashboard.service.ts` da fallback demo raqamlar (`totalStudents || 24`) kabi qoldiqlar bo'lgan bo'lsa, Phase 2 ning "Step 14 — Dashboard/Reports" auditi noto'g'ri natija berishi mumkin (ya'ni branch bo'yicha noto'g'ri filtrlashni fake data bilan yashirib qo'yishi mumkin).
> **Qat'iy ko'rsatma:** `dashboard.service.ts` ning barcha Prisma querylari (count, sum, aggregate) filial bo'yicha to'liq tekshirilsin va har qanday hardcoded/fallback raqamlar to'liq bartaraf etilsin.

### 5. SUPER_ADMIN / ADMIN bypass mantig'i
`permissions.guard.ts` da `SUPER_ADMIN` / `ADMIN` hamma narsaga (`*`) kirish huquqiga ega va ularga `permissionScope = ORGANIZATION` qo'yiladi — ya'ni ular tashkilot doirasidagi barcha branchlarni ko'rish va boshqarish huquqiga ega.
Phase 2 yangi branch-tekshiruvi qo'shganda, bu admin bypass buzilmasligi kerak (admin birdan o'z tashkilotining filiallaridagi ma'lumotlarni ko'rmay qolmasin), lekin ayni paytda bu bypass boshqa rollarga (Branch Manager, Teacher, Staff) sizib chiqmasligi ham qat'iy kafolatlanishi shart.
> **Qat'iy ko'rsatma:** Test matritsasiga aniq test qo'shing:
> `ADMIN role barcha branchlarni ko'ra oladimi — PASS bo'lishi kerak.`
