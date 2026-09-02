# PHASE 10.1 — EDUCATION DOMAIN DESIGN REPORT

## 1. Executive Summary
PHASE 10.1 defines the complete architectural, conceptual, and technical domain model for Windzo ERP's first vertical: **EDUCATION** (Learning Centers, Training Centers, Language Schools, Tutoring Centers, IT Academies, and Professional Training Centers). The Education vertical is designed strictly as an independent modular domain, consuming ERP Core services (Tenancy, Branching, RBAC, Audit, SystemConfig, Files) without contaminating or forcing domain-specific dependencies onto the Core.

## 2. Existing Architecture Findings
The existing codebase follows a clean, modular structure:
* **Backend:** NestJS 10 + Prisma ORM + PostgreSQL with active Guards (`JwtAuthGuard`, `ModuleGuard`, `PermissionsGuard`, `BranchAccessGuard`), Decorators (`@CurrentTenant`, `@CurrentBranch`, `@RequirePermissions`, `@RequireModule`), DTO validations (`ValidationPipe`), and atomic database transactions.
* **Frontend:** Vue 3 + Pinia + TailwindCSS with locked Windzo UI components (`vmodal`, `FormInput`, `FormSelect`, `FilterSelect`, `Badge`, `Alert`).
* **Multi-Tenancy & Isolation:** 100% enforced via verified JWT extraction (`request.user.organizationId`) and branch scoping.

## 3. Core / Education Boundary
* **ERP CORE:**
  * Authentication & JWT Lifecycle
  * Organizations & Multi-Tenancy
  * Branches & Branch Isolation
  * Users (Employees, Admins, Teachers with credentials)
  * RBAC (Custom Roles, Permissions, PermissionScope)
  * Audit Logging (Append-Only, Redacted History)
  * System Configuration (`SystemConfig.enabledModules`, `terminology`, `features`)
  * Generic File & Storage Ingestion
* **EDUCATION VERTICAL:**
  * Students & Student Lifecycle
  * Guardians / Parents
  * Teacher Profiles & Subject Assignments
  * Courses, Programs & Price Lists
  * Groups & Cohorts
  * Group Enrollments & Cohort Transfers
  * Lessons & Teaching Sessions
  * Class Schedules & Timetable
  * Attendance & Participation Grading
  * Exams, Assessments & Scorecards
  * Education Certificates & Diplomas
  * Tuition Contracts & Education Fee Allocations
  * Academic Reports & Analytics

## 4. Actor Model
1. **Super Admin / Platform Admin:** Global platform management.
2. **Organization Admin (Owner / Director):** Full access to organization-wide academic, financial, and operational data.
3. **Branch Manager:** Scoped to managing groups, rooms, and students within assigned branch(es).
4. **Academic Manager / Head of Studies:** Manages courses, curricula, lesson plans, and teacher performance.
5. **Teacher / Mentor / Instructor:** Views assigned groups, records daily attendance, grades exams, and submits lesson topics.
6. **Receptionist / Administrator:** Handles leads, student admissions, group enrollments, and calls.
7. **Cashier / Accountant:** Manages fee collections, invoices, and expense registers.
8. **Student (Client):** Consumes courses; profile managed by center staff (can access Student Portal when LMS module enabled).
9. **Guardian / Parent:** Contact person for minor students; receives attendance and payment notifications.

## 5. User vs Domain Entity Decision
* **Core User:** Authentication identity (email/phone + bcrypt password + JWT) for staff members (Admins, Managers, Teachers, Cashiers).
* **Student:** Domain business profile linked to `Organization` and `Branch`. Students do not pollute the Core `User` table unless student portal login is explicitly provisioned.
* **Parent:** Domain guardian entity linked to one or more `Student` records without requiring a Core `User` credential.
* **Teacher:** Core `User` with role `Role.TEACHER` and optional `TeacherProfile` linkage.

