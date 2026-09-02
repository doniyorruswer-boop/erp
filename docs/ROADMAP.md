# 🚀 EduHub -> Universal Multi-Tenant ERP/SaaS Architecture & Roadmap

Ushbu hujjat **EduHub** tizimini bosqichma-bosqich yagona mustahkam Core va turli biznes sohalari uchun moslashuvchan **Vertical Modullar**ga ega bo'lgan **Universal ERP/SaaS** platformasiga aylantirishning to'liq arxitektura rejasi va barcha bosqichli promptlarini o'z ichiga oladi.

---

## 🏛 1. Asosiy Arxitektura Tamoyili (Core Platform vs Vertical Modules)

> **Oltin Qoida:** Universal ERP barcha sohalarning 100% biznes-logikasini oldindan bilishi shart emas. U **umumiy biznes infratuzilmasini** (Core) universal qiladi, har bir sohaning maxsus qoidalarini esa **Vertical Module**ga beradi.

```text
                           UNIVERSAL ERP
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
         ERP CORE                              VERTICAL MODULES
              │                                     │
 ┌────────────┼────────────┐                        │
 │            │            │                        │
CRM        FINANCE        HR                        │
 │            │            │                        │
Customer   Invoice      Employee                    │
Lead       Payment      Payroll                     │
Pipeline   Expense                                  │
Activity   Cashbox                                  │
                                           ┌────────┼─────────┐
                                           │        │         │
                                      Education  Driving    Other (Gym/Beauty)
                                           │        │         │
                                        Student   Driver    ...
                                        Teacher   Vehicle
                                        Course    Exam
                                        Group     Practice
                                        Lesson
```

---

## 🧭 2. Sohalarning Mosligi va Qamrovi

### 🟢 1. Core bilan 100% tabiiy mos keluvchi sohalar:
1. **Ta'lim (Education)**: O'quv markazi, xususiy maktab, bog'cha, til markazi, IT akademiya.
2. **Avtomaktab (Driving School)**: O'quvchi, instruktor, mashina (Resource), nazariya/amaliyot (Schedule), imtihon, sertifikat.
3. **Fitness / Gym**: Mijoz, a'zolik paketi (Membership), trenyor (Employee), dars/zal (Resource), davomat.
4. **Go'zallik saloni / Beauty**: Mijoz, usta (Employee), xizmat (Service), bron qilish (Appointment), sarf-xarajat.
5. **Ko'chmas mulk (Real Estate)**: Lid, mijoz, obyekt (Resource/Property), rieltor (Agent), ko'rish (Viewing), bitim.
6. **Xizmat ko'rsatish markazlari (Service Center)**: Avtoservis, gadjet ta'mirlash (ServiceOrder, Parts, Invoice).

### 🟡 2. Maxsus chuqur modul talab qiluvchi sohalar:
1. **Klinika / Medical Center**: Bemor, shifokor, tibbiy karta, retsept, tashxis (Medical-specific architecture).
2. **Mehmonxona (Hotel)**: Mehmon, xona (Room Resource), bronlash dvigateli (Reservation engine), tozalash (Housekeeping).
3. **Restoran / POS**: Stol, buyurtma, menyu, oshxona, ofitsiant, ombor (POS & Inventory).
4. **Savdo / Retail**: Mahsulot, ombor (Warehouse), qoldiq (Stock), xarid, savdo.

### 🚫 3. Ushbu ERP bilan aralashtirish noto'g'ri bo'lgan sohalar:
* Bank / Sug'urta tizimlari, og'ir sanoat, aerokosmik — bular tor ixtisoslashgan alohida mustaqil platformalarni talab qiladi.

---

## 🎯 3. Bosqichma-bosqich Rivojlanish Tartibi (Execution Order)

```text
00: Qoidalar -> 01: Audit -> 02: DB V2 Dizayn -> 03: Multi-tenancy -> 04: Branch
 ↓
05: RBAC -> 06: DTO/Validation -> 07: Audit/Soft-Delete -> 08: Core CRM -> 09: Custom Fields
 ↓
10: Resource/Schedule -> 11: Finance Core -> 12: Education Module -> 13: Education Rules
 ↓
14: Dashboard -> 15: Notifications -> 16: Background Jobs -> 17: Import/Export
 ↓
18: SaaS/Subscription -> 19: Workflow -> 20: Driving School Test -> 21: Universality Test
 ↓
22: Testing -> 23: Production Hardening -> 24: Frontend Modular Refactor -> 25: Final Review
```

---

# 📋 4. Barcha Bosqich Promptlari (Prompt 00 — Prompt 25)

