# EduHub ERP — Ishlatilmayotgan Kodlar Auditi Hisoboti (Knip Dead Code Audit Report)

Ushbu hisobot **Knip (v5.88.1)** tahlil vositasi yordamida EduHub ERP frontend loyihasidagi barcha foydalanilmayotgan komponentlar, sahifalar, yordamchi fayllar, npm paketlar (bog'liqliklar) va eksportlarni aniqlash natijasida shakllantirildi.

> [!IMPORTANT]
> **Hech qanday fayl avtomatik o'chirilmadi.**
> Loyiha boshqaruv qoidalariga (`AGENTS.md`) muvofiq, o'chirish yoki refaktoring qilishdan oldin to'liq hisobot taqdim etilishi shart. Quyida aniqlangan har bir element batafsil tavsiflandi.

---

## 📊 Umumiy Xulosa (Executive Summary)

| Toifa                                     | Aniqlangan Soni | Xavf / Ta'siri                                 | Tavsiya                                                    |
| :---------------------------------------- | :-------------: | :--------------------------------------------- | :--------------------------------------------------------- |
| **Ishlatilmayotgan UI Komponentlar**      |    **10 ta**    | Bundle hajmini oshiradi, ortiqcha kod          | O'chirish yoki umumiy dizayn tizimiga integratsiya qilish  |
| **Ishlatilmayotgan Sahifalar (Views)**    |    **4 ta**     | Eski/monolit sahifalar, yopiq marshrutlar      | O'chirish (UniversalUnifiedDashboard bilan almashtirilgan) |
| **Ishlatilmayotgan Yordamchi Fayllar**    |    **7 ta**     | Ortiqcha store va composable'lar               | Tozalash                                                   |
| **Faqat TypeScript Turlari (Types)**      |    **5 ta**     | Runtime ta'siri yo'q (Typescript erase qiladi) | Saqlab qolish (`src/types/` qatlami)                       |
| **Ishlatilmayotgan Bog'liqliklar (deps)** |    **5 ta**     | ~15-20 MB keraksiz yuk `node_modules` da       | `npm uninstall` qilish                                     |
| **Ishlatilmayotgan DevBog'liqliklar**     |    **4 ta**     | Build vositalarining eski plaginlari           | Xavfsiz tekshirib olib tashlash                            |
| **Ishlatilmayotgan Eksportlar**           |    **66 ta**    | Dead code                                      | Tozalash yoki Tree-shaking                                 |

---

## 🧩 1. Ishlatilmayotgan UI Komponentlar (Unused Components)

Quyidagi komponentlar kod bazasida mavjud, biroq ilovaning hech bir faol sahifasida yoki routerida import qilinmagan:

| Komponent Fayli                                             | Qatorlar Soni | Sabab / Aniqlangan Holat                                                                                                                   |
| :---------------------------------------------------------- | :-----------: | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/common/KanbanBoard.vue`                     |     240+      | `LeadsKanban.vue` sahifasi umumiy komponentdan emas, o'zining ichki kanban ustunlaridan foydalanmoqda. Ushbu komponent o'lik holda qolgan. |
| `src/components/custom-fields/DynamicField.vue`             |     120+      | Maxsus maydonlar (Custom Fields) formasi hali dinamik ulangan emas, komponent chaqirilmaydi.                                               |
| `src/components/custom-fields/DynamicFieldsSection.vue`     |      80+      | Hech bir o'quvchi yoki xodim profilida import qilinmagan.                                                                                  |
| `src/components/custom-fields/FieldDefinitionManager.vue`   |     190+      | Sozlamalar sahifasida (Settings) import qilinmagan.                                                                                        |
| `src/components/dashboard/AcademicYearFilter.vue`           |      75       | Dashboard uchun yil tanlash filtri, hozirgi universal dashboardda ichki header orqali boshqariladi.                                        |
| `src/components/dashboard/ClassCapacityAndQuickActions.vue` |     350+      | Faqat eski `SchoolDashboard.vue` da bo'lgan. Universal dashboardga ko'chirilmagan.                                                         |
| `src/components/dashboard/FinancialActivitySection.vue`     |     560+      | Faqat eski o'lik dashboardlarda chaqirilgan.                                                                                               |
| `src/components/dashboard/MonthlyContractsStatistics.vue`   |     210+      | Faqat eski o'lik dashboardlarda chaqirilgan.                                                                                               |
| `src/components/dashboard/StatCard.vue`                     |      60       | `FinancialKpiCards.vue` va `StatsCard.vue` yaratilgandan so'ng bu eski karta komponenti o'lik bo'lib qolgan.                               |
| `src/components/Footer.vue`                                 |      45       | Loyihada pastki footer paneli ishlatilmaydi.                                                                                               |

---

## 📄 2. Ishlatilmayotgan Sahifalar va Fayllar (Unused Views & Files)

### A. Ishlatilmayotgan Sahifalar (Views):

1. **`src/views/dashboard/SchoolDashboard.vue`**:
   - _Izoh:_ Barcha dashboardlar yagona [UniversalUnifiedDashboard.vue](file:///home/ruswer/Documents/erp-own/erp/frontend/src/views/dashboard/UniversalUnifiedDashboard.vue) ga birlashtirilganligi sababli, ushbu sahifa endi routerda ham, boshqa sahifada ham ishlatilmaydi.
2. **`src/views/dashboard/CourseCenterDashboard.vue`**:
   - _Izoh:_ O'quv markazlari dashboardi ham universal dashboardga ko'chirilgan, routerda mavjud emas.
3. **`src/views/dashboard/KindergartenDashboard.vue`**:
   - _Izoh:_ Bog'cha moduli dashboardi ham universal tizimga o'tkazilgan.
4. **`src/views/layouts/Blank.vue`**:
   - _Izoh:_ Bo'sh layout komponenti hech qayerda qo'llanilmayapti.

### B. Ishlatilmayotgan Store va Yordamchi Fayllar:

1. **`src/store/index.js`**:
   - _Izoh:_ `src/main.js` to'g'ridan-to'g'ri `createPinia()` ni ishlatadi, shuning uchun bu alohida fayl o'lik.
2. **`src/store/sidebar.js`**:
   - _Izoh:_ Sidebar holati komponentlararo prop yoki lokal holatda boshqariladi, ushbu Pinia store chaqirilmaydi.
3. **`src/store/fullscreen.js`**:
   - _Izoh:_ Hech qayerda ishlatilmagan.
4. **`src/helper/theme-sidebar.js`**:
   - _Izoh:_ Mavzular va sidebar sozlamalari yangi Tailwind dizayn tizimiga o'tgan, bu eski fayl import qilinmaydi.
5. **`src/composables/useTableFilter.js`**:
   - _Izoh:_ Yangi `useTableFilter` composable yaratilgan, ammo hali mavjud sahifalarga ulanmagan.
6. **`src/api/index.js` va `src/composables/index.js`**:
   - _Izoh:_ Barrel re-export fayllari, importlar to'g'ridan-to'g'ri alohida fayllardan qilinmoqda.

### C. Faqat TypeScript Turlari (`src/types/`):

- `src/types/auth.ts`, `src/types/common.ts`, `src/types/finance.ts`, `src/types/student.ts`, `src/types/index.ts`
- _Tavsif:_ Ushbu fayllar **o'lik kod EMAS**. Ular sof TypeScript `interface` va `type` lardan iborat bo'lib, kompilyatsiya paytida JS bundle'iga kirmaydi (`type erasure`). Knip JS import qidirgani sababli ko'rsatmoqda. Bular `AGENTS.md` qoidasiga ko'ra saqlanishi shart.

---

## 📦 3. Ishlatilmayotgan Bog'liqliklar (Unused Dependencies)

`frontend/package.json` da ro'yxatga olingan, biroq loyiha kodida import qilinmagan kutubxonalar:

### Asosiy Bog'liqliklar (`dependencies`):

| Paket Nomi              | O'rnatilgan Versiya | Haqiqiy Holati                                                                                                        | Tavsiya                                                 |
| :---------------------- | :-----------------: | :-------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| **`validator`**         |      `^13.9.0`      | Loyihada o'zining `@/utils/validators.js` fayli bor. Tashqi `validator` paketidan birorta ham funksiya chaqirilmagan. | 🗑️ O'chirish mumkin (`npm uninstall validator`)         |
| **`vee-validate`**      |      `^4.15.1`      | Hech qaysi komponentda ishlatilmagan. Formalar v-model va ichki metodlar bilan ishlaydi.                              | 🗑️ O'chirish mumkin (`npm uninstall vee-validate`)      |
| **`lodash`**            |     `^4.17.21`      | Kod bazasida `lodash` dan birorta import yo'q. Native ES6 metodlari (map, filter, find, reduce) yetarli.              | 🗑️ O'chirish mumkin (`npm uninstall lodash`)            |
| **`perfect-scrollbar`** |      `^1.5.5`       | Loyiha `vue3-perfect-scrollbar` paketini ishlatadi, xom `perfect-scrollbar` to'g'ridan-to'g'ri import qilinmaydi.     | 🗑️ O'chirish mumkin (`npm uninstall perfect-scrollbar`) |
| **`core-js`**           |      `^3.8.3`       | Babel/Webpack tomonidan avtomatik ta'minlanadi, to'g'ridan-to'g'ri chaqirilmaydi.                                     | ⚠️ Saqlab turish yoki Babel config bilan tekshirish     |

### Dev Bog'liqliklar (`devDependencies`):

| Paket Nomi                    | O'rnatilgan Versiya | Sabab                                                                                                  |
| :---------------------------- | :-----------------: | :----------------------------------------------------------------------------------------------------- |
| **`@storybook/blocks`**       |      `^8.6.14`      | Storybook hikoyalarida bloklar to'g'ridan-to'g'ri ishlatilmagan.                                       |
| **`@vue/cli-plugin-babel`**   |      `~5.0.0`       | CLI service konfiguratsiyasi ichida.                                                                   |
| **`@vue/cli-plugin-router`**  |      `~5.0.0`       | Router dastlab o'rnatilganda kiritilgan, hozir router to'g'ridan-to'g'ri `vue-router` orqali ishlaydi. |
| **`vue-cli-plugin-tailwind`** |      `~3.0.0`       | Tailwind to'g'ridan-to'g'ri `postcss.config.js` va `tailwind.config.js` orqali boshqariladi.           |

---

## ⚡ 4. Ishlatilmayotgan Eksportlar (Unused Exports - 66 ta)

Fayllarda `export` qilingan, ammo boshqa hech qaysi fayl tomonidan import qilinmayotgan funksiya va o'zgaruvchilar:

1. **`src/api/services.js` (Eski va Ulanmagan API Xizmatlari):**
   - `pipelinesApi`, `customersApi`, `activitiesApi`, `crmNotesApi`, `contractsApi`, `customFieldsApi`, `resourcesApi`, `scheduleApi`, `financeApi`, `importExportApi`, `workflowsApi`, `lessonsApi`, `parentsApi`.
   - _Sabab:_ Ushbu API servislar yaratilgan, biroq sahifalar backendga to'liq ulanmaganligi sababli hali chaqirilmayapti. Backend integratsiyasida bular kerak bo'ladi!
2. **`src/utils/validators.js`:**
   - 18 ta turli xil validation qoidalari (`studentValidationRules`, `employeeValidationRules`, `payrollValidationRules`, `courseValidationRules`, va h.k.) hamda Yup schemalari.
   - _Sabab:_ Forma validatsiyasi barcha sahifalarda to'liq markazlashtirilmagan.
3. **Statik Mock Ma'lumotlari (`src/api/*Data.js`):**
   - `loadAllClassSchedules`, `saveAllClassSchedules`, `applyTemplateToClass`, `schoolArchived`, `courseCenterArchived`, `kindergartenGroups`, `saveSchoolDroppedStudents`, `findParentByLoginOrPhone`, `saveSchoolStudents`.
4. **Yordamchi Funksiyalar:**
   - `hexToRgb` (`src/helper/theme.js`)
   - `getStatusBadgeVariant`, `getStatusLabel` (`src/helper/formatters.js`)
   - `getPaymentMethod`, `getPaymentMethodColor` (`src/config/paymentMethods.js`)
   - `setApiBaseUrl` (`src/config/api.config.js`)
   - `useToast` (`src/utils/toast.js` — loyihada `toast` yoki `$toast` ishlatiladi)

---

## 🎯 5. Tavsiya Qilinadigan Harakatlar Rejasi (Action Plan)

Foydalanuvchi tasdig'idan so'ng quyidagi bosqichma-bosqich tozalashni amalga oshirish tavsiya etiladi:

### 1-Faza: Mutlaqo Xavfsiz O'chirish (Zero Risk)

- Ishlatilmayotgan 4 ta o'lik paketni olib tashlash:
  ```bash
  npm --prefix frontend uninstall validator vee-validate lodash perfect-scrollbar
  ```
  _(Bu orqali `node_modules` hajmi qisqaradi va keraksiz bog'liqliklar yo'qoladi)_
- O'lik sahifalarni tozalash:
  - `src/views/dashboard/SchoolDashboard.vue`
  - `src/views/dashboard/CourseCenterDashboard.vue`
  - `src/views/dashboard/KindergartenDashboard.vue`
  - `src/views/layouts/Blank.vue`
- O'lik yordamchi komponentlarni tozalash:
  - `src/components/Footer.vue`
  - `src/components/dashboard/StatCard.vue`
  - `src/components/dashboard/AcademicYearFilter.vue`
  - `src/components/dashboard/ClassCapacityAndQuickActions.vue`
  - `src/components/dashboard/FinancialActivitySection.vue`
  - `src/components/dashboard/MonthlyContractsStatistics.vue`
  - `src/store/sidebar.js`, `src/store/fullscreen.js`, `src/store/index.js`
  - `src/helper/theme-sidebar.js`

### 2-Faza: Qayta Ishlatish yoki Refaktoring (Refactor / Reuse)

- `src/components/common/KanbanBoard.vue`:
  - `LeadsKanban.vue` dagi takroriy kanban kodini ushbu umumiy komponentga integratsiya qilish.
- `src/types/*.ts`:
  - `knip.json` dagi `ignore` ro'yxatiga kiritish, chunki bular qat'iy TypeScript talabi hisoblanadi.

---

> **Audit buyrug'i:** `npm run analyze` (yoki `npx knip`)
> **Konfiguratsiya fayli:** `frontend/knip.json`