## 6. Entity Catalog
| Entity | Purpose | Scope | Key Relations | Lifecycle Statuses |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Student client profile | Org + Branch | GroupEnrollment, Attendance, Payment, Contract, Parent | `NEW`, `ACTIVE`, `INACTIVE`, `FROZEN`, `GRADUATED`, `DROPPED` |
| **Parent** | Guardian contact details | Organization | Student (M:N via relations) | `ACTIVE`, `DELETED` |
| **Course** | Educational offering / syllabus | Organization | Group, Lead, Contract | `ACTIVE`, `INACTIVE`, `ARCHIVED` |
| **Group** | Active learning cohort / class | Org + Branch | Course, Teacher, Room, Lesson, Enrollment | `PLANNING`, `ACTIVE`, `FINISHED`, `CANCELLED` |
| **GroupEnrollment** | Student's participation in a Group | Group + Student | Group, Student, Contract | `APPLIED`, `ACTIVE`, `FROZEN`, `LEFT`, `COMPLETED` |
| **Lesson** | Scheduled educational session | Group | Group, Teacher, Room, Attendance | `SCHEDULED`, `COMPLETED`, `CANCELLED` |
| **Attendance** | Student attendance & scoring per lesson | Lesson + Student | Lesson, Group, Student, User(Marker) | `PRESENT`, `ABSENT`, `LATE`, `EXCUSED` |
| **Exam** | Assessment / Test / Quiz | Group / Course | Group, Course, Grade | `DRAFT`, `SCHEDULED`, `COMPLETED` |
| **Grade** | Student score & feedback on an Exam | Exam + Student | Exam, Student, User(Grader) | `GRADED`, `PUBLISHED` |
| **Contract** | Tuition agreement & payment schedule | Org + Student | Student, Course, Payment | `DRAFT`, `ACTIVE`, `COMPLETED`, `TERMINATED` |
| **Certificate** | Official completion certificate | Org + Student | Student, Course, Group | `ISSUED`, `REVOKED` |

## 7. Entity Relationships
```text
Organization (Core)
  ├── Branch (Core)
  │     ├── Room (Cross-cutting)
  │     ├── Group (Education)
  │     └── Student (Education)
  │
  ├── Course (Education)
  │     ├── Group (Education)
  │     │     ├── Lesson (Education) ── Attendance (Education) ── Student
  │     │     ├── GroupEnrollment (Education) ── Student
  │     │     └── Exam (Education) ── Grade (Education) ── Student
  │     │
  │     └── Contract (Education) ── Payment (Finance) ── Cashbox
  │
  └── Parent (Education) ── Student
```

## 8. Organization / Branch Scope Matrix
| Entity | Organization Scope | Branch Scope | Rationale |
| :--- | :---: | :---: | :--- |
| **Course** | YES | Optional | Standard syllabus created at org level, taught across branches |
| **Group** | YES | YES | A class takes place at a specific physical or virtual branch |
| **Student** | YES | YES | Primary branch assignment with cross-branch transfer support |
| **Parent** | YES | NO | Family relationship applies across entire organization |
| **Lesson** | YES | YES | Inherited from Group's branch |
| **Attendance** | YES | YES | Inherited from Lesson's branch |
| **Contract** | YES | Optional | Bound to organization with branch reference |
| **Exam & Grade** | YES | YES | Bound to Group's branch |

## 9. Student Model
* **Attributes:** `id`, `organizationId`, `branchId`, `firstName`, `lastName`, `phone`, `email`, `dateOfBirth`, `gender`, `status`, `balance`, `notes`, `customFields: Json?`, `deletedAt`, `createdAt`, `updatedAt`.
* **Tenancy:** Always filtered by `organizationId: orgId` and `deletedAt: null`.

## 10. Guardian / Parent Model
* **Attributes:** `id`, `organizationId`, `firstName`, `lastName`, `phone`, `email`, `relationship` (Father, Mother, Guardian), `address`, `notes`, `deletedAt`.
* **Multiplicity:** One guardian can have multiple children; one child can have multiple emergency contacts.

## 11. Teacher Model
* **Representation:** Core `User` with `role: Role.TEACHER` or customRole.
* **Attributes in Core/Domain:** `taughtGroups Group[]`, `salaryType`, `salaryAmount`, `customFields: Json?`.

## 12. Course Model
* **Attributes:** `id`, `organizationId`, `name`, `description`, `price`, `duration` (months), `lessonCount`, `isActive`, `customFields: Json?`, `deletedAt`.

## 13. Subject Model
* For learning centers, `Course` is the primary unit. Sub-subjects or levels (e.g. Grammar, Speaking) are supported as modules/topics within `Lesson` or `customFields` without requiring mandatory separate database tables.

## 14. Group Model
* **Attributes:** `id`, `organizationId`, `branchId`, `name`, `courseId`, `teacherId`, `roomId`, `days` (`ODD_DAYS`, `EVEN_DAYS`, `EVERY_DAY`, `CUSTOM`), `startTime`, `endTime`, `startDate`, `endDate`, `status`, `customFields: Json?`.

## 15. Enrollment Model
* **Attributes:** `id`, `groupId`, `studentId`, `enrolledAt`, `leftAt`, `status`, `discount`, `notes`, `contractId`.
* **First-Class Concept:** Decouples student identity from group assignment; preserves history of past groups when student completes or changes level.

## 16. Lesson Model
* **Attributes:** `id`, `groupId`, `teacherId`, `roomId`, `date`, `startTime`, `endTime`, `topic`, `status` (`SCHEDULED`, `COMPLETED`, `CANCELLED`), `notes`.

## 17. Schedule Model
* Timetable recurrence engine leveraging `Group.days`, `Group.startTime`, `Group.endTime`, and `Room` allocations to automatically generate calendar sessions without conflict.

