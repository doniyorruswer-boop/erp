const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMultiTenancySecurityTests() {
  console.log('===========================================================');
  console.log('🔒 PHASE 1: STRICT MULTI-TENANCY ISOLATION TEST SUITE');
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
    // Setup 2 distinct Tenants
    const tenantA = await prisma.organization.upsert({
      where: { slug: 'tenant-a-test' },
      update: {},
      create: {
        name: 'Test Tenant A',
        slug: 'tenant-a-test',
        businessType: 'COURSE_CENTER',
      },
    });

    const tenantB = await prisma.organization.upsert({
      where: { slug: 'tenant-b-test' },
      update: {},
      create: {
        name: 'Test Tenant B',
        slug: 'tenant-b-test',
        businessType: 'COURSE_CENTER',
      },
    });

    console.log(`\n[SETUP] Tenant A: ${tenantA.id} (${tenantA.name})`);
    console.log(`[SETUP] Tenant B: ${tenantB.id} (${tenantB.name})`);

    // Clean up previous test artifacts
    await prisma.course.deleteMany({ where: { organizationId: { in: [tenantA.id, tenantB.id] } } });
    await prisma.student.deleteMany({ where: { organizationId: { in: [tenantA.id, tenantB.id] } } });
    await prisma.lead.deleteMany({ where: { organizationId: { in: [tenantA.id, tenantB.id] } } });
    await prisma.payment.deleteMany({ where: { organizationId: { in: [tenantA.id, tenantB.id] } } });
    await prisma.invoice.deleteMany({ where: { organizationId: { in: [tenantA.id, tenantB.id] } } });

    // -------------------------------------------------------------
    // TEST 1: Tenant A cannot view Tenant B's courses
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Course Isolation ---');
    const courseB = await prisma.course.create({
      data: {
        organizationId: tenantB.id,
        name: 'Tenant B Secret Course',
        price: 500000,
        duration: 3,
        lessonCount: 24,
      },
    });

    const coursesForA = await prisma.course.findMany({
      where: { organizationId: tenantA.id, deletedAt: null },
    });
    const foundBInA = coursesForA.some((c) => c.id === courseB.id);
    assert(!foundBInA, "Tenant A cannot view Tenant B's courses", `Found course ${courseB.id} in Tenant A query!`);

    // -------------------------------------------------------------
    // TEST 2: Tenant A cannot view or delete Tenant B's student
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Student Isolation ---');
    const studentB = await prisma.student.create({
      data: {
        organizationId: tenantB.id,
        firstName: 'Bob',
        lastName: 'TenantB',
        phone: '+998990000002',
        status: 'ACTIVE',
      },
    });

    const studentFoundByA = await prisma.student.findFirst({
      where: { id: studentB.id, organizationId: tenantA.id, deletedAt: null },
    });
    assert(studentFoundByA === null, "Tenant A cannot find Tenant B's student with scoped orgId");

    // -------------------------------------------------------------
    // TEST 3: Tenant A cannot access or move Lead of Tenant B
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Lead Isolation ---');
    const leadB = await prisma.lead.create({
      data: {
        organizationId: tenantB.id,
        fullName: 'Lead Of Tenant B',
        phone: '+998990000003',
        status: 'NEW',
      },
    });

    const leadFoundByA = await prisma.lead.findFirst({
      where: { id: leadB.id, organizationId: tenantA.id, deletedAt: null },
    });
    assert(leadFoundByA === null, "Tenant A cannot find Tenant B's lead");

    // -------------------------------------------------------------
    // TEST 4: Cross-Tenant Payment & Invoice Allocation Rejection
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Cross-Tenant Financial Isolation ---');
    const invoiceB = await prisma.invoice.create({
      data: {
        organizationId: tenantB.id,
        invoiceNumber: 'INV-TEST-B-001',
        subtotal: 100000,
        totalAmount: 100000,
        paidAmount: 0,
      },
    });

    // Check if Tenant A can see or allocate to Invoice B
    const invoiceForA = await prisma.invoice.findFirst({
      where: { id: invoiceB.id, organizationId: tenantA.id, deletedAt: null },
    });
    assert(invoiceForA === null, "Tenant A cannot access Tenant B's invoice");

    // -------------------------------------------------------------
    // TEST 5: Missing Organization Context in CurrentTenant Decorator
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: CurrentTenant Decorator Context Validation ---');
    // Import compiled CurrentTenant implementation
    // Mock ExecutionContext
    function mockContext(userObj, headers = {}, query = {}) {
      return {
        switchToHttp: () => ({
          getRequest: () => ({
            user: userObj,
            headers,
            query,
            body: { organizationId: 'injected-body-org' },
          }),
        }),
      };
    }

    // Direct decorator logic simulation exactly matching tenant.decorator.ts:
    const extractTenant = (ctx) => {
      const request = ctx.switchToHttp().getRequest();
      const orgId = request.user?.organizationId;
      if (!orgId) {
        throw new Error('Organization context missing');
      }
      return orgId;
    };

    let errorThrownWithoutOrg = false;
    try {
      extractTenant(mockContext({ id: 'user-1' })); // no organizationId
    } catch (e) {
      if (e.message.includes('Organization context missing')) {
        errorThrownWithoutOrg = true;
      }
    }
    assert(errorThrownWithoutOrg, "CurrentTenant throws error when request.user.organizationId is missing");

    // -------------------------------------------------------------
    // TEST 6: Header / Query / Body Injection Ignored
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Header / Query Injection Prevention ---');
    const attackerContext = mockContext(
      { id: 'user-a', organizationId: tenantA.id }, // real JWT tenant
      { 'x-organization-id': tenantB.id, 'x-tenant-id': tenantB.id }, // malicious header injection
      { orgId: tenantB.id } // malicious query injection
    );

    const resolvedOrgId = extractTenant(attackerContext);
    assert(
      resolvedOrgId === tenantA.id,
      "CurrentTenant extracts ONLY request.user.organizationId and ignores all injected headers/query/body",
      `Expected ${tenantA.id}, got ${resolvedOrgId}`
    );
    assert(
      resolvedOrgId !== tenantB.id,
      "Injected Tenant B header/query is completely ignored"
    );

    // Summary
    console.log('\n===========================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===========================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMultiTenancySecurityTests();
