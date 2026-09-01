# PHASE 5 — AUDIT LOG + SOFT DELETE + DATA LIFECYCLE

PHASE 1 — STRICT MULTI-TENANCY has been completed.

PHASE 2 — STRICT BRANCH ISOLATION has been completed.

PHASE 3 — RBAC + PERMISSION + SCOPE has been completed.

PHASE 4 — DTO + VALIDATION + API CONTRACT HARDENING has been completed.

Now implement:

# PHASE 5 — AUDIT LOG + SOFT DELETE + DATA LIFECYCLE

This is a SECURITY, COMPLIANCE, DATA-INTEGRITY and ERP-FOUNDATION phase.

The objective is to establish a reusable lifecycle and audit architecture that can be used by:

* Education
* CRM
* Driving School
* Auto School
* HR
* Finance
* Gym
* Beauty
* Real Estate
* other future vertical modules

---

# ABSOLUTE RULES

DO NOT:

* redesign Windzo UI
* replace existing frontend architecture
* add Education-specific features
* add Driving School features
* add CRM-specific business features
* rewrite working modules unnecessarily
* break PHASE 1 tenant isolation
* break PHASE 2 branch isolation
* break PHASE 3 RBAC
* break PHASE 4 validation
* create a second competing audit system
* blindly convert every DELETE to soft delete
* store sensitive secrets in audit logs
* log passwords/tokens/secrets
* use `any` to bypass TypeScript
* use `@ts-ignore`
* weaken TypeScript strictness

Preserve existing functionality unless a security/data-integrity problem requires a change.

---

# PRIMARY OBJECTIVE

Establish:

```text
Entity Lifecycle
       ↓
ACTIVE
       ↓
SOFT DELETED / ARCHIVED
       ↓
RESTORED
       ↓
PERMANENTLY DELETED
```

and:

```text
Every sensitive change
       ↓
Audit Log
       ↓
Who
What
When
Where
Before
After
Result
```

The architecture must be reusable across future modules.

---

# STEP 1 — FULL AUDIT ARCHITECTURE

Before modifying anything inspect:

* Prisma schema
* existing AuditLog
* existing audit middleware
* interceptors
* event system
* activity logs
* deletedAt fields
* archivedAt fields
* status fields
* delete endpoints
* restore endpoints
* hard delete operations
* cascading deletes
* scheduled cleanup
* background jobs
* imports
* bulk operations

Determine whether audit and lifecycle mechanisms already exist.

DO NOT create duplicates.

---

# STEP 2 — EXISTING AUDIT SYSTEM

If an audit system already exists, document:

```text
Model
Fields
Relations
Creation mechanism
Storage
Retention
Query API
Authorization
```

Determine:

* what events are logged
* what is not logged
* whether organizationId is stored
* whether branchId is stored
* whether actorId is stored
* whether before/after values are stored
* whether IP/user-agent are stored
* whether audit logs can be modified
* whether audit logs are tenant isolated

Reuse the existing architecture where possible.

---

# STEP 3 — AUDIT LOG SECURITY MODEL

Every audit record must have sufficient context.

Conceptually:

```text
organizationId
branchId
actorUserId
action
entityType
entityId
timestamp
before
after
metadata
```

Only include fields that make sense for the actual architecture.

Do NOT blindly add every field.

---

# STEP 4 — TENANT ISOLATION FOR AUDIT LOGS

Audit logs are tenant-sensitive.

Organization A must NEVER be able to view:

```text
Organization B audit logs
```

All audit queries must respect:

```text
organizationId
```

from authenticated context.

Never trust:

```text
request.body.organizationId
query.organizationId
client organizationId
```

for audit authorization.

PHASE 1 remains mandatory.

---

# STEP 5 — BRANCH ISOLATION FOR AUDIT LOGS

Where the underlying entity is branch-scoped, audit records should preserve branch context where appropriate.

Example:

```text
Organization A
 ├── Branch A
 │    └── Student updated
 │
 └── Branch B
      └── Student updated
```

