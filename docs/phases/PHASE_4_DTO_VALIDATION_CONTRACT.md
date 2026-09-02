# PHASE 4 — DTO + VALIDATION + API CONTRACT HARDENING

PHASE 1 — STRICT MULTI-TENANCY has been completed.

PHASE 2 — STRICT BRANCH ISOLATION has been completed.

PHASE 3 — RBAC + PERMISSION + SCOPE has been completed.

Now implement:

# PHASE 4 — DTO + VALIDATION + API CONTRACT HARDENING

This is a SECURITY-CRITICAL and DATA-INTEGRITY-CRITICAL phase.

The goal is to make every API boundary strict, predictable, validated, and resistant to malicious or accidental input.

---

# ABSOLUTE RULES

DO NOT:
* redesign the Windzo UI
* replace the existing frontend architecture
* add new business features
* implement Education-specific features
* implement Driving School features
* rewrite working modules unnecessarily
* change working API behavior without a documented reason
* weaken TypeScript
* use `any` to bypass errors
* use `@ts-ignore`
* use unsafe type assertions to bypass validation
* trust client-provided organizationId
* trust client-provided permissions
* trust client-provided roles
* trust client-provided userId for ownership
* trust client-provided authorization context

Preserve all security guarantees from PHASE 1, PHASE 2 and PHASE 3.

---

# PRIMARY OBJECTIVE

Establish this API boundary:

```text
Client
   ↓
HTTP Request
   ↓
DTO Transformation
   ↓
DTO Validation
   ↓
Authentication
   ↓
Organization Context
   ↓
Branch Access
   ↓
Permission / RBAC
   ↓
Controller
   ↓
Service
   ↓
Business Validation
   ↓
Prisma
```

The client controls DATA INPUT.

The server controls:
```text
organization
branch authorization
user identity
ownership
permissions
roles
security context
```

---

# STEP 1 — FULL DTO INVENTORY

Before changing anything, inspect the entire backend.

Find:
```text
*.dto.ts
Create*.dto.ts
Update*.dto.ts
*.input.ts
*.request.ts
*.query.ts
*.params.ts
```

Also inspect controllers that accept:
```text
@Body()
@Query()
@Param()
```

Create an inventory.

Report:
```text
Module
DTO
Endpoint
Create/Update/Query/Params
Validation status
Security-sensitive fields
```

DO NOT modify yet.

---

# STEP 2 — VALIDATION PIPELINE

Inspect the existing NestJS validation configuration.

Determine whether the application uses:
```typescript
ValidationPipe
```
and whether the following are enabled:
```typescript
transform: true
whitelist: true
forbidNonWhitelisted: true
```

Prefer a secure global configuration equivalent to:
```typescript
new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});
```

However:
DO NOT blindly replace the existing configuration.
First understand why the current configuration exists.
If changing it, verify all existing endpoints afterward.

---

# STEP 3 — WHITELIST PROTECTION

The API must reject unexpected properties where strict DTO validation is intended.

Example DTO:
```typescript
class CreateStudentDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
```

Request:
```json
{
  "name": "John",
  "email": "john@example.com",
  "isAdmin": true
}
```
must NOT allow `isAdmin` to silently enter the application.

Prefer:
```text
forbidNonWhitelisted: true
```
where compatible with the existing API.

---

# STEP 4 — MASS ASSIGNMENT PROTECTION

Audit all places where DTOs are passed directly into Prisma.

Find patterns such as:
```typescript
prisma.student.create({
  data: dto
});
```
```typescript
prisma.student.update({
  data: dto
});
```

These are potentially dangerous if DTOs contain security-sensitive fields.

Explicitly construct Prisma data where necessary.

Example:
```typescript
const data = {
  name: dto.name,
  email: dto.email,
  phone: dto.phone,
};
```

Do NOT allow clients to control:
```text
organizationId
createdById
updatedById
role
permissions
isSuperAdmin
isAdmin
branch ownership
ownerId
approval status
financial status
audit fields
system fields
```
unless there is a legitimate server-authorized workflow.

---

# STEP 5 — ORGANIZATION ID

Audit every DTO containing:
```text
organizationId
```
Determine whether it should be:
1. removed from the client DTO
2. read-only
3. server-generated
4. accepted only for system-level operations

