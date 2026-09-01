# PHASE 10.4 — STEP 2 / 3

# GROUPS + ENROLLMENTS + LESSONS + ATTENDANCE + EXAMS + GRADES

You are continuing the Windzo ERP Education backend implementation.

## CURRENT STATUS

```text
PHASE 1    Strict Multi-Tenancy              ✅
PHASE 2    Branch Isolation                  ✅
PHASE 3    RBAC + Permissions                ✅
PHASE 4    DTO + Validation                  ✅
PHASE 5    Audit + Soft Delete               ✅
PHASE 6    Universal Module Architecture     ✅
PHASE 7    Database Hardening                ✅
PHASE 8    Production Security               ✅
PHASE 9    ERP Core / Vertical Readiness     ✅
PHASE 10.1 Education Domain Design            ✅
PHASE 10.2 Education Database Foundation     ✅
PHASE 10.3 Education DTOs & Contracts        ✅
PHASE 10.4 STEP 1 Parents/Courses/Contracts  ✅
```

Now implement:

```text
PHASE 10.4 — STEP 2 / 3
```

Scope:

```text
Groups
Group Enrollments
Lessons
Attendance
Exams
Grades
```

---

# 1. FIRST — INSPECT EXISTING CODE

Before writing anything:

Read the actual:

```text
Prisma schema
Education DTOs
Groups DTOs
Enrollment DTOs
Lesson DTOs
Attendance DTOs
Exam DTOs
Grade DTOs
existing services
existing controllers
auth
CurrentTenant
branch authorization
permission guards
AuditService
soft-delete implementation
pagination
exception handling
existing tests
```

Do NOT assume names.

Use the actual project structure and existing conventions.

---

# 2. DO NOT MODIFY CORE UNNECESSARILY

Education remains a vertical.

Architecture:

```text
ERP CORE
    ↓
EDUCATION
```

Do NOT create parallel:

```text
Auth
RBAC
Audit
Tenant
Finance
```

systems.

Reuse existing infrastructure.

---

# 3. ABSOLUTE TENANT RULE

Every tenant-sensitive service method MUST use:

```typescript
orgId: string
```

Never:

```typescript
orgId?: string
```

Tenant context MUST come from authenticated user context.

Never from:

```text
body
query
arbitrary headers
route parameter
```

---

# 4. GROUPS

Implement Group service/controller according to the actual schema.

Expected operations where supported:

```text
create
findAll
findOne
update
remove
restore
```

---

# 5. GROUP CREATE VALIDATION

Before creating a Group verify all related resources.

For example:

```text
Course
Teacher
Branch
Room
```

if they exist.

Every related ID must be verified.

Example:

```text
Course.organizationId === orgId
Teacher.organizationId === orgId
Branch.organizationId === orgId
```

and branch compatibility must be checked where applicable.

Never trust DTO foreign keys.

---

# 6. GROUP CAPACITY

If Group has capacity:

```text
capacity >= 0
```

must be enforced.

Do not allow enrollment beyond capacity unless the existing domain explicitly supports overbooking.

---

# 7. GROUP BRANCH ISOLATION

If Group is branch-scoped:

```text
group.branchId
```

must respect current user's branch scope.

Use existing:

```text
assertBranchAccess
buildBranchWhere
```

or the actual equivalents.

Do not invent a new branch authorization mechanism.

---

# 8. GROUP UPDATE

Verify:

```text
group belongs to org
user can access group branch
related entities belong to org
permission allows update
```

before updating.

Do not allow accidental organization changes.

---

# 9. GROUP DELETE

Follow existing soft-delete architecture.

Before deleting consider:

```text
enrollments
lessons
attendance
exams
grades
```

Historical academic records must not be accidentally destroyed.

If deletion should be blocked by business rules, implement that.

Do not hard-delete historical data.

---

# 10. ENROLLMENT IS NOT NORMAL CRUD

Treat GroupEnrollment as a business process.

Implement appropriate operations from the actual DTO/schema:

```text
enroll
findAll
findOne
updateStatus
freeze
unfreeze
leave
complete
transfer
```

Only implement operations that are supported by the actual domain.

---

# 11. ENROLLMENT OWNERSHIP

Every enrollment operation must verify:

```text
Student belongs to org
Group belongs to org
```

and branch compatibility where required.

This must happen in Service.

DTO validation is NOT enough.

---

# 12. ENROLLMENT CAPACITY

When enrolling:

```text
active enrollment count
        <
group capacity
```

if capacity exists.

This must be concurrency-safe.

If multiple records are updated together, use Prisma transaction according to existing architecture.

Avoid race conditions.

---

# 13. DUPLICATE ENROLLMENT

Prevent invalid duplicate active enrollments according to the domain rules.

Use:

```text
Service validation
+
Database constraint where appropriate
```

Do not rely on service checks alone.

---

# 14. ENROLLMENT HISTORY

Do not destroy history by overwriting records.

For transfer:

```text
Old Group Enrollment
        ↓
LEFT

New Group Enrollment
        ↓
ACTIVE
```

Preserve historical information.

Use transaction.

---