---

### 🔹 PROMPT 00 — PROJECT RULES
```text
You are working on an existing EduCRM project.

The project is intended to evolve into a multi-tenant Universal ERP/SaaS platform.

Current stack:
- Backend: NestJS + TypeScript + Prisma + PostgreSQL
- Frontend: Vue 3
- Existing modules include authentication, users, students, courses, groups, attendance, payments, contracts, leads, rooms and dashboard.

IMPORTANT:
Do NOT rewrite the project from scratch.
Do NOT delete working business functionality.
Do NOT introduce microservices at this stage.
Use Modular Monolith architecture.

Architecture principle:

CORE PLATFORM
- Organizations
- Branches
- Users
- Roles
- Permissions
- CRM
- Finance
- Employees/HR
- Resources
- Scheduling
- Notifications
- Files
- Audit Logs
- Custom Fields
- Settings
- Feature Flags
- Module Management

VERTICAL MODULES
- Education
- Driving School
- Future business-specific modules

The Core must not contain business-specific Education or Driving School logic.

Before changing code:
1. Inspect the existing project.
2. Identify existing models/services/controllers/components that can be reused.
3. Do not duplicate existing functionality.
4. Do not make unnecessary breaking changes.
5. Explain architectural impact before major changes.
6. Keep backward compatibility where practical.
7. Run tests/type checking after changes.

Never create a generic abstraction just for the sake of abstraction.
Prefer simple, maintainable modular architecture.
```

---

### 🔹 PROMPT 01 — FULL CODE AUDIT
```text
Perform a complete architectural audit of the existing project.

Inspect:
- NestJS modules
- Controllers
- Services
- DTOs
- Guards
- JWT authentication
- Authorization
- Prisma schema
- Database relationships
- Vue structure
- Stores
- API layer
- Routing
- Components
- Dashboard
- Configuration
- Environment variables

Do not modify code yet.

Find:
1. Multi-tenancy vulnerabilities
2. Missing organization filters
3. Missing branch architecture
4. Authorization weaknesses
5. Missing DTO validation
6. Duplicate frontend components
7. Business logic coupling
8. Incorrect database relationships
9. Finance weaknesses
10. Missing audit logging
11. Missing soft delete
12. Production security problems
13. Scalability problems
14. Code duplication
15. Areas that prevent future vertical modules

Classify every issue:
CRITICAL
HIGH
MEDIUM
LOW

For each issue provide:
- File
- Current implementation
- Problem
- Risk
- Recommended solution
- Whether migration is required

Do not modify code.
```

---

### 🔹 PROMPT 02 — DATABASE V2 DESIGN
```text
Based on the existing Prisma schema and the architectural audit, design the target Database V2 architecture.

Do not immediately migrate the database.

First produce:
1. Target entity list
2. Core entities
3. Education entities
4. Future Driving School entities
5. Relationships
6. Required indexes
7. Unique constraints
8. Tenant isolation strategy
9. Soft-delete strategy
10. Audit strategy

Core target concepts:

Organization
Branch
User
Role
Permission
RolePermission
UserBranch

Customer
Lead
Pipeline
PipelineStage
Activity
Task
Note
Tag

Product
Service
PriceList

Invoice
InvoiceItem
Payment
PaymentAllocation
Refund
Expense
ExpenseCategory
Cashbox
Transaction

Resource
Schedule
CalendarEvent

Notification
NotificationTemplate

File
AuditLog

CustomFieldDefinition

SystemConfig
FeatureFlag
ModuleConfiguration

Education:
Student
Parent
Course
Group
GroupEnrollment
Lesson
Attendance
Exam
Grade
Homework
Contract

Do not introduce Person abstraction yet unless the existing project clearly requires it.
Do not introduce microservices.

After designing the schema, explain which existing models can be migrated and which should remain unchanged.
```

---

### 🔹 PROMPT 03 — MULTI-TENANCY
```text
Implement secure multi-tenancy in the existing NestJS application.

Requirements:

1. JWT must contain:
- userId
- organizationId
- role

2. Every tenant-owned entity must be isolated by organizationId.

3. No user from Organization A can access Organization B data.

4. Introduce a clear TenantContext abstraction.

5. Avoid unsafe global Prisma magic that could accidentally break system-level operations.

6. Review every existing service:
- Students
- Courses
- Groups
- Attendance
- Payments
- Contracts
- Leads
- Users
- Rooms
- Dashboard
- Settings

7. Add organization filtering to all relevant queries.

8. Add tests proving tenant isolation.

9. Make organizationId non-null where appropriate.

10. Do not break existing functionality.

Before implementation, list every affected service.
After implementation, run tests and type checking.
```

