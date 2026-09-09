/**
 * EduHub ERP Core Route Loader
 * Loads and registers routes from modules into the RouterRegistry.
 */

import type { RouteRecordRaw } from "vue-router";

import { CORE_PILOT_MODULES, initModuleRegistry } from "@/core/modules/loader";
import type { ModuleDefinition } from "@/core/modules/types";

import { routerRegistry } from "./router.registry";

/**
 * Collects and registers routes from provided modules (defaults to CORE_PILOT_MODULES).
 * Ensures modules are initialized in the Module Registry.
 * Returns the flattened array of RouteRecordRaw ready for Vue Router.
 */
export function loadModuleRoutes(
  modules: ModuleDefinition[] = CORE_PILOT_MODULES
): RouteRecordRaw[] {
  initModuleRegistry();

  const routes: RouteRecordRaw[] = [];

  for (const mod of modules) {
    if (Array.isArray(mod.routes) && mod.routes.length > 0) {
      routerRegistry.registerRoutes(mod.id, mod.routes);
      routes.push(...mod.routes);
    }
  }

  return routes;
}
