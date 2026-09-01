# 🔒 AI Agent Rules & Project Guidelines

## 🎨 UI/UX DESIGN SYSTEM RULE: WINDZO UI IS LOCKED

> **CRITICAL RULE FOR ALL AI AGENTS:**
> **WINDZO UI IS LOCKED.**
> 
> Do not redesign, replace, modernize, restyle, or restructure the existing Windzo UI unless explicitly requested by the user.
> 
> The existing Windzo template is the official design system of this ERP.

---

### 📌 UI Implementation Constraints
When implementing new functionality, screens, or components:
- **Reuse existing Windzo components:** FormInput, FormSelect, FormDatePicker, FormCurrencyInput, FilterSelect, vmodal, Badge, Alert, EmptyState, Breadcrumb, etc.
- **Reuse existing layouts:** Sidebar, Top Navbar, Content wrapper, Page header with actions.
- **Reuse existing spacing:** Padding, margin, gaps (`p-3.5`, `rounded-2xl`, `gap-3`).
- **Reuse existing typography:** Font sizes, weights, and color contrast tokens (`text-xs`, `text-sm`, `font-bold`, `text-gray-800 dark:text-gray-100`).
- **Reuse existing colors:** Primary brand colors, Emerald for financial/active states, Rose/Red for danger/lost states, Slate/Gray backgrounds.
- **Reuse existing tables:** Standard tables with sticky/clean headers, rounded borders, action buttons.
- **Reuse existing forms & inputs:** Styled inputs with Iconify icons and dark mode compatibility.
- **Reuse existing modals / drawers:** Standard `vmodal` and slide-over panels.
- **Reuse existing cards:** Kanban cards, summary metric cards, statistics widgets.
- **Reuse existing navigation patterns:** Breadcrumbs, tab bars, view toggles (Kanban / Table).

---

### 🏛 Consistency Principle
* **New modules must visually look like they have always been part of Windzo.**
* **Business architecture and backend logic may change significantly.**
* **UI/UX must remain visually and behaviorally consistent with the Windzo design system.**
