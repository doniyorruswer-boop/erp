/**
 * EduHub ERP Core Module System — Type Definitions
 * Strict TypeScript specifications for modular architecture.
 *
 * All module IDs must follow the canonical format defined in:
 * docs/MODULE_PERMISSION_CONTRACT.md (UPPERCASE string, e.g. 'ATTENDANCE', 'FINANCE', 'STUDENTS')
 */

import type { RouteRecordRaw } from "vue-router";

export type ModuleCategory =
  | "CORE"
  | "ACADEMIC"
  | "FINANCE"
  | "CRM"
  | "COMMUNICATION"
  | "OPERATIONS"
  | "AUTOMATION"
  | "LEGAL"
  | "OTHER";

export interface ModuleNavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  permission?: string;
  order?: number;
  children?: ModuleNavigationItem[];
}

export interface ModuleRouteDefinition {
  path: string;
  name?: string;
  component: () => Promise<unknown>;
  meta?: {
    title?: string;
    permission?: string;
    moduleId?: string;
    hideNav?: boolean;
    requiresAuth?: boolean;
    [key: string]: unknown;
  };
}

export interface ModuleDefinition {
  /** Canonical UPPERCASE ID (e.g. 'ATTENDANCE', 'FINANCE', 'STUDENTS') */
  id: string;
  /** Human-readable display name */
  name: string;
  /** Optional detailed description */
  description?: string;
  /** Domain category */
  category?: ModuleCategory;
  /** Primary icon identifier */
  icon?: string;
  /** Semantic version of the module */
  version?: string;
  /** Other module IDs that must be enabled for this module to work */
  dependencies?: string[];
  /** Optional target business types (e.g. ['COURSE_CENTER', 'SCHOOL']) */
  applicableBusinessTypes?: string[];
  /** Route definitions registered by this module */
  routes?: RouteRecordRaw[];
  /** Navigation / sidebar items contributed by this module */
  navigation?: ModuleNavigationItem[];
  /** Permission codes declared by this module */
  permissions?: string[];
  /** Runtime state: whether this module is currently enabled for the tenant */
  isEnabled?: boolean;
}

export interface ModuleRegistryContract {
  register(module: ModuleDefinition): void;
  registerMany(modules: ModuleDefinition[]): void;
  getModule(id: string): ModuleDefinition | undefined;
  getAllModules(): ModuleDefinition[];
  getEnabledModules(): ModuleDefinition[];
  isEnabled(id: string): boolean;
  syncEnabledModules(enabledList: string[]): void;
  reset(): void;
}