---

### 🔹 PROMPT 04 — BRANCH ARCHITECTURE
```text
Implement Branch architecture.

Requirements:

Organization
    ↓
Branch
    ↓
Users / Students / Groups / Resources / Finance

Add:
- Branch model
- UserBranch relation
- Branch CRUD
- Branch permissions
- Branch-aware queries

Support:
1. Organization-wide administrators
2. Branch managers
3. Users assigned to specific branches

A user must never access a branch outside their authorized scope.

Do not duplicate organization logic.
Create reusable authorization/scoping utilities.

Add tests for:
- organization isolation
- branch isolation
- organization admin
- branch manager
```

---

### 🔹 PROMPT 05 — RBAC
```text
Refactor authorization into granular RBAC.

Implement:

Permission
Role
RolePermission
UserRole or appropriate existing relation

Permission examples:

students.view
students.create
students.update
students.delete
students.export

groups.view
groups.create
groups.update
groups.delete

payments.view
payments.create
payments.refund

reports.view

Use reusable NestJS guards/decorators.

Support permission scopes:
- organization
- branch
- own records

Do not hardcode permissions inside controllers.
Existing roles must continue working where possible.

Add authorization tests.
```

---

### 🔹 PROMPT 06 — DTO + VALIDATION
```text
Refactor all public NestJS endpoints to use strongly typed DTOs.

Requirements:
- No @Body() body: any
- class-validator
- class-transformer
- Global ValidationPipe
- whitelist
- forbidNonWhitelisted where appropriate
- consistent validation errors

Review all controllers.

Create:
CreateDto
UpdateDto
QueryDto

for relevant resources.

Do not change API behavior unnecessarily.
Add tests for invalid payloads and authorization failures.
```

---

### 🔹 PROMPT 07 — AUDIT + SOFT DELETE
```text
Implement enterprise-grade audit logging and soft delete.

AuditLog fields should support:
- organizationId
- branchId
- userId
- action
- entityType
- entityId
- before
- after
- ip
- userAgent
- createdAt

Actions:
CREATE
UPDATE
DELETE
RESTORE
LOGIN
LOGOUT
PAYMENT
REFUND
etc.

Implement soft delete for appropriate business entities.
Do NOT physically delete financial transactions or audit records.

Payment deletion must be replaced with:
- void
- reversal
- refund
where appropriate.

Add audit tests.
```

---

### 🔹 PROMPT 08 — CORE CRM
```text
Refactor CRM into a reusable Core module.

Implement:

Customer
Lead
Pipeline
PipelineStage
Activity
Task
Note
Tag
LeadSource

Requirements:
- configurable pipelines
- configurable stages
- Kanban support
- lead conversion
- activities
- tasks
- notes
- tags
- tenant isolation
- branch access
- granular permissions

Do not put Education-specific logic into Core CRM.
Education may use CRM, but CRM must not depend on Education.
```

---

### 🔹 PROMPT 09 — CUSTOM FIELDS
```text
Implement a reusable Custom Fields engine.

Use PostgreSQL JSON/JSONB for entity values and a FieldDefinition model.

FieldDefinition should support:

organizationId
entityType
key
label
fieldType
options
isRequired
sortOrder
fieldGroup
isActive

Initial field types:
TEXT
TEXTAREA
NUMBER
DATE
DATETIME
BOOLEAN
SELECT
MULTI_SELECT
EMAIL
PHONE
URL
FILE

Implement:
- CRUD API
- validation
- tenant isolation
- field groups
- dynamic frontend field renderer
- dynamic form section

Frontend components:
DynamicField
DynamicFieldsSection
FieldDefinitionManager

Initially support:
Student
Course
Customer
Lead

Do not create a separate database column for every custom field.
Add validation tests.
```

---

### 🔹 PROMPT 10 — RESOURCE + SCHEDULE
```text
Create a reusable Resource and Scheduling engine.

Resource types initially:
ROOM
VEHICLE
EQUIPMENT
OTHER

Schedule should support:
- startAt
- endAt
- resource
- instructor/employee
- participants
- recurrence where appropriate
- branch
- organization

Education must be able to schedule:
Teacher + Group + Room

Driving School must later be able to schedule:
Instructor + Student + Vehicle

Do not implement Driving School yet.
Refactor existing Room scheduling to use Resource where practical.

Add conflict detection:
- same room cannot have overlapping lessons
- same vehicle cannot have overlapping lessons
- same instructor cannot have overlapping lessons
```

---

### 🔹 PROMPT 11 — FINANCE CORE
```text
Refactor the existing payment system into a reusable Finance Core.

Implement:

Product
Service
PriceList

Invoice
InvoiceItem

Payment
PaymentAllocation
Refund

Expense
ExpenseCategory

Cashbox
Transaction

Requirements:

1. Payment must not directly be the source of truth for balance.
2. Invoice represents an amount owed.
3. Payment represents money received.
4. PaymentAllocation connects payment to invoices.
5. Refund reverses/reconciles payment properly.
6. Financial records must be auditable.
7. Do not allow unsafe hard deletion of financial transactions.
8. Support:
- cash
- card
- bank
- other payment methods
9. Add organization and branch isolation.
10. Existing Education payment functionality must continue working.

Create migration strategy before changing production data.
```

---

### 🔹 PROMPT 12 — EDUCATION MODULE
```text
Refactor Education into a vertical module built on top of Core.

Education must use Core:
- CRM
- Finance
- Resource
- Schedule
- Notifications
- Files
- Audit
- Custom Fields

Education-specific entities:

Student
Parent
Course
Group
GroupEnrollment
Lesson
Attendance
Exam
Grade
Homework
Contract
EnrollmentHistory

Requirements:
- no Core dependency on Education
- student enrollment history
- attendance history
- course/group management
- teacher assignment
- scheduling
- invoices
- payments
- contracts

Preserve existing functionality.
Do not duplicate Core functionality inside Education.
```

---

### 🔹 PROMPT 13 — EDUCATION BUSINESS RULES
```text
Implement Education business rules.

Student lifecycle:
NEW
ACTIVE
FROZEN
GRADUATED
DROPPED

Group lifecycle:
DRAFT
ACTIVE
COMPLETED
ARCHIVED

Enrollment must maintain history.

Implement:
- enrollment
- transfer between groups
- freeze/unfreeze
- graduation
- attendance
- lesson history
- teacher workload
- student progress

Do not hardcode business rules that should become configurable later.
```

---

### 🔹 PROMPT 14 — DASHBOARD
```text
Refactor the dashboard into a reusable widget-based dashboard system.

Remove hardcoded fake production values.

Create reusable widgets:
- Revenue
- Expenses
- Students/Customers
- Leads
- Attendance
- Debt
- Schedule
- Payments

Dashboard should be configurable by organization/role.
Business-specific dashboards must be compositions of reusable widgets.
Do not create separate duplicated dashboard implementations for every vertical.
```

---

### 🔹 PROMPT 15 — NOTIFICATION
```text
Create a Core Notification system.

Implement:

Notification
NotificationTemplate
NotificationLog

Channels:
IN_APP
EMAIL
TELEGRAM

Architecture must use providers/adapters.

Example:

NotificationService
    ↓
TelegramProvider
EmailProvider
InAppProvider

Events:
- payment received
- invoice overdue
- attendance absent
- lesson reminder
- exam reminder

Do not hardcode Telegram logic inside Education services.
```

---

### 🔹 PROMPT 16 — BACKGROUND JOBS
```text
Introduce background job processing using Redis + BullMQ where appropriate.

Use jobs for:
- notifications
- scheduled reminders
- report generation
- imports
- exports
- recurring billing

Do not put long-running operations inside HTTP request handlers.
Add retry strategy and failure logging.
```

---

### 🔹 PROMPT 17 — IMPORT / EXPORT
```text
Implement reusable import/export infrastructure.

Support:
CSV
Excel

Import flow:

Upload
↓
Parse
↓
Preview
↓
Validate
↓
Show errors
↓
Confirm
↓
Import
↓
Audit

Support bulk export.

Initially implement for:
Students
Customers
Leads
Payments

Architecture must be reusable by future vertical modules.
```

---

### 🔹 PROMPT 18 — SaaS / SUBSCRIPTION
```text
Implement SaaS subscription architecture.

Entities:

Plan
Subscription
PlanFeature
Usage
UsageLimit

Support:
FREE
BASIC
PRO
ENTERPRISE

Possible limits:
- users
- students/customers
- branches
- storage
- notifications

Do not tightly couple subscription logic to Education.
Create reusable feature/limit guards.
```

---

### 🔹 PROMPT 19 — AUTOMATION / WORKFLOW
```text
Implement a generic Workflow Engine.

Architecture:

Event
↓
Trigger
↓
Condition
↓
Action

Example:
Invoice overdue
↓
3 days
↓
Send Telegram
↓
Create Task

Actions initially:
- create task
- send notification
- update status
- webhook

Do not implement a visual workflow builder initially.
Start with a stable backend engine and simple configuration.
```

---