For normal tenant operations:
`organizationId MUST come from authenticated context.`

Never trust:
```text
body.organizationId
query.organizationId
params.organizationId
```
as authorization.

PHASE 1 rules remain mandatory.

---

# STEP 6 — BRANCH ID

Audit every DTO containing:
```text
branchId
```

Branch ID can be a requested target/input where legitimate.

However:
`branchId ≠ authorization`

For example:
```json
{
  "branchId": "branch-B"
}
```
means:
"perform this operation for branch B"

It does NOT mean:
"I am authorized to access branch B."

The backend must still perform:
```text
organization validation
+
branch access validation
+
permission validation
```
from PHASE 2 and PHASE 3.

---

# STEP 7 — USER ID

Audit DTOs containing:
```text
userId
createdById
updatedById
ownerId
assignedById
```

Determine whether each is:
`client-controlled data` or `authenticated identity`.

For authenticated identity, use:
`request.user.id` or the project's equivalent secure context.

Do NOT allow a client to impersonate another user by submitting:
```json
{
  "createdById": "another-user-id"
}
```

---

# STEP 8 — ROLE AND PERMISSION FIELDS

Audit all DTOs containing:
```text
role
roleId
permissions
permissionIds
isAdmin
isSuperAdmin
scope
```

These fields require special protection.

A normal user MUST NOT be able to elevate themselves by sending:
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

Role and permission changes must be authorized by PHASE 3 RBAC.

---

# STEP 9 — CREATE VS UPDATE DTOs

Audit whether the application incorrectly reuses:
`CreateDto` for `UpdateDto`.

Create separate DTOs where necessary.

---

# STEP 10 — UPDATE DTO SEMANTICS

Determine whether updates are PUT or PATCH.
For PATCH-like updates, optional fields may be correct:
```typescript
@IsOptional()
@IsString()
name?: string;
```

---

# STEP 11 — ENUM VALIDATION

Audit all enum-like fields:
`status`, `type`, `role`, `gender`, `paymentMethod`, `paymentStatus`, `attendanceStatus`, `priority`, `source`, `stage`.

Use strict enum validation where appropriate.

---

# STEP 12 — STRING VALIDATION

Audit string fields:
`@IsString()`, `@IsNotEmpty()`, `@MinLength()`, `@MaxLength()`, `@IsEmail()`, `@IsUrl()`.

---

# STEP 13 — NUMBER VALIDATION

Audit:
`amount`, `price`, `quantity`, `discount`, `percentage`, `sortOrder`, `duration`, `capacity`, `age`.
Prevent `NaN`, `Infinity`, negative values where business rules prohibit them.

---

# STEP 14 — BOOLEAN VALIDATION

Audit boolean fields. Verify transformation behavior (`"true"`, `"false"`, `true`, `false`).

---

# STEP 15 — DATE VALIDATION

Audit:
`startDate`, `endDate`, `birthDate`, `paymentDate`, `dueDate`, `scheduledAt`.

---

# STEP 16 — UUID / ID VALIDATION

Audit all:
`id`, `userId`, `studentId`, `groupId`, `branchId`, `courseId`, `paymentId`, `invoiceId`.

---

# STEP 17 — QUERY PARAMETER VALIDATION

Audit:
`page`, `limit`, `sort`, `sortBy`, `search`, `status`, `branchId`, `dateFrom`, `dateTo`.

---

# STEP 18 — PAGINATION

Audit all list endpoints:
`page >= 1`, `limit >= 1`, `limit <= 100`.

---

# STEP 19 — SORTING

Audit dynamic sorting. NEVER directly trust `?sortBy=someDatabaseField` unless it is validated against an allowlist.

---

# STEP 20 — FILTERING

Audit dynamic filtering. Ensure filters are validated, typed, scoped, and authorized.

---

# STEP 21 — SEARCH

Audit search functionality (max length, sanitization, tenant/branch isolated).

---

# STEP 22 — NESTED DTO VALIDATION

Audit nested objects and arrays. Ensure `@ValidateNested()` and `@Type(() => NestedDto)` are present.

---

# STEP 23 — ARRAY VALIDATION