# 15. ENROLLMENT STATUS

Use actual Prisma enum.

If the domain contains:

```text
ACTIVE
FROZEN
COMPLETED
LEFT
```

respect it.

Do not accept arbitrary strings.

Validate legal status transitions.

Do not invent transitions without examining the actual model.

---

# 16. LESSONS

Implement Lesson service/controller.

Expected operations where supported:

```text
create
findAll
findOne
update
remove
```

---

# 17. LESSON OWNERSHIP

Before creating/updating a Lesson verify:

```text
Group belongs to org
Teacher belongs to org
Branch belongs to org
Room belongs to org
```

where applicable.

Never allow cross-tenant relationships.

---

# 18. LESSON TIME VALIDATION

If lesson contains start/end:

```text
start < end
```

must be enforced.

Also inspect obvious scheduling conflicts if the domain requires it.

Do not build a complex scheduling engine unless already specified.

---

# 19. LESSON BRANCH

If Lesson is branch-scoped:

```text
lesson.branchId
```

must be compatible with Group and authorized user scope.

---

# 20. ATTENDANCE

Attendance is business-critical.

Implement appropriate operations:

```text
mark
findByLesson
findByStudent
update
```

and bulk marking if DTO/API design supports it.

---

# 21. ATTENDANCE OWNERSHIP

Before creating attendance:

```text
Lesson belongs to org
Student belongs to org
```

Then verify:

```text
Student belongs to Lesson's Group
```

where the domain requires this.

This is mandatory.

A random student from the same organization must not be attachable to an unrelated lesson.

---

# 22. DUPLICATE ATTENDANCE

Prevent:

```text
same lesson
+
same student
+
multiple attendance records
```

Use:

```text
Service validation
+
Database unique constraint
```

where appropriate.

---

# 23. ATTENDANCE STATUS

Use actual enum from Prisma.

If:

```text
PRESENT
ABSENT
LATE
EXCUSED
```

exists, use it.

No arbitrary strings.

---

# 24. BULK ATTENDANCE

If the existing DTO supports bulk attendance:

Implement atomically.

Conceptually:

```text
markAttendance(
  orgId,
  lessonId,
  records[]
)
```

Validate EVERY student before writing.

Do not partially write invalid data.

Use transaction.

---

# 25. TEACHER ATTENDANCE SCOPE

A Teacher must not automatically be able to mark attendance for every group.

Verify:

```text
Teacher
 ↓
authorized group
 ↓
lesson
 ↓
attendance
```

using the existing permission/scope architecture.

Do not hard-code role logic if permissions/scope already exist.

---

# 26. EXAMS

Implement Exam service/controller according to actual DTO/schema.

Expected operations:

```text
create
findAll
findOne
update
remove
```

where supported.

---

# 27. EXAM OWNERSHIP

Before creating/updating Exam:

Verify all related entities:

```text
Group
Course
Lesson
Teacher
Branch
```

only if they actually exist in the schema.

Every relation must be tenant-safe.

---

# 28. MAX SCORE

If Exam contains:

```text
maxScore
```

validate:

```text
maxScore >= 0
```

but remember:

DTO validation is not enough for Grade.

---

# 29. GRADES

Implement Grade service/controller.

Before creating/updating Grade verify:

```text
Exam belongs to org
Student belongs to org
```

and if required:

```text
Student belongs to Exam's Group
```

---

# 30. GRADE SCORE

If:

```text
Exam.maxScore = 100
```

then:

```text
Grade.score = 100
```

PASS.

```text
Grade.score = 101
```

MUST fail.

Also:

```text
Grade.score < 0
```

MUST fail.

The Service MUST fetch the actual Exam from the database and compare against its current `maxScore`.

Do not trust client-provided maxScore.

---

# 31. GRADE DUPLICATES

Determine from the actual schema/business rules whether one student can have:

```text
one grade per exam
```

If yes:

```text
studentId + examId
```

must be unique.

Use database constraint where appropriate.

---

# 32. TEACHER GRADE SCOPE

Teachers should only grade exams/students they are authorized to manage.

Do not allow:

```text
Teacher A
    ↓
Exam/Group owned by Teacher B
```

unless the existing permission model explicitly permits it.

---

# 33. TENANT ATTACK TESTS

Test:

```text
Org A Student
+
Org B Group
```

Expected:

```text
REJECTED
```

Test:

```text
Org A Lesson
+
Org B Student Attendance
```

Expected:

```text
REJECTED
```

Test:

```text
Org A Exam
+
Org B Student Grade
```

Expected:

```text
REJECTED
```

---

# 34. BRANCH ATTACK TESTS

Create:

```text
Org A
 ├── Branch A
 └── Branch B
```

Test user restricted to Branch A attempting to access:

```text
Group Branch B
Lesson Branch B
Attendance Branch B
Exam Branch B
Grade Branch B
```

All unauthorized access must be rejected.

---

# 35. PERMISSIONS

Every endpoint must use existing permission infrastructure.

Do NOT write:

```typescript
if (user.role === 'ADMIN') ...
```

unless that exact pattern is already the project's architecture.

Prefer:

