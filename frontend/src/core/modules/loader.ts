/**
 * EduHub ERP — Core Module Loader
 * Bootstraps module registration and synchronizes active tenant modules.
 */

// Pilot modules
import { attendanceModule } from "@/modules/attendance/module";
import { financeModule } from "@/modules/finance/module";
import { studentsModule } from "@/modules/students/module";

import { moduleRegistry } from "./registry";
import type { ModuleDefinition } from "./types";

/**
 * Built-in Pilot modules available in the system
 */
export const CORE_PILOT_MODULES: ModuleDefinition[] = [
  studentsModule,
  attendanceModule,
  financeModule,
];

/**
 * Bootstraps the module registry by registering all pilot modules
 * and syncing with the provided enabled modules list.
 */
export function initModuleRegistry(enabledModules: string[] = []): void {
  // 1. Register pilot modules if not already registered
  for (const mod of CORE_PILOT_MODULES) {
    if (!moduleRegistry.getModule(mod.id)) {
      moduleRegistry.register(mod);
    }
  }

  // 2. Synchronize active state from backend config
  if (Array.isArray(enabledModules) && enabledModules.length > 0) {
    moduleRegistry.syncEnabledModules(enabledModules);
  }
}
