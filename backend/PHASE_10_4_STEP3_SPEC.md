# 🚀 WINDZO ERP
# PHASE 10.4 — STEP 3 / 3
# STUDENTS + FINANCE INTEGRATION + PAYMENTS
# FINAL EDUCATION BACKEND IMPLEMENTATION

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
PHASE 10.4 STEP 1 Parents/Contracts/Courses   ✅
PHASE 10.4 STEP 2 Groups/Lessons/Attendance/Exams ✅
```

---

# 1. CORE ARCHITECTURE
Education is a vertical reusing Core Finance.
```text
                 WINDZO ERP
                     │
             ┌───────┴───────┐
             │               │
          ERP CORE       EDUCATION
             │               │
          Finance         Students
          Cashbox         Parents
          Invoice         Groups
          Payment         Lessons
             │            Attendance
             │            Exams
             │            Grades
             │            Contracts
             │
             └────── Education
```
Education must USE Core Finance. Do not duplicate Payment, Cashbox, Invoice, Transaction, Ledger.

---

# 2. FIRST TASK — CODEBASE AUDIT
Inspect:
`src/students/`, `src/courses/`, `src/groups/`, `src/lessons/`, `src/attendance/`, `src/exams/`, `src/contracts/`, `src/finance/`, `src/cashbox/`, `src/invoices/`.

---

# 3. STUDENT SERVICE
Implement/finalize Student service and controller according to actual DTO/schema:
`create`, `findAll`, `findOne`, `update`, `remove`, `restore`.

---

# 4. STUDENT TENANT SECURITY
Every operation must enforce `Student.organizationId === authenticated orgId`.
Never trust `organizationId` or `tenantId` from body, query, header, route.
Tenant comes from `orgId: string` derived from authenticated JWT context.

---

# 5. STUDENT BRANCH SECURITY
If Student is branch-scoped: `student.branchId` must respect existing branch authorization using `assertBranchAccess`, `buildBranchWhere`.

---

# 6. STUDENT UNIQUE FIELDS
Inspect schema unique fields (phone, email, studentNumber).
Enforce service validation + DB constraint where appropriate.

---

# 7. STUDENT ↔ PARENT
Use existing `Student`, `Parent`, `StudentParent` relationship.
Both `Student.organizationId === orgId` and `Parent.organizationId === orgId` must be true.

---

# 8. STUDENT CREATE + PARENT + INITIAL ENROLLMENT
Atomic transaction:
```text
BEGIN TRANSACTION
Create Student
Create/find Parent
Create StudentParent
Create initial Enrollment
COMMIT
```
Rollback everything if any operation fails.

---

# 9. STUDENT LIFECYCLE
Use actual schema/enums (`StudentStatus`). Historical academic and financial data must remain consistent.

---

# 10. STUDENT DELETE
Never hard-delete historical financial or academic records (`Attendance`, `Grade`, `Contract`, `Payment`, `Invoice`). Soft delete with `deletedAt`.

---

# 11. STUDENT SEARCH
Database-side search using existing Query DTO (`limit <= 100`).

---

# 12. CONTRACT ↔ STUDENT
`Contract.organizationId === orgId` and `Student.organizationId === orgId`. Branch compatibility checked.

---

# 13. CONTRACT BUSINESS INTEGRITY
`totalAmount`, `discountAmount`, `finalAmount`, `paidAmount`, `remainingAmount`, `status`.

---

# 14. MONEY RULE
Use Prisma Decimal for financial calculations. Never use JavaScript floating-point arithmetic.

---

# 15. CONTRACT BALANCE
Server-side calculation: `remaining = total - paid`. Never trust client-input calculated fields.

---

# 16. PAYMENT INTEGRATION
Education uses Core Finance `Payment`. No duplicate `EducationPayment`.

---

# 17. PAYMENT TENANT OWNERSHIP
Verify `organizationId === orgId` for Student, Contract, Invoice, Cashbox, Customer, Payment.

---

# 18. PAYMENT CROSS-TENANT ATTACK
Reject all cross-tenant combinations (Org A Student + Org B Contract + Org A Cashbox, etc.).

---

# 19. PAYMENT ↔ STUDENT
Verify payment student/customer belongs to same organization.

---

# 20. PAYMENT ↔ CONTRACT
Verify `Contract.organizationId === orgId` and `Contract.studentId === Student.id`.

---

# 21. PAYMENT ↔ INVOICE
Verify `Invoice.organizationId === orgId` and invoice belongs to same customer/student/contract.

---

# 22. PAYMENT ↔ CASHBOX
Verify `Cashbox.organizationId === orgId` and branch compatibility.

---

# 23. PAYMENT AMOUNT
Payment amount must be `> 0`.

---

# 24. OVERPAYMENT
Follow existing Core Finance business rules.

---

# 25. PAYMENT STATUS
Never allow client to arbitrarily set server-controlled payment state (`COMPLETED`, `CANCELLED`, `REFUNDED`).

---

# 26. REFUND / CANCELLATION
Preserve financial history on refund/cancellation. Never hard-delete Payment.

---

# 27. CASHBOX BALANCE
Atomic balance updates through Core Finance transaction architecture.

---

# 28. FINANCIAL TRANSACTION ATOMICITY
Multi-record operations (Payment + Invoice + Contract + Cashbox) must be atomic in `$transaction`.

---

# 29. CONCURRENCY
Prevent race conditions with transactions/locking strategies.

---

# 30. PAYMENT IDEMPOTENCY
Check receiptNumber, transactionNumber, or idempotency keys.

---

# 31. RECEIPT NUMBER
Server-generated receiptNumber; client must not control it.

---

# 32. AUDIT
All Student and Finance mutations logged to central `AuditLog`.

---

# 33. FINANCE AUTHORIZATION
Strict separation of permissions (Cashier vs Teacher vs Admin).

---

# 34. BRANCH FINANCE
Verify User branch, Cashbox branch, Student branch, Contract branch compatibility.

---

# 35. CONTROLLER RULE
Controllers remain thin; business logic in services.

---

# 36. SERVICE RULE
Services enforce tenant, branch, business rules, transactions, and audit.

---

# 37. NO OPTIONAL ORG ID
Strict `orgId: string` everywhere; no `orgId?: string`.

---

# 38. CURRENT TENANT
`@CurrentTenant()` obtains `request.user.organizationId` JWT-only.

---

# 39. DTO SECURITY
DTOs must not accept server-controlled fields (`whitelist: true`, `forbidNonWhitelisted: true`).

---

# 40. RESPONSE SECURITY
Never expose passwords, tokens, hashes, or secret internal fields.

---

# 41. ERROR HANDLING
Use standard NestJS exceptions; never expose raw Prisma errors.

---

# 42. N+1
Use Prisma `select`, `include`, batch queries.

---

# 43. DATABASE CONSTRAINTS
Inspect and maintain tenant-scoped unique and foreign key constraints.

---

# 44. SOFT DELETE
Academic and financial records never deleted on student soft delete.

---

# 45. PAGINATION
All lists bounded with `limit <= 100`.

---

# 46. SEARCH
Database-side search with indexed fields.

---

# 47. TEST MATRIX
Create comprehensive test suite for Student, Parent, Contract, Payment, and Finance integrity.

---

# 48. TRANSACTION FAILURE TEST
Verify rollback on simulated failure during financial operations.

---

# 49. REGRESSION TESTS
Run full regression (DTOs + Step 1 + Step 2 + Step 3).

---

# 50. BUILD
Verify `tsc --noEmit` and `npm run build`.

---

# 51. FRONTEND
Zero frontend modifications (`crm/` UI is locked).

---

# 52. NO UNRELATED REFACTOR
Preserve core stability.

---

# 53. UNIVERSAL ERP RULE
Education vertical consumes ERP Core; Core does not depend on Education.

---

# 54. FINAL ARCHITECTURAL CHECK
Verify clean vertical integration.

---

# 55. FINAL SELF-AUDIT
Execute 20+ checkpoint self-audit.

---

# 56. FINAL REPORT
Generate 32-section official report.

---

# 57. STOP CONDITION
Stop and await user approval before any next milestone.
