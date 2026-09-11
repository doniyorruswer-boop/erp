# EduHub ERP — Kelajakdagi Imkoniyatlar va Modullar Reestri (FUTURE_FEATURES.md)

**Hujjat Maqsadi:** Knip auditida hozircha to'liq faol bo'lmagan, biroq EduHub ERP tizimining kelgusi biznes bosqichlari uchun maxsus saqlab qolingan arxitektura komponentlari, modullari va xizmatlarini hujjatlashtirish.

---

## 🏛️ 1. Moslashuvchan Maydonlar Moduli (Custom Fields Engine)

- **Tegishli Fayllar:**
  - `src/components/custom-fields/DynamicField.vue`
  - `src/components/custom-fields/DynamicFieldsSection.vue`
  - `src/components/custom-fields/FieldDefinitionManager.vue`
  - Backend API: `customFieldsApi` (`src/api/services.js`)
- **Tegishli ERP Moduli:** `Settings`, `Student Management`, `HR / Employee Management`, `CRM Leads`.
- **Nega mavjud (Why it exists):**
  - Har bir ta'lim muassasasining o'ziga xos talablari mavjud (masalan, ayrim maktablar o'quvchining qon guruhi, forma o'lchami yoki tibbiy ma'lumotnomasini saqlashi kerak, o'quv markazlari esa faqat qiziqqan yo'nalishini so'raydi).
  - Backendda `CustomFieldDefinition` va `CustomFieldValue` PostgreSQL jadvallari allaqachon yaratilgan.
- **Qachon va qanday ishlatiladi (When and how it should be used):**
  - **1-Bosqich (Sozlamalar):** Administrator `/settings/custom-fields` sahifasida `FieldDefinitionManager.vue` orqali yangi maydonlarni (Text, Number, Date, Select, Boolean) yaratadi.
  - **2-Bosqich (Formalar va Profillar):** O'quvchi qo'shish yoki xodim anketasida `DynamicFieldsSection.vue` va `DynamicField.vue` orqali ushbu maxsus maydonlar avtomatik reaktiv shaklda paydo bo'ladi.

---

## 📋 2. Universal Kanban Taxtasi (Generic Kanban Engine)

- **Tegishli Fayllar:**
  - `src/components/common/KanbanBoard.vue`
- **Tegishli ERP Moduli:** `CRM (Leads & Deals)`, `Workflow & Tasks`, `Admission Pipeline`.
- **Nega mavjud (Why it exists):**
  - Tizimda hozirda `LeadsKanban.vue` mavjud, ammo u bitta sahifa ichida qattiq yozilgan (hardcoded) kanban ustunlaridan foydalanmoqda.
  - `KanbanBoard.vue` esa slotlar, drag-and-drop, moslashuvchan filtrlar, qidiruv va kartalar sonini hisoblovchi to'liq qayta ishlatiluvchi komponent hisoblanadi.
- **Qachon va qanday ishlatiladi:**
  - CRM voronkalarida (Lidlar harakati: "Yangi" ➔ "Qo'ng'iroq qilindi" ➔ "Sinov darsi" ➔ "To'lov qilindi").
  - Vazifalar va topshiriqlar modulida (`Workflow Tasks`).
  - `LeadsKanban.vue` ni refaktoring qilish jarayonida ushbu komponent o'rnatiladi.

---

## 📊 3. Ta'lim Turi Bo'yicha Ixtisoslashgan Dashboardlar (Vertical Dashboards)

