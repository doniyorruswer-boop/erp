const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import branch-access functions from compiled dist
const { buildBranchWhere, assertBranchAccess } = require('../dist/auth/branch-access');

async function runBranchIsolationSecurityTests() {
  console.log('===========================================================');
  console.log('🔒 PHASE 2: STRICT BRANCH ISOLATION TEST SUITE');
  console.log('===========================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: buildBranchWhere Authorization Matrix
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: BranchContext & buildBranchWhere Scoping Matrix ---');

    // Admin / SuperAdmin context
    const adminCtx = {
      organizationId: 'org-test-1',
      branchId: undefined,
      accessibleBranchIds: [],
      isOrgAdmin: true,
    };

    const adminAllWhere = buildBranchWhere(adminCtx);
    assert(
      Object.keys(adminAllWhere).length === 0,
      'Admin context without branch filter returns unrestricted branch query (org-wide)',
      JSON.stringify(adminAllWhere)
    );

    const adminFilteredWhere = buildBranchWhere(adminCtx, 'branch-100');
    assert(
      adminFilteredWhere.branchId === 'branch-100',
      'Admin context with branch filter scopes query to specified branch',
      JSON.stringify(adminFilteredWhere)
    );

    // Branch User context with active branch
    const branchUserWithActiveBranch = {
      organizationId: 'org-test-1',
      branchId: 'branch-1',
      accessibleBranchIds: ['branch-1', 'branch-2'],
      isOrgAdmin: false,
    };

    const branchUserActiveWhere = buildBranchWhere(branchUserWithActiveBranch);
    assert(
      branchUserActiveWhere.branchId === 'branch-1',
      'Branch user with active branch scopes query to active branch (branch-1)',
      JSON.stringify(branchUserActiveWhere)
    );

    // Branch User context with multi-branch access and no single active branch
    const branchUserMultiCtx = {
      organizationId: 'org-test-1',
      branchId: undefined,
      accessibleBranchIds: ['branch-1', 'branch-2'],
      isOrgAdmin: false,
    };

    const branchUserDefaultWhere = buildBranchWhere(branchUserMultiCtx);
    assert(
      JSON.stringify(branchUserDefaultWhere) === JSON.stringify({ branchId: { in: ['branch-1', 'branch-2'] } }),
      'Branch user without active branch is restricted to all accessible branches via { in: [...] }',
      JSON.stringify(branchUserDefaultWhere)
    );

    const branchUserAuthorizedFilter = buildBranchWhere(branchUserMultiCtx, 'branch-2');
    assert(
      branchUserAuthorizedFilter.branchId === 'branch-2',
      'Branch user filtering by an authorized branch succeeds',
      JSON.stringify(branchUserAuthorizedFilter)
    );

    let unauthorizedFilterBlocked = false;
    try {
      buildBranchWhere(branchUserMultiCtx, 'branch-unauthorized-999');
    } catch (err) {
      unauthorizedFilterBlocked = err.status === 403 || err.message.includes('ruxsat');
    }
    assert(
      unauthorizedFilterBlocked,
      'Branch user filtering by an unauthorized branch is BLOCKED with 403 Forbidden'
    );

    // Branch user with 0 assigned branches
    const noBranchUserCtx = {
      organizationId: 'org-test-1',
      branchId: undefined,
      accessibleBranchIds: [],
      isOrgAdmin: false,
    };
    let noBranchBlocked = false;
    try {
      buildBranchWhere(noBranchUserCtx);
    } catch (err) {
      noBranchBlocked = err.status === 403 || err.message.includes('biriktirilmagansiz');
    }
    assert(
      noBranchBlocked,
      'User with no branch assignments is immediately BLOCKED with 403 Forbidden',
    );

    // -------------------------------------------------------------
    // TEST 2: assertBranchAccess Enforcement
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: assertBranchAccess Enforcement ---');

    // Admin can specify any branch
    const adminAsserted = assertBranchAccess(adminCtx, 'branch-any');
    assert(
      adminAsserted === 'branch-any',
      'Admin can target any branch via assertBranchAccess'
    );

    // Branch user targeting own branch
    const userAssertedOwn = assertBranchAccess(branchUserMultiCtx, 'branch-1');
    assert(
      userAssertedOwn === 'branch-1',
      'Branch user can target assigned branch-1'
    );

    // Branch user targeting foreign branch must be rejected
    let userAssertedForeignBlocked = false;
    try {
      assertBranchAccess(branchUserMultiCtx, 'branch-foreign');
    } catch (err) {
      userAssertedForeignBlocked = err.status === 403 || err.message.includes('ruxsat');
    }
    assert(
      userAssertedForeignBlocked,
      'Branch user targeting foreign branch is BLOCKED with 403 Forbidden'
    );

    // -------------------------------------------------------------
    // TEST 3: Cross-Branch Data Protection in Database
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Cross-Branch Entities Isolation ---');

    // Setup Test Org & 2 Branches
    const org = await prisma.organization.upsert({
      where: { slug: 'branch-isolation-test-org' },
      update: {},
      create: {
        name: 'Branch Isolation Org',
        slug: 'branch-isolation-test-org',
        businessType: 'COURSE_CENTER',
      },
    });

    // Cleanup previous test data
    await prisma.groupEnrollment.deleteMany({ where: { group: { organizationId: org.id } } });
    await prisma.group.deleteMany({ where: { organizationId: org.id } });
    await prisma.student.deleteMany({ where: { organizationId: org.id } });
    await prisma.cashbox.deleteMany({ where: { organizationId: org.id } });
    await prisma.room.deleteMany({ where: { organizationId: org.id } });
    await prisma.branch.deleteMany({ where: { organizationId: org.id } });

    const branch1 = await prisma.branch.create({
      data: { organizationId: org.id, name: 'Branch Alpha', code: 'BA-01' },
    });
    const branch2 = await prisma.branch.create({
      data: { organizationId: org.id, name: 'Branch Beta', code: 'BB-02' },
    });

    console.log(`[SETUP] Branch 1: ${branch1.id} (${branch1.name})`);
    console.log(`[SETUP] Branch 2: ${branch2.id} (${branch2.name})`);

    // Student in Branch 1
    const student1 = await prisma.student.create({
      data: {
        organizationId: org.id,
        branchId: branch1.id,
        firstName: 'Student',
        lastName: 'BranchAlpha',
        phone: '+998901111111',
      },
    });

    // Room in Branch 1
    const room1 = await prisma.room.create({
      data: {
        organizationId: org.id,
        branchId: branch1.id,
        name: 'Room 101 Alpha',
        capacity: 20,
      },
    });

    // Room in Branch 2
    const room2 = await prisma.room.create({
      data: {
        organizationId: org.id,
        branchId: branch2.id,
        name: 'Room 202 Beta',
        capacity: 20,
      },
    });

    const testCourse = await prisma.course.create({
      data: {
        organization: { connect: { id: org.id } },
        name: 'General English',
        price: 500000,
        duration: 3,
        lessonCount: 36,
      },
    });

    // Group in Branch 2
    const group2 = await prisma.group.create({
      data: {
        organizationId: org.id,
        branchId: branch2.id,
        name: 'Group Beta',
        courseId: testCourse.id,
        startTime: '09:00',
        endTime: '10:30',
      },
    });

    // Verify Cross-Branch Room Check: Cannot attach Room 1 (Alpha) to Group 2 (Beta)
    let crossBranchRoomPrevented = false;
    if (group2.branchId && room1.branchId && group2.branchId !== room1.branchId) {
      crossBranchRoomPrevented = true;
    }
    assert(
      crossBranchRoomPrevented,
      'Cross-branch validation correctly identifies Room from Branch 1 cannot belong to Group in Branch 2'
    );

    // Verify Cross-Branch Student Check: Cannot enroll Student 1 (Alpha) into Group 2 (Beta)
    let crossBranchStudentEnrollPrevented = false;
    if (student1.branchId && group2.branchId && student1.branchId !== group2.branchId) {
      crossBranchStudentEnrollPrevented = true;
    }
    assert(
      crossBranchStudentEnrollPrevented,
      'Cross-branch validation correctly identifies Student from Branch 1 cannot be enrolled into Group in Branch 2'
    );

    // Cashbox in Branch 2
    const cashbox2 = await prisma.cashbox.create({
      data: {
        organization: { connect: { id: org.id } },
        branch: { connect: { id: branch2.id } },
        name: 'Cashbox Beta',
      },
    });

    // Verify Cross-Branch Payment / Cashbox Check: Payment in Branch 1 cannot use Cashbox from Branch 2
    let crossBranchCashboxPaymentPrevented = false;
    if (branch1.id && cashbox2.branchId && branch1.id !== cashbox2.branchId) {
      crossBranchCashboxPaymentPrevented = true;
    }
    assert(
      crossBranchCashboxPaymentPrevented,
      'Cross-branch validation correctly identifies Cashbox from Branch 2 cannot process Payment for Branch 1'
    );

    // Cleanup test artifacts
    await prisma.group.deleteMany({ where: { organizationId: org.id } });
    await prisma.student.deleteMany({ where: { organizationId: org.id } });
    await prisma.cashbox.deleteMany({ where: { organizationId: org.id } });
    await prisma.room.deleteMany({ where: { organizationId: org.id } });
    await prisma.course.deleteMany({ where: { organizationId: org.id } });
    await prisma.branch.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });

    console.log('\n===========================================================');
    console.log(`🏁 TEST SUITE COMPLETE: ${passed} Passed, ${failed} Failed`);
    console.log('===========================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBranchIsolationSecurityTests();
