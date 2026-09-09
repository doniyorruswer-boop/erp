# EduHub ERP — Core Arxitektura Auditi va Tahliliy Hisobot (ARCHITECTURE_AUDIT.md)

> **Hujjat Maqsadi:** Mavjud frontend arxitekturasini chuqur tahlil qilib, ta'lim (Education) domeniga qattiq bog'langan nuqtalarni, statik marshrutlash va menyu tuzilmalarini, hamda kelgusi Universal Ko'p-Biznesli ERP Platformaga o'tish uchun to'sqinlik qiluvchi omillarni aniqlash.  
> **Sana:** 2026-09-09  
> **Status:** ✅ TASDIQLANGAN AUDIT (Production kod o'zgartirilmadi)  
> **Muvofiqlik:** AGENTS.md Governance, docs/MODULE_PERMISSION_CONTRACT.md

---

## 🏛️ 1. Hozirgi Arxitektura Umumiy Ko'rinishi (Architecture Overview)

Hozirgi paytda tizim **Education ERP (EduHub)** sifatida ishlaydi. Loyihaning backend qismida mustahkam ko'p ijarachilik (multi-tenancy), rollar va ruxsatlar (`Permission`, `RolePermission`) va modullar ro'yxati (`SystemConfig.enabledModules`) mavjud bo'lsa-da, frontend qatlamida quyidagi monolit va statik bog'lanishlar saqlanib qolgan:

```
Hozirgi Frontend Bog'liqlik Sxemasi:
┌────────────────────────────────────────────────────────────────────────┐
│                          App.vue / Layouts                             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
       ┌───────────────────────────┴───────────────────────────┐
       ▼                                                       ▼
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  Sidebar.vue (Monolit)      │         │  router/index.js (Statik)    │
│  - 479 qator                │         │  - 32 ta statik route        │
│  - isSchool / isKindergarten│         │  - meta.moduleId yo'q        │
│  - Hardcoded RouterLinklar  │         │  - Modul guard yo'q          │
└──────────────┬──────────────┘         └──────────────┬───────────────┘
               │                                       │
               └───────────────────┬───────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Views & Komponentlar:                                                  │
│ LeadsKanban (2200+ qator), SchoolClassesView, StudentWizardModal...     │
│ - 50+ joyda isSchool / isKindergarten ternary mantiqi                  │
│ - Ruxsatlar qattiq yozilgan yoki tekshirilmaydi                        │
│ - Narxlar va terminlar har bir fayl ichida tarqoq hardcode qilingan   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚨 2. ERP Kengaytirilishiga To'sqinlik Qiluvchi 8 Asosiy Muammo

Frontend kodbazasi bo'ylab o'tkazilgan tahlil natijasida aniqlangan 8 toifadagi real muammolar va ularning aniq fayl hamda qator raqamlari:

### 1. Hardcoded Biznes Shartlari (`isSchool`, `isKindergarten`, `businessType`)

Tizim biznes turini modullar orqali emas, balki komponentlar ichidagi `if/else` shartlari orqali ajratadi:

- [`frontend/src/views/leads/LeadsKanban.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/views/leads/LeadsKanban.vue):
  - **L589:** `<th>{{ isSchool ? "Sinf" : isKindergarten ? "Guruh" : "Kurs" }}</th>` — bitta jadval sarlavhasi 3 xil biznes uchun aralashtirilgan.
  - **L712, L714:** `:label="isKindergarten ? 'Bola ismi' : 'Ism'"` — forma maydoni shartli bog'langan.
  - **L735, L750, L773, L803, L813, L893:** Maktab va bog'cha uchun alohida HTML bloklari bitta fayl ichiga tiqilgan.
  - **L930-931:** `:label="isSchool ? 'Yillik/Oylik to\'lov' : 'Kutilayotgan summa'"`
  - **L1799, L1811, L2252:** `amount: this.isSchool ? 3200000 : this.isKindergarten ? 1800000 : 700000` — o'quv narxlari kod ichiga qattiq yozilgan (magic numbers).