- **Tegishli Fayllar:**
  - `src/views/dashboard/SchoolDashboard.vue` (Xususiy maktablar uchun)
  - `src/views/dashboard/CourseCenterDashboard.vue` (O'quv markazlari uchun)
  - `src/views/dashboard/KindergartenDashboard.vue` (Xususiy bog'chalar uchun)
  - Qo'shimcha tahliliy widgetlar:
    - `src/components/dashboard/ClassCapacityAndQuickActions.vue` (50% sig'im, 50% tezkor tugmalar)
    - `src/components/dashboard/FinancialActivitySection.vue` (Moliyaviy chuqur tahlil)
    - `src/components/dashboard/MonthlyContractsStatistics.vue` (Shartnomalar monitoringi)
    - `src/components/dashboard/AcademicYearFilter.vue`
    - `src/components/dashboard/StatCard.vue`
- **Tegishli ERP Moduli:** `Executive Dashboard`, `Multi-Tenant Branch Management`.
- **Nega mavjud:**
  - EduHub bitta universal platforma orqali maktab, o'quv markazi va bog'chalarga xizmat ko'rsatadi.
  - Hozirgi `UniversalUnifiedDashboard.vue` barcha umumiy metrikalarni birlashtirgan. Biroq, har bir sohaning o'ziga xos talablari bor: maktabda o'quv choraklari va sinflar, o'quv markazida guruhlar va kurslar, bog'chada esa yosh guruhlari va ovqatlanish rejasi muhim.
- **Qachon va qanday ishlatiladi:**
  - Foydalanuvchi tizimga kirganida, tashkilotning `businessType` turiga qarab (`SCHOOL`, `COURSE_CENTER`, `KINDERGARTEN`) tegishli ixtisoslashgan tahliliy panel ko'rinadi yoki dashboard sozlamalarida alohida tab sifatida ochiladi.

---

## 🔍 4. Reaktiv Jadval Filtrlash Composable'i (`useTableFilter`)

- **Tegishli Fayllar:**
  - `src/composables/useTableFilter.js`
- **Tegishli ERP Moduli:** `All Data Tables (Students, Teachers, Payments, Invoices, Contracts)`.
- **Nega mavjud:**
  - `AGENTS.md` qoidalariga muvofiq, UI komponentlar ichida ma'lumotlarni saralash, qidirish va filtrlash bo'yicha biznes mantiq bo'lmasligi shart.
- **Qachon va qanday ishlatiladi:**
  - Har qanday yangi jadval komponentida:
    ```javascript
    import { useTableFilter } from "@/composables/useTableFilter";
    const { filteredItems, searchQuery, filters, sortKey, sortOrder } = useTableFilter(
      rawStudents,
      {
        searchFields: ["fullName", "phone", "studentId"],
        initialSortKey: "createdAt",
        initialSortOrder: "desc",
      }
    );
    ```

---

## 🌐 5. Backend Bilan Tayyor Integratsiya Qilingan API Xizmatlari

- **Tegishli Fayllar:**
  - `src/api/services.js` (Eksportlar: `contractsApi`, `financeApi`, `workflowsApi`, `parentsApi`, `customFieldsApi`, `scheduleApi`, `importExportApi`, `lessonsApi`, `tasksApi`, `activitiesApi`, `crmNotesApi`)
- **Tegishli ERP Moduli:** `All Core Modules`.
- **Nega mavjud:**
  - Ushbu API funksiyalari NestJS backendidagi real endpointlarga (`/contracts`, `/finance/invoices`, `/workflow`, `/parents`, `/schedule`, va h.k.) 100% moslab yozilgan.
- **Qachon va qanday ishlatiladi:**
  - Hozirda ba'zi frontend sahifalarida lokal kesh yoki mock ma'lumotlar turibdi. Bosqichma-bosqich har bir sahifa real backendga ulanganda ushbu tayyor xizmatlar chaqiriladi.
  - Ular kelgusida `src/services/*.ts` formatiga o'tkaziladi.

---

## 🛡️ 6. Korporativ Validatsiya Qatlami (`src/validation/`)

- **Tegishli Fayllar:**
  - `src/validation/student.schema.ts`
  - `src/validation/finance.schema.ts`
  - `src/validation/employee.schema.ts`
  - `src/validation/index.ts`
- **Tegishli ERP Moduli:** `Forms, Modals, Wizards`.
- **Nega mavjud:**
  - `vee-validate` va `yup` kutubxonalari bazasida qurilgan, TypeScript bilan qat'iy tiplashtirilgan forma sxemalari.
- **Qachon va qanday ishlatiladi:**
  - Yangi o'quvchi qo'shish modalida, to'lov qabul qilish oynasida va xodim anketasida to'liq ishlatiladi.
