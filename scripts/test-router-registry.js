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

const routerCore = loadTsModule(path.resolve(__dirname, "../frontend/src/core/router/index.ts"));
const { loadModuleRoutes, routerRegistry } = routerCore;

console.log("🚀 Starting Dynamic Router Registry Unit Tests...\n");

// 1. Load module routes
console.log("TEST 1: Dynamic Route Loading from Pilot Modules");
const routes = loadModuleRoutes();
assert.strictEqual(routes.length, 7, "Must load exactly 7 pilot routes (3 students, 1 attendance, 3 finance)");

const paths = routes.map((r) => r.path);
assert.ok(paths.includes("/students"), "Should include /students");
assert.ok(paths.includes("/students/create"), "Should include /students/create");
assert.ok(paths.includes("/students/:id"), "Should include /students/:id");
assert.ok(paths.includes("/attendance"), "Should include /attendance");
assert.ok(paths.includes("/finance"), "Should include /finance");
assert.ok(paths.includes("/payment-stats"), "Should include /payment-stats");
assert.ok(paths.includes("/payment-stats/month/:monthKey"), "Should include /payment-stats/month/:monthKey");
console.log("✔ All 7 pilot module routes loaded with correct paths.");

// 2. Test route permissions and module IDs
console.log("\nTEST 2: Route Metadata Verification");
for (const r of routes) {
  assert.ok(r.meta && r.meta.moduleId, `Route ${r.path} must define meta.moduleId`);
}
assert.strictEqual(routerRegistry.getModuleIdForRoute({ path: "/attendance" }), "ATTENDANCE");
assert.strictEqual(routerRegistry.getModuleIdForRoute({ path: "/finance" }), "FINANCE");
assert.strictEqual(routerRegistry.getModuleIdForRoute({ path: "/students" }), "STUDENTS");
console.log("✔ Route metadata correctly mapped.");

// 3. Test Allowed Route Guard for Enabled Modules
console.log("\nTEST 3: Route Guard with All Enabled Modules");
const enabledModules = ["LEADS", "STUDENTS", "GROUPS", "COURSES", "ATTENDANCE", "FINANCE", "SMS", "PAYMENTS"];
assert.strictEqual(routerRegistry.isRouteAllowed({ path: "/finance" }, enabledModules), true);
assert.strictEqual(routerRegistry.isRouteAllowed({ path: "/attendance" }, enabledModules), true);
assert.strictEqual(routerRegistry.isRouteAllowed({ path: "/students" }, enabledModules), true);
assert.strictEqual(routerRegistry.isRouteAllowed({ path: "/" }, enabledModules), true, "Non-module route should always be allowed");
console.log("✔ Enabled modules permitted.");

// 4. Test Blocked Route Guard for Disabled Module (FINANCE disabled)
console.log("\nTEST 4: Route Guard Blocking for Disabled Module");
const withoutFinance = ["STUDENTS", "ATTENDANCE"];
assert.strictEqual(routerRegistry.isRouteAllowed({ path: "/finance" }, withoutFinance), false, "Disabled FINANCE route must be blocked");
assert.strictEqual(routerRegistry.isRouteAllowed({ path: "/payment-stats" }, withoutFinance), false, "Disabled FINANCE route must be blocked");
assert.strictEqual(routerRegistry.isRouteAllowed({ path: "/students" }, withoutFinance), true, "Active STUDENTS route must be allowed");
assert.strictEqual(routerRegistry.isRouteAllowed({ path: "/attendance" }, withoutFinance), true, "Active ATTENDANCE route must be allowed");
console.log("✔ Disabled module routes blocked.");

// 5. Test Dependency Failure Blocking
console.log("\nTEST 5: Route Guard Blocking on Dependency Failure");
const missingStudentDep = ["ATTENDANCE", "FINANCE"];
assert.strictEqual(routerRegistry.isRouteAllowed({ path: "/attendance" }, missingStudentDep), false, "ATTENDANCE must be blocked when STUDENTS dependency is missing");
assert.strictEqual(routerRegistry.isRouteAllowed({ path: "/finance" }, missingStudentDep), true, "FINANCE should remain allowed");
console.log("✔ Dependency failure route blocking verified.");

console.log("\n🎉 ALL DYNAMIC ROUTER REGISTRY TESTS PASSED SUCCESSFULLY!");
