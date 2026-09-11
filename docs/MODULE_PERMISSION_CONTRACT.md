# EduHub ERP — Backend/Frontend Modul va Ruxsat Shartnomasi (MODULE_PERMISSION_CONTRACT.md)

> **Yagona Haqiqat Manbai (Single Source of Truth)**  
> **Status:** 🔒 QAT'IY KELISHUV (FROZEN SPECIFICATION)  
> **Sana:** 2026-09-09  
> **Mualliflar:** Backend & Frontend Architecture Teams  
> **Muvofiqlik:** AGENTS.md, NestJS Controllers, Prisma Schema, Vue 3 Core

---

## 📌 1. Maqsad va Shartnoma Qoidasi

Ushbu shartnoma **Backend (NestJS + Prisma)** va **Frontend (Vue 3 + Pinia)** o'rtasidagi barcha **Modul ID'lari** va **Ruxsat (Permission) Kodlari**ning yagona rasmiy standartini belgilaydi.

### Asosiy Qoidalar:

1. **Frontend yangi modul ID'lari yoki yangi ruxsat formatlarini o'ylab topishi qat'iyan taqiqlanadi.**
2. Backend'da mavjud bo'lgan ID va formatlar 1:1 aynan ishlatiladi.
3. Keyingi barcha bosqichlar (PROMPT 1 — PROMPT 5 va undan keyingi fazalar) ushbu shartnomaga to'liq bo'ysunadi.
4. Ushbu shartnoma ishlab turgan tizim (production kod)ni o'zgartirmasdan, backend kodlarining real auditi asosida tuzilgan.

---

## 📦 2. Rasmiy Modul ID'lari Ro'yxati (Canonical Module IDs)

Backend'da modullar `UPPERCASE` formatdagi string sifatida saqlanadi va tekshiriladi (`SystemConfig.enabledModules`, `@RequireModule(...)`, `ModuleGuard`).

| Modul ID (Canonical) | Modul Nomi                 | Kategoriya      | Backend Decorator Namunasi     | Tavsif                                                    |
| -------------------- | -------------------------- | --------------- | ------------------------------ | --------------------------------------------------------- |
| **`STUDENTS`**       | O'quvchilar va Mijozlar    | `CORE`          | `@RequireModule('STUDENTS')`   | O'quvchilar bazasi, profillar, ota-onalar va shartnomalar |
| **`GROUPS`**         | Sinflar va Guruhlar        | `CORE`          | `@RequireModule('GROUPS')`     | Guruhlar, sinflar, xona biriktirish va dars jadvallari    |
| **`COURSES`**        | Kurslar va Fanlar          | `CORE`          | `@RequireModule('COURSES')`    | Kurslar, akademik fanlar, ta'lim narxlari                 |
| **`ATTENDANCE`**     | Davomat va Jurnal          | `ACADEMIC`      | `@RequireModule('ATTENDANCE')` | Dars davomati, sababli/sababsiz dars qoldirish, baholash  |
| **`FINANCE`**        | Moliya va Kassa            | `FINANCE`       | `@RequireModule('FINANCE')`    | Kassalar, xarajatlar, hisob-fakturalar, moliyaviy KPI     |
| **`PAYMENTS`**       | To'lovlar va Kvitansiyalar | `FINANCE`       | `@RequireModule('PAYMENTS')`   | To'lovlarni qabul qilish, qaytarish (refund), kvitansiya  |
| **`LEADS`**          | Lidlar va CRM Voronka      | `CRM`           | `@RequireModule('LEADS')`      | Yangi murojaatlar, Kanban doskasi, sotuv voronkasi        |
| **`SMS`**            | SMS va Xabarnomalar        | `COMMUNICATION` | `@RequireModule('SMS')`        | Eskiz SMS shlyuzi, Telegram, tizim bildirishnomalari      |
| **`SCHEDULING`**     | Resurslar va Jadval        | `OPERATIONS`    | `@RequireModule('ROOMS')`      | Xonalar bandligi, vaqtlar to'qnashuvi nazorati            |
| **`WORKFLOW`**       | Avtomatlashtirish          | `AUTOMATION`    | `@RequireModule('WORKFLOW')`   | Avtomatik qoidalar, triggler va xabarnoma zanjirlari      |
| **`CONTRACTS`**      | Shartnomalar Moduli        | `LEGAL`         | `@RequireModule('CONTRACTS')`  | Talaba/ota-ona bilan ikki tomonlama o'quv shartnomalari   |
| **`SERVICES`**       | Qo'shimcha Xizmatlar       | `OPERATIONS`    | `@RequireModule('SERVICES')`   | Oshxona (canteen), maktab transporti (avtobus)            |
| **`CLASSES`**        | Maktab Sinflari            | `CORE`          | `@RequireModule('CLASSES')`    | Xususiy maktab 1-11 sinflari va sinf rahbarlari           |