## 18. Attendance Model
* **Attributes:** `id`, `lessonId`, `groupId`, `studentId`, `date`, `status` (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`), `reason`, `score`, `markedById`, `createdAt`.
* **Composite Index:** `@@unique([lessonId, studentId])` preventing duplicate attendance records.

## 19. Exam / Result Model
* **Exam Attributes:** `id`, `groupId`, `courseId`, `title`, `examDate`, `maxScore`, `passingScore`.
* **Grade Attributes:** `id`, `examId`, `studentId`, `score`, `feedback`, `gradedById`.

## 20. Certificate Model
* **Attributes:** `id`, `organizationId`, `studentId`, `courseId`, `certificateNumber`, `issueDate`, `templateUrl`, `qrCodeUrl`, `grade`.
* **Document Engine:** Reuses Core file storage to save generated PDF certificates.

## 21. Payment Boundary
* **Education Domain:** Calculates monthly tuition fees, applies student discounts, manages contracts.
* **Finance Core:** Executes transaction via `Cashbox`, updates `Student.balance` atomically (`{ increment }` / `{ decrement }`), writes `AuditLog`.

## 22. Reporting Boundary
* **Academic Reports:** Attendance rate %, student retention rate, dropout reasons, teacher workload hours, exam pass rates.
* **Financial Reports:** Tuition collections by course, outstanding student debts, branch revenue.

## 23. Permission Model
Clean permission namespace adhering to Windzo standards:
* `students.view`, `students.create`, `students.edit`, `students.delete`
* `courses.view`, `courses.create`, `courses.edit`, `courses.delete`
* `groups.view`, `groups.create`, `groups.edit`, `groups.delete`
* `attendance.view`, `attendance.mark`
* `exams.view`, `exams.manage`
* `contracts.view`, `contracts.manage`

## 24. Role / Permission Matrix
| Role | Students | Courses | Groups | Attendance | Exams | Payments | Reports |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Admin** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | Full |
| **Branch Manager** | CRUD (Branch) | READ | CRUD (Branch) | CRUD (Branch) | CRUD (Branch) | CRUD (Branch) | Branch |
| **Academic Manager** | READ | CRUD | CRUD | READ | CRUD | NONE | Academic |
| **Teacher** | READ (Assigned) | READ | READ (Assigned) | MARK (Assigned) | GRADE (Assigned)| NONE | None |
| **Receptionist** | CRUD | READ | READ | READ | NONE | CREATE | Limited |
| **Cashier** | READ | READ | READ | NONE | NONE | CRUD | Financial |

## 25. Status Architecture
Strictly typed TypeScript & Prisma Enums:
* `StudentStatus`: `NEW`, `ACTIVE`, `INACTIVE`, `FROZEN`, `GRADUATED`, `DROPPED`
* `GroupStatus`: `PLANNING`, `ACTIVE`, `FINISHED`, `CANCELLED`
* `GroupEnrollmentStatus`: `APPLIED`, `ACTIVE`, `FROZEN`, `LEFT`, `COMPLETED`
* `AttendanceStatus`: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`

## 26. Custom Fields
* Flexible attributes defined in `FieldDefinition` and stored in `Student.customFields: Json?`, `Course.customFields: Json?`, `Group.customFields: Json?` (e.g. English level, trial feedback, target IELTS band).

## 27. Files
* Attachments (passports, photos, contracts, medical notes) ingested via Core file infrastructure and bound by `organizationId`.

## 28. Notifications
* Domain events (`attendance.absent`, `payment.due`, `group.enrolled`, `exam.published`) trigger SMS and Telegram templates via Core `NotificationService`.

## 29. Audit
* All CRUD actions on Students, Enrollments, Attendances, and Grades automatically emit append-only `AuditLog` records with user, IP, and sanitized before/after state.

## 30. Multi-Branch Model
* Organizations with multiple branches operate independently with strict branch isolation while Organization Admins retain top-level consolidated visibility.

## 31. History Requirements
* Complete audit trail: `EnrollmentHistory` tracks student transfers across groups and branches without overwriting historical academic records.

## 32. Security & Privacy
* Sensitive data (phone numbers, parent details) guarded by `PermissionsGuard` and sanitized in API outputs. Zero account enumeration on public endpoints.

## 33. API Resource Design
* `GET /api/students`, `POST /api/students`, `GET /api/students/:id`, `PUT /api/students/:id`, `DELETE /api/students/:id`
* `GET /api/courses`, `POST /api/courses`, `PUT /api/courses/:id`, `DELETE /api/courses/:id`
* `GET /api/groups`, `POST /api/groups`, `GET /api/groups/:id`, `PUT /api/groups/:id`, `DELETE /api/groups/:id`
* `GET /api/attendance`, `POST /api/attendance`, `PUT /api/attendance/:id`
* `GET /api/contracts`, `POST /api/contracts`

## 34. Frontend Module Design
* Education screens built inside `crm/src/views/` reusing Windzo components (`vmodal`, `FormInput`, `FormSelect`, `FilterSelect`, `Badge`, `Alert`).

## 35. Navigation Design
* Sidebar items (`O'quvchilar`, `Guruhlar`, `Kurslar`, `Davomat`, `Dars Jadvali`, `Imtihonlar`) rendered dynamically when `enabledModules` includes `STUDENTS`, `GROUPS`, `COURSES`, `ATTENDANCE`.

## 36. Dashboard Requirements
* Metric widgets: Active Students count, Groups in session, Today's attendance %, Expected fee collection vs Collected amount.

## 37. Domain Events
* `student.enrolled`, `student.dropped`, `attendance.marked`, `payment.received`, `exam.graded`, `contract.signed`.

## 38. Import / Export Requirements
* Mass import of students and parent contacts via CSV preview/confirm transaction flow (`/api/data-transfer/import`).
* Export of attendance sheets and financial debt lists to CSV/JSON.

## 39. Bulk Operation Requirements
* Bulk attendance marking for an entire group.
* Bulk group transfer (e.g. graduating beginner group to elementary).
* Bulk SMS notifications for absent students.

## 40. Future Integration Compatibility
* Seamless compatibility with Telegram Bot attendance check-ins, Payment gateways (Click, Payme, Uzum), and Biometric turnstile readers.

## 41. Future Vertical Compatibility
* Verified against Driving School, Kindergarten, and Gym verticals. Zero concepts were placed in Core that belong exclusively to Education.

## 42. Database ERD
```text
[Organization] (1) ── (N) [Branch] (1) ── (N) [Group] (1) ── (N) [Lesson] (1) ── (N) [Attendance]
       │                        │               │                              │
       │                        │               ├── (N) [GroupEnrollment] ─────┤
       │                        │               │                              │
       ├── (N) [Course] ────────┼───────────────┤                              │
       │                        │                                              │
       └── (N) [Student] ───────┴──────────────────────────────────────────────┘
               │
               ├── (N) [Contract] ── (N) [Payment]
               └── (N) [Grade] ── (1) [Exam]
```

## 43. Architecture Risks
* **Risk:** High concurrency during simultaneous bulk attendance marking.
* **Mitigation:** Database composite index `@@unique([lessonId, studentId])` and Prisma `$transaction` batching.

## 44. Architecture Decisions
1. **Decision:** Separate `Core User` from `Student` domain profile.
2. **Decision:** Make `GroupEnrollment` a first-class entity to preserve historical cohort data.
3. **Decision:** Retain financial math exclusively inside Core `Cashbox` and `Payment` services.
4. **Decision:** Keep Windzo UI strictly locked without external UI overhauls.

## 45. Required Changes to Core
* **Changes to Core:** `0 (Zero changes required)`. The ERP Core is completely prepared.

## 46. Education Implementation Order
* **10.2:** Database Foundation (Verify & index Education tables)
* **10.3:** Education Backend Core & DTOs
* **10.4:** Education Permissions & Scoping
* **10.5:** Students Management Module
* **10.6:** Courses & Programs Module
* **10.7:** Groups & Scheduling Module
* **10.8:** Group Enrollments & Lifecycle
* **10.9:** Attendance Marking & Journal
* **10.10:** Exams & Grading Module
* **10.11:** Contracts & Education Billing
* **10.12:** Frontend Views & Windzo UI Integration
* **10.13:** End-to-End Verification & Testing

## 47. Final Checklist
- [x] Education is isolated from Core
- [x] Core does not depend on Education
- [x] Tenant isolation is preserved
- [x] Branch isolation is preserved
- [x] Existing RBAC remains usable
- [x] Existing permission system remains usable
- [x] Existing audit remains usable
- [x] Existing file system remains usable
- [x] Existing notification system remains usable
- [x] Existing UI remains unchanged
- [x] Multi-branch Education is possible
- [x] Student history is preserved where required
- [x] Guardian relationships are flexible
- [x] Teacher accounts are flexible
- [x] Course/Group distinction is clear
- [x] Enrollment is a first-class concept
- [x] Lesson is distinct from Course
- [x] Attendance is linked to actual lessons
- [x] Education-specific statuses stay inside Education
- [x] Education-specific workflows stay inside Education
- [x] Future verticals are not blocked
- [x] No giant universal entity was introduced
- [x] No unnecessary abstraction was introduced

## 48. Final Decision
```text
========================================================================
FINAL DECISION: PHASE 10.1 — PASS ✅ (EDUCATION DOMAIN DESIGN APPROVED)
========================================================================
```
The Education domain model is complete, robustly isolated, and ready for systematic implementation starting with Phase 10.2.