Branch A user must not be able to inspect Branch B audit records unless authorized.

PHASE 2 remains mandatory.

---

# STEP 6 — ACTOR IDENTITY

Audit records must identify the authenticated actor where applicable.

Use:

```text
request.user.id
```

or the project's secure authentication context.

Do NOT trust:

```text
body.userId
body.actorId
body.createdById
```

as the actor identity.

System-generated events may use an explicit system actor representation if the architecture supports it.

---

# STEP 7 — AUDIT ACTION TAXONOMY

Inspect existing conventions.

Where needed, standardize actions such as:

```text
CREATE
UPDATE
DELETE
RESTORE
ARCHIVE
LOGIN
LOGOUT
ROLE_CHANGED
PERMISSION_CHANGED
BRANCH_ACCESS_CHANGED
EXPORT
IMPORT
APPROVE
REJECT
REFUND
VOID
STATUS_CHANGED
```

Do NOT create unnecessary action types.

Use the project's established naming convention if one already exists.

---

# STEP 8 — BEFORE / AFTER DATA

For important UPDATE operations, preserve meaningful before/after state.

Example:

```text
Student
BEFORE:
{
  "status": "ACTIVE",
  "groupId": "A"
}

AFTER:
{
  "status": "INACTIVE",
  "groupId": "B"
}
```

Do NOT store:

* password hashes
* access tokens
* refresh tokens
* API keys
* secrets
* authentication credentials

Sensitive fields must be redacted.

---

# STEP 9 — AUDIT REDACTION

Create or reuse a centralized redaction mechanism.

Sensitive field examples:

```text
password
passwordHash
refreshToken
accessToken
token
secret
apiKey
clientSecret
privateKey
```

Do not rely on every developer remembering to redact fields manually.

Centralize the protection.

---

# STEP 10 — AUDIT IMMUTABILITY

Audit logs should be append-oriented.

Normal users must NOT be able to:

```text
UPDATE audit log
DELETE audit log
```

unless there is an exceptional system-level retention mechanism.

Protect audit records from normal application CRUD operations.

---

# STEP 11 — AUDIT QUERY AUTHORIZATION

Viewing audit logs requires permission.

Create/reuse an appropriate permission such as:

```text
audit.view
```

only if the existing permission architecture does not already provide equivalent functionality.

Audit access must respect:

```text
organization
branch
role
permission scope
```

from PHASE 1–3.

---

# STEP 12 — AUDIT EVENT COVERAGE

Identify critical events.

At minimum review:

```text
user creation
user update
user deactivation
role assignment
permission changes
branch access changes
organization settings changes
financial changes
payment creation
payment update
refund
invoice modification
expense modification
important entity deletion
restore
archive
export
import
```

Do not blindly log every database SELECT.

Focus on meaningful state-changing events.

---

# STEP 13 — AUDIT UPDATE DIFFS

Where practical, avoid storing enormous full objects.

Prefer meaningful changed fields:

```text
{
  "status": {
    "from": "ACTIVE",
    "to": "INACTIVE"
  },
  "groupId": {
    "from": "A",
    "to": "B"
  }
}
```

However, preserve enough information for compliance/debugging.

Do not introduce unnecessary complexity.

---

# STEP 14 — SOFT DELETE STRATEGY

Audit the actual data model.

Determine which entities should use:

```text
deletedAt
```

or equivalent.

Do NOT add soft delete to every model automatically.

Classify:

### Soft-delete candidates

Usually business records that may need restoration:

```text
students
groups
customers
leads
contacts
courses
rooms
resources
invoices
expenses
contracts
documents
```

But use the actual project requirements.

### Usually NOT soft-deleted

System/infrastructure records may require different treatment.

Examples:

```text
audit logs
migration records
security events
system configuration
```

Do not guess.

---

# STEP 15 — SOFT DELETE SEMANTICS

For soft-deleted records:

```text
deletedAt != null
```

means the record is not active.