---

## 🔤 3. Modul ID'larini Standartlashtirish (Normalization Rule)

Backend va frontend o'rtasida katta-kichik harflar tufayli nomuvofiqlik kelib chiqmasligi uchun quyidagi yagona qoida qat'iy qo'llaniladi:

### Normalizatsiya Funksiyasi:

```typescript
/**
 * Modul identifikatorini backend standarti (UPPERCASE)ga keltiradi.
 * Misol: 'students' -> 'STUDENTS', ' attendance ' -> 'ATTENDANCE'
 */
export function normalizeModuleId(id: string): string {
  return String(id || "")
    .trim()
    .toUpperCase();
}
```

- **Frontend Module Registry:** Barcha ichki kalitlar faqat `UPPERCASE` ko'rinishda saqlanadi:
  ```typescript
  // TO'G'RI:
  moduleRegistry.isEnabled("ATTENDANCE");
  moduleRegistry.isEnabled("FINANCE");

  // QAT'IYAN TAQIQLANADI:
  moduleRegistry.isEnabled("attendance"); // XATO
  ```

---

## 🔑 4. Rasmiy Ruxsat Kodlari Ro'yxati (Canonical Permission Codes)

Backend'dagi `@RequirePermissions(...)`, `RolesService.seedDefaultPermissions()` va `PermissionsGuard` da ishlatiladigan **barcha 34 ta ruxsat kodlarining to'liq ro'yxati**:

### Format Qoidasi:

Ruxsat kodlari **kichik harflarda, nuqta bilan ajratilgan** ko'rinishda bo'ladi:  
`[modul_yoki_resurs].[harakat]`

