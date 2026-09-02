import { PrismaClient } from '@prisma/client';
import { ParentsService } from './src/students/parents.service';
import { ContractsService } from './src/students/contracts.service';
import { CoursesService } from './src/courses/courses.service';
import { AuditService } from './src/audit/audit.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

const prisma = new PrismaClient();
const auditService = new AuditService(prisma as any);
const parentsService = new ParentsService(prisma as any, auditService);
const contractsService = new ContractsService(prisma as any, auditService);
const coursesService = new CoursesService(prisma as any, auditService);

async function runStep1Audit() {
  console.log('========================================================================');
  console.log('🛡️  PHASE 10.4 — STEP 1 SECURITY & TENANT AUDIT SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      failed++;
      console.error(`❌ [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
    }
  }

  try {
    // 1. Setup Test Tenants
    const orgA = await prisma.organization.upsert({
      where: { slug: 'audit-step1-org-a' },
      update: {},
      create: { name: 'Audit Academy A', slug: 'audit-step1-org-a', businessType: 'COURSE_CENTER' },
    });

    const orgB = await prisma.organization.upsert({
      where: { slug: 'audit-step1-org-b' },
      update: {},
      create: { name: 'Audit Academy B', slug: 'audit-step1-org-b', businessType: 'COURSE_CENTER' },
    });

    const studentA = await prisma.student.create({
      data: {
        organizationId: orgA.id,
        firstName: 'Farrux',
        lastName: 'Xolmatov',
        phone: '+998931110001',
        balance: 0,
      },
    });

    const studentB = await prisma.student.create({
      data: {
        organizationId: orgB.id,
        firstName: 'Sanjar',
        lastName: 'Karimov',
        phone: '+998932220002',
        balance: 0,
      },
    });

    // -------------------------------------------------------------
    // TEST 1: Cross-Tenant Parent Creation & Uniqueness
    // -------------------------------------------------------------
    const parentA = await parentsService.create(
      {
        fullName: 'Ziyoda Xolmatova',
        phone: '+998933330003',
        relationship: 'MOTHER',
      },
      orgA.id,
    );
    assert(parentA.organizationId === orgA.id, '1. Parent creation belongs strictly to Org A');

    // Duplicate phone in SAME org must be rejected by service and DB
    let duplicateRejected = false;
    try {
      await parentsService.create(
        {
          fullName: 'Boshqa Ota-ona',
          phone: '+998933330003',
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof ConflictException) duplicateRejected = true;
    }
    assert(duplicateRejected, '2. Duplicate Parent phone in SAME org rejected with ConflictException');

    // Same phone in DIFFERENT org MUST be allowed
    const parentB = await parentsService.create(
      {
        fullName: 'Karim Ota',
        phone: '+998933330003', // Same phone in Org B
        relationship: 'FATHER',
      },
      orgB.id,
    );
    assert(parentB.organizationId === orgB.id, '3. Same Parent phone in DIFFERENT org is ALLOWED');

    // -------------------------------------------------------------
    // TEST 2: Cross-Tenant Parent ↔ Student Link Attack
    // -------------------------------------------------------------
    let crossTenantLinkRejected = false;
    try {
      // Org A parent linking Org B student
      await parentsService.linkStudent(
        {
          studentId: studentB.id, // Org B
          parentId: parentA.id,   // Org A
          relationship: 'MOTHER',
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof NotFoundException) crossTenantLinkRejected = true;
    }
    assert(crossTenantLinkRejected, '4. Cross-Tenant Link: Org A parent linking Org B student REJECTED');

    // Valid Link in same org
    const validLink = await parentsService.linkStudent(
      {
        studentId: studentA.id,
        parentId: parentA.id,
        relationship: 'MOTHER',
        isPrimary: true,
      },
      orgA.id,
    );
    assert(validLink.studentId === studentA.id && validLink.parentId === parentA.id, '5. Valid StudentParent M:N link created');

    // Duplicate link is safely idempotent
    const duplicateLink = await parentsService.linkStudent(
      {
        studentId: studentA.id,
        parentId: parentA.id,
        relationship: 'MOTHER',
      },
      orgA.id,
    );
    assert(duplicateLink.id === validLink.id, '6. Duplicate StudentParent link is idempotent');

    // -------------------------------------------------------------
    // TEST 3: Contracts Cross-Tenant Security & Decimal Integrity
    // -------------------------------------------------------------
    let crossTenantContractRejected = false;
    try {
      // Org A creating contract for Org B student
      await contractsService.create(
        {
          studentId: studentB.id, // Org B
          totalAmount: 2500000.0,
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof NotFoundException) crossTenantContractRejected = true;
    }
    assert(crossTenantContractRejected, '7. Cross-Tenant Contract: Org A creating contract for Org B student REJECTED');

    const contractA = await contractsService.create(
      {
        studentId: studentA.id,
        contractNumber: `SH-STEP1-${Date.now()}`,
        totalAmount: 3600000.0,
        discountAmount: 200000.0,
        notes: 'Yillik shartnoma',
      },
      orgA.id,
    );
    assert(Number(contractA.totalAmount) === 3600000.0, '8. Contract totalAmount stored with Decimal precision');

    // Cross-tenant contract access attempt
    let crossTenantContractGetRejected = false;
    try {
      await contractsService.findOne(contractA.id, orgB.id); // Org B trying to read Org A contract
    } catch (e) {
      if (e instanceof NotFoundException) crossTenantContractGetRejected = true;
    }
    assert(crossTenantContractGetRejected, '9. Cross-Tenant Contract Read: Org B reading Org A contract REJECTED');

    // -------------------------------------------------------------
    // TEST 4: Courses Cross-Tenant & Restore Tenant Safety
    // -------------------------------------------------------------
    const courseA = await coursesService.create(
      {
        name: 'Mathematics Mastery',
        price: 950000.0,
        duration: 6,
        lessonCount: 72,
      },
      orgA.id,
    );

    const courseB = await coursesService.create(
      {
        name: 'Physics Mastery',
        price: 950000.0,
        duration: 6,
        lessonCount: 72,
      },
      orgB.id,
    );

    // Cross-tenant course update attempt
    let crossTenantCourseUpdateRejected = false;
    try {
      await coursesService.update(courseA.id, { name: 'Hacked Math' }, orgB.id);
    } catch (e) {
      if (e instanceof NotFoundException) crossTenantCourseUpdateRejected = true;
    }
    assert(crossTenantCourseUpdateRejected, '10. Cross-Tenant Course Update: Org B updating Org A course REJECTED');

    // Soft delete Course A
    await coursesService.remove(courseA.id, orgA.id);
    const deletedCourseInQuery = await prisma.course.findFirst({
      where: { id: courseA.id, organizationId: orgA.id, deletedAt: null },
    });
    assert(deletedCourseInQuery === null, '11. Soft Delete: Deleted course hidden from active queries');

    // Cross-tenant restore attempt
    let crossTenantRestoreRejected = false;
    try {
      await coursesService.restore(courseA.id, orgB.id); // Org B trying to restore Org A course
    } catch (e) {
      if (e instanceof NotFoundException) crossTenantRestoreRejected = true;
    }
    assert(crossTenantRestoreRejected, '12. Cross-Tenant Restore: Org B restoring Org A course REJECTED');

    // Valid restore by Org A
    const restoredCourse = await coursesService.restore(courseA.id, orgA.id);
    assert(restoredCourse.deletedAt === null, '13. Valid Restore: Org A successfully restores course');

    // -------------------------------------------------------------
    // TEST 5: Audit Trail Verification
    // -------------------------------------------------------------
    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId: orgA.id },
    });
    assert(auditLogs.length >= 4, `14. Audit Trail: Mutations logged to central AuditLog table (Count: ${auditLogs.length})`);

    // Clean up test data
    await prisma.auditLog.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.course.deleteMany({ where: { id: { in: [courseA.id, courseB.id] } } });
    await prisma.contract.deleteMany({ where: { id: contractA.id } });
    await prisma.studentParent.deleteMany({ where: { studentId: { in: [studentA.id, studentB.id] } } });
    await prisma.parent.deleteMany({ where: { id: { in: [parentA.id, parentB.id] } } });
    await prisma.student.deleteMany({ where: { id: { in: [studentA.id, studentB.id] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });

    console.log('\n========================================================================');
    console.log(`📊 STEP 1 AUDIT TEST RESULTS: ${passed} PASSED / ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Audit failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStep1Audit();