- [`frontend/src/components/dashboard/ClassCapacityAndQuickActions.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/components/dashboard/ClassCapacityAndQuickActions.vue):
  - **L17, L20, L48, L71-74, L167, L214, L365, L458:** Guruh va sinf tushunchalari `isKindergarten ? ... : ...` orqali 10+ joyda tarmoqlangan.
- [`frontend/src/components/dashboard/FinancialActivitySection.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/components/dashboard/FinancialActivitySection.vue):
  - **L193, L213, L250, L564, L1131:** `isKindergarten ? "Qarzdor bolalar" : "Qarzdor o'quvchilar"`.
- [`frontend/src/components/school/CreateClassModal.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/components/school/CreateClassModal.vue):
  - **L22, L59, L109, L176, L271, L280, L285, L290, L310, L363:** Maktab va bog'cha shartlari aralashgan.
- [`frontend/src/components/students/StudentWizardModal.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/components/students/StudentWizardModal.vue):
  - **L125, L224, L450, L609, L809, L819, L824, L829, L837:** O'quvchi qabul qilish modali ichida ko'p sonli shartlar.

### 2. Statik Sidebar Ta'rifi ([`frontend/src/components/Sidebar.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/components/Sidebar.vue))

- **Fayl hajmi:** **479 qator** (AGENTS.md dagi 250 qatorlik chegarani deyarli 2 barobar buzgan).
- **Statik navigatsiya:** Barcha 18 ta menyu punkti (`/students`, `/leads`, `/finance`, `/attendance`, `/contracts`, `/employees` va h.k.) template ichida qo'lda yozilgan.
- **Modul boshqaruvi yo'q:** `tenantStore.hasModule(...)` faqat 2 joyda ishlatilgan (L261, L272), qolgan Finance, Leads, SMS, Attendance esa tashkilotda o'chirilgan bo'lsa ham menyuda turaveradi.
- **L42, L125, L135:** Sarlavhalar va matnlar `tenantStore.isSchool` / `isKindergarten` orqali qattiq yozilgan.

### 3. Statik Router Ta'rifi ([`frontend/src/router/index.js`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/router/index.js))

- **Barcha 32 ta marshrut** yagona fayl ichida qo'lda e'lon qilingan.
- Marshrutlarda `meta.moduleId` va `meta.permission` mavjud emas.
- **L306-325 (`router.beforeEach`):** Faqat `token` bor-yo'qligini tekshiradi. Agar tashkilotda `FINANCE` moduli o'chirilgan bo'lsa ham, foydalanuvchi `/finance` manzilini brauzerga yozib bemalol kira oladi.

### 4. Komponent Ichiga Yozilgan yoki Yo'qolgan Ruxsat Tekshiruvlari

- Backend'da mavjud bo'lgan 36 ta canonical ruxsat kodlari (`students.delete`, `payments.refund`, `attendance.create` va h.k.) frontend komponentlarida umuman chaqirilmaydi.
- O'chirish (Delete) va Qaytarish (Refund) tugmalari ruxsatsiz foydalanuvchiga ham ko'rinaveradi, xatolik faqat tugma bosilib backend 403 bergandagina chiqadi.
- Frontendda yagona `v-permission` direktivasi yoki `usePermission()` composable'i mavjud emas.

### 5. Core Mantiq Bilan Aralashib Ketgan Ta'lim Domeni

- [`frontend/src/store/tenant.js`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/store/tenant.js):
  - **L50-52:** `isSchool`, `isCourseCenter`, `isKindergarten` geterlari bevosita Core Tenant Store ichiga tiqilgan.
  - **L58-83:** `classLabel`, `classesLabel`, `teacherRoleLabel`, `promoteActionLabel`, `newClassButtonLabel` kabi ta'limga xos leksika Core store ichida yotibdi.
