# EduHub ERP — AI & Developer Governance Rules (AGENTS.md)

> **Permanent Project Governance Contract**
> This file defines strict, non-negotiable architectural and engineering rules for all AI agents (Antigravity, Claude, Copilot, etc.) and human developers contributing to the EduHub ERP codebase.
> Every modification, refactoring, and feature creation must comply with these guidelines.

---

## 🏛️ 1. Architecture Rules

- **Vue 3 Composition API:**
  - All new components and views must strictly use the Vue 3 Composition API. Legacy Options API is forbidden in new code and must be phased out during refactoring.
- **TypeScript Everywhere:**
  - Strict typing must be enforced across all layers (components, composables, stores, services, models, and utility functions).
  - Never use `any` as a TypeScript type. Use explicit interfaces, types, generics, or `unknown` with narrowing.
- **Reusable UI Components:**
  - Reusable design system components live exclusively in `frontend/src/components/common/`.
  - Never re-invent buttons, tables, badges, modals, form inputs, datepickers, or cells in views.
- **Separation of Concerns:**
  - **Zero business logic inside UI components:** Components are strictly responsible for presentation and user interaction.
  - **Composables for reusable logic:** Move business logic, data formatting, filtering, pagination, and side-effects into `frontend/src/composables/` (e.g. `useStudentFilter.ts`, `usePaymentStats.ts`).
  - **Services for API communication:** All network interaction must pass through `frontend/src/api/` or `frontend/src/services/`.
  - **Stores only for true global state:** Pinia stores (`frontend/src/store/`) are reserved for application-wide shared state (e.g., authentication, tenant/organization info, active permissions, layout state). Do not use Pinia for ephemeral, single-page local form states.

---

## 📝 2. Code Rules & Limits

- **No Hardcoded Values:**
  - **Never hardcode API URLs:** Always use `process.env.VUE_APP_API_URL` or the centralized client in `@/api/client.js`.
  - **Never hardcode hex colors or inline colors:** Always use Tailwind classes or design tokens (`bg-primary`, `text-primary`, `border-emerald-500`, etc.) adhering to `docs/DESIGN_SYSTEM_RULES.md`.
  - **Never hardcode repeated strings:** Use constants, enums, or configuration files (e.g., `@/config/app.config.js`, `@/config/brand.config.js`).
- **Clean Codebase Hygiene:**
  - **Never duplicate components:** Search existing folders before creating any UI element.
  - **Never create unnecessary files:** Do not create proxy/shim files, empty wrappers, or placeholder scripts.
- **Strict Size Boundaries:**
  - **Maximum component size:** **250 lines**. Any component exceeding 250 lines must be decomposed into modular sub-components.
  - **Maximum function size:** **40 lines**. Functions exceeding 40 lines must be decomposed into single-responsibility helper functions.

---

## ⚡ 3. Vue Single File Component (SFC) Rules

Every `.vue` file must adhere to modern `<script setup>` conventions:

```vue
<script setup lang="ts">
// 1. Imports (Vue, libraries, components, composables, services, types)
import { ref, computed } from "vue";
import type { Student } from "@/types/student";

// 2. Props & Emits definitions
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    items?: Student[];
  }>(),
  {
    title: "Ro'yxat",
    items: () => [],
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", payload: Student): void;
}>();

// 3. Composables & State
// ...

// 4. Methods & Handlers
// ...
</script>

<template>
  <!-- Clean, semantic HTML using Design System classes -->
</template>
```

- **Mandatory Conventions:**
  - Always use `<script setup lang="ts">`.
  - Always declare typed props with `defineProps<Props>()` and default values with `withDefaults()`.
  - Always declare typed emits with `defineEmits<Emits>()`.
  - Maintain Single Responsibility Principle (SRP) — one component handles one visual or logical unit.

---

## 🎨 4. Styling & Design System Rules

- **Design Tokens & Tailwind CSS:**
  - Strictly use Tailwind utility classes defined in the design system.
  - Always use the project font (`font-lexend`).
  - Consistent shadows (`shadow-2xs`, `shadow-sm`, `shadow-md`, `shadow-xl`).
  - Interactive transitions (`transition duration-150 active:scale-98`).
- **Prohibitions:**
  - **No inline styles:** Never use `style="..."` in templates (except for dynamic coordinate calculation like drag-and-drop or charts).
  - **No arbitrary / random CSS values:** Avoid arbitrary Tailwind syntax like `w-[347px]` or `bg-[#123456]` unless strictly bound to a calculated pixel offset. Use design tokens.

---

## 🌐 5. API & Network Communication Rules

- **Centralized API Services:**
  - All HTTP calls must strictly go through `src/api/services.js` (or `src/services/`).
  - **No direct `axios` or `fetch` calls inside components or views.**
- **Error Handling & Feedback:**
  - Handle API failures gracefully with user-friendly toast notifications via `$toast` or `@/utils/toast`.
  - Never display raw backend stack traces to the user.
  - All network requests must support authentication tokens and multi-tenant headers managed by `@/api/client.js`.

---

## ✅ 6. Quality & Verification Rules

Before proposing or applying any code changes:

1. **Check Existing Code:**
   - Run targeted searches (`grep_search` / `find_by_name`) to see if an existing component, composable, or utility already provides the required feature.
2. **Reuse Existing Solutions:**
   - Always prefer extending existing Design System components (`<AppTable>`, `<AppButton>`, `<AppConfirmModal>`, `<AppFilterDropdown>`, `<AppDateRangePicker>`, `<AppDropzone>`).
3. **Automated Verification:**
   - Always verify that Playwright E2E tests pass (`npx playwright test`).
   - Verify that production build succeeds without errors (`npm run build`).
   - Verify that Storybook renders component stories cleanly.
4. **Documentation Integrity:**
   - Preserve relevant documentation and comments.
   - Update corresponding stories in `frontend/src/stories/` whenever a common component prop or behavior is changed.

---

_Every future modification by AI agents or developers must respect these rules without exception._
