const fs = require("fs");
const path = require("path");
const assert = require("assert");
const ts = require("../frontend/node_modules/typescript");

const moduleCache = new Map();

function loadTsModule(filePath) {
  let normalized = path.normalize(filePath);
  if (!fs.existsSync(normalized)) {
    if (fs.existsSync(normalized + ".ts")) normalized += ".ts";
    else if (fs.existsSync(normalized + ".js")) normalized += ".js";
  }

  if (moduleCache.has(normalized)) {
    return moduleCache.get(normalized);
  }

  const code = fs.readFileSync(normalized, "utf8");
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const m = { exports: {} };
  moduleCache.set(normalized, m.exports);

  const wrapper = new Function("exports", "require", "module", "__filename", "__dirname", transpiled.outputText);
  const customRequire = (reqPath) => {
    if (reqPath === "vue-router") return {};
    if (reqPath.includes("types")) return {};
    let resolved = reqPath;
    if (reqPath.startsWith("@/")) {
      resolved = path.resolve(__dirname, "../frontend/src", reqPath.slice(2));
    } else {
      resolved = path.resolve(path.dirname(normalized), reqPath);
    }
    if (fs.existsSync(resolved + ".ts")) {
      resolved += ".ts";
    } else if (fs.existsSync(resolved + ".js")) {
      resolved += ".js";
    }
    return loadTsModule(resolved);
  };
  wrapper(m.exports, customRequire, m, normalized, path.dirname(normalized));
  return m.exports;
}

const navMod = loadTsModule(path.resolve(__dirname, "../frontend/src/core/navigation/navigation.service.ts"));
const { navigationService } = navMod;

console.log("🚀 Starting Navigation Service Unit Tests...\n");

// 1. Sync with educrm-markaziy (all 3 pilot modules enabled)
console.log("TEST 1: educrm-markaziy navigation items");
const educrmModules = ["LEADS", "STUDENTS", "GROUPS", "COURSES", "ATTENDANCE", "FINANCE", "SMS", "PAYMENTS"];
navigationService.sync(educrmModules);

const studentItems = navigationService.getNavItemsForModule("STUDENTS");
assert.strictEqual(studentItems.length, 1);
assert.strictEqual(studentItems[0].path, "/students");
assert.strictEqual(studentItems[0].label, "O'quvchilar");
assert.strictEqual(studentItems[0].icon, "ph:student-fill");

const attendanceItems = navigationService.getNavItemsForModule("ATTENDANCE");
assert.strictEqual(attendanceItems.length, 1);
assert.strictEqual(attendanceItems[0].path, "/attendance");
assert.strictEqual(attendanceItems[0].label, "Davomat");

const financeItems = navigationService.getNavItemsForModule("FINANCE");
assert.strictEqual(financeItems.length, 1);
assert.strictEqual(financeItems[0].path, "/finance");
assert.strictEqual(financeItems[0].label, "Moliya & Kassa");
console.log("✔ Pilot modules navigation items verified.");

// 2. Test getEnabledNavItems ordering
console.log("\nTEST 2: getEnabledNavItems ordering");
const allEnabled = navigationService.getEnabledNavItems();
assert.strictEqual(allEnabled.length, 3);
assert.strictEqual(allEnabled[0].moduleId, "STUDENTS"); // order 10
assert.strictEqual(allEnabled[1].moduleId, "ATTENDANCE"); // order 40
assert.strictEqual(allEnabled[2].moduleId, "FINANCE"); // order 50
console.log("✔ Order sorting verified.");

// 3. Test Disabled Module (e.g. Org without FINANCE)
console.log("\nTEST 3: Organization without FINANCE");
navigationService.sync(["STUDENTS", "ATTENDANCE"]);

const financeDisabled = navigationService.getNavItemsForModule("FINANCE");
assert.deepStrictEqual(financeDisabled, [], "Disabled FINANCE must return empty array");

const studentsStillEnabled = navigationService.getNavItemsForModule("STUDENTS");
assert.strictEqual(studentsStillEnabled.length, 1);
console.log("✔ Disabled module returns empty array (no DOM render).");

// 4. Test Dependency Failure (ATTENDANCE without STUDENTS)
console.log("\nTEST 4: Dependency failure (ATTENDANCE without STUDENTS)");
navigationService.sync(["ATTENDANCE", "FINANCE"]);

const attendanceDepFailed = navigationService.getNavItemsForModule("ATTENDANCE");
assert.deepStrictEqual(attendanceDepFailed, [], "ATTENDANCE must return empty array when STUDENTS dependency is missing");

const financeValid = navigationService.getNavItemsForModule("FINANCE");
assert.strictEqual(financeValid.length, 1);
console.log("✔ Dependency failure verified.");

console.log("\n🎉 ALL NAVIGATION SERVICE TESTS PASSED SUCCESSFULLY!");