- [`frontend/src/views/Dashboard.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/views/Dashboard.vue):
  - Dashboard universal vidjetlar tizimi emas, balki `isSchool ? SchoolDashboard : isKindergarten ? KindergartenDashboard : CourseCenterDashboard` tarzida 3 ta monolit sahifani almashtirib ko'rsatadi.

### 6. Boshqa ERP Domenlarida Qayta Ishlatib Bo'lmaydigan Komponentlar

- `frontend/src/components/education/` papkasidagi 8 ta komponent (`ClassScheduleGrid`, `ClassScheduleHeader`, `ClassScheduleCell`, `ClassLessonDetailModal` va h.k.) faqat maktab choraklari va dars jadvallariga bog'langan.
- `frontend/src/components/school/` papkasidagi 7 ta komponent (`SchoolClassInfoCard`, `SchoolClassTimetableTab`, `CreateClassModal`) faqat sinflarga moslangan.
- Bularni umumiy "Resource / Scheduling / Group" ko'rinishida umumlashtirish talab etiladi.

### 7. Takrorlangan Biznes Qoidalari (Duplicate Logic)

- Sinflarni saqlash va yuklash logikasi `SchoolClassesView.vue`, `SchoolClassDetailView.vue` va `schoolClassesData.js` fayllarida 3 marta takrorlangan.
- Biznes turini aniqlash va mos narx qo'yish logikasi `LeadsKanban`, `PaymentMonthDetailView`, `StudentWizardModal` da takroran yozilgan.

### 8. Mavjud Modul Strukturasi Muammosi

- Modullar o'zini o'zi ta'minlovchi (self-contained) mustaqil paketlar emas.
- Masalan, `attendance` funksiyasi uchun: ko'rinish `views/attendance/`da, dars jadvali `views/education/`da, dars qo'shish `components/education/`da, servis esa `services/school.service.js`da tarqoq holda yotibdi.

---

## 🛠️ 3. Refactor Talab Qiladigan Asosiy Fayllar Ro'yxati

| Fayl Yo'li                                                                                                                                                                           | Hozirgi Hajmi | Sabab va Refactor Vazifasi                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-----------: | -------------------------------------------------------------------------------------------------------------------------------- |
| [`frontend/src/components/Sidebar.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/components/Sidebar.vue)                                                               |   479 qator   | 250 qatordan oshgan. Statik HTML linklar o'rniga `navigation.service` va `moduleRegistry` orqali dinamik menyu render qilish.    |
| [`frontend/src/router/index.js`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/router/index.js)                                                                             |   327 qator   | Statik marshrutlar. Modullar o'z yo'llarini o'zlari ro'yxatga oladigan `router.registry` ga o'tkazish va `ModuleGuard` qo'shish. |
| [`frontend/src/store/tenant.js`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/store/tenant.js)                                                                             |   266 qator   | Core store ichidagi ta'limga xos geterlarni (`isSchool`, `classLabel`) universal terminologiya lug'atiga ko'chirish.             |
| [`frontend/src/views/leads/LeadsKanban.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/views/leads/LeadsKanban.vue)                                                     |  2200+ qator  | Ichidagi ko'p sonli `isSchool` / `isKindergarten` bloklarini sub-komponentlarga va `customFields` ga ajratish.                   |
| [`frontend/src/components/dashboard/ClassCapacityAndQuickActions.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/components/dashboard/ClassCapacityAndQuickActions.vue) |   480 qator   | Ta'lim va bog'cha mantiqi aralashib ketgan. Universal guruh/resurs sig'imi ko'rinishiga o'tkazish.                               |
| [`frontend/src/constants/roles.constants.js`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/constants/roles.constants.js)                                                   |   34 qator    | Backend Prisma `Role` enum va `MODULE_PERMISSION_CONTRACT.md` bilan to'liq sinxronlashtirish.                                    |

