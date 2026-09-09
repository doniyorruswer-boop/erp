/**
 * EduHub ERP Core Navigation — Type Definitions
 * Strict TypeScript specifications for dynamic navigation.
 */

export interface NavigationItem {
  id: string;
  moduleId: string;
  label: string;
  path: string;
  icon: string;
  permission?: string;
  order: number;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface NavigationFilterOptions {
  enabledModules?: string[];
  userPermissions?: string[];
  userRole?: string;
}

export interface NavigationServiceContract {
  getEnabledNavItems(options?: NavigationFilterOptions): NavigationItem[];
  getNavItemsForModule(
    moduleId: string,
    enabledModules?: string[],
    options?: NavigationFilterOptions
  ): NavigationItem[];
  isModuleEnabled(moduleId: string, enabledModules?: string[]): boolean;
  sync(enabledModules?: string[]): void;
}
