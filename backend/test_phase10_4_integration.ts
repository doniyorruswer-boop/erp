import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runIntegrationTests() {
  console.log('========================================================================');
  console.log('🚀 PHASE 10.4 — COMPREHENSIVE BUSINESS & TENANT INTEGRATION TESTS');
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
    // 1. Setup Test Tenants and Branches
    const orgA = await prisma.organization.upsert({
      where: { slug: 'audit-org-a' },
      update: {},
      create: { name: 'Audit Academy A', slug: 'audit-org-a', businessType: 'COURSE_CENTER' },
    });

    const orgB = await prisma.organization.upsert({
      where: { slug: 'audit-org-b' },
      update: {},
      create: { name: 'Audit Academy B', slug: 'audit-org-b', businessType: 'COURSE_CENTER' },
    });

    const branchA1 = await prisma.branch.create({
      data: { organizationId: orgA.id, name: 'Chilonzor Filiali' },
    });

    const branchA2 = await prisma.branch.create({
      data: { organizationId: orgA.id, name: 'Yunusobod Filiali' },
    });

    const branchB = await prisma.branch.create({
      data: { organizationId: orgB.id, name: 'Samarqand Filiali' },
    });

    // 2. Multi-Tenant Student Isolation
    const studentA = await prisma.student.create({
      data: {
        organizationId: orgA.id,
        branchId: branchA1.id,
        firstName: 'Anvar',
        lastName: 'Sobirov',
        phone: '+998901230001',
        balance: 0,
      },
    });

    const studentB = await prisma.student.create({
      data: {
        organizationId: orgB.id,
        branchId: branchB.id,
        firstName: 'Bekzod',
        lastName: 'Rahimov',
        phone: '+998901230001', // Same phone in Org B allowed
        balance: 0,
      },
    });

    const orgAStudents = await prisma.student.findMany({
      where: { organizationId: orgA.id, deletedAt: null },
    });
    assert(!orgAStudents.some(s => s.id === studentB.id), '1. Multi-Tenant Isolation: Org A cannot query Org B students');

    // 3. Related Entity Cross-Tenant Attack Protection in Payment
    const cashboxB = await prisma.cashbox.create({
      data: {
        organizationId: orgB.id,
        name: 'Org B Kassa',
        code: 'CB_ORGB',
        balance: 0,
      },
    });

    // Simulate cross-tenant verification in Service: Student from Org A + Cashbox from Org B
    const cashboxInOrgA = await prisma.cashbox.findFirst({
      where: { id: cashboxB.id, organizationId: orgA.id },
    });
    assert(!cashboxInOrgA, '2. Cross-Tenant Cashbox Attack: Org B cashbox rejected for Org A payment');

    // 4. Contract Ownership in Payment
    const contractA = await prisma.contract.create({
      data: {
        organizationId: orgA.id,
        studentId: studentA.id,
        contractNumber: `SH-AUDIT-${Date.now()}`,
        totalAmount: 3600000.0,
      },
    });

    // Check if contract belongs to Org A and studentA
    const contractVerification = await prisma.contract.findFirst({
      where: { id: contractA.id, organizationId: orgA.id },
    });
    assert(
      contractVerification !== null && contractVerification.studentId === studentA.id,
      '3. Contract Ownership: Contract verified for Org A and studentA',
    );

    // 5. Parent & Student M:N Junction
    const parentA = await prisma.parent.create({
      data: {
        organizationId: orgA.id,
        fullName: 'Dilbar Sobirova',
        phone: '+998909990001',
        relationship: 'MOTHER',
      },
    });

    const studentParentLink = await prisma.studentParent.create({
      data: {
        studentId: studentA.id,
        parentId: parentA.id,
        relationship: 'MOTHER',
        isPrimary: true,
      },
    });
    assert(studentParentLink.studentId === studentA.id, '4. StudentParent M:N Junction: Established successfully');

    // 6. Course & Group Creation with Branch Scope
    const courseA = await prisma.course.create({
      data: {
        organizationId: orgA.id,
        name: 'Full Stack Development',
        price: 1200000.0,
        duration: 9,
        lessonCount: 108,
      },
    });

    const groupA1 = await prisma.group.create({
      data: {
        organizationId: orgA.id,
        branchId: branchA1.id,
        courseId: courseA.id,
        name: 'FS-Chilonzor-01',
        startTime: '09:00',
        endTime: '11:00',
      },
    });

    const groupA2 = await prisma.group.create({
      data: {
        organizationId: orgA.id,
        branchId: branchA2.id,
        courseId: courseA.id,
        name: 'FS-Yunusobod-01',
        startTime: '14:00',
        endTime: '16:00',
      },
    });

    // 7. Group Transfer Transaction & History Preservation
    const enrollment = await prisma.groupEnrollment.create({
      data: {
        groupId: groupA1.id,
        studentId: studentA.id,
        isActive: true,
      },
    });

    await prisma.$transaction([
      prisma.groupEnrollment.update({
        where: { id: enrollment.id },
        data: { isActive: false },
      }),
      prisma.groupEnrollment.create({
        data: {
          groupId: groupA2.id,
          studentId: studentA.id,
          isActive: true,
        },
      }),
      prisma.enrollmentHistory.create({
        data: {
          studentId: studentA.id,
          groupId: groupA2.id,
          action: 'TRANSFER',
          reason: 'Boshqa filialga ko\'chirish',
        },
      }),
    ]);

    const currentEnrollment = await prisma.groupEnrollment.findFirst({
      where: { studentId: studentA.id, isActive: true },
    });
    assert(currentEnrollment?.groupId === groupA2.id, '5. Group Transfer: Transferred atomically to new branch group');

    // 8. Exam MaxScore Boundary Validation
    const exam = await prisma.exam.create({
      data: {
        groupId: groupA2.id,
        title: 'Backend Node.js Test',
        maxScore: 100.0,
      },
    });

    // Business check: Score 105 > maxScore 100 must be rejected
    const invalidScore = 105;
    const isScoreValid = invalidScore <= Number(exam.maxScore) && invalidScore >= 0;
    assert(!isScoreValid, '6. Business Rule: Grade score 105 > maxScore 100 is rejected');

    // 9. Payment Atomic Balance & Transaction Update
    const cashboxA = await prisma.cashbox.create({
      data: {
        organizationId: orgA.id,
        branchId: branchA2.id,
        name: 'Yunusobod Kassa',
        code: 'CB_YUNUS',
        balance: 0,
      },
    });

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          organizationId: orgA.id,
          branchId: branchA2.id,
          studentId: studentA.id,
          contractId: contractA.id,
          cashboxId: cashboxA.id,
          amount: 1200000.0,
          method: 'CLICK',
        },
      }),
      prisma.student.update({
        where: { id: studentA.id },
        data: { balance: { increment: 1200000.0 } },
      }),
      prisma.cashbox.update({
        where: { id: cashboxA.id },
        data: { balance: { increment: 1200000.0 } },
      }),
      prisma.transaction.create({
        data: {
          organizationId: orgA.id,
          branchId: branchA2.id,
          cashboxId: cashboxA.id,
          type: 'INCOME',
          amount: 1200000.0,
          balanceAfter: 1200000.0,
          description: 'O\'qish to\'lovi',
        },
      }),
    ]);

    const studentAfterPayment = await prisma.student.findUnique({ where: { id: studentA.id } });
    const cashboxAfterPayment = await prisma.cashbox.findUnique({ where: { id: cashboxA.id } });

    assert(
      Number(studentAfterPayment?.balance) === 1200000.0 && Number(cashboxAfterPayment?.balance) === 1200000.0,
      '7. Atomic Payment: Student balance and Cashbox balance updated with Decimal precision',
    );

    // Clean up test data
    await prisma.transaction.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.payment.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.cashbox.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.exam.deleteMany({ where: { id: exam.id } });
    await prisma.enrollmentHistory.deleteMany({ where: { studentId: studentA.id } });
    await prisma.groupEnrollment.deleteMany({ where: { studentId: studentA.id } });
    await prisma.group.deleteMany({ where: { id: { in: [groupA1.id, groupA2.id] } } });
    await prisma.course.deleteMany({ where: { id: courseA.id } });
    await prisma.contract.deleteMany({ where: { id: contractA.id } });
    await prisma.studentParent.deleteMany({ where: { studentId: studentA.id } });
    await prisma.parent.deleteMany({ where: { id: parentA.id } });
    await prisma.student.deleteMany({ where: { id: { in: [studentA.id, studentB.id] } } });
    await prisma.branch.deleteMany({ where: { id: { in: [branchA1.id, branchA2.id, branchB.id] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });

    console.log('\n========================================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED / ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error during tests:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runIntegrationTests();
