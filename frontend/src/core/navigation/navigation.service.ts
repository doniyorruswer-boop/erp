/**
 * EduHub ERP Core Navigation Service
 * Dynamically computes navigation menus from enabled modules in the Module Registry.
 */

import { initModuleRegistry } from "@/core/modules/loader";
import { moduleRegistry } from "@/core/modules/registry";
import type { ModuleNavigationItem } from "@/core/modules/types";

import type {
  NavigationFilterOptions,
  NavigationItem,
  NavigationServiceContract,
} from "./navigation.types";

export class NavigationService implements NavigationServiceContract {
  /**
   * Initializes module registry if needed and synchronizes enabled modules.
   */
  public sync(enabledModules?: string[]): void {
    initModuleRegistry(enabledModules);
  }

  /**
   * Checks if a module is currently enabled.
   */
  public isModuleEnabled(moduleId: string, enabledModules?: string[]): boolean {
    if (Array.isArray(enabledModules)) {
      this.sync(enabledModules);
    }
    return moduleRegistry.isEnabled(moduleId);
  }

  /**
   * Retrieves navigation items for a specific module ID.
   * Returns empty array if module is disabled or has no navigation items.
   */
  public getNavItemsForModule(
    moduleId: string,
    enabledModules?: string[],
    options?: NavigationFilterOptions
  ): NavigationItem[] {
    if (!this.isModuleEnabled(moduleId, enabledModules)) {
      return [];
    }

    const mod = moduleRegistry.getModule(moduleId);
    if (!mod || !Array.isArray(mod.navigation)) {
      return [];
    }

    return mod.navigation
      .filter((nav) => this.filterByPermission(nav, options))
      .map((nav) => this.mapToNavigationItem(nav, mod.id))
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Retrieves all enabled navigation items across all enabled modules.
   */
  public getEnabledNavItems(options?: NavigationFilterOptions): NavigationItem[] {
    if (options?.enabledModules) {
      this.sync(options.enabledModules);
    }

    const enabledModules = moduleRegistry.getEnabledModules();
    const items: NavigationItem[] = [];

    for (const mod of enabledModules) {
      if (Array.isArray(mod.navigation)) {
        for (const nav of mod.navigation) {
          if (this.filterByPermission(nav, options)) {
            items.push(this.mapToNavigationItem(nav, mod.id));
          }
        }
      }
    }

    return items.sort((a, b) => a.order - b.order);
  }

  private mapToNavigationItem(nav: ModuleNavigationItem, moduleId: string): NavigationItem {
    return {
      id: nav.id,
      moduleId,
      label: nav.label,
      path: nav.path,
      icon: nav.icon || "solar:widget-bold",
      permission: nav.permission,
      order: typeof nav.order === "number" ? nav.order : 100,
      children: Array.isArray(nav.children)
        ? nav.children.map((child) => this.mapToNavigationItem(child, moduleId))
        : undefined,
    };
  }

  private filterByPermission(
    nav: ModuleNavigationItem,
    options?: NavigationFilterOptions
  ): boolean {
    if (!nav.permission || !options?.userPermissions) {
      return true;
    }
    return options.userPermissions.includes(nav.permission);
  }
}

export const navigationService = new NavigationService();
export default navigationService;