### 🔹 PROMPT 20 — DRIVING SCHOOL TEST
```text
Create a new Driving School vertical module without modifying Core business logic.

Driving School entities:

DrivingStudent
Instructor
Vehicle
DrivingCategory
TheoryLesson
PracticalLesson
DrivingExam
Certificate

Reuse Core:
- CRM
- Finance
- Resource
- Schedule
- Notifications
- Files
- Audit
- Custom Fields

Requirements:

1. Vehicle must use Resource architecture.
2. Instructor must use Employee/User architecture.
3. Student must use Core CRM/customer concepts where appropriate.
4. Practical lessons must use Schedule.
5. Vehicle conflict detection must work.
6. Instructor conflict detection must work.
7. Payments must use Finance Core.
8. Custom fields must work.
9. Notifications must use Notification Core.

Core modules must not import Driving School.
Document every place where Core had to be changed.

If Core requires changes only for generic capabilities, refactor those capabilities into Core.
Do not add Driving School-specific conditions to Core.
```

---

### 🔹 PROMPT 21 — UNIVERSALITY TEST
```text
Perform an architecture test of the ERP.

Pretend we need to add these verticals:

1. Gym
2. Beauty Salon
3. Real Estate
4. Service Center
5. Private School
6. Hotel

Do NOT implement them.

For each vertical identify:

A. Which Core modules can be reused?
B. Which entities can be represented using existing Core entities?
C. Which new vertical entities are required?
D. Which requirements cannot currently be represented?
E. Which Core improvements are necessary?

The goal is to identify whether the platform is truly extensible without introducing business-specific hacks into Core.

Produce an architecture report.
Do not modify code.
```

---

### 🔹 PROMPT 22 — TESTING
```text
Create a comprehensive automated test strategy.

Priority:

1. Tenant isolation
2. Authorization
3. Financial correctness
4. Enrollment
5. Attendance
6. Scheduling conflicts
7. Custom field validation
8. Audit logs
9. Soft delete
10. Notifications

Create:
- unit tests
- integration tests
- e2e tests

Especially prove:
Organization A cannot access Organization B data.
Branch A cannot access Branch B data unless authorized.
A cashier cannot perform unauthorized refunds.
A teacher cannot access unrelated student records.
Two instructors cannot be scheduled for overlapping lessons.
One vehicle cannot be booked twice at the same time.
```

---

### 🔹 PROMPT 23 — PRODUCTION HARDENING
```text
Prepare the application for production SaaS deployment.

Audit:
- environment variables
- secrets
- CORS
- rate limiting
- security headers
- JWT expiration
- refresh tokens
- password security
- logging
- error handling
- database indexes
- database backups
- migrations
- file storage
- Redis
- queues
- health checks
- monitoring

Remove:
- demo credentials
- fake data
- development-only authentication
- hardcoded secrets
- unsafe defaults

Create:
.env.example
production configuration
health endpoint
readiness endpoint
```

---

### 🔹 PROMPT 24 — FRONTEND REFACTOR
```text
Refactor the Vue frontend into a scalable modular architecture.

Use:

Vue 3
TypeScript
Vite
Pinia
Vue Router
TanStack Query
Tailwind CSS

Architecture:

src/
  app/
  layouts/
  core/
  shared/
  modules/
    crm/
    finance/
    hr/
    education/
    driving-school/

Create reusable:
- DataTable
- Form
- DynamicForm
- DynamicField
- Modal
- Drawer
- Filters
- Pagination
- FileUpload
- Calendar
- Kanban
- PermissionGate

Remove duplicate components.

Server state should use TanStack Query.
Global UI/auth state should use Pinia.

Do not put business-specific logic into shared UI components.
```

---

### 🔹 PROMPT 25 — FINAL ERP ARCHITECTURE REVIEW
```text
Perform a final architecture review of the complete Universal ERP.

Evaluate:

1. Multi-tenancy
2. Branch architecture
3. RBAC
4. CRM
5. Finance
6. HR
7. Resource management
8. Scheduling
9. Custom Fields
10. Notifications
11. Audit
12. Soft delete
13. Education vertical
14. Driving School vertical
15. SaaS subscriptions
16. Workflow
17. Reporting
18. Frontend architecture
19. API architecture
20. Database architecture
21. Security
22. Scalability
23. Extensibility

Then answer:

"If we add a completely new business vertical tomorrow, how much Core code must change?"

The ideal answer should be:
- Core changes only for genuinely reusable capabilities.
- New business logic lives in a new vertical module.

Identify every violation of this principle and recommend fixes.

Do not implement changes until the review is complete.
```