```text
Permission
+
Scope
```

---

# 36. AUDIT

All important mutations must use existing AuditService:

```text
Group create/update/delete/restore
Enrollment create/status/transfer
Lesson create/update/delete
Attendance changes
Exam create/update/delete
Grade create/update
```

Do not create a second audit system.

---

# 37. SOFT DELETE

Follow existing lifecycle architecture.

Do not delete historical:

```text
attendance
grades
lessons
enrollments
```

just because a parent resource is deleted.

Evaluate cascading behavior carefully.

---

# 38. PAGINATION

Collection endpoints must use existing pagination.

Respect:

```text
limit <= 100
```

or actual configured project limit.

Do not load huge datasets.

---

# 39. SEARCH / FILTER

Use existing query DTOs.

Implement database-side filtering.

Do not retrieve the entire table and filter in JavaScript.

---

# 40. N+1

Inspect Prisma queries.

Avoid:

```text
100 groups
+
100 separate enrollment queries
```

Use appropriate Prisma:

```text
include
select
batch queries
```

but do not over-fetch.

---

# 41. RESPONSE SECURITY

Never expose:

```text
password
internal security fields
unnecessary audit internals
```

Use existing response serialization/select patterns.

---

# 42. ERROR HANDLING

Use existing exception architecture.

Expected:

```text
NotFoundException
ForbiddenException
BadRequestException
ConflictException
```

as appropriate.

Never expose raw Prisma errors.

---

# 43. CONTROLLERS MUST REMAIN THIN

Controller:

```text
Auth
Tenant
DTO
Params
Query
Service call
```

Service:

```text
Business logic
Ownership
Branch checks
Transactions
Prisma
Audit
```

No direct Prisma calls from controllers.

---

# 44. TRANSACTIONS

Use transaction where multiple operations must be atomic.

Especially inspect:

```text
Enrollment transfer
Bulk attendance
Enrollment + related operations
Grade + related lifecycle
```

Do not use transactions unnecessarily for simple reads.

---

# 45. TESTS

Create/run targeted tests.

Minimum:

```text
Group cross-tenant access
Group cross-branch access

Enrollment cross-tenant
Enrollment capacity
Duplicate enrollment
Enrollment transfer

Lesson cross-tenant
Lesson branch access

Attendance cross-tenant
Attendance wrong-group student
Duplicate attendance
Bulk attendance

Exam cross-tenant

Grade cross-tenant
Grade wrong-group student
Grade > maxScore
Grade < 0
Duplicate grade
```

Use the actual testing framework already present in the project.

---

# 46. REGRESSION

Run existing tests for:

```text
Auth
Tenant isolation
Branch isolation
RBAC
Permissions
DTO validation
Audit
Soft delete
Core modules
Step 1 Education services
```

Nothing from previous phases may regress.

---

# 47. BUILD

Run the actual project commands:

```bash
npx tsc --noEmit
npm run build
```

and the appropriate test command.

Do not claim PASS unless commands actually execute successfully.

---

# 48. NO FRONTEND

This is BACKEND ONLY.

DO NOT modify:

```text
Vue
Windzo template
CSS
frontend pages
frontend components
frontend stores
```

Frontend comes later.

---

# 49. NO UNRELATED REFACTORING

Only modify files required for Step 2.

Do not rewrite Core.

Do not rename unrelated modules.

Do not change established architecture without reporting why.

---

# 50. FINAL SELF-AUDIT

Before finishing inspect:

```text
[ ] orgId: string everywhere
[ ] CurrentTenant JWT-only
[ ] no organizationId from DTO
[ ] no tenant fallback
[ ] branch authorization
[ ] related entity ownership
[ ] permission checks
[ ] business rules
[ ] capacity
[ ] enrollment history
[ ] attendance integrity
[ ] exam ownership
[ ] maxScore validation
[ ] grade ownership
[ ] duplicate protection
[ ] transactions
[ ] audit
[ ] soft delete
[ ] pagination
[ ] N+1
[ ] error handling
[ ] response security
```

---

# 51. FINAL REPORT

Return:

```text
# PHASE 10.4 — STEP 2 REPORT

## 1. Groups
## 2. Enrollments
## 3. Lessons
## 4. Attendance
## 5. Exams
## 6. Grades

## 7. Tenant Isolation
## 8. Branch Isolation
## 9. Related Entity Ownership
## 10. RBAC / Permissions
## 11. Business Rules
## 12. Transactions
## 13. Audit
## 14. Soft Delete
## 15. Pagination / Search
## 16. Security Tests
## 17. Regression Tests
## 18. Typecheck
## 19. Build
## 20. Files Created
## 21. Files Modified
## 22. Files Deleted
## 23. Problems Found
## 24. Architectural Risks
## 25. Required Fixes
## 26. Final Verdict
```

Provide REAL test results.

Never fabricate PASS.

Final verdict:

```text
PASS
PASS WITH CHANGES
NOT READY
```

---

# 52. STOP CONDITION

After Step 2 is completed:

STOP.

Do NOT implement Step 3.

Wait for further instruction.

# END PHASE 10.4 — STEP 2
