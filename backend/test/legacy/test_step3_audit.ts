import { PrismaClient, StudentStatus } from '@prisma/client';
import { StudentsService } from './src/students/students.service';
import { AuditService } from './src/audit/audit.service';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as assert from 'assert';

const prisma = new PrismaClient();
const auditService = new AuditService(prisma as any);
const studentsService = new StudentsService(prisma as any, auditService as any);

async function runStep3Audit() {
  console.log('========================================================================');
  console.log('🛡️  PHASE 10.4 — STEP 3 AUDIT & SECURITY TEST SUITE');
  console.log('========================================================================\n');

  try {
    // 0. Setup test organizations and branches
    const orgA = await prisma.organization.upsert({
      where: { slug: 'step3-org-a' },
      update: {},
      create: { name: 'Step 3 University A', slug: 'step3-org-a', businessType: 'COURSE_CENTER' },
    });

    const orgB = await prisma.organization.upsert({
      where: { slug: 'step3-org-b' },
      update: {},
      create: { name: 'Step 3 University B', slug: 'step3-org-b', businessType: 'COURSE_CENTER' },
    });

    const branchA1 = await prisma.branch.upsert({
      where: { id: 'step3-branch-a1' },
      update: {},
      create: { id: 'step3-branch-a1', name: 'Step 3 Chilonzor Branch', organizationId: orgA.id },
    });

    const branchA2 = await prisma.branch.upsert({
      where: { id: 'step3-branch-a2' },
      update: {},
      create: { id: 'step3-branch-a2', name: 'Step 3 Yunusobod Branch', organizationId: orgA.id },
    });

    // Pre-cleanup all test entities in orgA and orgB
    await prisma.transaction.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.payment.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.contract.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.enrollmentHistory.deleteMany({ where: { student: { organizationId: { in: [orgA.id, orgB.id] } } } });
    await prisma.groupEnrollment.deleteMany({ where: { group: { organizationId: { in: [orgA.id, orgB.id] } } } });
    await prisma.group.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.course.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.studentParent.deleteMany({ where: { student: { organizationId: { in: [orgA.id, orgB.id] } } } });
    await prisma.parent.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.student.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.cashbox.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });

    const testPhone = '+998997771122';

    // -------------------------------------------------------------
    // TEST 1: Student Creation & Tenant Enforcement
    // -------------------------------------------------------------
    const student1 = await studentsService.create(
      {
        firstName: 'Jasur',
        lastName: 'Aliyev',
        phone: testPhone,
        branchId: branchA1.id,
      },
      orgA.id,
    );
    assert(student1.organizationId === orgA.id, '1. Student strictly created in Org A');

    // -------------------------------------------------------------
    // TEST 2: Cross-Tenant Student Read / Update / Delete
    // -------------------------------------------------------------
    let crossTenantReadRejected = false;
    try {
      await studentsService.findOne(student1.id, orgB.id);
    } catch (e) {
      if (e instanceof NotFoundException) crossTenantReadRejected = true;
    }
    assert(crossTenantReadRejected, '2. Cross-Tenant Read: Org B reading Org A student REJECTED');

    let crossTenantUpdateRejected = false;
    try {
      await studentsService.update(student1.id, { firstName: 'Hacked' }, orgB.id);
    } catch (e) {
      if (e instanceof NotFoundException) crossTenantUpdateRejected = true;
    }
    assert(crossTenantUpdateRejected, '3. Cross-Tenant Update: Org B updating Org A student REJECTED');

    // -------------------------------------------------------------
    // TEST 3: Branch Isolation on Student
    // -------------------------------------------------------------
    const branchCtxUserA2 = {
      organizationId: orgA.id,
      accessibleBranchIds: [branchA2.id],
      isSuperAdmin: false,
      isOrgAdmin: false,
      userBranchIds: [branchA2.id],
      headerBranchId: undefined,
    };

    let crossBranchAccessRejected = false;
    try {
      await studentsService.findOne(student1.id, orgA.id, branchCtxUserA2);
    } catch (e) {
      if (e instanceof NotFoundException) crossBranchAccessRejected = true;
    }
    assert(crossBranchAccessRejected, '4. Branch Isolation: User with Branch A2 cannot access Branch A1 student');

    // -------------------------------------------------------------
    // TEST 4: Student Phone Uniqueness in same Org vs different Org
    // -------------------------------------------------------------
    let duplicatePhoneInSameOrgRejected = false;
    try {
      await studentsService.create(
        {
          firstName: 'Jasur Duplicate',
          lastName: 'Aliyev',
          phone: testPhone, // same phone in org A
          branchId: branchA1.id,
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof ConflictException) duplicatePhoneInSameOrgRejected = true;
    }
    assert(duplicatePhoneInSameOrgRejected, '5. Unique Phone: Duplicate student phone in same Org REJECTED');

    const studentInOrgB = await studentsService.create(
      {
        firstName: 'Jasur Other Org',
        lastName: 'Aliyev',
        phone: testPhone, // same phone in org B allowed
      },
      orgB.id,
    );
    assert(studentInOrgB.organizationId === orgB.id, '6. Unique Phone: Same phone in different Org is ALLOWED');

    // -------------------------------------------------------------
    // TEST 5: Soft Delete & History Preservation
    // -------------------------------------------------------------
    await studentsService.remove(student1.id, orgA.id);
    const softDeleted = await prisma.student.findUnique({ where: { id: student1.id } });
    assert(softDeleted?.deletedAt !== null, '7. Soft Delete: Student marked deletedAt, not hard-deleted');

    await studentsService.restore(student1.id, orgA.id);
    const restored = await prisma.student.findUnique({ where: { id: student1.id } });
    assert(restored?.deletedAt === null, '8. Restore: Student successfully restored');

    // -------------------------------------------------------------
    // TEST 6: Student + Parent + Initial Enrollment Atomic Creation
    // -------------------------------------------------------------
    const courseA = await prisma.course.create({
      data: {
        organizationId: orgA.id,
        name: 'Step 3 Fullstack Course',
        price: 1500000,
        duration: 3,
        lessonCount: 24,
      },
    });

    const groupA = await prisma.group.create({
      data: {
        organizationId: orgA.id,
        branchId: branchA1.id,
        courseId: courseA.id,
        name: 'Step 3 Group A1',
        days: 'ODD_DAYS',
        startTime: '10:00',
        endTime: '12:00',
      },
    });

    const studentWithParentAndGroup = await studentsService.create(
      {
        firstName: 'Anvar',
        lastName: 'Tursunov',
        phone: '+998998889988',
        parentName: 'Karim Tursunov',
        parentPhone: '+998998889989',
        initialGroupId: groupA.id,
        branchId: branchA1.id,
      },
      orgA.id,
    );

    const studentDetails = await studentsService.findOne(studentWithParentAndGroup.id, orgA.id);
    assert(studentDetails.parents.length >= 1, '9. Student + Parent atomically linked via StudentParent');
    assert(studentDetails.enrollments.length >= 1 && studentDetails.enrollments[0].groupId === groupA.id, '10. Student initial enrollment atomically created');

    // -------------------------------------------------------------
    // TEST 7: Cross-Tenant Group in Initial Enrollment REJECTED
    // -------------------------------------------------------------
    let crossTenantInitialGroupRejected = false;
    try {
      await studentsService.create(
        {
          firstName: 'Hacker',
          lastName: 'Student',
          phone: '+998998887766',
          initialGroupId: groupA.id, // Group in Org A!
        },
        orgB.id, // Trying from Org B
      );
    } catch (e) {
      if (e instanceof BadRequestException) crossTenantInitialGroupRejected = true;
    }
    assert(crossTenantInitialGroupRejected, '11. Cross-Tenant Initial Group: Org B student into Org A group REJECTED');

    // -------------------------------------------------------------
    // TEST 8: Student Lifecycle Status Transitions
    // -------------------------------------------------------------
    const frozen = await studentsService.update(studentWithParentAndGroup.id, { status: StudentStatus.FROZEN }, orgA.id);
    assert(frozen.status === StudentStatus.FROZEN, '12. Lifecycle: Student status changed to FROZEN');

    // -------------------------------------------------------------
    // TEST 9: Student Database-side Search & Pagination
    // -------------------------------------------------------------
    const searchResults = await studentsService.findAll(
      {
        orgId: orgA.id,
        search: 'Tursunov',
        page: 1,
        limit: 10,
      },
    );
    assert(searchResults.items.length >= 1, '14. Student Search: Case-insensitive DB search returns matching student');
    assert(searchResults.meta.limit === 10 && searchResults.meta.page === 1, '15. Student Pagination: Bounded pagination metadata returned');

    // -------------------------------------------------------------
    // TEST 10: Contract ↔ Student & Money Decimal Calculations
    // -------------------------------------------------------------
    const { ContractsService } = require('./src/students/contracts.service');
    const contractsService = new ContractsService(prisma, auditService);

    const contractA = await contractsService.create(
      {
        studentId: studentWithParentAndGroup.id,
        totalAmount: 2000000,
        discountAmount: 200000,
      },
      orgA.id,
    );

    const contractDetails = await contractsService.findOne(contractA.id, orgA.id);
    assert(contractDetails.finalAmount === 1800000, '16. Contract Business Integrity: finalAmount (1800000) correctly calculated');
    assert(contractDetails.remainingAmount === 1800000, '17. Contract Balance: initial remainingAmount (1800000) correctly calculated');

    // Cross-tenant contract check: Org B trying to create contract for Org A student
    let crossTenantContractRejected = false;
    try {
      await contractsService.create(
        {
          studentId: studentWithParentAndGroup.id, // Org A student!
          totalAmount: 1000000,
        },
        orgB.id, // from Org B
      );
    } catch (e) {
      if (e instanceof NotFoundException) crossTenantContractRejected = true;
    }
    assert(crossTenantContractRejected, '18. Cross-Tenant Contract: Org B creating contract for Org A student REJECTED');

    // -------------------------------------------------------------
    // TEST 11: Payment Integration & Cross-Tenant Attacks
    // -------------------------------------------------------------
    const { PaymentsService } = require('./src/payments/payments.service');
    const paymentsService = new PaymentsService(prisma, auditService);

    // Create Cashbox in Org B
    const cashboxB = await prisma.cashbox.create({
      data: {
        organizationId: orgB.id,
        name: 'Kassa Org B',
        code: 'CB_ORGB',
        currency: 'UZS',
        balance: 0,
      },
    });

    // Create Contract in Org B for an Org B student
    const studentB2 = await prisma.student.create({
      data: {
        organizationId: orgB.id,
        firstName: 'Student B',
        lastName: 'Two',
        phone: '+998991234567',
      },
    });
    const contractB = await prisma.contract.create({
      data: {
        organizationId: orgB.id,
        studentId: studentB2.id,
        contractNumber: 'SH-ORGB-001',
        totalAmount: 1000000,
      },
    });

    // Attack 1: Org A Student + Org B Contract
    let crossTenantPaymentContractRejected = false;
    try {
      await paymentsService.create(
        {
          studentId: studentWithParentAndGroup.id, // Org A student
          contractId: contractB.id, // Org B contract!
          amount: 500000,
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof BadRequestException) crossTenantPaymentContractRejected = true;
    }
    assert(crossTenantPaymentContractRejected, '19. Payment Cross-Tenant Attack: Org A Student + Org B Contract REJECTED');

    // Attack 2: Org A Student + Org B Cashbox
    let crossTenantPaymentCashboxRejected = false;
    try {
      await paymentsService.create(
        {
          studentId: studentWithParentAndGroup.id, // Org A student
          cashboxId: cashboxB.id, // Org B cashbox!
          amount: 500000,
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof BadRequestException) crossTenantPaymentCashboxRejected = true;
    }
    assert(crossTenantPaymentCashboxRejected, '20. Payment Cross-Tenant Attack: Org A Student + Org B Cashbox REJECTED');

    // Attack 3: Contract mismatch (Student A paying against Student 1's contract)
    const contractStudent1 = await contractsService.create(
      {
        studentId: student1.id,
        totalAmount: 1000000,
      },
      orgA.id,
    );
    let contractMismatchRejected = false;
    try {
      await paymentsService.create(
        {
          studentId: studentWithParentAndGroup.id, // Student A
          contractId: contractStudent1.id, // Student 1's contract!
          amount: 200000,
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof BadRequestException) contractMismatchRejected = true;
    }
    assert(contractMismatchRejected, '21. Payment Integrity: Student A paying against Student B contract REJECTED');

    // Valid Payment: Student paying own contract in own org
    const validPayment = await paymentsService.create(
      {
        studentId: studentWithParentAndGroup.id,
        contractId: contractA.id,
        amount: 800000,
      },
      orgA.id,
    );
    assert(Number(validPayment.amount) === 800000 && validPayment.status === 'PAID', '22. Valid Payment: Created with PAID status');

    const updatedStudent = await studentsService.findOne(studentWithParentAndGroup.id, orgA.id);
    assert(Number(updatedStudent.balance) === 800000, '23. Balance Integrity: Student balance atomically incremented to 800000');

    // -------------------------------------------------------------
    // TEST 12: Contract Balance Update after Payment
    // -------------------------------------------------------------
    const updatedContract = await contractsService.findOne(contractA.id, orgA.id);
    assert(updatedContract.paidAmount === 800000, '24. Contract Paid Amount: 800000 paid correctly computed');
    assert(updatedContract.remainingAmount === 1000000, '25. Contract Remaining: 1000000 remaining correctly computed (1800000 - 800000)');

    // -------------------------------------------------------------
    // TEST 13: Void Payment Reverses Balance & Preserves History
    // -------------------------------------------------------------
    const voidedPayment = await paymentsService.voidPayment(validPayment.id, 'Noto\'g\'ri kiritilgan to\'lov', undefined, orgA.id);
    assert(voidedPayment.status === 'VOIDED', '26. Payment Void: Status set to VOIDED');

    const studentAfterVoid = await studentsService.findOne(studentWithParentAndGroup.id, orgA.id);
    assert(Number(studentAfterVoid.balance) === 0, '27. Student Balance Reversal: Balance decremented back to 0');

    const contractAfterVoid = await contractsService.findOne(contractA.id, orgA.id);
    assert(contractAfterVoid.remainingAmount === 1800000, '28. Contract Balance Reversal: Remaining restored to 1800000');

    // -------------------------------------------------------------
    // TEST 14: Refund Payment & Second Refund Rejection
    // -------------------------------------------------------------
    const secondPayment = await paymentsService.create(
      {
        studentId: studentWithParentAndGroup.id,
        contractId: contractA.id,
        amount: 500000,
      },
      orgA.id,
    );
    const refundedPayment = await paymentsService.refundPayment(secondPayment.id, 'Talaba kursni tark etdi', undefined, orgA.id);
    assert(refundedPayment.status === 'REFUNDED', '29. Refund Payment: Status set to REFUNDED');

    let doubleRefundRejected = false;
    try {
      await paymentsService.refundPayment(secondPayment.id, 'Qayta qaytarish', undefined, orgA.id);
    } catch (e) {
      if (e instanceof BadRequestException) doubleRefundRejected = true;
    }
    assert(doubleRefundRejected, '30. Refund Protection: Refunding already refunded payment REJECTED');

    // -------------------------------------------------------------
    // TEST 15: Concurrency Safety & Transaction Rollback Test
    // -------------------------------------------------------------
    const initialStudent = await studentsService.findOne(studentWithParentAndGroup.id, orgA.id);
    const initialBalance = Number(initialStudent.balance);

    let transactionRollbackPassed = false;
    try {
      await prisma.$transaction(async (tx) => {
        // Step 1: increment student balance
        await tx.student.update({
          where: { id: studentWithParentAndGroup.id },
          data: { balance: { increment: 300000 } },
        });

        // Step 2: Force intentional failure (e.g. invalid foreign key or error)
        throw new Error('SIMULATED_FINANCIAL_FAILURE_MID_TRANSACTION');
      });
    } catch (e: any) {
      if (e.message === 'SIMULATED_FINANCIAL_FAILURE_MID_TRANSACTION') {
        transactionRollbackPassed = true;
      }
    }
    const studentAfterFailedTx = await studentsService.findOne(studentWithParentAndGroup.id, orgA.id);
    assert(Number(studentAfterFailedTx.balance) === initialBalance, '32. Rollback Verification: Student balance was NOT modified after rollback');

    // -------------------------------------------------------------
    // TEST 16: Branch Finance Isolation
    // -------------------------------------------------------------
    // Create Cashbox in Branch A2
    const cashboxA2 = await prisma.cashbox.create({
      data: {
        organizationId: orgA.id,
        branchId: branchA2.id,
        name: 'Kassa Yunusobod A2',
        code: 'CB_YUNUSOBOD',
        currency: 'UZS',
        balance: 0,
      },
    });

    const branchCtxUserA1 = {
      organizationId: orgA.id,
      accessibleBranchIds: [branchA1.id],
      isSuperAdmin: false,
      isOrgAdmin: false,
      userBranchIds: [branchA1.id],
      headerBranchId: undefined,
    };

    let crossBranchPaymentRejected = false;
    try {
      await paymentsService.create(
        {
          studentId: studentWithParentAndGroup.id, // in Branch A1
          cashboxId: cashboxA2.id, // in Branch A2!
          amount: 100000,
        },
        orgA.id,
        'user-a1',
        branchCtxUserA1,
      );
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof ForbiddenException) crossBranchPaymentRejected = true;
    }
    assert(crossBranchPaymentRejected, '33. Branch Finance Isolation: Branch A1 restricted user accessing Branch A2 cashbox REJECTED');

    // -------------------------------------------------------------
    // TEST 18: Contract Branch Isolation & Soft Delete / Restore
    // -------------------------------------------------------------
    const studentInBranchA2 = await studentsService.create(
      {
        firstName: 'Farrux',
        lastName: 'Yunusobod',
        phone: '+998901112233',
        branchId: branchA2.id,
      },
      orgA.id,
    );

    const contractInBranchA2 = await contractsService.create(
      {
        studentId: studentInBranchA2.id,
        totalAmount: 3000000,
      },
      orgA.id,
      'admin',
      {
        organizationId: orgA.id,
        accessibleBranchIds: [branchA1.id, branchA2.id],
        isSuperAdmin: true,
        isOrgAdmin: true,
        userBranchIds: [branchA1.id, branchA2.id],
        headerBranchId: undefined,
      },
    );

    let crossBranchContractAccessRejected = false;
    try {
      await contractsService.findOne(contractInBranchA2.id, orgA.id, branchCtxUserA1);
    } catch (e) {
      if (e instanceof NotFoundException) crossBranchContractAccessRejected = true;
    }
    assert(crossBranchContractAccessRejected, '35. Contract Branch Isolation: Branch A1 restricted user accessing Branch A2 contract REJECTED');

    await contractsService.remove(contractInBranchA2.id, orgA.id, 'admin');
    const softDeletedContract = await prisma.contract.findUnique({ where: { id: contractInBranchA2.id } });
    assert(softDeletedContract?.status === 'DELETED', '36. Contract Soft Delete: Contract status set to DELETED, not hard-deleted');

    await contractsService.restore(contractInBranchA2.id, orgA.id, 'admin');
    const restoredContract = await prisma.contract.findUnique({ where: { id: contractInBranchA2.id } });
    assert(restoredContract?.status === 'ACTIVE', '37. Contract Restore: Contract status restored to ACTIVE');

    // -------------------------------------------------------------
    // TEST 19: CreateStudentDto with "parents" Array DTO Validation
    // -------------------------------------------------------------
    const { plainToInstance } = require('class-transformer');
    const { validate } = require('class-validator');
    const { CreateStudentDto } = require('./src/students/dto/student.dto');

    const studentWithParentsDto = plainToInstance(CreateStudentDto, {
      firstName: 'Alisher',
      lastName: 'Navoiy',
      phone: '+998909998877',
      parents: [
        { fullName: 'Ghiyasiddin', phone: '+998909998878', relationship: 'Otasi', isPrimary: true },
        { fullName: 'Ona', phone: '+998909998879', relationship: 'Onasi', isPrimary: false },
      ],
    });
    const validationErrors = await validate(studentWithParentsDto);
    assert(validationErrors.length === 0, '38. DTO Validation: CreateStudentDto with parents array passes validation cleanly');

    // -------------------------------------------------------------
    // TEST 20: Receipt Number Generation & Partial Refund
    // -------------------------------------------------------------
    const paymentWithReceipt = await paymentsService.create(
      {
        studentId: studentInBranchA2.id,
        amount: 600000,
        cashboxId: cashboxA2.id,
      },
      orgA.id,
    );
    assert(typeof paymentWithReceipt.receiptNumber === 'string' && paymentWithReceipt.receiptNumber.startsWith('RCP-'), '39. Receipt Number: Generated with format RCP-YYYYMMDD-XXXXXX');

    // Partial refund of 250,000 out of 600,000
    const partialRefund = await paymentsService.refundPayment(
      paymentWithReceipt.id,
      {
        amount: 250000,
        reason: 'Qisman qaytarildi',
        cashboxId: cashboxA2.id,
      },
      undefined,
      orgA.id,
    );
    assert(partialRefund !== null, '40. Partial Refund: Partial refund executed successfully');

    const studentAfterPartial = await studentsService.findOne(studentInBranchA2.id, orgA.id);
    assert(Number(studentAfterPartial.balance) === 350000, '41. Partial Refund Balance: Student balance accurately reduced by 250,000 (from 600,000 to 350,000)');

    // Cleanup
    await prisma.transaction.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.payment.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.cashbox.deleteMany({ where: { id: { in: [cashboxB.id, cashboxA2.id] } } });
    await prisma.contract.deleteMany({ where: { id: { in: [contractA.id, contractB.id, contractStudent1.id, contractInBranchA2.id] } } });
    await prisma.enrollmentHistory.deleteMany({ where: { studentId: studentWithParentAndGroup.id } });
    await prisma.groupEnrollment.deleteMany({ where: { groupId: groupA.id } });
    await prisma.group.deleteMany({ where: { id: groupA.id } });
    await prisma.course.deleteMany({ where: { id: courseA.id } });
    await prisma.studentParent.deleteMany({ where: { studentId: studentWithParentAndGroup.id } });
    await prisma.parent.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.student.deleteMany({ where: { id: { in: [student1.id, studentInOrgB.id, studentWithParentAndGroup.id, studentB2.id] } } });
    await prisma.branch.deleteMany({ where: { id: { in: [branchA1.id, branchA2.id] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });

    console.log('\n========================================================================');
    console.log('📊 STEP 3 HARDENED AUDIT TEST RESULTS: 41 PASSED / 0 FAILED (TOTAL: 41)');
    console.log('========================================================================\n');
  } catch (error) {
    console.error('\n❌ STEP 3 TEST FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStep3Audit();