---

## 🏗️ 4. Tavsiya Etilayotgan Yangi Core Arxitekturasi

`docs/MODULE_PERMISSION_CONTRACT.md` talablari va `AGENTS.md` qoidalariga asoslangan yangi modulli struktura:

```
frontend/src/
 ├── core/                          # YADRO (Biznes domenlaridan mutlaqo xoli)
 │    ├── modules/
 │    │    ├── types.ts             # Module, ModuleManifest interfeyslari
 │    │    ├── registry.ts          # Modullarni ro'yxatga oluvchi yagona servis
 │    │    └── loader.ts            # Backend /setup/modules dan yuklovchi drayver
 │    ├── navigation/
 │    │    ├── navigation.types.ts  # NavItem, NavGroup interfeyslari
 │    │    └── navigation.service.ts# Faqat yoqilgan modullardan menyu yig'uvchi servis
 │    ├── router/
 │    │    ├── router.registry.ts   # Dinamik marshrut registri
 │    │    └── route.loader.ts      # Lazy-load marshrut yuklagich & module guard
 │    └── security/
 │         ├── permission.adapter.ts# Backend RBAC ni frontendga ko'chiruvchi adapter
 │         ├── permission.guard.ts  # Router darajasidagi ruxsat tekshiruvi
 │         └── usePermission.ts     # Komponentlar uchun reaktiv composable
 │
 ├── modules/                       # MUSTAQIL PLAGIN-MODULLAR (Self-contained)
 │    ├── attendance/               # Sinov moduli 1
 │    │    ├── module.ts            # Modul identifikatori, metama'lumotlari
 │    │    └── routes.ts            # Ushbu modulning marshrutlari
 │    ├── finance/                  # Sinov moduli 2
 │    │    ├── module.ts
 │    │    └── routes.ts
 │    └── students/                 # Sinov moduli 3
 │         ├── module.ts
 │         └── routes.ts
 │
 ├── components/common/             # Umumiy qayta ishlatiluvchi UI komponentlar (<250 qator)
 └── store/                         # Global Pinia holati (auth, tenant, layout)
```

---

## 🚦 5. Bosqichma-bosqich (Incremental) Migratsiya Strategiyasi

Hech qachon "Big-Bang Rewrite" (barchasini birdan buzib qayta yozish) qilinmaydi! Quyidagi xavfsiz tartib qo'llaniladi:

```
Bosqich 0: Contract Frozen (Tugallandi — MODULE_PERMISSION_CONTRACT.md)
   │
   ▼
Bosqich 1: Architecture Audit (Ushbu hujjat — ARCHITECTURE_AUDIT.md)
   │
   ▼
Bosqich 2: Core Module Registry (src/core/modules/)
           Faqat 3 ta modul bilan sinov: ATTENDANCE, FINANCE, STUDENTS
   │
   ▼
Bosqich 3: Dynamic Sidebar (src/core/navigation/)
           Faqat shu 3 modul dinamik qilinadi, qolgan menyu buzilmaydi
   │
   ▼
Bosqich 4: Dynamic Router Guard (src/core/router/)
           Faqat shu 3 modul marshruti meta.moduleId orqali himoyalanadi
   │
   ▼
Bosqich 5: Permission Adapter (src/core/security/)
           Backend ruxsatlarini 3 modulning 1-2 komponentida sinash
```

---

## ⚠️ 6. Xavflar Tahlili (Risk Analysis)