Audit arrays:
`userIds`, `studentIds`, `permissionIds`, `branchIds`, `items`.

---

# STEP 24 — CROSS-ENTITY VALIDATION

DTO validation checks shape; Services check business relationships.

---

# STEP 25 — FINANCIAL INPUT VALIDATION

Audit all financial DTOs:
`amount`, `discount`, `tax`, `refundAmount`, `paymentMethod`, `currency`.

---

# STEP 26 — FILE UPLOAD VALIDATION

Audit file upload endpoints.

---

# STEP 27 — IMPORT VALIDATION

Audit CSV/Excel/import endpoints. Imports must NOT bypass DTO validation, tenant isolation, branch isolation, or permissions.

---

# STEP 28 — RESPONSE DTO AUDIT

Audit responses for sensitive fields (`passwordHash`, `refreshToken`).

---

# STEP 29 — ERROR RESPONSE STANDARDIZATION

Audit validation and authorization errors.
Validation: 400 Bad Request
Unauthenticated: 401 Unauthorized
Unauthorized: 403 Forbidden
Missing: 404 Not Found

---

# STEP 30 — API CONTRACT PRESERVATION

Verify frontend consumers (Vue API services, composables, Pinia stores, forms). Do NOT redesign Windzo UI.

---

# STEP 31 — SECURITY-SENSITIVE FIELDS AUDIT

Audit `organizationId`, `branchId`, `userId`, `ownerId`, `role`, `permissions`, `isAdmin`, `isSuperAdmin`.

---

# STEP 32 — PRISMA INPUT AUDIT

Audit `data: dto`, `...dto`, `...body` inside database operations.

---

# STEP 33 — DELETE / RESTORE DTOs

Verify IDs belong to current organization, authorized branch, and scope before delete/restore.

---

# STEP 34 — BULK OPERATIONS

Audit bulk operations for batch size, validation, isolation, and transaction behavior.

---

# STEP 35 — TRANSACTION VALIDATION

Verify atomicity and ordering of multi-step database mutations.

---

# STEP 36 — DTO NAMING AND ORGANIZATION

Ensure clean, predictable structure.

---

# STEP 37 — TYPESCRIPT STRICTNESS

Do NOT weaken compiler settings. Fix real type/validation problems.

---

# STEP 38 — SECURITY TESTS

Create automated tests for:
- Unknown property (whitelist)
- Fake organization injection
- Unauthorized branch target
- Role escalation
- Permission escalation
- User impersonation
- Invalid enum
- Invalid ID
- Huge pagination
- Invalid sorting
- Cross-entity mismatch
- Cross-tenant entity mismatch

---

# STEP 39 — FRONTEND CONTRACT TEST

Verify frontend still communicates cleanly with backend without contract breaking.

---

# STEP 40 — BUILD AND TEST

Run:
* backend typecheck
* backend build
* unit/integration tests
* frontend typecheck
* frontend build

---

# MANDATORY FINAL CHECKLIST

Before declaring PHASE 4 complete:

```text
[x] Full DTO inventory completed
[x] Validation pipeline audited
[x] whitelist configured appropriately
[x] forbidNonWhitelisted configured appropriately
[x] Mass assignment audited
[x] organizationId protected
[x] branchId protected
[x] user identity protected
[x] role protected
[x] permissions protected
[x] scope protected
[x] Create/Update DTOs separated where necessary
[x] Enum validation implemented
[x] String validation audited
[x] Number validation audited
[x] Boolean validation audited
[x] Date validation audited
[x] ID validation audited
[x] Pagination protected
[x] Sorting allowlisted
[x] Filtering validated
[x] Search validated
[x] Nested DTO validation works
[x] Array validation works
[x] Cross-entity validation works
[x] Financial inputs validated
[x] File uploads audited
[x] Imports audited
[x] Response DTOs audited
[x] Sensitive fields not exposed
[x] Error responses consistent
[x] API contracts verified
[x] Bulk operations audited
[x] Transactions audited
[x] TypeScript strictness preserved
[x] Security tests added
[x] Frontend contract verified
[x] Backend typecheck passes
[x] Backend build passes
[x] Frontend typecheck passes
[x] Frontend build passes
```

---

# FINAL REPORT

Return a detailed report covering sections 1 to 13.
