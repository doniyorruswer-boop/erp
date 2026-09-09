/**
 * Unit Test for ModuleRegistryService (PROMPT 2 Verification)
 * Validates module registration, dependency resolution,
 * canonical uppercase ID normalization, and active module resolution
 * for the 3 demo organizations:
 *  - educrm-markaziy (COURSE_CENTER)
 *  - profi-maktab (SCHOOL)
 *  - yulduzcha-bogcha (KINDERGARTEN)
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const ts = require("../frontend/node_modules/typescript");

function loadTsModule(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const m = { exports: {} };
  const wrapper = new Function("exports", "require", "module", "__filename", "__dirname", transpiled.outputText);
  const customRequire = (reqPath) => {
    if (reqPath === "./types" || reqPath.endsWith("/types")) {
      return {};
    }
    const resolvedPath = path.resolve(path.dirname(filePath), reqPath + (reqPath.endsWith(".ts") ? "" : ".ts"));
    return loadTsModule(resolvedPath);
  };
  wrapper(m.exports, customRequire, m, filePath, path.dirname(filePath));
  return m.exports;
}

const registryMod = loadTsModule(path.resolve(__dirname, "../frontend/src/core/modules/registry.ts"));
const { ModuleRegistryService, normalizeModuleId } = registryMod;

console.log("🚀 Starting Module Registry Unit Tests...\n");

// 1. Test normalizeModuleId
console.log("TEST 1: Canonical ID Normalization");
assert.strictEqual(normalizeModuleId("finance"), "FINANCE");
assert.strictEqual(normalizeModuleId("  attendance  "), "ATTENDANCE");
assert.strictEqual(normalizeModuleId("STUDENTS"), "STUDENTS");
assert.strictEqual(normalizeModuleId(""), "");
console.log("✔ Canonical ID normalization passed.");

// 2. Test pilot modules setup
console.log("\nTEST 2: Pilot Modules Registration");
const registry = new ModuleRegistryService();

const studentsModule = {
  id: "STUDENTS",
  name: "O'quvchilar",
  category: "ACADEMIC",
  dependencies: [],
  applicableBusinessTypes: ["COURSE_CENTER", "SCHOOL", "KINDERGARTEN"],
};

const attendanceModule = {
  id: "ATTENDANCE",
  name: "Davomat",
  category: "ACADEMIC",
  dependencies: ["STUDENTS"],
  applicableBusinessTypes: ["COURSE_CENTER", "SCHOOL", "KINDERGARTEN"],
};

const financeModule = {
  id: "FINANCE",
  name: "Moliya",
  category: "FINANCE",
  dependencies: [],
  applicableBusinessTypes: ["COURSE_CENTER", "SCHOOL", "KINDERGARTEN"],
};

registry.register(studentsModule);
registry.register(attendanceModule);
registry.register(financeModule);

assert.strictEqual(registry.getAllModules().length, 3);
assert.strictEqual(registry.getModule("students").id, "STUDENTS");
assert.strictEqual(registry.getModule("ATTENDANCE").id, "ATTENDANCE");
assert.strictEqual(registry.getModule("FINANCE").id, "FINANCE");
console.log("✔ Registration of 3 pilot modules passed.");

// 3. Test Demo Org: educrm-markaziy
console.log("\nTEST 3: Demo Org 'educrm-markaziy' (Course Center)");
const educrmModules = ["LEADS", "STUDENTS", "GROUPS", "COURSES", "ATTENDANCE", "FINANCE", "SMS", "PAYMENTS"];
registry.syncEnabledModules(educrmModules);

assert.strictEqual(registry.isEnabled("FINANCE"), true, "FINANCE should be enabled for educrm-markaziy");
assert.strictEqual(registry.isEnabled("ATTENDANCE"), true, "ATTENDANCE should be enabled for educrm-markaziy");
assert.strictEqual(registry.isEnabled("STUDENTS"), true, "STUDENTS should be enabled for educrm-markaziy");
assert.strictEqual(registry.isEnabled("WAREHOUSE"), false, "WAREHOUSE should be disabled");
assert.strictEqual(registry.getEnabledModules().length, 3);
console.log("✔ educrm-markaziy modules verified.");

// 4. Test Demo Org: profi-maktab
console.log("\nTEST 4: Demo Org 'profi-maktab' (School)");
const profiModules = ["STUDENTS", "CLASSES", "CONTRACTS", "ATTENDANCE", "FINANCE", "SERVICES", "SMS"];
registry.syncEnabledModules(profiModules);

assert.strictEqual(registry.isEnabled("FINANCE"), true, "FINANCE should be enabled for profi-maktab");
assert.strictEqual(registry.isEnabled("ATTENDANCE"), true, "ATTENDANCE should be enabled for profi-maktab");
assert.strictEqual(registry.isEnabled("STUDENTS"), true, "STUDENTS should be enabled for profi-maktab");
assert.strictEqual(registry.getEnabledModules().length, 3);
console.log("✔ profi-maktab modules verified.");

// 5. Test Demo Org: yulduzcha-bogcha
console.log("\nTEST 5: Demo Org 'yulduzcha-bogcha' (Kindergarten)");
const yulduzchaModules = ["STUDENTS", "GROUPS", "ATTENDANCE", "FINANCE", "SERVICES", "SMS"];
registry.syncEnabledModules(yulduzchaModules);

assert.strictEqual(registry.isEnabled("FINANCE"), true, "FINANCE should be enabled for yulduzcha-bogcha");
assert.strictEqual(registry.isEnabled("ATTENDANCE"), true, "ATTENDANCE should be enabled for yulduzcha-bogcha");
assert.strictEqual(registry.isEnabled("STUDENTS"), true, "STUDENTS should be enabled for yulduzcha-bogcha");
assert.strictEqual(registry.getEnabledModules().length, 3);
console.log("✔ yulduzcha-bogcha modules verified.");

// 6. Test Org without FINANCE
console.log("\nTEST 6: Custom Org without FINANCE");
const customWithoutFinance = ["STUDENTS", "ATTENDANCE", "LEADS"];
registry.syncEnabledModules(customWithoutFinance);

assert.strictEqual(registry.isEnabled("FINANCE"), false, "FINANCE must be false when omitted from config");
assert.strictEqual(registry.isEnabled("STUDENTS"), true, "STUDENTS should be true");
assert.strictEqual(registry.isEnabled("ATTENDANCE"), true, "ATTENDANCE should be true");
console.log("✔ Disabled module check passed.");

// 7. Test Dependency Failure Handling
console.log("\nTEST 7: Dependency Failure Handling (ATTENDANCE requires STUDENTS)");
const configMissingDependency = ["ATTENDANCE", "FINANCE"];
registry.syncEnabledModules(configMissingDependency);

assert.strictEqual(registry.isEnabled("STUDENTS"), false, "STUDENTS is missing");
assert.strictEqual(registry.isEnabled("ATTENDANCE"), false, "ATTENDANCE must fail when STUDENTS dependency is missing");
assert.strictEqual(registry.isEnabled("FINANCE"), true, "FINANCE has no dependencies, should remain true");
console.log("✔ Dependency failure handling verified.");

console.log("\n🎉 ALL 7 MODULE REGISTRY TESTS PASSED SUCCESSFULLY!");
