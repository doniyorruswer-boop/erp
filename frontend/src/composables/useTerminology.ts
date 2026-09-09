/**
 * EduHub ERP — useTerminology Composable
 * Provides centralized, reactive terminology resolution across business types.
 *
 * Adheres to AGENTS.md:
 * - Vue 3 Composition API & TypeScript strict (no any)
 * - Under 40 lines per function, under 250 lines total
 * - Pure UI presentation text, zero technical identifier changes
 */

import { computed, type ComputedRef } from "vue";

import {
  BACKEND_FIELD_MAP,
  DEFAULT_BUSINESS_TERMINOLOGY,
  DEFAULT_FALLBACK_TERMINOLOGY,
  pluralizeUzbek,
  type TerminologyForm,
  type TerminologyKey,
} from "@/core/i18n/terminology.defaults";
import { useTenantStore } from "@/store/tenant";

export interface UseTerminologyReturn {
  term: (key: TerminologyKey, form?: TerminologyForm) => string;
  termLower: (key: TerminologyKey, form?: TerminologyForm) => string;
  currentTerminology: ComputedRef<Record<string, unknown>>;
  businessType: ComputedRef<string>;
}

/**
 * Searches backend terminology object for matching field labels.
 */
function findBackendTerm(
  rawTerms: Record<string, unknown> | null | undefined,
  fieldKeys: string[]
): string | null {
  if (!rawTerms || typeof rawTerms !== "object") {
    return null;
  }
  for (const field of fieldKeys) {
    const val = rawTerms[field];
    if (typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
  }
  return null;
}

/**
 * Resolves a term using backend config, business preset, or fallback dictionary.
 */
function resolveTerm(
  key: TerminologyKey,
  form: TerminologyForm,
  rawTerms: Record<string, unknown> | null | undefined,
  businessType: string
): string {
  const fieldKeys = BACKEND_FIELD_MAP[key] || [key];
  const backendVal = findBackendTerm(rawTerms, fieldKeys);

  if (backendVal) {
    return form === "plural" ? pluralizeUzbek(backendVal) : backendVal;
  }

  const businessPreset = DEFAULT_BUSINESS_TERMINOLOGY[businessType];
  if (businessPreset && businessPreset[key]) {
    return businessPreset[key][form];
  }

  const fallback = DEFAULT_FALLBACK_TERMINOLOGY[key];
  return fallback ? fallback[form] : key;
}

/**
 * Main useTerminology composable
 */
export function useTerminology(): UseTerminologyReturn {
  const tenantStore = useTenantStore();

  const businessType = computed<string>(() => tenantStore.businessType || "COURSE_CENTER");
  const currentTerminology = computed<Record<string, unknown>>(() => tenantStore.terminology || {});

  const term = (key: TerminologyKey, form: TerminologyForm = "singular"): string => {
    return resolveTerm(key, form, currentTerminology.value, businessType.value);
  };

  const termLower = (key: TerminologyKey, form: TerminologyForm = "singular"): string => {
    return term(key, form).toLowerCase();
  };

  return {
    term,
    termLower,
    currentTerminology,
    businessType,
  };
}
