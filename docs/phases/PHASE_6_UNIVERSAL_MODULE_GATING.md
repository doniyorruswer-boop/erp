# PHASE 6 — UNIVERSAL MODULE ARCHITECTURE + MODULE GATING

PHASE 1 — STRICT MULTI-TENANCY                    ✅
PHASE 2 — STRICT BRANCH ISOLATION                 ✅
PHASE 3 — RBAC + PERMISSION + SCOPE               ✅
PHASE 4 — DTO + VALIDATION + API CONTRACT          ✅
PHASE 5 — AUDIT LOG + SOFT DELETE + DATA LIFECYCLE ✅

Now implement:

# PHASE 6 — UNIVERSAL MODULE ARCHITECTURE + MODULE GATING

This phase establishes Windzo as a UNIVERSAL ERP PLATFORM.

The system must support multiple business verticals without rewriting the core.

Potential future verticals:

```text
Education
Private School
Kindergarten
Training Center
Driving School
Auto School
CRM
Gym / Fitness
Beauty Salon
Medical / Clinic
Real Estate
HR
Service Business
Retail
Other verticals
```

These are examples only.

DO NOT implement all these modules now.

The objective is to create a stable CORE + MODULE architecture.

---

# ABSOLUTE RULES

DO NOT:

* redesign Windzo UI
* replace the existing frontend framework
* rewrite existing working modules
* convert the application into microservices
* create unnecessary abstractions
* implement every future vertical
* create fake placeholder business logic
* duplicate organization/branch/user/RBAC logic
* bypass PHASE 1–5
* create module-specific copies of core functionality
* use `any`
* use `@ts-ignore`
* weaken TypeScript
* introduce a complex plugin marketplace
* introduce dynamic code loading unless already required
* make Education mandatory for the ERP core

The goal is:

```text
CORE
+
OPTIONAL MODULES
```

not:

```text
Education CRM pretending to be ERP
```

---

# STEP 1 — CURRENT ARCHITECTURE AUDIT

Before changing anything inspect:

```text
backend/
frontend/
modules/
features/
services/
controllers/
prisma/
```

Determine:

```text
Which code is CORE?
Which code is Education-specific?
Which code is reusable?
Which code is tightly coupled?
```

Do not modify yet.

Create a dependency map.

---

# STEP 2 — DEFINE CORE

Identify functionality that belongs to almost every business.

Typical CORE candidates:

```text
Organization
Branch
User
Role
Permission
Authentication
Authorization
Tenant context
Branch context
Audit
File storage
Notifications
Settings
Localization
System configuration
Data lifecycle
Pagination
API infrastructure
Error handling
```

Only classify actual project functionality.

Do not invent modules unnecessarily.

---

# STEP 3 — DEFINE VERTICAL MODULES

Identify business-specific functionality.

For the current project, likely examples may include:

```text
Students
Teachers
Courses
Groups
Lessons
Attendance
Enrollments
Academic structure
Education payments
```

But use the actual repository.

Classify each:

```text
CORE
or
VERTICAL MODULE
```

---

# STEP 4 — MODULE BOUNDARIES

Every module should have a clear responsibility.

Conceptually:

```text
CORE
 ├── Auth
 ├── Organizations
 ├── Branches
 ├── Users
 ├── RBAC
 ├── Audit
 ├── Files
 └── Settings

EDUCATION
 ├── Students
 ├── Teachers
 ├── Courses
 ├── Groups
 ├── Lessons
 └── Attendance
```

The exact structure must follow the existing repository.

Do not force a folder structure if it creates unnecessary churn.

---

# STEP 5 — MODULE INDEPENDENCE

A future module such as:

```text
DrivingSchool
```

must be able to use:

```text
Organization
Branch
User
RBAC
Audit
Files
Notifications
```

without copying their implementations.

For example:

```text
DrivingSchool
       ↓
     CORE
```

not:

```text
DrivingSchool
       ↓
its own Organization
its own Branch
its own User
its own RBAC
```

---

# STEP 6 — EDUCATION MUST NOT BE THE CORE

This is mandatory.

Search for core services/controllers/entities that directly depend on Education concepts.

Examples:

```text
Student
Teacher
Course
Group
Lesson
Attendance
```

If something fundamental depends directly on these concepts, determine whether that dependency is necessary.

Avoid architecture such as:

```typescript
OrganizationService
   ↓
StudentService
```

if Organization is supposed to be generic.

Prefer:

```text
OrganizationService
   ↑
Education Module
```

where appropriate.

---

# STEP 7 — MODULE REGISTRY

Design or reuse a module registry.

Conceptually:

```typescript
interface ErpModule {
  key: string;
  name: string;
  version: string;
  enabled: boolean;
}
```

However:

DO NOT blindly copy this interface.

Use a structure compatible with the existing project.

Possible module keys:

```text
core
education
crm
driving_school
auto_service
gym
beauty
```

Only register modules that actually exist.

Future modules can be registered later.

---

# STEP 8 — MODULE METADATA

Determine appropriate metadata.

Potential fields:

```text
key
name
version
description
status
dependencies
permissions
```

Do not add unnecessary fields.

The module system should remain simple.

---

# STEP 9 — MODULE DEPENDENCIES

Support dependency declaration where necessary.

Example:

```text
Education
  requires:
    Core
```

Future:

```text
CRM
  requires:
    Core
```

Do NOT create circular dependencies.

Example invalid:

```text
Education → CRM
CRM → Education
```

unless there is a legitimate architecture supporting it.

---

# STEP 10 — MODULE ENABLEMENT

Organizations should be able to have different modules enabled.

Conceptually:

```text
Organization A
  Education = ON
  CRM       = OFF

Organization B
  Education = OFF
  CRM       = ON

Organization C
  Education = ON
  CRM       = ON
```

This is critical.

Module state should be organization-scoped where appropriate.

Do NOT make module availability only global if the business model requires per-organization activation.

---

# STEP 11 — GLOBAL VS ORGANIZATION MODULES

Clearly distinguish:

```text
GLOBAL MODULE
```

from:

```text
ORGANIZATION ENABLED MODULE
```

For example:

```text
Module exists globally
        ↓
Organization has module enabled
        ↓
Users may access module
        ↓
RBAC determines specific actions
```

These are separate concepts.

---

# STEP 12 — MODULE ENABLEMENT ≠ PERMISSION

Never confuse:

```text
module enabled
```

with:

```text
permission granted
```

Example:

```text
Education module = ON
```

does NOT mean:

```text
every user can manage students
```

The final access decision should conceptually be:

```text
Authenticated
      AND
Organization has module
      AND
Branch access
      AND
Permission
```

---

# STEP 13 — MODULE ACCESS GUARD

Determine whether a reusable module guard/middleware is appropriate.

Conceptually:

```typescript
@RequireModule('education')
```

But:

DO NOT implement this exact API blindly.

Follow existing NestJS architecture.

The guard must verify:

```text
module exists
module enabled for organization
```

and then allow RBAC to make the permission decision.

---

# STEP 14 — MODULE PERMISSIONS

Module permissions should be namespaced.

Examples:

```text
education.students.view
education.students.create
education.students.update
education.students.delete

crm.leads.view
crm.leads.create

driving_school.students.view
```

Do not create permissions such as:

```text
students.view
```

if that creates ambiguity between vertical modules.

However, preserve existing permission naming if PHASE 3 already established a strong convention.

If migration is necessary:

```text
old permission
→ new permission
```

must be handled safely.

---

# STEP 15 — MODULE ROUTES

Audit frontend and backend routes.

Disabled modules must not expose usable functionality.

Verify:

```text
navigation
routes
API endpoints
permissions
```

all agree.

Important:

Hiding a menu item is NOT security.

Backend module authorization remains mandatory.

---

# STEP 16 — FRONTEND MODULE VISIBILITY

The existing Windzo UI must remain visually unchanged.

Only module visibility logic may be added where required.

Conceptually:

```text
Module enabled
+
Permission granted
      ↓
show navigation
```

If disabled:

```text
do not show module navigation
```

But backend authorization remains authoritative.

DO NOT redesign the sidebar.

DO NOT replace Windzo components.

---

# STEP 17 — API MODULE DISCOVERY

Determine whether frontend needs a safe endpoint such as:

```text
GET /modules
```

or an equivalent existing mechanism.

If implemented, return only safe information:

```text
key
name
enabled
```

Do NOT expose:

```text
internal configuration
secrets
database details
private implementation details
```

The endpoint must respect organization context.

---

# STEP 18 — MODULE CONFIGURATION

Determine where module configuration belongs.

Potentially:

```text
OrganizationModule
```

or an equivalent existing model.

Do not create redundant configuration tables.

A typical conceptual relationship:

```text
Organization
   │
   ├── enabled modules
   │
   ├── branches
   │
   └── users
```

---

# STEP 19 — DATABASE MODEL

Inspect Prisma schema.

Determine whether module activation requires a persistent model.

If yes, design it carefully.

Potential conceptual model:

```text
OrganizationModule

id
organizationId
moduleKey
enabled
createdAt
updatedAt
```

Do NOT copy this blindly.

Use the project's naming conventions.

Add appropriate unique constraints.

Example conceptual constraint:

```text
organizationId + moduleKey
```

must be unique.

---

# STEP 20 — MODULE STATE

Define valid module states.

Do not create unnecessary states.

Possible:

```text
ENABLED
DISABLED
```

If the project requires lifecycle states such as:

```text
TRIAL
SUSPENDED
```

document the reason before introducing them.

---

# STEP 21 — MODULE DISABLE BEHAVIOR

This is critical.

When an organization disables a module:

```text
What happens to existing data?
```

The default answer should NOT be:

```text
DELETE DATA
```

Module disablement should generally mean:

```text
module inaccessible
data preserved
```

unless explicit business rules require otherwise.

---

# STEP 22 — RE-ENABLE

If a module is disabled:

```text
data remains
```

Then later:

```text
module enabled
```

the previous data should become available again where appropriate.

Test this.

---

# STEP 23 — MODULE DATA ISOLATION

A module must not accidentally query data belonging to another module.

Example:

```text
Education module
```

must not automatically access:

```text
CRM leads
```

unless an explicit integration exists.

---

# STEP 24 — MODULE-TO-MODULE DEPENDENCY

Future modules may share data.

For example:

```text
CRM
  ↓
Customer
  ↓
Education Enrollment
```

But do not prematurely couple modules.

Use stable core/domain boundaries.

If an integration is needed, document it explicitly.

---

# STEP 25 — MODULE SERVICE DEPENDENCIES

Audit imports.

Look for:

```text
education → crm
education → driving_school
crm → education
```

Classify:

```text
CORE DEPENDENCY
VERTICAL DEPENDENCY
INTEGRATION
UNNECESSARY COUPLING
```

Remove unnecessary coupling.

---

# STEP 26 — MODULE DATABASE COUPLING

Audit Prisma models.

Determine whether generic models contain fields such as:

```text
studentId
teacherId
courseId
groupId
```

that make the CORE education-specific.

If a core model contains vertical-specific fields, assess whether they should remain or move.

Do NOT blindly migrate the database.

Only make changes that materially improve architecture.

---

# STEP 27 — CORE ENTITY DESIGN

Review core entities such as:

```text
Organization
Branch
User
Role
Permission
AuditLog
File
Notification
```

They must not depend on:

```text
Student
Teacher
Course
Group
Lesson
```

unless there is a legitimate generic relationship.

---

# STEP 28 — MODULE-SCOPED SETTINGS

Determine whether module-specific settings should live separately.

Example:

```text
Education settings
CRM settings
Driving School settings
```

Do NOT pollute global organization settings with hundreds of vertical-specific fields.

Prefer modular configuration where justified.

---

# STEP 29 — MODULE FEATURE FLAGS

Do not confuse:

```text
MODULE
```

with:

```text
FEATURE FLAG
```

Module:

```text
education
crm
driving_school
```

Feature flag:

```text
education.new_attendance
new_dashboard
experimental_reports
```

Keep these concepts separate.

Do NOT build a large feature-flag system unless the project actually needs it.

---

# STEP 30 — MODULE VERSIONING

Determine whether module versions are needed.

Example:

```text
education@1.0
education@1.1
```

Do NOT implement complex versioning now unless necessary.

Document the future strategy.

---

# STEP 31 — MODULE MIGRATIONS

If a module has module-specific database migrations, ensure they do not corrupt other modules.

Understand the current Prisma migration strategy.

Do not create dynamic per-organization migrations.

Database schema remains application-level.

---

# STEP 32 — SEED DATA

Audit seed scripts.

Do not seed every future module into every organization.

Seeds should distinguish:

```text
CORE seed
MODULE seed
DEMO seed
TEST seed
```

where useful.

---

# STEP 33 — RBAC INTEGRATION

Module gating must integrate with PHASE 3.

Example:

```text
Education module enabled
+
education.students.view
+
branch access
```

Only then:

```text
GET students
```

is allowed.

Never bypass existing RBAC.

---

# STEP 34 — AUDIT INTEGRATION

