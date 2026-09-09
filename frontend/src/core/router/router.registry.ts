/**
 * EduHub ERP Core Dynamic Router Registry
 * Manages modular routes and performs module-level route access guards.
 */

import type { RouteLocationNormalized, RouteRecordRaw } from "vue-router";

import { moduleRegistry } from "@/core/modules/registry";

export class RouterRegistryService {
  private readonly registeredRoutes: RouteRecordRaw[] = [];
  private readonly routeModuleMap = new Map<string, string>();

  /**
   * Registers route definitions associated with a canonical module ID.
   */
  public registerRoutes(moduleId: string, routes: RouteRecordRaw[]): void {
    for (const route of routes) {
      this.registeredRoutes.push(route);
      if (route.path) {
        this.routeModuleMap.set(route.path, moduleId);
      }
      if (route.name && typeof route.name === "string") {
        this.routeModuleMap.set(route.name, moduleId);
      }
    }
  }

  /**
   * Retrieves all registered module routes.
   */
  public getModuleRoutes(): RouteRecordRaw[] {
    return [...this.registeredRoutes];
  }

  /**
   * Checks whether the user is permitted to visit the target route
   * based on the module enabled status for the active tenant.
   *
   * If route has meta.moduleId and that module is disabled: returns false.
   * Otherwise returns true.
   */
  public isRouteAllowed(to: RouteLocationNormalized, enabledModules?: string[]): boolean {
    const moduleId = (to.meta?.moduleId as string) || this.getModuleIdForRoute(to);
    if (!moduleId) {
      // Route is not tied to any module (e.g. Dashboard, Login, 404), allow access
      return true;
    }

    if (Array.isArray(enabledModules)) {
      moduleRegistry.syncEnabledModules(enabledModules);
    }

    return moduleRegistry.isEnabled(moduleId);
  }

  /**
   * Resolves the module ID associated with a given route location.
   */
  public getModuleIdForRoute(to: RouteLocationNormalized): string | undefined {
    if (to.meta?.moduleId && typeof to.meta.moduleId === "string") {
      return to.meta.moduleId;
    }
    if (to.name && typeof to.name === "string" && this.routeModuleMap.has(to.name)) {
      return this.routeModuleMap.get(to.name);
    }
    return this.routeModuleMap.get(to.path);
  }

  /**
   * Clears registry state (mainly for testing).
   */
  public reset(): void {
    this.registeredRoutes.length = 0;
    this.routeModuleMap.clear();
  }
}

export const routerRegistry = new RouterRegistryService();
export default routerRegistry;
