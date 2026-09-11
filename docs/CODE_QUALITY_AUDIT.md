# EduHub ERP — Keng Qamrovli Kod Sifati va Arxitektura Auditi (Code Quality Audit)

**Muallif:** Senior Vue.js Architect & Code Quality Engineer  
**Sana:** 2026-09-09  
**Loyiha:** EduHub ERP (Frontend: Vue 3 / Backend: NestJS / Database: PostgreSQL 16)  
**Holati:** Tahlil yakunlandi — o'zgartirish kiritishdan oldin ko'rib chiqish uchun taqdim etilmoqda.

---

## 📑 Mundarija

1. [Ijrochi Xulosasi (Executive Summary)](#1-ijrochi-xulosasi-executive-summary)
2. [Folder Strukturasidagi Kamchiliklar](#2-folder-strukturasidagi-kamchiliklar)
3. [Vue Arxitekturasi va Paradigma Muammolari](#3-vue-arxitekturasi-va-paradigma-muammolari)
4. [Komponentlar Tashkiliyoti va Proxy Dublikatlar](#4-komponentlar-tashkiliyoti-va-proxy-dublikatlar)
5. [Hardcode Qilingan Qiymatlar va Sirli Ma'lumotlar](#5-hardcode-qilingan-qiymatlar-va-sirli-malumotlar)
6. [Kod Takrorlanishi (Duplicate Code / DRY Buzilishi)](#6-kod-takrorlanishi-duplicate-code--dry-buzilishi)
7. [Ishlatilmayotgan (O'lik) Komponentlar](#7-ishlatilmayotgan-olik-komponentlar)
8. [Ishlatilmayotgan Bog'liqliklar (Unused Dependencies)](#8-ishlatilmayotgan-bogliqliklar-unused-dependencies)
9. [API Strukturasidagi Ajralish (Dual-State Architecture)](#9-api-strukturasidagi-ajralish-dual-state-architecture)
10. [State Management (Holat Boshqaruvi) Kamchiliklari](#10-state-management-holat-boshqaruvi-kamchiliklari)
11. [Nomlash Qoidalari (Naming Conventions) Buzilishi](#11-nomlash-qoidalari-naming-conventions-buzilishi)
12. [TypeScript Yo'qligi va Tip Xavfsizligi](#12-typescript-yoqligi-va-tip-xavfsizligi)
13. [CSS va Tailwind Tashkiliyoti Muammolari](#13-css-va-tailwind-tashkiliyoti-muammolari)
14. [Xavfsizlik Zaifliklari (Security Issues)](#14-xavfsizlik-zaifliklari-security-issues)
15. [Unumdorlik (Performance & Bundle Size) Muammolari](#15-unumdorlik-performance--bundle-size-muammolari)
16. [Monolitik Fayllar va Kod Hidi (Code Smells)](#16-monolitik-fayllar-va-kod-hidi-code-smells)
17. [Ustuvor Harakatlar Rejasi (Action Plan)](#17-ustuvor-harakatlar-rejasi-action-plan)

---

## 1. Ijrochi Xulosasi (Executive Summary)

EduHub ERP — biznes funksionalligi, dizayn intizomi (`DESIGN_SYSTEM_RULES.md`) va vizual jozibadorligi bo'yicha juda yuqori darajada rivojlangan ta'lim ERP platformasi. Biroq, loyihaning jadal o'sishi natijasida frontend qatlamida jiddiy **arxitekturaviy qarzlar (technical debt)** yig'ilib qolgan:

- **Asosiy xavf (Kritik):** Maktab moduli (`views/school/*`) backend PostgreSQL bazasiga emas, brauzerning `localStorage`iga va statik JSON fayllariga ulanib qolgan (Dual-State Architecture).
- **Unumdorlik xavfi (Yuqori):** Routerda 38 ta sahifaning barchasi bir paytda statik yuklangan (Zero Code Splitting), 10 dan ortiq og'ir keraksiz kutubxonalar (`flowbite`, `dropzone-vue`, `v-tables-3`, 4 xil scrollbar) bundle'ni shishirib turibdi.
- **Kod barqarorligi xavfi (Yuqori):** 2,000 qatordan oshuvchi monolitik fayllar mavjud, 100% kod Vue 2 Options API'da yozilgan, TypeScript mavjud emas.

---

## 2. Folder Strukturasidagi Kamchiliklar

### Muammo 2.1: Parallellik va Domen Chalkashligi

- **Joylashuvi:** `frontend/src/views/students/` vs `frontend/src/views/school/SchoolStudentsView.vue`, hamda `src/views/Dashboard.vue` vs `src/views/dashboard/`
- **Darajasi:** 🟠 **High**
- **Tavsifi:** O'quvchilar ro'yxati 2 ta mutlaqo alohida sahifada (`students/StudentsList.vue` va `school/SchoolStudentsView.vue`) mavjud. Dashboard bitta fayli `views/` ildizida, qolganlari esa `views/dashboard/` ichida joylashgan. Bu yangi dasturchilar uchun chalkashlik va domenlararo noaniqlik keltiradi.
- **Tavsiya:** Domenlarni modulli (feature-based) arxitekturaga ajratish:
  - `src/modules/students/`
  - `src/modules/school/`
  - `src/modules/finance/`
  - `src/modules/dashboard/`

### Muammo 2.2: Yordamchi Funksiyalar Bo'linishi (`helper/` vs `utils/`)

- **Joylashuvi:** `frontend/src/helper/` vs `frontend/src/utils/`
- **Darajasi:** 🟡 **Medium**
- **Tavsifi:** `helper/theme.js` alohida papkada, `utils/validators.js` va `utils/toast.js` boshqa papkada. Ikkalasi ham yordamchi utility funksiyalar hisoblanadi.
- **Tavsiya:** Barchasini yagona `src/utils/` yoki `src/shared/` papkasi ostida birlashtirish (`src/utils/theme.js`, `src/utils/validators.js`).

---

## 3. Vue Arxitekturasi va Paradigma Muammolari

### Muammo 3.1: Vue 3 Muhitida 100% Eski Options API Ishlatilishi

- **Joylashuvi:** `frontend/src/views/**/*.vue`, `frontend/src/components/**/*.vue`
- **Darajasi:** 🟠 **High**
- **Tavsifi:** Loyiha Vue 3.2+ da yaratilgan bo'lsa-da, bitta ham `<script setup>` komponenti yo'q. Barcha 38 ta view va 50+ komponent eski Vue 2 uslubidagi Options API (`data()`, `methods`, `computed`) orqali yozilgan.
- **Oqibati:**
  - 1,000+ qatorli fayllarda `this.` ga bog'liqlik sababli kod bo'ylab sakrashlar ko'p, mantiqni composable (`use...()`) funksiyalarga ajratish qiyin.
  - Tree-shaking samaradorligi pasayadi.
- **Tavsiya:** Yangi komponentlarni va refaktoring qilinayotgan sahifalarni Vue 3 `<script setup>` (Composition API) standartiga o'tkazish.

### Muammo 3.2: Global Properties Ifloslanishi

- **Joylashuvi:** `frontend/src/main.js` (88-96-qatorlar)
- **Darajasi:** 🟡 **Medium**
- **Tavsifi:** `app.config.globalProperties` ga `$toast`, `$brand`, `$appConfig`, `$formatMoney`, `$formatDate`, `$formatPhone`, `$validateForm`, `$rules` qo'lda bog'langan.
- **Oqibati:** Komponentlar ichida `this.$formatMoney` chaqiriladi. Bu esa TypeScript'da avtomatik tip xatolarini keltirib chiqaradi va unit test yozishni murakkablashtiradi.
- **Tavsiya:** Bu funksiyalarni global injection o'rniga to'g'ridan-to'g'ri kerakli joyda `import { formatMoney } from '@/utils/formatters'` shaklida ishlatish.

---

## 4. Komponentlar Tashkiliyoti va Proxy Dublikatlar

### Muammo 4.1: Ildiz Komponentlar Papkasidagi Soxta Proxy (Shim) Fayllar

- **Joylashuvi:** `frontend/src/components/AppTable.vue`, `AppUserCell.vue`, `AppPhoneCell.vue`, `AppDateRangePicker.vue`, `AppConfirmModal.vue` va h.k. (14 ta fayl)
- **Darajasi:** 🟠 **High**
- **Tavsifi:** Ushbu fayllar aslida mustaqil komponent emas, balki atigi 3 qatordan iborat bo'lib, `common/` ichidagi fayllarni qayta eksport qiladi:
  ```javascript
  // src/components/AppTable.vue
  import AppTable from "./common/AppTable.vue";
  export default AppTable;
  ```
  Shuningdek, `DataTable.vue` ham aynan shu ishni qiladi.
- **Oqibati:** Bitta komponent loyihada 3 xil nom bilan mavjud (`AppTable`, `common/AppTable`, `DataTable`), IDE avtomatik importlarida adashish yuzaga keladi.
- **Tavsiya:** Proxy fayllarni butunlay tozalash. Barcha sahifalardagi importlarni yagona to'g'ridan-to'g'ri manzilga yo'naltirish: `@/components/common/AppTable.vue` yoki umumiy barrel eksport: `@/components/index.js`.

---

## 5. Hardcode Qilingan Qiymatlar va Sirli Ma'lumotlar

### Muammo 5.1: Client-Side Kodda Administrator Paroli Saqlanishi

- **Joylashuvi:** `frontend/src/config/api.config.js` (17-20-qatorlar), `frontend/src/views/setup/SetupWizard.vue` (483-qator)
- **Darajasi:** 🔴 **Critical**
- **Tavsifi:**
  ```javascript
  DEFAULT_AUTH: {
    phone: '+998901234567',
    password: 'admin123',
  }
  ```
- **Oqibati:** Ushbu fayl `npm run build` qilinganda frontend JS bundle ichiga kirib ketadi. Istalgan foydalanuvchi DevTools orqali dastlabki admin telefon va parolini o'qiy oladi.
- **Tavsiya:** `api.config.js` ichidan `DEFAULT_AUTH` blokini butunlay olib tashlash. Kirish ma'lumotlari faqat backend `.env` va `seed.ts` orqali boshqarilishi shart.

### Muammo 5.2: Hardcode Sana va Yil Qiymatlari

- **Joylashuvi:** `frontend/src/api/scheduleData.js`, `frontend/src/api/schoolStudentsData.js`
- **Darajasi:** 🟡 **Medium**
- **Tavsifi:** Sanalar `"2026-09-08"`, `"2026"` deb qat'iy yozilgan.
- **Tavsiya:** Dinamik `new Date().getFullYear()` yoki tizim o'quv yili konfiguratsiyasidan foydalanish.

---

## 6. Kod Takrorlanishi (Duplicate Code / DRY Buzilishi)

### Muammo 6.1: Sana va Telefon Formatlash Funksiyalarining Ko'p Joyda Qayta Yozilishi

- **Joylashuvi:**
  - `src/config/app.config.js` (`formatDateUz`, `formatPhone`)
  - `src/utils/validators.js` (`formatPhone`)
  - `src/components/common/AppPhoneCell.vue` (`rawPhone`, `formattedPhone`)
  - `src/api/schoolStudentsData.js` (ichki formatlash funksiyalari)
- **Darajasi:** 🟡 **Medium**
- **Tavsifi:** O'zbekiston telefon raqamini formatlash (`+998 (XX) XXX-XX-XX`) mantiqi kamida 4 xil joyda alohida Regex va `replace` bilan yozilgan. Agar raqam formatlash qoidasi o'zgarsa, barcha 4 joyni o'zgartirish talab etiladi.
- **Tavsiya:** Barcha formatlash funksiyalarini yagona `src/utils/formatters.js` fayliga jamlash va barcha komponentlarda faqat undan import qilish.

### Muammo 6.2: Modal Oynalarning Qayta-Qayta O'rab Yozilishi

- **Joylashuvi:** `src/components/modal.vue`, `src/components/ConfirmModal.vue`, `src/components/common/AppConfirmModal.vue`
- **Darajasi:** 🟡 **Medium**
- **Tavsifi:** `ConfirmModal.vue` va `AppConfirmModal.vue` bir xil vazifani bajaruvchi ikkita alohida modal komponenti bo'lib qolgan.
- **Tavsiya:** `ConfirmModal.vue` ni eskirgan deb belgilab (deprecated), loyiha bo'ylab faqat `AppConfirmModal.vue` ga o'tkazish.

---

## 7. Ishlatilmayotgan (O'lik) Komponentlar

Quyidagi komponentlar kod bazasida mavjud, ammo biron marta ham sahifalarda yoki ilovada ishlatilmaydi:

| O'lik Komponent                | Fayl Manzili                                              | Hajmi  | Holati                                   |
| ------------------------------ | --------------------------------------------------------- | ------ | ---------------------------------------- |
| **AppAccordion.vue**           | `src/components/AppAccordion.vue`                         | 1.4 KB | Hech qayerda chaqirilmaydi               |
| **MenuAccordion.vue**          | `src/components/MenuAccordion.vue`                        | 1.3 KB | Hech qayerda chaqirilmaydi               |
| **AcademicYearFilter.vue**     | `src/components/dashboard/AcademicYearFilter.vue`         | 2.1 KB | Eskirgan filtr                           |
| **ClassScheduleCell.vue**      | `src/components/education/ClassScheduleCell.vue`          | 3.5 KB | Grid ichida inline ishlatilgan           |
| **sidebarlist.vue**            | `src/components/sidebarlist.vue`                          | 4.2 KB | `Sidebar.vue` bilan almashtirilgan       |
| **KanbanBoard.vue**            | `src/components/common/KanbanBoard.vue`                   | 5.8 KB | `LeadsKanban.vue` o'zi mustaqil yozilgan |
| **FieldDefinitionManager.vue** | `src/components/custom-fields/FieldDefinitionManager.vue` | 4.1 KB | CRM Settings ichida kiritilmagan         |
| **DynamicField.vue**           | `src/components/custom-fields/DynamicField.vue`           | 3.2 KB | Faol emas                                |
| **DynamicFieldsSection.vue**   | `src/components/custom-fields/DynamicFieldsSection.vue`   | 2.8 KB | Faol emas                                |

- **Darajasi:** 🟢 **Low**
- **Tavsiya:** Ushbu 9 ta o'lik komponentni arxivlash yoki xavfsiz o'chirib tashlash, loyiha bundle'ini tozalash.

---

## 8. Ishlatilmayotgan Bog'liqliklar (Unused Dependencies)

Frontend `package.json` da o'rnatilgan, lekin `src/` ichida biror marta ham `import` qilinmagan paketlar:

| Paket Nomi                  | O'rnatilgan Versiya | Haqiqiy Holat                                                                          |
| --------------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| **`flowbite`**              | `^1.4.1`            | **0 marta ishlatilgan**. Loyiha sof Tailwind va o'zining komponentlaridan foydalanadi. |
| **`dropzone-vue`**          | `^0.1.11`           | **0 marta ishlatilgan**. Fayl yuklash native input orqali qilingan.                    |
| **`v-tables-3`**            | `^0.4.7`            | **0 marta ishlatilgan**. Loyiha o'zining `<AppTable>` tizimiga ega.                    |
| **`vee-validate`**          | `^4.15.1`           | **0 marta ishlatilgan**. Loyiha `utils/validators.js` dan foydalanadi.                 |
| **`yup`**                   | `^1.7.1`            | **0 marta ishlatilgan**.                                                               |
| **`chart.js`**              | `^3.7.1`            | **0 marta ishlatilgan**. Loyiha faqat `ApexCharts` dan foydalanadi.                    |
| **`vue-chartjs`**           | `^4.0.2`            | **0 marta ishlatilgan**.                                                               |
| **`vue-perfect-scrollbar`** | `^0.2.1`            | **0 marta ishlatilgan** (Vue 2 uchun mo'ljallangan eski paket).                        |
| **`smooth-scrollbar`**      | `^8.7.4`            | `vue3-perfect-scrollbar` bilan ziddiyatda.                                             |

- **Darajasi:** 🟠 **High** (taxminan **15-20 MB** `node_modules` ortiqcha yuki va build sekinlashuvi).
- **Tavsiya:** `npm uninstall flowbite dropzone-vue v-tables-3 vee-validate yup chart.js vue-chartjs vue-perfect-scrollbar smooth-scrollbar` buyrug'ini bajarish.

---

## 9. API Strukturasidagi Ajralish (Dual-State Architecture)

### Muammo 9.1: Maktab Modulining Ma'lumotlar Bazasidan Uzilib Qolishi

- **Joylashuvi:** `src/views/school/SchoolStudentsView.vue`, `SchoolParentsView.vue`, `SchoolClassesView.vue`, `SchoolDroppedView.vue`
- **Darajasi:** 🔴 **Critical**
- **Tavsifi:**
  - Asosiy tizim sahifalari (`views/students/StudentsList.vue`, `views/groups/GroupsList.vue`) backend NestJS API'ga ulanib, ma'lumotlarni PostgreSQL bazasidan oladi va saqlaydi.
  - Maktab bo'limi esa (`views/school/*`) ma'lumotlarni `src/api/schoolStudentsData.js`, `schoolClassesData.js`, `schoolParentsData.js` fayllaridagi statik massivdan o'qiydi va faqat brauzerning `localStorage`iga saqlaydi.
- **Oqibati:**
  - Agar foydalanuvchi keshni tozalasa yoki boshqa brauzerdan/kompyuterdan kirsa, Maktab modulidagi barcha yangi kiritilgan o'quvchilar va sinflar yo'qoladi!
  - Backend ma'lumotlar bazasida bu o'quvchilar ko'rinmaydi.
- **Tavsiya:** `services.js` ichidagi `studentsApi`, `groupsApi`, `parentsApi` endpointlarini to'liq integratsiya qilib, Maktab modulini ham yagona NestJS REST API'ga ulash.

---

## 10. State Management (Holat Boshqaruvi) Kamchiliklari

### Muammo 10.1: Auth & User Store Mavjud Emasligi

- **Joylashuvi:** `frontend/src/store/`
- **Darajasi:** 🟠 **High**
- **Tavsifi:** Loyihada faqat `tenant.js`, `sidebar.js`, `fullscreen.js` store'lari mavjud. Tizimning eng muhim qismi — foydalanuvchi hisobi, roli, ruxsatnomalari (permissions) va JWT tokeni uchun **markazlashgan Pinia store yo'q**.
- **Oqibati:** Token va user ma'lumotlari to'g'ridan-to'g'ri `localStorage`dan o'qiladi. Foydalanuvchi tizimdan chiqqanda (`logout`) yoki sessiyasi yangilanganda reaktiv sinxronizatsiya yo'qoladi.
- **Tavsiya:** `src/store/auth.js` Pinia store yaratish:
  - `state: { user, token, isAuthenticated, permissions }`
  - `login()`, `logout()`, `refreshToken()` harakatlarini store ichiga jamlash.

### Muammo 10.2: `JSON.parse` Xatoliklarida Tizim Butunlay Qulashi

- **Joylashuvi:** `frontend/src/store/tenant.js` (8-17-qatorlar)
- **Darajasi:** 🟠 **High**
- **Tavsifi:**
  ```javascript
  organization: JSON.parse(localStorage.getItem("organization") || "null");
  ```
  Agar `localStorage`da saqlangan qiymat biror sabab bilan buzulsa (masalan `"undefined"` yoki chala string saqlansa), `JSON.parse` xatolik (`SyntaxError`) tashlab, butun Vue ilovasi oq ekran (White Screen of Death) bo'lib ochilmay qoladi.
- **Tavsiya:** Xavfsiz yordamchi funksiya yaratish:
  ```javascript
  function safeJsonParse(val, fallback) {
    try {
      return JSON.parse(val) || fallback;
    } catch {
      return fallback;
    }
  }
  ```

---

## 11. Nomlash Qoidalari (Naming Conventions) Buzilishi

### Muammo 11.1: Fayllar va Komponentlar Registrining Qorishib Ketishi

- **Joylashuvi:** `src/components/`, `src/views/layouts/`
- **Darajasi:** 🟡 **Medium**
- **Tavsifi:**
  - `modal.vue` — kichik harflarda (to'g'ri standart: `AppModal.vue` yoki `Modal.vue`).
  - `sidebarlist.vue` — kichik harflarda (to'g'ri standart: `SidebarList.vue`).
  - `forgot-password.vue` — kebab-case (yonidagi `Login.vue` va `Register.vue` esa PascalCase).
  - `404.vue`, `500.vue`, `maintenance.vue` — raqamli nomlar.
- **Tavsiya:** Vue rasmiy Style Guide (Priority B) qoidalariga rioya qilgan holda barcha `.vue` komponent nomlarini qat'iy **PascalCase** ga o'tkazish (`Modal.vue`, `SidebarList.vue`, `ForgotPassword.vue`, `NotFoundView.vue`).

---

## 12. TypeScript Yo'qligi va Tip Xavfsizligi

### Muammo 12.1: Frontendda Compile-Time Type Checking Yo'qligi

- **Joylashuvi:** `frontend/` (butun loyiha)
- **Darajasi:** 🟡 **Medium**
- **Tavsifi:** Backend 100% TypeScript'da yozilgan, qat'iy DTO va Prisma modellari mavjud. Frontend esa to'liq oddiy JavaScript (`jsconfig.json`).
- **Oqibati:**
  - Backend API o'zgarsa yoki DTO dagi maydon nomi yangilansa (`login` -> `email`), frontendda buni faqat runtime paytida xato chiqqandagina bilish mumkin.
  - IDE da props va API modellari uchun intellisense/autocomplete to'liq ishlamaydi.
- **Tavsiya:**
  1. Bosqichma-bosqich TypeScript'ni qo'llab-quvvatlash (`vue-tsc`, `@vue/tsconfig`).
  2. Birinchi navbatda API DTO interfeyslari (`types/api.d.ts`) va komponent props tiplarini kiritish.

---

## 13. CSS va Tailwind Tashkiliyoti Muammolari

### Muammo 13.1: CSS Sintaktik Xatosi va Qo'lda Kompilyatsiya Qilinuvchi SCSS

- **Joylashuvi:** `src/assets/tailwind.css` (61-qator), `src/assets/sass/css/eduhub.css`
- **Darajasi:** 🟡 **Medium**
- **Tavsifi:**
  1. `tailwind.css` 61-qatorda: `background-color: "#EEF6FF";` (qo'shtirnoq ichida berilgan, bu noto'g'ri CSS sintaksisi).
  2. `eduhub.css` fayli git'ga qo'shilgan va har gal dasturchi `npm run sass:watch` orqali uni qo'lda yangilab turishi kerak.
- **Tavsiya:**
  1. `background-color: #EEF6FF;` qilib tuzatish.
  2. Webpack konfiguratsiyasida `sass-loader`ni to'g'ri ulab, `.scss` fayllarini avtomatik kompilyatsiya qilinadigan qilish (statik CSS faylini qo'lda yurgizmaslik).

---

## 14. Xavfsizlik Zaifliklari (Security Issues)

### Muammo 14.1: XSS va Tokenlarning `localStorage`da Ochiq Saqlanishi

- **Joylashuvi:** `src/api/client.js`, `src/views/layouts/auth/Login.vue`
- **Darajasi:** 🟠 **High**
- **Tavsifi:** JWT `accessToken` va `refreshToken` brauzerning oddiy `localStorage`ida saqlanadi. Agar saytga uchinchi tomon skripti (CDN, analitika skripti) orqali XSS xuruji uyushtirilsa, barcha tokenlarni o'g'irlash mumkin.
- **Tavsiya:** Refresh tokenni `HttpOnly`, `Secure`, `SameSite=Strict` Cookie orqali saqlash tizimiga o'tish (Backend `auth.controller.ts` allaqachon buni qo'llab-quvvatlashga qodir).

### Muammo 14.2: Rate Limiting Paytida Tizim Bloklanishi

- **Joylashuvi:** `backend/src/auth/auth.controller.ts` (`limit: 5, ttl: 60000`)
- **Darajasi:** 🟡 **Medium**
- **Tavsifi:** Login va Register uchun 1 daqiqada 5 ta so'rov chegarasi qo'yilgan. Bu xavfsizlik uchun yaxshi, ammo ofisda yoki bitta Wi-Fi tarmog'ida bir nechta xodim bir vaqtda kirmoqchi bo'lsa (yoki sahifa qayta-qayta yuklansa), 429 xatosi chiqib bloklanadi.
- **Tavsiya:** Cheklovni IP bo'yicha emas, balki `identifier` (login/telefon) bo'yicha hisoblash yoki limitni rivojlanish davrida 15-20 taga oshirish.

---

## 15. Unumdorlik (Performance & Bundle Size) Muammolari

### Muammo 15.1: Zero Code Splitting (Router Eager Loading)

- **Joylashuvi:** `frontend/src/router/index.js` (4-44-qatorlar)
- **Darajasi:** 🔴 **Critical**
- **Tavsifi:** Barcha 38 ta view komponentlari `import ... from "..."` orqali statik import qilingan.
- **Oqibati:** Foydalanuvchi oddiy Login sahifasiga kirganida ham, butun tizimdagi barcha katta jadvallar, grafiklar va sahifalar bitta ulkan `app.js` fayli bo'lib yuklanadi.
- **Tavsiya:** Barcha yo'nalishlarni dinamik importga (`() => import(...)`) o'tkazish:
  ```javascript
  // Oldin:
  import SchoolStudentsView from "../views/school/SchoolStudentsView.vue";
  // Yangilanish:
  const SchoolStudentsView = () => import("../views/school/SchoolStudentsView.vue");
  ```
  Bu boshlang'ich bundle hajmini **60-70% ga qisqartiradi**!

---

## 16. Monolitik Fayllar va Kod Hidi (Code Smells)

### Muammo 16.1: Gigant 1,000+ Qatorli Monolit Komponentlar

- **Joylashuvi:**
  - `src/views/leads/LeadsKanban.vue` — **2,159 qator**
  - `src/views/settings/CrmSettings.vue` — **1,406 qator**
  - `src/views/school/SchoolParentsView.vue` — **1,263 qator**
  - `src/components/students/StudentWizardModal.vue` — **1,229 qator**
  - `src/views/school/SchoolStudentsView.vue` — **1,209 qator**
- **Darajasi:** 🟠 **High**
- **Tavsifi:** Ushbu fayllar ichida sahifa dizayni, ma'lumotlar ro'yxati, filtrlash mantiqi, tahrirlash modallari, SMS jo'natish formalari, eksport funksiyalari — barchasi bitta fayl ichiga tiqilgan.
- **Tavsiya:** "Single Responsibility Principle" (SRP) bo'yicha bo'laklash:
  - `SchoolStudentsView.vue` -> `StudentsTable.vue`, `StudentFilterBar.vue`, `StudentCreateDrawer.vue`.
  - `LeadsKanban.vue` -> `KanbanColumn.vue`, `LeadCard.vue`, `LeadDetailModal.vue`.

---

## 17. Ustuvor Harakatlar Rejasi (Action Plan)

Ushbu audit natijasida aniqlangan kamchiliklarni bartaraf etish bo'yicha quyidagi bosqichma-bosqich reja tavsiya etiladi:

### 1-Bosqich: Xavfsizlik va Unumdorlikni Zudlik Bilan To'g'rilash (Tezkor G'alaba)

1. [ ] **Code Splitting:** `router/index.js` dagi barcha 38 ta statik importni `() => import(...)` ga o'tkazish.
2. [ ] **Sirli Ma'lumotlarni Tozalash:** `api.config.js` dagi hardcoded admin parolini olib tashlash.
3. [ ] **Ortiqcha Bog'liqliklarni O'chirish:** Ishlatilmayotgan 8 ta paketni (`flowbite`, `dropzone-vue`, `v-tables-3`, `vee-validate`, `yup`, `chart.js`, `vue-chartjs`, `vue-perfect-scrollbar`) `package.json` dan o'chirish.

### 2-Bosqich: Arxitektura va Dual-State Muammosini Hal Qilish

1. [ ] **Yagona API Integratsiyasi:** Maktab modulidagi (`views/school/*`) statik fayllarni real NestJS backend API'lariga ulash.
2. [ ] **Auth Pinia Store:** Markazlashgan `useAuthStore` yaratish va tokenni xavfsiz boshqarish.
3. [ ] **Proxy Komponentlarni Tozalash:** `src/components/` dagi ortiqcha 14 ta shim faylni olib tashlash.

### 3-Bosqich: Kod Tozaligi va Refaktoring

1. [ ] **Formatlash Funksiyalarini Birlashtirish:** Yagona `utils/formatters.js` ga o'tkazish.
2. [ ] **Gigant Komponentlarni Bo'laklash:** `SchoolStudentsView.vue` va `LeadsKanban.vue` ni kichik, qayta ishlatiluvchi modullarga ajratish.
3. [ ] **O'lik Komponentlarni Arxivlash:** Ishlatilmayotgan 9 ta komponentni tozalash.