Module administration actions must integrate with PHASE 5.

Examples:

```text
MODULE_ENABLED
MODULE_DISABLED
```

If module management exists, those changes should be auditable.

Do not log sensitive data.

---

# STEP 35 — SOFT DELETE INTEGRATION

Module disabling is NOT deletion.

Never implement:

```text
disable module
→ delete module data
```

by default.

Module lifecycle:

```text
ENABLED
   ↓
DISABLED
   ↓
ENABLED
```

Data remains intact.

---

# STEP 36 — ORGANIZATION ONBOARDING

Inspect organization creation.

Determine which modules are enabled for:

```text
new organization
```

Do not hard-code Education as the only default if the platform is intended to be universal.

Possible conceptual strategy:

```text
CORE
+
selected modules
```

Use actual business requirements.

---

# STEP 37 — SUPER ADMIN / PLATFORM ADMIN

Determine who can:

```text
enable module
disable module
```

This must NOT automatically be available to every organization administrator.

Define:

```text
platform-level
organization-level
```

responsibilities.

Preserve PHASE 3 RBAC.

---

# STEP 38 — BILLING FUTURE COMPATIBILITY

Do not implement billing now unless already present.

But ensure the module architecture does not make future subscription logic impossible.

Conceptually:

```text
Organization
   ↓
Subscription
   ↓
Enabled Modules
```

Document as future architecture only if not currently implemented.

---

# STEP 39 — FRONTEND ROUTE GUARDS

If the frontend uses Vue Router guards:

verify they do not become the primary security layer.

Frontend:

```text
UX protection
```

Backend:

```text
REAL security
```

Disabled modules must still be rejected by backend.

---

# STEP 40 — API DIRECT ACCESS TEST

Even if frontend navigation is hidden, manually call:

```text
GET /education/...
POST /education/...
```

for a disabled module.

Expected:

```text
403
```

or the project's established module-disabled response.

Do NOT rely on frontend hiding.

---

# STEP 41 — MODULE ENABLEMENT TESTS

Create tests:

### Test A

Organization A:

```text
Education = ENABLED
```

Organization B:

```text
Education = DISABLED
```

A can access Education.

B cannot.

---

### Test B

Education disabled.

User manually calls Education API.

Expected:

```text
DENIED
```

---

### Test C

Education enabled.

User has no Education permission.

Expected:

```text
DENIED
```

---

### Test D

Education enabled.

User has permission.

But branch unauthorized.

Expected:

```text
DENIED
```

---

### Test E

Education disabled.

Existing Education data remains.

Enable again.

Existing data is accessible again.

---

### Test F

Organization A disables Education.

Organization B remains enabled.

B is unaffected.

---

### Test G

User attempts to modify module state without permission.

Expected:

```text
DENIED
```

---

### Test H

Module enable/disable produces audit event where applicable.

---

# STEP 42 — ARCHITECTURAL TEST

Create a conceptual future test:

```text
Add CRM module
```

without modifying:

```text
Organization
Branch
Authentication
RBAC core
Audit core
```

If adding CRM requires changing core Education-specific code, identify why.

The architecture should make this reasonably straightforward.

---

# STEP 43 — SEARCH FOR EDUCATION COUPLING

Search entire repository for:

```text
Student
Teacher
Course
Group
Lesson
Attendance
Enrollment
```

inside:

```text
core
auth
organization
branch
user
rbac
audit
settings
```

Review every occurrence.

---

# STEP 44 — SEARCH FOR MODULE BYPASS

Search for:

```text
education
crm
driving
module
feature
```

inside:

```text
guards
middleware
controllers
services
repositories
frontend routes
```

Determine whether any endpoint can bypass module activation.

---

# STEP 45 — TYPESCRIPT SAFETY

Do not use:

```text
any
as any
@ts-ignore
```

to resolve module architecture problems.

Maintain strict TypeScript.

---

# STEP 46 — PERFORMANCE

Module gating should not introduce excessive database queries.

Avoid:

```text
every API request
→ multiple module queries
→ multiple permission queries
```

Reuse existing request context/caching mechanisms where appropriate.

Do not introduce Redis solely for this phase unless already used and necessary.

---

# STEP 47 — MIGRATION SAFETY

If database changes are required:

```text
migration
```

must be reversible where practical.

Before applying:

```text
inspect existing data
```

Do not destroy production data.

Do not reset the database.

