/**
 * EduHub ERP — Core Module Registry Service
 * Central registry managing application modules and active tenant state.
 *
 * Implements strict canonical ID contract defined in:
 * docs/MODULE_PERMISSION_CONTRACT.md
 */

import type { ModuleDefinition, ModuleRegistryContract } from "./types";

/**
 * Normalizes any module ID to the canonical uppercase standard.
 */
export function normalizeModuleId(id: string): string {
  return String(id || "")
    .trim()
    .toUpperCase();
}

export class ModuleRegistryService implements ModuleRegistryContract {
  private readonly modules = new Map<string, ModuleDefinition>();
  private readonly enabledIds = new Set<string>();

  /**
   * Registers a single module into the registry.
   */
  public register(module: ModuleDefinition): void {
    const canonicalId = normalizeModuleId(module.id);
    if (!canonicalId) {
      throw new Error("Module definition must have a valid non-empty id");
    }

    const normalizedModule: ModuleDefinition = {
      ...module,
      id: canonicalId,
      dependencies: (module.dependencies || []).map(normalizeModuleId),
      isEnabled: this.enabledIds.has(canonicalId),
    };

    this.modules.set(canonicalId, normalizedModule);
  }

  /**
   * Registers multiple modules at once.
   */
  public registerMany(modules: ModuleDefinition[]): void {
    for (const mod of modules) {
      this.register(mod);
    }
  }

  /**
   * Retrieves a module definition by its ID.
   */
  public getModule(id: string): ModuleDefinition | undefined {
    return this.modules.get(normalizeModuleId(id));
  }

  /**
   * Returns all registered modules.
   */
  public getAllModules(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /**
   * Returns only modules currently enabled for the active tenant.
   */
  public getEnabledModules(): ModuleDefinition[] {
    return this.getAllModules().filter((mod) => this.isEnabled(mod.id));
  }

  /**
   * Checks if a module is enabled for the active tenant.
   * Also verifies whether all declared dependencies are met.
   */
  public isEnabled(id: string): boolean {
    const canonicalId = normalizeModuleId(id);
    if (!this.enabledIds.has(canonicalId)) {
      return false;
    }

    const mod = this.modules.get(canonicalId);
    if (!mod) {
      // If module is enabled in backend list but not yet loaded in frontend, return true
      return true;
    }

    // Verify dependencies if any
    if (mod.dependencies && mod.dependencies.length > 0) {
      const allDepsEnabled = mod.dependencies.every((depId) => this.enabledIds.has(depId));
      if (!allDepsEnabled) {
        return false;
      }
    }

    return true;
  }

  /**
   * Synchronizes the registry with the backend's enabledModules list.
   */
  public syncEnabledModules(enabledList: string[]): void {
    this.enabledIds.clear();

    for (const rawId of enabledList || []) {
      const canonicalId = normalizeModuleId(rawId);
      if (canonicalId) {
        this.enabledIds.add(canonicalId);
      }
    }

    // Update internal isEnabled status for registered modules
    for (const [id, mod] of this.modules.entries()) {
      mod.isEnabled = this.isEnabled(id);
    }
  }

  /**
   * Resets the registry (primarily for testing).
   */
  public reset(): void {
    this.modules.clear();
    this.enabledIds.clear();
  }
}

// Global Singleton Instance
export const moduleRegistry: ModuleRegistryService = new ModuleRegistryService();
export default moduleRegistry;
