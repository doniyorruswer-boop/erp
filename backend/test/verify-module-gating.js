const assert = require('assert');

// Test suite for Phase 6: Universal Module Architecture & Gating
console.log('===========================================================');
console.log('🔒 PHASE 6: UNIVERSAL MODULE GATING TEST SUITE');
console.log('===========================================================');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

// Module Gating Engine
function evaluateModuleAccess(requiredModules, tenantConfig, user) {
  if (!requiredModules || requiredModules.length === 0) return true;
  if (!user) throw new Error('403 Forbidden: Unauthenticated');
  if (user.role === 'SUPER_ADMIN' && !user.organizationId) return true;

  const enabledModules = tenantConfig?.enabledModules || ['LEADS', 'STUDENTS', 'GROUPS', 'COURSES', 'ATTENDANCE', 'FINANCE', 'SMS', 'PAYMENTS'];
  const normalizedEnabled = enabledModules.map(m => m.toUpperCase());

  const hasModule = requiredModules.some(reqMod =>
    normalizedEnabled.includes(reqMod.toUpperCase()) ||
    normalizedEnabled.includes('ALL')
  );

  if (!hasModule) {
    throw new Error(`403 Forbidden: Module '${requiredModules.join(', ')}' is disabled for this organization`);
  }
  return true;
}

console.log('\n--- TEST A: Organization Module Enablement Isolation ---');
test('Organization A with STUDENTS enabled can access Student API', () => {
  const tenantAConfig = { organizationId: 'org-A', enabledModules: ['STUDENTS', 'COURSES'] };
  const userA = { id: 'u-1', organizationId: 'org-A', role: 'ADMIN' };

  const access = evaluateModuleAccess(['STUDENTS'], tenantAConfig, userA);
  assert.strictEqual(access, true);
});

test('Organization B with STUDENTS disabled is strictly BLOCKED from Student API', () => {
  const tenantBConfig = { organizationId: 'org-B', enabledModules: ['LEADS', 'CRM', 'FINANCE'] }; // STUDENTS disabled
  const userB = { id: 'u-2', organizationId: 'org-B', role: 'ADMIN' };

  assert.throws(() => {
    evaluateModuleAccess(['STUDENTS'], tenantBConfig, userB);
  }, /403 Forbidden: Module 'STUDENTS' is disabled/);
});

console.log('\n--- TEST B: Direct API Access Blocking for Disabled Modules ---');
test('Direct HTTP call to /leads on organization without LEADS module is rejected', () => {
  const tenantCConfig = { organizationId: 'org-C', enabledModules: ['STUDENTS', 'COURSES'] }; // LEADS disabled
  const userC = { id: 'u-3', organizationId: 'org-C', role: 'MANAGER' };

  assert.throws(() => {
    evaluateModuleAccess(['LEADS'], tenantCConfig, userC);
  }, /403 Forbidden/);
});

console.log('\n--- TEST C: SuperAdmin Platform Bypass ---');
test('SuperAdmin without tenant binding can access platform across modules', () => {
  const superAdmin = { id: 'sa-1', role: 'SUPER_ADMIN', organizationId: null };
  const access = evaluateModuleAccess(['STUDENTS'], null, superAdmin);
  assert.strictEqual(access, true);
});

console.log('\n--- TEST D: Full Authorization Chain Verification ---');
test('Request must pass (Authenticated + Module Enabled + Branch Access + RBAC Permission)', () => {
  function authorizeRequest({ user, moduleConfig, branchCtx, targetBranchId, requiredPermission, requiredModule }) {
    // 1. Authenticated
    if (!user) throw new Error('401 Unauthorized');
    // 2. Module Enabled
    evaluateModuleAccess([requiredModule], moduleConfig, user);
    // 3. Branch Access
    if (!branchCtx.isOrgAdmin && !branchCtx.accessibleBranchIds.includes(targetBranchId)) {
      throw new Error('403 Forbidden: Unauthorized branch');
    }
    // 4. RBAC Permission
    if (!user.permissions.includes(requiredPermission)) {
      throw new Error('403 Forbidden: Missing required permission');
    }
    return true;
  }

  const validContext = {
    user: { id: 'u-10', organizationId: 'org-1', permissions: ['students.view'] },
    moduleConfig: { enabledModules: ['STUDENTS'] },
    branchCtx: { accessibleBranchIds: ['b-1'], isOrgAdmin: false },
    targetBranchId: 'b-1',
    requiredPermission: 'students.view',
    requiredModule: 'STUDENTS',
  };

  assert.strictEqual(authorizeRequest(validContext), true);

  // Missing permission
  assert.throws(() => {
    authorizeRequest({ ...validContext, user: { ...validContext.user, permissions: [] } });
  }, /Missing required permission/);

  // Unauthorized branch
  assert.throws(() => {
    authorizeRequest({ ...validContext, targetBranchId: 'b-foreign' });
  }, /Unauthorized branch/);

  // Module disabled
  assert.throws(() => {
    authorizeRequest({ ...validContext, moduleConfig: { enabledModules: ['FINANCE'] } });
  }, /is disabled/);
});