NEVER use destructive commands against existing project data without explicit authorization.

---

# STEP 48 — FRONTEND PRESERVATION

The current Windzo template is intentionally preserved.

DO NOT:

* redesign sidebar
* redesign dashboard
* replace theme
* replace components
* replace typography
* change color system
* change layout

Only add module-awareness to existing UI where required.

---

# STEP 49 — DOCUMENTATION

Create/update architecture documentation explaining:

```text
CORE
MODULE
ORGANIZATION MODULE
PERMISSION
BRANCH ACCESS
AUDIT
```

The documentation must explain:

```text
Module Enabled
      ↓
RBAC Permission
      ↓
Branch Access
      ↓
API Access
```

---

# STEP 50 — FINAL ARCHITECTURAL VALIDATION

The final architecture should conceptually support:

```text
                    WINDZO ERP
                         │
             ┌───────────┴───────────┐
             │                       │
            CORE                 MODULES
             │                       │
     ┌───────┼────────┐       ┌─────┼─────┐
     │       │        │       │     │     │
   Auth   Tenant    RBAC   Education CRM  ...
     │       │        │
     └───────┼────────┘
             │
           Audit
```

Future:

```text
Driving School
Auto Service
Gym
Beauty
Real Estate
HR
```

must be able to sit beside Education rather than inside Education.

---

# MANDATORY FINAL CHECKLIST

```text
[x] Current architecture audited
[x] CORE identified
[x] Vertical modules identified
[x] Education-specific boundaries identified
[x] CORE does not unnecessarily depend on Education
[x] Module boundaries documented
[x] Module registry strategy established
[x] Module metadata strategy established
[x] Module dependencies reviewed
[x] Organization-level module enablement established where required
[x] Global vs organization module state separated
[x] Module enablement separated from RBAC
[x] Module access guard implemented/reused where appropriate
[x] Module permissions namespaced appropriately
[x] Backend module security implemented
[x] Frontend module visibility integrated without UI redesign
[x] API module discovery reviewed
[x] Module configuration architecture established
[x] Module disable preserves data
[x] Module re-enable works
[x] Module-to-module coupling reviewed
[x] Database coupling reviewed
[x] Core entities reviewed
[x] Module-specific settings reviewed
[x] Feature flags kept separate
[x] Versioning strategy documented
[x] Migration strategy reviewed
[x] Seeds reviewed
[x] RBAC integration verified
[x] Audit integration verified
[x] Soft-delete integration verified
[x] Organization onboarding reviewed
[x] Platform/org admin responsibilities reviewed
[x] Future billing compatibility documented
[x] Frontend route guards reviewed
[x] Direct API access tested
[x] Module enable/disable tests added
[x] Future CRM architecture test considered
[x] Education coupling search completed
[x] Module bypass search completed
[x] TypeScript strictness preserved
[x] Performance reviewed
[x] Migration safety verified
[x] Windzo UI preserved
[x] Architecture documentation updated
[x] Backend typecheck passes
[x] Backend build passes
[x] Frontend typecheck passes
[x] Frontend build passes
```

---

# FINAL REPORT

Return:

## 1. CORE Architecture

List every actual CORE module.

## 2. Vertical Modules

List every actual vertical module.

## 3. Education Coupling

Show:

```text
Strong coupling:
Acceptable coupling:
Removed coupling:
Remaining coupling:
```

## 4. Module Registry

Show the actual implementation.

## 5. Module Enablement

Explain exactly how an organization enables/disables modules.

## 6. Module Security

Explain:

```text
Module
+
Permission
+
Branch
+
Organization
```

authorization flow.

## 7. Database

Show any new/changed Prisma models.

## 8. Permissions

List module-related permissions.

## 9. Audit

List module lifecycle events that are audited.

## 10. Frontend

Explain how module visibility integrates with the existing Windzo UI WITHOUT redesign.

## 11. Tests

```text
Total:
Passed:
Failed:
Skipped:
```

## 12. Build

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

## 13. Breaking Changes

List every breaking change.

If none:

```text
None
```

## 14. Remaining Risks

List all unresolved architecture issues.

## 15. Future Module Test

Explain how a future:

```text
CRM
```

could be added without modifying core architecture.

## 16. FINAL STATUS

```text
PHASE 6 — UNIVERSAL MODULE ARCHITECTURE + MODULE GATING

PASS
or
NOT READY
```

STOP.

DO NOT continue to PHASE 7 automatically.

Wait for review.