| #      | Ruxsat Kodi (`code`) | Modul           | Tavsif                                          | Backend Controller Ishlatilishi             |
| ------ | -------------------- | --------------- | ----------------------------------------------- | ------------------------------------------- |
| **1**  | `students.view`      | `STUDENTS`      | O'quvchilar ro'yxati va profilini ko'rish       | `@RequirePermissions('students.view')`      |
| **2**  | `students.create`    | `STUDENTS`      | Yangi o'quvchi qo'shish                         | `@RequirePermissions('students.create')`    |
| **3**  | `students.update`    | `STUDENTS`      | O'quvchi ma'lumotlarini tahrirlash              | `@RequirePermissions('students.update')`    |
| **4**  | `students.delete`    | `STUDENTS`      | O'quvchini arxivlash yoki o'chirish             | `@RequirePermissions('students.delete')`    |
| **5**  | `students.export`    | `STUDENTS`      | O'quvchilar ma'lumotlarini Excel/PDF ga yuklash | `@RequirePermissions('students.export')`    |
| **6**  | `groups.view`        | `GROUPS`        | Guruhlar/sinflar ro'yxatini ko'rish             | `@RequirePermissions('groups.view')`        |
| **7**  | `groups.create`      | `GROUPS`        | Yangi guruh ochish                              | `@RequirePermissions('groups.create')`      |
| **8**  | `groups.update`      | `GROUPS`        | Guruh ma'lumotlari va jadvalini tahrirlash      | `@RequirePermissions('groups.update')`      |
| **9**  | `groups.delete`      | `GROUPS`        | Guruhni yopish yoki o'chirish                   | `@RequirePermissions('groups.delete')`      |
| **10** | `courses.view`       | `COURSES`       | Kurslar va fanlar ro'yxatini ko'rish            | `@RequirePermissions('courses.view')`       |
| **11** | `courses.create`     | `COURSES`       | Yangi kurs yoki fan qo'shish                    | `@RequirePermissions('courses.create')`     |
| **12** | `courses.update`     | `COURSES`       | Kurs parametrlari va narxini o'zgartirish       | `@RequirePermissions('courses.update')`     |
| **13** | `courses.delete`     | `COURSES`       | Kursni o'chirish                                | `@RequirePermissions('courses.delete')`     |
| **14** | `payments.view`      | `FINANCE`       | To'lovlar ro'yxati va statistikasini ko'rish    | `@RequirePermissions('payments.view')`      |
| **15** | `payments.create`    | `FINANCE`       | Yangi to'lov qabul qilish va kassa kirimi       | `@RequirePermissions('payments.create')`    |
| **16** | `payments.refund`    | `FINANCE`       | To'lovni bekor qilish yoki pulni qaytarish      | `@RequirePermissions('payments.refund')`    |
| **17** | `payments.delete`    | `FINANCE`       | To'lov yozuvini tizimdan o'chirish (Void)       | `@RequirePermissions('payments.delete')`    |
| **18** | `attendance.view`    | `ATTENDANCE`    | Davomat jurnali va statistikani ko'rish         | `@RequirePermissions('attendance.view')`    |
| **19** | `attendance.create`  | `ATTENDANCE`    | Kunlik davomatni belgilash                      | `@RequirePermissions('attendance.create')`  |
| **20** | `attendance.update`  | `ATTENDANCE`    | O'tgan kunlar davomatini o'zgartirish           | `@RequirePermissions('attendance.update')`  |
| **21** | `leads.view`         | `CRM`           | Lidlar va CRM Kanban doskasini ko'rish          | `@RequirePermissions('leads.view')`         |
| **22** | `leads.create`       | `CRM`           | Yangi lid arizasini kiritish                    | `@RequirePermissions('leads.create')`       |
| **23** | `leads.update`       | `CRM`           | Lid bosqichini surish va tahrirlash             | `@RequirePermissions('leads.update')`       |
| **24** | `leads.delete`       | `CRM`           | Noto'g'ri lidni o'chirish                       | `@RequirePermissions('leads.delete')`       |
| **25** | `crm.view`           | `CRM`           | Mijozlar, vazifalar va eslatmalarni ko'rish     | `@RequirePermissions('crm.view')`           |
| **26** | `crm.create`         | `CRM`           | Yangi CRM obyektlari va vazifalarni ochish      | `@RequirePermissions('crm.create')`         |
| **27** | `crm.update`         | `CRM`           | CRM obyektlarini o'zgartirish                   | `@RequirePermissions('crm.update')`         |
| **28** | `crm.delete`         | `CRM`           | CRM obyektlarini o'chirish                      | `@RequirePermissions('crm.delete')`         |
| **29** | `crm.pipelines`      | `CRM`           | Voronkalar va bosqichlarni sozlash              | `@RequirePermissions('crm.pipelines')`      |
| **30** | `crm.convert`        | `CRM`           | Lidni haqiqiy talaba/mijozga aylantirish        | `@RequirePermissions('crm.convert')`        |
| **31** | `branches.view`      | `BRANCHES`      | Filiallar ro'yxatini ko'rish                    | `@RequirePermissions('branches.view')`      |
| **32** | `branches.create`    | `BRANCHES`      | Yangi filial ochish va sozlash                  | `@RequirePermissions('branches.create')`    |
| **33** | `rooms.manage`       | `RESOURCES`     | Xonalar va moddiy resurslarni boshqarish        | `@RequirePermissions('rooms.manage')`       |
| **34** | `reports.view`       | `REPORTS`       | Boshqaruv hisobotlari va dashboardni ko'rish    | `@RequirePermissions('reports.view')`       |
| **35** | `notifications.view` | `NOTIFICATIONS` | Tizim xabarnomalarini ko'rish                   | `@RequirePermissions('notifications.view')` |
| **36** | `settings.manage`    | `SETTINGS`      | Tizim, tashkilot va rollarni boshqarish         | `@RequirePermissions('settings.manage')`    |

---

## 🛡️ 5. Wildcard va Rol Darajalari Matritsasi (Built-in Role Hierarchy)

Backend `PermissionsGuard` da o'rnatilgan standart huquqlar taqsimoti:

### Wildcard Qoidalari:

- `*` — Barcha modullar va barcha amallarga to'liq huquq beradi (`SUPER_ADMIN`, `ADMIN`).
- `[modul].*` — Shu modulning barcha amallariga ruxsat beradi (masalan, `students.*` $\rightarrow$ `view`, `create`, `update`, `delete`, `export`).

### Standart Rollar Ruxsati (Fallback Matrix):

```typescript
const defaultRolePerms = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["*"],
  BRANCH_MANAGER: [
    "students.*",
    "groups.*",
    "courses.*",
    "attendance.*",
    "payments.*",
    "leads.*",
    "crm.*",
    "rooms.*",
    "reports.view",
    "branches.view",
    "notifications.view",
  ],
  MANAGER: [
    "students.view",
    "students.create",
    "students.update",
    "groups.view",
    "courses.view",
    "attendance.view",
    "leads.view",
    "leads.create",
    "leads.update",
    "crm.view",
    "crm.create",
    "crm.update",
    "crm.convert",
    "payments.view",
    "payments.create",
    "reports.view",
    "rooms.manage",
    "notifications.view",
  ],
  TEACHER: [
    "groups.view",
    "attendance.view",
    "attendance.create",
    "students.view",
    "courses.view",
    "notifications.view",
  ],
  CASHIER: [
    "payments.view",
    "payments.create",
    "students.view",
    "groups.view",
    "reports.view",
    "notifications.view",
  ],
  STUDENT: ["students.view", "groups.view", "attendance.view", "notifications.view"],
};
```

---

## 🔌 6. Frontend Core Integratsiya Shartnomasi (PROMPT 2-5 Ko'rsatmalari)

Frontend arxitekturasi ushbu shartnomani quyidagi nuqtalarda to'g'ridan-to'g'ri ishlatadi:

### 1. Module Registry (`src/core/modules/` — PROMPT 2):

- Modul ID'si faqat `STUDENTS`, `ATTENDANCE`, `FINANCE` kabi canonical ID bo'lishi shart.
- `moduleRegistry.isEnabled(id)` chaqirilganda `normalizeModuleId(id)` orqali tekshiriladi.
- `GET /setup/status` dan keluvchi `enabledModules` massivi `tenantStore` da saqlanadi.

### 2. Dinamik Sidebar (`src/core/navigation/` — PROMPT 3):

- Sidebar elementi tegishli `moduleId` ga bog'lanadi:
  ```typescript
  {
    id: 'attendance-nav',
    moduleId: 'ATTENDANCE', // <-- Shartnomadagi ID
    label: 'Davomat',
    path: '/attendance',
    permission: 'attendance.view' // <-- Shartnomadagi kod
  }
  ```

### 3. Dinamik Router Guard (`src/core/router/` — PROMPT 4):

- Marshrutlar `meta` obyektida canonical qiymatlar ko'rsatiladi:
  ```typescript
  {
    path: '/attendance',
    component: AttendanceView,
    meta: {
      moduleId: 'ATTENDANCE',       // <-- Shartnomadagi ID
      permission: 'attendance.view' // <-- Shartnomadagi kod
    }
  }
  ```

### 4. Permission Adapter (`src/core/security/` — PROMPT 5):

- Yangi ruxsat formatlari yozilmaydi.
- Komponentlarda faqat shartnomada belgilangan kodlar chaqiriladi:
  ```html
  <AppButton v-if="hasPermission('students.create')">O'quvchi qo'shish</AppButton>
  <AppButton v-if="hasPermission('payments.refund')" variant="danger">Qaytarish</AppButton>
  ```

---

## 🚦 7. Shartnoma Statusi va Kafolat

Ushbu hujjat backend manbalaridan (`backend/src/setup/setup.service.ts`, `backend/src/roles/roles.service.ts`, `backend/src/auth/permissions.guard.ts`, `backend/src/auth/module.guard.ts`) to'liq sinovdan o'tkazilib tasdiqlangan.

Kelgusi barcha promptlar (PROMPT 1 dan PROMPT 5 gacha) ushbu fayldagi ID va kodlarni **o'zgartirmasdan, 1:1 formatda** ishlatishi shart.
