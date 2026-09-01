# PHASE 1 — STRICT MULTI-TENANCY HARDENING

## MANDATORY SECURITY REQUIREMENTS

This phase is SECURITY-CRITICAL.

The following requirements are NOT optional and MUST be implemented exactly.

---

## MANDATORY REQUIREMENT #1 — CURRENT TENANT DECORATOR

Locate:

```text
tenant.decorator.ts
```

Rewrite/verify the `CurrentTenant` decorator so that it obtains the organization ONLY from:

```text
request.user.organizationId
```

It MUST NOT read organization context from:

* headers
* query parameters
* request body
* route parameters
* cookies
* localStorage
* frontend state
* any other fallback

The implementation must follow this security model:

```typescript
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const orgId = request.user?.organizationId;

    if (!orgId) {
      throw new UnauthorizedException('Organization context missing');
    }

    return orgId;
  },
);
```

You may adapt imports/types to the existing project architecture, but DO NOT change the security behavior.

### Forbidden patterns

The following are NOT allowed:

```typescript
request.headers.organizationId
```

```typescript
request.query.organizationId
```

```typescript
request.body.organizationId
```

```typescript
data.organizationId || orgId
```

```typescript
orgId || someFallbackOrganization
```

```typescript
organization.findFirst()
```

as a tenant fallback.

If `request.user.organizationId` is missing, the request MUST fail.

It must NEVER silently select another organization.

---

# MANDATORY REQUIREMENT #2 — ORG ID MUST BE REQUIRED IN SERVICES

Audit ALL backend services that accept organization context.

Find patterns such as:

```typescript
orgId?: string
```

and change them to:

```typescript
orgId: string
```

Organization context MUST be mandatory.

Do not leave tenant-scoped service methods with:

```typescript
orgId?: string
```

when organizationId is required for their operation.

---

## WHY THIS IS REQUIRED

The purpose is to make TypeScript itself identify forgotten tenant context.

If a service method has:

```typescript
async findAll(orgId?: string)
```

then the compiler cannot force callers to provide organization context.

Instead:

```typescript
async findAll(orgId: string)
```

must be used.

Then every caller that forgot to provide the organization context will produce a TypeScript compilation error.

Use the compiler as an additional tenant-isolation safety mechanism.

---

# MANDATORY REQUIREMENT #3 — FIX ALL RESULTING COMPILER ERRORS

After changing:

```typescript
orgId?: string
```

to:

```typescript
orgId: string
```

run the backend typecheck/build.

Every resulting error MUST be investigated.

Do NOT solve errors by:

```typescript
orgId as string
```

```typescript
orgId!
```

```typescript
someFallbackOrganizationId
```

```typescript
organization.findFirst()
```

or any other unsafe workaround.

The correct solution is to trace the caller and obtain organizationId from the authenticated request context.

---

# MANDATORY REQUIREMENT #4 — TRACE THE COMPLETE CALL CHAIN

For every tenant-scoped endpoint verify:

```text
HTTP Request
    ↓
JWT Authentication
    ↓
request.user.organizationId
    ↓
CurrentTenant decorator / authenticated context
    ↓
Controller
    ↓
Service(orgId: string)
    ↓
Prisma query
    ↓
organizationId filter
```

There must be no point where tenant identity becomes optional.

---

# MANDATORY REQUIREMENT #5 — DATABASE QUERY MUST USE THE REQUIRED ORG ID

Changing the TypeScript parameter alone is NOT sufficient.

For every tenant-scoped Prisma query verify that the required `orgId` is actually used.

Bad:

```typescript
findMany({
  where: {
    status: 'ACTIVE',
  },
});
```

Good:

```typescript
findMany({
  where: {
    organizationId: orgId,
    status: 'ACTIVE',
  },
});
```

For entity lookup:

```typescript
findFirst({
  where: {
    id,
    organizationId: orgId,
  },
});
```

For update/delete:

```typescript
updateMany({
  where: {
    id,
    organizationId: orgId,
  },
  data,
});
```

Do not assume that having `orgId: string` automatically provides security.

The query must actually enforce tenant isolation.

---

# MANDATORY REQUIREMENT #6 — NEVER TRUST CLIENT ORGANIZATION ID

If a DTO currently contains:

```typescript
organizationId
```

determine whether it is actually required by the API.

For normal tenant-owned operations, organizationId must be assigned from:

```text
request.user.organizationId
```

The client must not be able to override it.

If the DTO contains organizationId only because of the previous architecture, remove it from the client-controlled input where safe.

Do not blindly remove it if a legitimate system-level operation requires it. Investigate first.

---

# MANDATORY REQUIREMENT #7 — CROSS-TENANT RELATION CHECK

Do not only secure the main query.

When connecting records, verify that BOTH records belong to the same organization.

Example:

```text
Organization A
  Group A

Organization B
  Student B
```

This request must fail:

```text
Group A + Student B
```

The same rule applies to:

* Student → Group
* Group → Course
* Payment → Invoice
* Invoice → Customer
* Schedule → Resource
* Schedule → Instructor
* CRM records
* Custom Fields
* Files
* Notifications
* any other tenant-owned relation

---

# MANDATORY REQUIREMENT #8 — COMPILER AS SECURITY CHECK

After implementation run:

```bash
npm run build
```

or the project's actual backend build command.

Also run the appropriate TypeScript typecheck command if available.

The expected behavior is:

```text
Optional orgId
      ↓
compiler allows forgotten callers

Required orgId
      ↓
compiler detects forgotten callers
      ↓
developer fixes every caller
      ↓
tenant context becomes explicit
```

Do not weaken TypeScript strictness to make the build pass.

Do not add `@ts-ignore`.

Do not add unnecessary `any`.

Do not use non-null assertions to bypass tenant errors.

---

# MANDATORY REQUIREMENT #9 — SEARCH AFTER IMPLEMENTATION

After completing the work, search the entire backend for:

```text
orgId?: string
```

and equivalent optional organization context patterns.

Report every remaining occurrence.

For each remaining occurrence explain:

1. file
2. method
3. why it is intentionally optional
4. whether it is tenant-scoped
5. whether it should be changed

The default expectation is:

```text
Tenant-scoped service → orgId: string
```

---

# MANDATORY REQUIREMENT #10 — SEARCH FOR UNSAFE FALLBACKS AGAIN

After implementation search the entire backend for:

```text
organization.findFirst
```

```text
findFirst()
```

```text
organizationId ||
```

```text
orgId ||
```

```text
headers.organizationId
```

```text
query.organizationId
```

```text
body.organizationId
```

and equivalent patterns.

Every occurrence must be reviewed.

No unsafe tenant fallback may remain.

---

# MANDATORY REQUIREMENT #11 — SECURITY TESTS

Create tests proving:

### Test A — Valid tenant

```text
request.user.organizationId = A
```

User accesses Organization A data.

Expected:

```text
200
```

---

### Test B — Cross-tenant read

User belongs to Organization A.

Attempts to access Organization B record.

Expected:

```text
403 / 404
```

according to the project's authorization convention.

---

### Test C — Cross-tenant update

Organization A user attempts to update Organization B record.

Expected:

```text
DENIED
```

---

### Test D — Cross-tenant delete

Organization A user attempts to delete Organization B record.

Expected:

```text
DENIED
```

---

### Test E — Missing organization context

```text
request.user.organizationId = undefined
```

Expected:

```text
UnauthorizedException
```

with:

```text
Organization context missing
```

or the project's equivalent secure error.

---

### Test F — Fake client organization ID

Authenticated user:

```text
organizationId = A
```

Client sends:

```json
{
  "organizationId": "B"
}
```

Expected:

```text
Server continues using Organization A
```

The client must NOT be able to switch tenant context.

---

### Test G — Cross-tenant relation

Organization A Group + Organization B Student.

Expected:

```text
DENIED
```

---

# MANDATORY FINAL CHECK

Before declaring this phase complete, verify ALL of the following:

```text
[X] CurrentTenant reads ONLY request.user.organizationId
[X] Missing organizationId throws UnauthorizedException
[X] No header tenant fallback
[X] No query tenant fallback
[X] No body tenant fallback
[X] No findFirst organization fallback
[X] Tenant-scoped services use orgId: string
[X] Compiler catches missing orgId callers
[X] No unsafe TypeScript bypasses
[X] Every tenant query is scoped
[X] Relation ownership is validated
[X] Client cannot override organization
[X] Dashboard/report queries are tenant-scoped
[X] Custom Fields are tenant-scoped
[X] Audit logs are tenant-scoped
[X] Tests cover cross-tenant attacks
[X] Backend build passes
[X] Tests pass
```

---

# FINAL REPORT FORMAT

Return a detailed report:

## 1. CurrentTenant decorator

* Before
* After
* File
* Security behavior

## 2. Optional orgId audit

```text
Found:
Fixed:
Remaining:
```

## 3. Unsafe fallback audit

```text
Found:
Removed:
Remaining:
```

## 4. Tenant-scoped services

List all modified services.

## 5. Prisma queries

List important tenant-scoped query fixes.

## 6. Relation security

List cross-tenant relation protections.

## 7. Tests

```text
Total:
Passed:
Failed:
Skipped:
```

## 8. Build

```text
TypeScript:
PASS/FAIL

Backend build:
PASS/FAIL
```

## 9. Remaining risks

List every unresolved issue.

## 10. Final status

```text
PHASE 1 — STRICT MULTI-TENANCY

PASS
or
NOT READY
```

Do NOT continue to Phase 2 automatically.

Do NOT implement unrelated features.

STOP after this phase and wait for review.
