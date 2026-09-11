# EduHub ERP — Dead Code Decision Report

**Hujjat Maqsadi:** Knip tahlilida aniqlangan barcha foydalanilmayotgan komponentlar, sahifalar, yordamchi fayllar va eksportlar bo'yicha arxitektura va biznes qarorlarini belgilash.
**Boshqaruv Shartnomasi:** Ushbu hisobot `AGENTS.md` va korporativ ERP uzoq muddatli masshtablash tamoyillariga to'liq asoslanadi.

---

## 📋 Tasniflash Tizimi (Classification Methodology)

- **CATEGORY A — SAFE TO REMOVE (Xavfsiz O'chirish):**
  - _Mezonlar:_ Hech qayerda chaqirilmagan, biznes maqsadiga ega emas, kelajakda ishlatilmaydi, boshlang'ich shablondan qolib ketgan dublikat yoki tashlab ketilgan kod.
  - _Harakat:_ Kod bazasidan xavfsiz o'chirish.
- **CATEGORY B — KEEP: Future ERP Capability (Saqlash — Kelajakdagi ERP Imkoniyati):**
  - _Mezonlar:_ Kelajakdagi ERP modulini ifodalaydi, biznes mantiqi keyingi fazalarda kerak bo'ladi, backend integratsiyasi tayyorlanmoqda, qayta ishlatiluvchi arxitektura elementi.
  - _Harakat:_ Saqlab qolish, `docs/FUTURE_FEATURES.md` da to'liq hujjatlashtirish.
- **CATEGORY C — REFACTOR / INTEGRATE (Refaktoring va Integratsiya):**
  - _Mezonlar:_ Yaxshi g'oya yoki tayyor arxitektura, biroq noto'g'ri joylashuv, modullashtirish yoki zamonaviy TypeScript xizmatlariga o'tkazish talab etiladi.
  - _Harakat:_ Yangi arxitektura qatlamiga o'tkazish (masalan: `src/services/` yoki `src/validation/`).
- **CATEGORY D — REPLACE WITH BETTER SOLUTION (Zamonaviyroq Yechimga O'tkazish):**
  - _Mezonlar:_ Eskirgan yondashuv yoki texnologiya, Vue 3 / TypeScript uchun ancha qulay va yengil alternativa mavjud.
  - _Harakat:_ Bosqichma-bosqich migratsiya rejasini ishlab chiqish.

---

## 🧩 1. UI Komponentlar Tahlili va Qarorlar

### 1.1. `src/components/common/KanbanBoard.vue`

- **Muammo (Problem):** Knip tomonidan ishlatilmayotgan komponent deb topilgan.
- **Hozirgi holat (Current state):** 240 qatordan iborat, to'liq funksional universal Kanban taxtasi (ustunlar, kartalar, drag-and-drop, filtrlash, qidiruv, header slotlari). `LeadsKanban.vue` esa o'zining ichki kanban ustunlaridan foydalanmoqda.
- **Biznes qiymati (Business purpose & Future value):** CRM voronkasi (Lead Pipeline), Ta'lim jarayonlari (Admission Workflow), Vazifalar taxtasi (Task Board) modullarida qayta ishlatish uchun tayyor professional komponent.
- **Qaror (Decision):** **CATEGORY B (KEEP — Future ERP Capability)**.
- **Sabab (Reason):** Ushbu komponentni o'chirish keyingi CRM bosqichlarida qaytadan kanban yozishga majbur qiladi.
- **Xavf (Risk):** Nol. Mavjud kodni buzmaydi.
- **Amalga oshirish rejasi (Implementation plan):** Saqlab qolish, kelgusida `LeadsKanban.vue` va `WorkflowTasks.vue` sahifalarini ushbu universal komponentga ulash.

---

### 1.2. `src/components/custom-fields/DynamicField.vue`

- **Muammo:** Hech qaysi faol formaga ulanmagan.
- **Hozirgi holat:** 120 qatorlik Vue 3 komponenti. Matn, son, sana, tanlov (select), bayroqcha (boolean) kabi maxsus maydon turlarini dinamik render qiladi.
- **Biznes qiymati:** NestJS backendida `CustomFieldDefinition` modeli va `custom-fields.controller.ts` mavjud. Ta'lim markazlariga o'quvchi yoki xodim anketasiga maxsus maydonlar qo'shish imkonini beradi.
- **Qaror:** **CATEGORY B (KEEP — Future ERP Capability)**.
- **Sabab:** Backendda tayyor bo'lgan `custom-fields` modulining frontend taqdimot asosi.
- **Xavf:** Nol.
- **Amalga oshirish rejasi:** `docs/FUTURE_FEATURES.md` da qayd etish va O'quvchi/Xodim profil sahifalariga ulash.

---

### 1.3. `src/components/custom-fields/DynamicFieldsSection.vue`

- **Muammo:** Profil sahifalarida chaqirilmagan.
- **Hozirgi holat:** Berilgan entitiy (`STUDENT`, `EMPLOYEE`, `COURSE`, `LEAD`) bo'yicha barcha dinamik maydonlarni guruhlab ko'rsatuvchi seksiyali komponent.
- **Biznes qiymati:** Maxsus maydonlar to'plamini formalar ichiga bitta qatorda joylash imkonini beradi.
- **Qaror:** **CATEGORY B (KEEP — Future ERP Capability)**.
- **Sabab:** `DynamicField` ning ota-komponenti.

---

### 1.4. `src/components/custom-fields/FieldDefinitionManager.vue`

- **Muammo:** Sozlamalar sahifasida import qilinmagan.
- **Hozirgi holat:** 320 qatorlik to'liq boshqaruv interfeysi. Yangi maydon yaratish, maydon turlarini tanlash, o'chirish va tartiblash jadvallari mavjud.
- **Biznes qiymati:** Administratorlar uchun ERP sozlamalarida (`/settings/custom-fields`) maxsus maydonlarni yaratish va sozlash boshqaruv paneli.
- **Qaror:** **CATEGORY B (KEEP — Future ERP Capability)**.
- **Sabab:** Sozlamalar menyusiga yangi Custom Fields bo'limi qo'shilganda to'g'ridan-to'g'ri ulanadi.

---

### 1.5. `src/components/dashboard/StatCard.vue`

- **Muammo:** Faqat eski dashboardlarda ishlatilgan.
- **Hozirgi holat:** 60 qatorlik kichik statistika kartasi. Yangi universal dashboardda `FinancialKpiCards.vue` va umumiy `StatsCard.vue` ishlatilmoqda.
- **Qaror:** **CATEGORY B (KEEP — Future ERP Capability)**.
- **Sabab:** Ixtisoslashgan `SchoolDashboard.vue` bilan birga referens sifatida saqlanadi.

---

### 1.6. `src/components/dashboard/AcademicYearFilter.vue`, `ClassCapacityAndQuickActions.vue`, `FinancialActivitySection.vue`, `MonthlyContractsStatistics.vue`

- **Muammo:** Yangi `UniversalUnifiedDashboard.vue` da o'zining ichki widgetlari yaratilganligi sababli bu komponentlar tashqi import qilinmay qolgan.
- **Hozirgi holat:** Maktab va bog'cha bo'yicha sinflar sig'imi (50%) va tezkor harakatlar (50%), oylar kesimidagi shartnomalar statistikasini aks ettiruvchi komponentlar.
- **Biznes qiymati:** Maktab va bog'chalar uchun chuqurlashtirilgan tahliliy widgetlar sifatida juda yuqori qiymatga ega.
- **Qaror:** **CATEGORY B (KEEP — Future ERP Capability)**.
- **Sabab:** Kelajakda universal dashboard sozlamalari orqali yoki maktab ixtisoslashgan rejimida foydalanuvchiga yoqib-o'chirish imkoniyati beriladi.

---

### 1.7. `src/components/Footer.vue`

- **Muammo:** Hech qayerda ko'rsatilmaydi.
- **Hozirgi holat:** 12 qatorlik matnli footer.
- **Biznes qiymati:** ERP tizimining zamonaviy to'liq ekranli (flex-col, overflow-hidden) interfeysida pastki statik footer zarur emas va foydali ekranni toraytiradi.
- **Qaror:** **CATEGORY A (SAFE TO REMOVE)**.
- **Sabab:** 0 biznes qiymati, dizayn tizimiga zid.
- **Xavf:** Nol.

---

## 📄 2. Sahifalar (Views) Tahlili va Qarorlar

### 2.1. `src/views/layouts/Blank.vue`

- **Muammo:** Boshlang'ich HTML shablonidan qolib ketgan "Blank Pages / Nothing specials here" matnli 9 qatorlik fayl.
- **Biznes qiymati:** Mutlaqo mavjud emas.
- **Qaror:** **CATEGORY A (SAFE TO REMOVE)**.
- **Sabab:** Abandoned boilerplate.
- **Xavf:** Nol.

---

### 2.2. `src/views/dashboard/SchoolDashboard.vue`, `CourseCenterDashboard.vue`, `KindergartenDashboard.vue`

- **Muammo:** Routerda barcha biznes yo'nalishlar uchun yagona `UniversalUnifiedDashboard.vue` ulangan.
- **Hozirgi holat:** Har bir ta'lim turi (Maktab, O'quv markazi, Bog'cha) uchun o'ziga xos metrikalar va ko'rsatkichlar joylashtirilgan.
- **Biznes qiymati:** Multi-tenant ERP tizimida tashkilot profiliga qarab moslashtirilgan ixtisoslashgan tahliliy panellar.
- **Qaror:** **CATEGORY B (KEEP — Future ERP Capability)**.
- **Sabab:** Ushbu sahifalar to'liq tayyorlangan va kelgusida tashkilot turi bo'yicha dashboard almashinuvi (`businessType`) faollashtirilganda ulanadi.

---

## 🛠️ 3. Yordamchi Fayllar va Store Tahlili

### 3.1. `src/helper/theme-sidebar.js`

- **Muammo:** Eski imperativ JavaScript fayli (`document.querySelector`, `alert("dark")`).
- **Biznes qiymati:** Mavjud emas. Sidebar va temalar to'liq Tailwind CSS va Pinia orqali boshqariladi.
- **Qaror:** **CATEGORY A (SAFE TO REMOVE)**.
- **Sabab:** `AGENTS.md` qoidalariga zid bo'lgan eskirgan kod.
- **Xavf:** Nol.

---

### 3.2. `src/store/sidebar.js`, `src/store/fullscreen.js`, `src/store/index.js`

- **Muammo:** Boshlang'ich shablondan qolgan keraksiz Pinia store fayllari.
- **Hozirgi holat:** `sidebar.js` ichida soxta `{ name: "Alert" }` menyusi saqlangan; `index.js` faqat `createPinia()` qiladi (lekin `main.js` o'zi mustaqil yaratadi).
- **Biznes qiymati:** Nol. Haqiqiy do'konlar: `src/store/auth.js` va `src/store/tenant.js`.
- **Qaror:** **CATEGORY A (SAFE TO REMOVE)**.
- **Sabab:** Foydalanilmayotgan dublikat fayllar.
- **Xavf:** Nol.

---

### 3.3. `src/composables/useTableFilter.js`

- **Muammo:** Hali mavjud sahifalarga import qilinmagan.
- **Hozirgi holat:** 106 qatorlik mukammal Composition API composable (matn qidiruvi, aniq parametrlar bo'yicha filtrlash, saralash).
- **Biznes qiymati:** Barcha yangi jadval sahifalari uchun yagona standart filtrlash mantiqi.
- **Qaror:** **CATEGORY B (KEEP — Future ERP Capability)**.
- **Sabab:** `AGENTS.md` da talab qilingan qayta ishlatiluvchi composables namunasi.

---

### 3.4. `src/types/*.ts` (`auth.ts`, `student.ts`, `finance.ts`, `common.ts`)

- **Muammo:** Knip ularni import qilinmagan fayl deb hisoblaydi.
- **Hozirgi holat:** Sof TypeScript interfeyslari va turlari.
- **Biznes qiymati:** Tizimning qat'iy tiplashtirish asosi (`strict: true`). Kompilyatsiya paytida JavaScript kodiga aylanmaydi (type erasure).
- **Qaror:** **CATEGORY B (KEEP — Core System Types)**.
- **Sabab:** `AGENTS.md` ning 1-bo'limi talabi.

---

## 🌐 4. Eksportlar Tahlili (`src/api/services.js` — 66 ta eksport)

- **Muammo:** Knip `src/api/services.js` dagi ko'plab API ob'ektlarini (`financeApi`, `contractsApi`, `workflowsApi`, `parentsApi`, `customFieldsApi`, va h.k.) ishlatilmayotgan eksport sifatida ko'rsatmoqda.
- **Hozirgi holat:** NestJS backendining 30 ta kontrolleriga to'liq mos keluvchi Axios mijozlari yozib chiqilgan. Frontenddagi ayrim sahifalar esa hozircha lokal kesh yoki soddalashtirilgan API dan foydalanmoqda.
- **Biznes qiymati:** Barcha backend ERP biznes jarayonlariga to'liq ulanish nuqtalari. Bularni o'chirish — backend integratsiyasini yo'qqa chiqarish bilan barobar!
- **Qaror:** **CATEGORY C (REFACTOR / INTEGRATE)**.
- **Sabab:** Hech bir API o'chirilmaydi. Ular kelgusida modulli `src/services/*.ts` strukturasiga ko'chiriladi.

---

## 📊 Xulosa Jadvali

| Fayl / Ob'ekt                                 | Toifa |  Qaror   | Amaliy Harakat                                             |
| :-------------------------------------------- | :---: | :------: | :--------------------------------------------------------- |
| `src/views/layouts/Blank.vue`                 | **A** |  REMOVE  | Xavfsiz o'chirish                                          |
| `src/helper/theme-sidebar.js`                 | **A** |  REMOVE  | Xavfsiz o'chirish                                          |
| `src/store/sidebar.js`                        | **A** |  REMOVE  | Xavfsiz o'chirish                                          |
| `src/store/fullscreen.js`                     | **A** |  REMOVE  | Xavfsiz o'chirish                                          |
| `src/store/index.js`                          | **A** |  REMOVE  | Xavfsiz o'chirish                                          |
| `src/components/Footer.vue`                   | **A** |  REMOVE  | Xavfsiz o'chirish                                          |
| `src/components/common/KanbanBoard.vue`       | **B** |   KEEP   | Saqlash, `FUTURE_FEATURES.md` da qayd etish                |
| `src/components/custom-fields/*` (3 ta)       | **B** |   KEEP   | Saqlash, kelgusi modul sifatida belgilash                  |
| `src/views/dashboard/*` (3 ta eski dashboard) | **B** |   KEEP   | Ixtisoslashgan multi-tenant rejimi uchun saqlash           |
| `src/components/dashboard/*` (5 ta widget)    | **B** |   KEEP   | Ixtisoslashgan dashboardlar bilan birga saqlash            |
| `src/composables/useTableFilter.js`           | **B** |   KEEP   | Saqlash, yangi jadvallarga integratsiya qilish             |
| `src/types/*.ts` (5 ta)                       | **B** |   KEEP   | Saqlash, TypeScript tiplar qatlami                         |
| `src/api/services.js` (API eksportlar)        | **C** | REFACTOR | Saqlash, `src/services/*.ts` ga ko'chirish rejasini tuzish |