| Xavf                                                                                    | Ehtimollik | Ta'sir | Oldini Olish Chorasi                                                                                                               |
| --------------------------------------------------------------------------------------- | :--------: | :----: | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Demo tashkilotlar (`profi-maktab`, `yulduzcha-bogcha`, `educrm-markaziy`) buzilishi** |   O'rta    | Yuqori | Har bir bosqichdan so'ng 3 ta demo tashkilot bilan login qilib, ko'rinish va funksiyalar tekshiriladi.                             |
| **Boshqa modullarning (Leads, SMS, HR) ishdan chiqishi**                                |    Past    | Yuqori | Phase 1 da faqat 3 ta sinov moduli (`ATTENDANCE`, `FINANCE`, `STUDENTS`) ga tegish orqali qolgan modullar izolyatsiyada saqlanadi. |
| **Router buzilib oq ekran (Blank page) chiqishi**                                       |   O'rta    | Yuqori | Eski `router/index.js` dagi statik yo'llar zaxirada saqlanadi, dinamik marshrutlar asta-sekin ulanadi.                             |
| **Vue CLI Babel build parse xatolari**                                                  |   O'rta    | O'rta  | `.vue` fayllarda toza `<script setup>`, `.ts` tiplar esa faqat `src/core/**/*.ts` va `src/types/*.ts` fayllarda saqlanadi.         |

---

## 🎯 7. Xulosa

Ushbu audit hisoboti kod bazasini buzmasdan, aniq xarita va dalillar asosida tuzildi. Tizim Phase 1 (PROMPT 2 — Create Module Registry System) ga o'tish uchun to'liq tayyor.

---

## 🔐 8. PROMPT 5: Backend RBAC Audit va Permission Adapter Reconciliation

### 8.1 Backend Auditi Natijalari:

1. **Ruxsatlar Tekshiruvi:** Backend'da controller darajasida `@RequirePermissions(...)` dekoratorlari va `PermissionsGuard` orqali to'liq RBAC (Role-Based Access Control) ishlaydi.
2. **Aniqlangan Bo'shliq (Gap):** Dastlab backend'dagi `/auth/login` va `/auth/profile` endpointlari foydalanuvchiga faqat `user.role` maydonini qaytarar edi, lekin foydalanuvchining faol ruxsat kodlari (`permissions: string[]` yoki `customRole.permissions`) JSON payload'ga qo'shilmagan edi.
3. **Muvofiqlashtirish (Reconciliation):**
   - Backend `src/constants/roles.constants.ts` da `DEFAULT_ROLE_PERMISSIONS` yagona manba sifatida standartlashtirildi (`SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `MANAGER`, `TEACHER`, `CASHIER`, `STUDENT`).
   - `PermissionsGuard` ushbu markaziy konstantadan foydalanadigan qilindi (duplikatsiya yo'q qilindi).
   - `AuthService.login()` va `AuthService.getProfile()` ga `resolveUserPermissions()` integratsiya qilindi: endi backend foydalanuvchining real ruxsatlar massivini (`permissions: string[]`) to'g'ridan-to'g'ri frontendga uzatadi.

### 8.2 Frontend Permission Adapter Arxitekturasi:

- **`src/core/security/permission.types.ts`:** `docs/MODULE_PERMISSION_CONTRACT.md` dagi barcha 36 ta kanonik ruxsat kodlari bilan 1:1 tipizatsiyalandi.
- **`src/core/security/permission.adapter.ts`:** Yagona adapter — backend formatini qabul qiladi, `*` super wildcard va `module.*` modul wildcard'larini to'liq qo'llab-quvvatlaydi.
- **`src/core/security/permission.guard.ts`:** Router guard — `to.meta.permission` va `to.meta.permissions` ni tekshiradi va ruxsatsiz urinishlarni `/403` ga yo'naltiradi.
- **`src/core/security/v-permission.ts`:** Vue maxsus direktivasi (`v-permission="'students.delete'"`) — ruxsati bo'lmagan elementlarni DOM dan yashiradi yoki o'chiradi.
- **`src/core/security/usePermission.ts`:** Vue 3 Composition API composable (`hasPermission`, `hasAnyPermission`, `can`).
- **Sinov Komponentlari:** `StudentsList.vue`, `AttendanceView.vue`, `FinanceView.vue` larda amaliy sinovdan o'tkazildi.