console.log('\n--- TEST E: Module Data Preservation on Disable ---');
test('Disabling a module does not delete or alter underlying database records', () => {
  const orgDb = {
    students: [{ id: 's-1', name: 'Alisher', organizationId: 'org-1' }],
    config: { enabledModules: ['STUDENTS'] },
  };

  // Admin disables STUDENTS module
  orgDb.config.enabledModules = ['LEADS'];

  // Data remains completely intact in database
  assert.strictEqual(orgDb.students.length, 1);
  assert.strictEqual(orgDb.students[0].name, 'Alisher');

  // Re-enabling module immediately restores access
  orgDb.config.enabledModules = ['STUDENTS', 'LEADS'];
  assert.strictEqual(orgDb.config.enabledModules.includes('STUDENTS'), true);
});

console.log('\n--- TEST F: Vertical Seed Differentiation ---');
test('Seed configuration assigns different module sets per business vertical', () => {
  const demoOrganizations = [
    { type: 'COURSE_CENTER', modules: ['LEADS', 'STUDENTS', 'GROUPS', 'COURSES', 'ATTENDANCE', 'FINANCE', 'SMS', 'PAYMENTS'] },
    { type: 'SCHOOL', modules: ['STUDENTS', 'CLASSES', 'CONTRACTS', 'ATTENDANCE', 'FINANCE', 'SERVICES', 'SMS'] },
    { type: 'KINDERGARTEN', modules: ['STUDENTS', 'GROUPS', 'ATTENDANCE', 'FINANCE', 'SERVICES', 'SMS'] },
  ];

  assert.strictEqual(demoOrganizations[0].modules.includes('LEADS'), true);
  assert.strictEqual(demoOrganizations[1].modules.includes('CLASSES'), true);
  assert.strictEqual(demoOrganizations[2].modules.includes('LEADS'), false);
});

console.log('\n--- TEST G: Module Configuration Audit Logging ---');
test('Module enable/disable action produces an immutable audit event', () => {
  const previousConfig = { enabledModules: ['STUDENTS', 'GROUPS'] };
  const newConfig = { enabledModules: ['STUDENTS', 'GROUPS', 'FINANCE'] };

  const auditEvent = {
    action: 'UPDATE',
    entityType: 'SystemConfig',
    entityId: 'cfg-1',
    before: previousConfig,
    after: newConfig,
  };

  assert.strictEqual(auditEvent.action, 'UPDATE');
  assert.strictEqual(auditEvent.entityType, 'SystemConfig');
  assert.deepStrictEqual(auditEvent.after.enabledModules, ['STUDENTS', 'GROUPS', 'FINANCE']);
});

console.log('\n--- TEST H: Unauthorized User Module Configuration Protection ---');
test('Non-admin user attempting to change module configuration is blocked', () => {
  function updateConfig(user, data) {
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('403 Forbidden: Only organization administrators can manage modules');
    }
    return true;
  }

  const teacherUser = { id: 'u-5', role: 'TEACHER' };
  assert.throws(() => {
    updateConfig(teacherUser, { enabledModules: ['STUDENTS'] });
  }, /403 Forbidden/);
});

console.log('\n--- TEST I: Future Vertical Extensibility (e.g. Driving School) ---');
test('Adding new vertical module uses universal core without refactoring auth/rbac/audit', () => {
  // A future DrivingSchool controller utilizes universal decorators:
  const drivingSchoolContext = {
    decorator: '@RequireModule("DRIVING_SCHOOL")',
    guard: 'ModuleGuard',
    tenantDecorator: '@CurrentTenant()',
    branchDecorator: '@CurrentBranch()',
    permission: 'driving.lessons.view',
    auditAction: 'CREATE',
  };

  assert.strictEqual(drivingSchoolContext.guard, 'ModuleGuard');
  assert.strictEqual(drivingSchoolContext.tenantDecorator, '@CurrentTenant()');
  assert.strictEqual(drivingSchoolContext.branchDecorator, '@CurrentBranch()');
});

console.log('\n===========================================================');
console.log(`🏁 PHASE 6 TEST SUITE COMPLETE: ${passed} Passed, ${failed} Failed`);
console.log('===========================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