Normal queries should NOT return deleted records unless explicitly requested.

Conceptually:

```typescript
where: {
  deletedAt: null,
}
```

must be applied consistently for soft-deletable entities.

---

# STEP 16 — CENTRALIZE SOFT DELETE

Do not implement inconsistent logic such as:

```text
Service A:
deletedAt: null

Service B:
status != DELETED

Service C:
isDeleted = false
```

unless the business model intentionally requires different mechanisms.

Prefer a consistent lifecycle strategy.

Reuse existing Prisma middleware/extensions/helpers where appropriate.

---

# STEP 17 — SOFT DELETE + TENANT ISOLATION

Soft delete must NOT bypass:

```text
organizationId
branchId
permission
```

Example:

User from Branch A:

```text
Student from Branch B
deletedAt = null
```

must still be inaccessible.

The query must enforce both:

```text
organization
+
branch
+
lifecycle
```

---

# STEP 18 — RESTORE

Implement/verify restore operations for appropriate entities.

Restore must require:

```text
restore permission
+
organization access
+
branch access
```

Do not allow an unauthorized user to restore another branch's record.

Restore should create an audit event:

```text
RESTORE
```

where appropriate.

---

# STEP 19 — DELETE PERMISSIONS

Do not assume:

```text
entity.update
```

means:

```text
entity.delete
```

Delete should use explicit permission where appropriate.

Example:

```text
students.delete
students.restore
```

Follow the permission architecture established in PHASE 3.

---

# STEP 20 — HARD DELETE

Audit every hard delete.

Search:

```text
delete(
deleteMany(
```

and equivalent Prisma operations.

For each occurrence determine:

1. Is hard delete required?
2. Can soft delete be used?
3. Is the record system data?
4. Is it legally/compliantly required?
5. Is cascading behavior safe?

Do NOT automatically replace all hard deletes.

---

# STEP 21 — CASCADE DELETE AUDIT

Inspect Prisma relations with:

```text
onDelete: Cascade
```

This is critical.

A parent deletion must not accidentally remove unrelated or historically important records.

Audit:

```text
Organization
Branch
User
Student
Group
Payment
Invoice
AuditLog
```

and all important relationships.

Especially ensure:

```text
AuditLog
```

is not accidentally destroyed by deleting the entity it describes.

---

# STEP 22 — HISTORICAL DATA

Financial and historical records require special care.

Do not allow deleting an entity to silently destroy:

```text
payments
invoices
transactions
audit records
attendance history
financial history
```

Use references, soft deletion, archival or restrictions according to existing business rules.

---

# STEP 23 — UNIQUE CONSTRAINTS + SOFT DELETE

Audit unique fields.

Example:

```text
email
phone
code
slug
registrationNumber
invoiceNumber
```

If a deleted record remains in the database, determine whether its unique value should:

1. remain reserved
2. be reusable
3. be replaced
4. use a partial unique strategy if supported

Do NOT blindly modify unique constraints.

Document the business decision.

---

# STEP 24 — RELATIONS TO DELETED RECORDS

Determine behavior when an active entity references a deleted entity.

Example:

```text
Student → deleted Group
```

Should:

```text
prevent deletion
detach relation
allow historical reference
```

according to business rules.

Do not create dangling references.

---

# STEP 25 — LIST / SEARCH / REPORT BEHAVIOR

Normal:

```text
list
search
dashboard
reports
```

must generally exclude soft-deleted records unless explicitly requested.

Admin/recovery views may include:

```text
deleted=true
```

only with appropriate permissions.

---

# STEP 26 — EXPORT

Exports must respect lifecycle and authorization.

A user must not export:

```text
deleted records
unauthorized branch records
unauthorized organization records
```

unless explicitly permitted.

Export actions should be auditable.

---

# STEP 27 — IMPORT

Imports must not accidentally resurrect or overwrite deleted records.

Define and document behavior for:

```text
existing active record
existing deleted record
duplicate record
conflicting unique field
```

Do not guess.

---

# STEP 28 — BACKGROUND JOBS

Audit scheduled/background jobs.

They must correctly handle:

```text
deletedAt
organizationId
branchId
```

Examples:

```text
notifications
reports
payments
subscriptions
cleanup
reminders
```

A deleted entity should not unexpectedly continue receiving active workflows.

---

# STEP 29 — AUTOMATIC PURGING

If permanent deletion is required, do NOT implement arbitrary automatic cleanup.

First determine:

```text
retention policy
legal requirements
business requirements
audit requirements
```

If no requirement exists:

```text
DO NOT implement automatic permanent deletion.
```

---

# STEP 30 — AUDIT LOG RETENTION

Similarly, do not automatically delete audit logs.

If a retention policy already exists, document it.

Otherwise preserve audit history.

---

# STEP 31 — AUDIT UI/API

Inspect existing frontend support.

If audit logs already have UI:

* preserve Windzo design
* preserve existing components
* improve only where necessary

If an API exists but UI does not, do not build a large new UI in this phase unless already required.

Foundation first.

---

# STEP 32 — AUDIT FILTERS

Audit log querying should support appropriate filters such as:

```text
entity
entityId
actor
action
branch
date range
```

All filters must still respect authorization.

Do not expose arbitrary database fields.

---

# STEP 33 — AUDIT PAGINATION

Audit logs can become very large.

Ensure:

```text
pagination
maximum limit
safe sorting
indexed filtering
```

are implemented.

Do not allow:

```text
limit=100000000
```

to create expensive queries.

---

# STEP 34 — AUDIT PERFORMANCE

Audit logging must not create unacceptable performance problems.

Inspect:

* synchronous vs asynchronous logging
* transaction behavior
* indexes
* payload size
* large before/after objects

Do not prematurely introduce a complex event bus.

Use the simplest architecture compatible with the current project.

---

# STEP 35 — TRANSACTION CONSISTENCY

For critical mutations:

```text
database mutation
+
audit event
```

must have clearly defined consistency.

Determine whether audit should:

```text
commit with transaction
```

or:

```text
be emitted asynchronously
```

based on the existing architecture.

For critical financial/security changes, avoid silently losing the audit event.

---

# STEP 36 — BULK OPERATIONS

Audit bulk operations:

```text
bulk delete
bulk restore
bulk update
bulk import
```

Do not create millions of individual oversized audit records unnecessarily.

Use an appropriate strategy while preserving traceability.

---

# STEP 37 — API ERROR BEHAVIOR

For deleted records:

```text
GET deleted entity
UPDATE deleted entity
DELETE deleted entity
RESTORE deleted entity
```

define consistent behavior.

Use existing API conventions.

Do not leak information about unauthorized deleted records.

---

# STEP 38 — SEARCH FOR DELETE OPERATIONS

Search entire backend for:

```text
delete(
deleteMany(
destroy
remove
archive
softDelete
deletedAt
isDeleted
```

Create a report.

Every delete operation must be classified:

```text
SOFT DELETE
HARD DELETE
SYSTEM DELETE
UNKNOWN
```

No UNKNOWN items may remain without explanation.

---

# STEP 39 — SEARCH FOR AUDIT GAPS

Identify critical mutations that currently have no audit event.

Especially:

```text
roles
permissions
branch access
financial operations
user changes
deletion
restoration
```

Document gaps.

---

# STEP 40 — TYPESCRIPT SAFETY

Do not use:

```text
any
as any
@ts-ignore
!
```

to bypass lifecycle/audit errors.

Maintain strict TypeScript.

---

# STEP 41 — SECURITY TESTS

Create tests for:

## Test A — Tenant audit isolation

Organization A cannot view Organization B audit logs.

---

## Test B — Branch audit isolation

Branch A cannot view Branch B audit logs without permission.

---

## Test C — Actor identity

Audit actor comes from authenticated user.

Client cannot forge actorId.

---

## Test D — Sensitive data redaction

Audit logs do NOT contain:

```text
password
tokens
secrets
private credentials
```

---

## Test E — Soft delete

Deleted entity disappears from normal list.

---

## Test F — Restore

Authorized user can restore.

Unauthorized user cannot.

---

## Test G — Cross-branch delete

Branch A cannot delete Branch B entity.

---

## Test H — Cross-tenant delete

Organization A cannot delete Organization B entity.

---

## Test I — Audit immutability

Normal user cannot update/delete audit records.

---

## Test J — Permission separation

User with:

```text
entity.view
```

cannot automatically:

```text
entity.delete
entity.restore
```

---

## Test K — Historical data

Deleting/archiving a business entity does not unexpectedly destroy important historical records.

---

## Test L — Unique constraint behavior

Verify expected behavior for deleted records with unique values.

---

# STEP 42 — BUILD + TEST

Run the actual project commands for:

```text
backend typecheck
backend build
unit tests
integration tests
e2e tests
frontend typecheck
frontend build
```

Do not invent commands if package.json provides different scripts.

Do not hide failures.

---

# MANDATORY FINAL CHECKLIST

```text id="0p7d1k"
[x] Existing audit system audited
[x] No duplicate audit architecture created
[x] Audit organization isolation verified
[x] Audit branch isolation verified
[x] Actor identity comes from authenticated context
[x] Audit permissions verified
[x] Audit actions standardized where necessary
[x] Sensitive fields redacted
[x] Audit records protected from modification
[x] Critical mutations audited
[x] Role changes audited
[x] Permission changes audited
[x] Branch access changes audited
[x] Financial actions audited
[x] Delete actions audited
[x] Restore actions audited
[x] Export/import audited where appropriate
[x] Soft-delete strategy documented
[x] Soft-delete entities identified
[x] Normal queries exclude deleted records
[x] Restore protected
[x] Delete permission protected
[x] Hard deletes audited
[x] Cascade deletes audited
[x] Historical data protected
[x] Unique constraints reviewed
[x] Deleted relations reviewed
[x] Reports exclude deleted data appropriately
[x] Exports respect lifecycle
[x] Imports respect lifecycle
[x] Background jobs audited
[x] No unsafe automatic purge
[x] Audit retention reviewed
[x] Audit pagination protected
[x] Audit sorting protected
[x] Audit performance reviewed
[x] Transaction consistency reviewed
[x] Bulk operations reviewed
[x] Security tests added
[x] Backend typecheck passes
[x] Backend build passes
[x] Frontend typecheck passes
[x] Frontend build passes
```

---

# FINAL REPORT

Return:

## 1. Audit Architecture

Describe the final audit implementation.

## 2. Audit Model

Show:

```text
organizationId
branchId
actorUserId
action
entityType
entityId
timestamp
before
after
metadata
```

only for fields actually implemented.

## 3. Audit Coverage

List important audited operations.

## 4. Redaction

List protected sensitive fields.

## 5. Soft Delete Matrix

Provide:

```text
Entity
Soft Delete?
Restore?
Hard Delete?
Reason
```

## 6. Delete Audit

```text
Total delete operations:
Soft delete:
Hard delete:
System delete:
Unresolved:
```

## 7. Cascade Audit

List important cascade relationships and decisions.

## 8. Historical Data

Explain how important historical/financial data is protected.

## 9. Security Tests

```text
Total:
Passed:
Failed:
Skipped:
```

## 10. Build

```text
Backend Typecheck:
PASS / FAIL

Backend Build:
PASS / FAIL

Frontend Typecheck:
PASS / FAIL

Frontend Build:
PASS / FAIL
```

## 11. Breaking Changes

List every breaking change.

If none:

```text
None
```

## 12. Remaining Risks

List every unresolved issue.

## 13. FINAL STATUS

```text
PHASE 5 — AUDIT LOG + SOFT DELETE + DATA LIFECYCLE

PASS
or
NOT READY
```

STOP.

DO NOT continue to PHASE 6 automatically.

Wait for review.
