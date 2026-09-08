# 🏛 Arxitektura Qaror Hujjati: Room vs Resource (Scheduling Dublikatsiyasi Tahlili)

**Hujjat kodi:** ADR-004 / TASK-E2  
**Holati:** Muhokamada (Under Review)  
**Sana:** 2026-09-03  
**Muallif:** AI Lead Architect  
**Mavzu:** Tizimda mavjud bo'lgan ikkita mustaqil resurs/xona tizimi (`Room` vs `Resource`) o'rtasidagi arxitekturaviy ziddiyatni bartaraf etish bo'yicha strategik qaror.

---

## 1. Muammoning Tavsifi (Context & Problem Statement)

EduHub loyihasining kod bazasida resurslar va jadvallarni boshqarish bo'yicha ikkita parallel va bir-biriga bog'lanmagan mexanizm mavjud:

1. **`Room` tizimi (`backend/src/rooms/` + `model Room`):**
   * Ta'lim (Education) vertikalining tarixiy qismi.
   * `Group.roomId` to'g'ridan-to'g'ri `Room` ga bog'langan.
   * Frontend'da `groupsApi` va `roomsApi` aynan shu tizim orqali dars xonalarini tanlaydi (`GroupsList.vue`).
   * Oddiy tuzilishga ega: faqat `name`, `capacity`, `branchId` va `organizationId`.

2. **`Resource` tizimi (`backend/src/scheduling/` + `model Resource` + `model Schedule`):**
   * Universal ERP Core platformasi uchun loyihalashtirilgan universal resurslar tizimi.
   * `type` (`ROOM`, `VEHICLE`, `EQUIPMENT`, `OTHER`) va `status` (`AVAILABLE`, `IN_USE`, `MAINTENANCE`, `RETIRED`) ga ega.
   * Murakkab `ScheduleService` (konfliktlarni avtomatik aniqlash, takrorlanuvchi slotlar, o'qituvchi va xona bandligini tekshirish) bilan integratsiya qilingan.
   * **Hozirgi muammo:** Hozirgi `Group` va `Lesson` obyektlari amalda `Resource` tizimidan foydalanmaydi (faqat `Lesson.resourceId` satr sifatida saqlanadi, lekin FK bog'lanmagan).

Natijada: Tizimda bir xil jismoniy obyekt (masalan: "302-xona") ham `Room` jadvalida, ham `Resource` jadvalida dublikat bo'lib qolishi yoki ikki alohida API endpoint (`/api/rooms` va `/api/resources`) orqali chalkashlik keltirib chiqarishi mumkin.

---

## 2. Model Maydonlarining Yonma-Yon Solishtiruvi

Quyidagi jadvalda Prisma schemadagi `Room` va `Resource` modellarining barcha maydonlari taqqoslangan:

| Maydon nomi | `Room` Modeli (Education) | `Resource` Modeli (Universal Core) | Tahlil va Moslik |
| :--- | :--- | :--- | :--- |
| **`id`** | `String @id @default(uuid())` | `String @id @default(uuid())` | Bir xil (UUID) |
| **`organizationId`** | `String?` (Cascade relation) | `String?` (Cascade relation) | Bir xil (Multi-tenant) |
| **`branchId`** | `String?` (SetNull relation) | `String?` (SetNull relation) | Bir xil (Branch isolation) |
| **`name`** | `String` | `String` | Bir xil (Resurs/Xona nomi) |
| **`code`** | ❌ Mavjud emas | `String?` | `Resource` da qisqa kod/raqam bor |
| **`type`** | ❌ Faqat xona deb hisoblanadi | `ResourceType @default(ROOM)` | `Resource` 4 ta turni qo'llaydi: `ROOM`, `VEHICLE`, `EQUIPMENT`, `OTHER` |
| **`capacity`** | `Int` (Majburiy) | `Int?` (Ixtiyoriy) | `Room` da sig'im shart, `Resource` da ixtiyoriy |
| **`status`** | ❌ Holat saqlanmaydi | `ResourceStatus @default(AVAILABLE)` | `Resource` ta'mir, faol yoki hisobdan chiqarilgan holatini biladi |
| **`metadata`** | ❌ Mavjud emas | `Json?` | Jihozlar (proyektor, konditsioner, avtomobil raqami) JSONda |
| **`customFields`** | ❌ Mavjud emas | `Json?` | EAV dinamik maydonlari |
| **`deletedAt`** | `DateTime?` | `DateTime?` | Bir xil (Soft delete) |
| **`createdAt` / `updatedAt`** | `DateTime` | `DateTime` | Bir xil (Audit taymlari) |
| **Relatsiyalar (Relations)** | `groups Group[]` | `schedules Schedule[]` | `Room` to'g'ridan-to'g'ri guruhga, `Resource` esa jadvalga ulangan |

---

## 3. Uchta Mumkin Bo'lgan Variant Tahlili

---

### 🔴 VARIANT A: `Resource` ni bekor qilish, faqat `Room` da qolish

Bu variantda `model Resource` va unga bog'liq `backend/src/scheduling/controllers/resources.controller.ts` hamda `services/resources.service.ts` butunlay o'chiriladi. Universal ERP resurslari g'oyasidan voz kechilib, hamma narsa faqat `Room` (Xonalar) sifatida qoldiriladi.

* **O'zgarishi kerak bo'lgan fayllar soni:** **~8-10 ta fayl**
  1. `backend/prisma/schema.prisma` (`model Resource` o'chiriladi, `model Schedule` dagi `resourceId` uziladi yoki `roomId` ga o'zgartiriladi).
  2. `backend/src/scheduling/controllers/resources.controller.ts` (o'chiriladi).
  3. `backend/src/scheduling/services/resources.service.ts` (o'chiriladi).
  4. `backend/src/scheduling/scheduling.module.ts` (importlar tozalanadi).
  5. `backend/src/scheduling/services/schedule.service.ts` (mohiyati o'zgaradi).
  6. `backend/src/scheduling/dto/resource.dto.ts` (o'chiriladi).
  7. `frontend/src/api/services.js` (`resourcesApi` o'chiriladi).
* **Migratsiya xavfi:** **O'rta**
  * Agar `Resource` jadvalida birorta ham test yoki production ma'lumot bo'lmasa, ma'lumot yo'qotish xavfi yo'q.
  * Ammo `Schedule` jadvali `Resource` bilan bog'langan, bu bog'liqlik uziladi.
* **Kamchiliklari (Nega tavsiya etilmaydi):**
  * **Universallik qulashi:** Loyiha faqat ta'lim uchun emas, avtomaktab (`VEHICLE`), sport majmuasi (`EQUIPMENT`, `HALL`), go'zallik saloni yoki ijara uchun kengayishi rejalashtirilgan (`UNIVERSALITY_TEST_REPORT.md`). Avtomaktab avtomashinasi yoki fitnes zali uskunalarini `Room` modeliga solish mantiqsizlikka olib keladi.
  * Rejalashtirilgan universal SaaS arxitekturasi orqaga chekinadi.

---

### 🟡 VARIANT B: `Room` ni to'liq bekor qilib, `Resource` ga birlashtirish (Direct Cutover)

Bu variantda `model Room` va `backend/src/rooms/` butunlay yo'qotiladi. `Group.roomId` maydoni `Group.resourceId` ga aylantiriladi va `Resource` ga foreign key qilinadi. Barcha mavjud xonalar `Resource (type: ROOM)` ga ko'chiriladi.

* **O'zgarishi kerak bo'lgan fayllar soni:** **~16-20 ta fayl**
  1. `backend/prisma/schema.prisma` (`model Room` o'chiriladi, `Group.roomId` -> `Group.resourceId` FK).
  2. `backend/src/rooms/` (butun modul o'chiriladi).
  3. `backend/src/app.module.ts` (`RoomsModule` olib tashlanadi).
  4. `backend/src/groups/dto/group.dto.ts` (`roomId` o'rniga `resourceId` yoki alias).
  5. `backend/src/groups/groups.service.ts` (barcha xona qidirish, kross-filial tekshiruvi va include'lar o'zgaradi).
  6. `backend/src/groups/groups.controller.ts`.
  7. `backend/src/branches/branches.service.ts` (`rooms` o'rniga `resources` count).
  8. `backend/src/roles/roles.service.ts` (ruxsatnomalar nomi).
  9. `frontend/src/api/services.js` (`roomsApi` yo'qotilib, `resourcesApi` ga o'tkaziladi).
  10. `frontend/src/views/groups/GroupsList.vue` (shakllar, selectlar, filtrlash o'zgartiriladi).
* **Migratsiya xavfi:** **YUQORI (HIGH RISK)**
  * **Ma'lumotlar yo'qolishi xavfi:** Production bazada mavjud bo'lgan `Room` ma'lumotlari SQL orqali `Resource` ga to'g'ri o'tkazilmasa, mavjud guruhlarning dars xonalari null bo'lib qoladi.
  * **Frontend buzilishi:** Frontendning bir nechta joylarida `room.name` kutilmoqda. Agar birdan o'zgartirilsa, frontend UI xatoliklarga uchraydi.
  * **Orqaga qaytish (Rollback) qiyinligi:** O'zgarishlar hajmi katta bo'lgani sababli bitta xato butun tizimni to'xtatib qo'yishi mumkin.

---

### 🟢 VARIANT C: Evolyutsion Gibrid Yondashuv (Compatibility Adapter / Unified Backend)

Ikkala modelni bir zumda sindirmasdan, **Core Resourceni yagona haqiqat manbai (Single Source of Truth)** qilib belgilash, `Room` API'sini esa `Resource (type: 'ROOM')` ga yo'naltirilgan **yengil adapter (Facade)** sifatida saqlab qolish.

* **Konsepsiya:**
  1. Ma'lumotlar bazasida `Room` modeli vaqtincha saqlanadi yoki `Room` jadvaliga yozilgan ma'lumot bir vaqtning o'zida `Resource (type: 'ROOM')` bilan sinxronlashadi.
  2. `Group.roomId` o'z o'rnida qoladi, lekin yangi yaratilayotgan `Schedule` yozuvlariga ham uning mos `Resource` id'si avtomatik ulanadi.
  3. Frontend va mavjud guruhlar uchun hech qanday breaking change bo'lmaydi: `roomsApi` va `Group.roomId` odatdagidek ishlayveradi.
  4. Yangi vertikallar (Avtomaktab mashinalari, uskunalar, konferens zallar) to'g'ridan-to'g'ri `resourcesApi` orqali ishlaydi.
* **O'zgarishi kerak bo'lgan fayllar soni:** **0 ta (Hozircha o'zgarishsiz qoldirish) yoki faqat 2-3 ta servis.**
* **Migratsiya xavfi:** **NOL (ZERO RISK)**
  * Hech qanday jadval o'chirilmaydi.
  * Mavjud darslar va guruhlar o'z xonalarini yo'qotmaydi.
  * Frontendda birorta ham sahifa buzilmaydi.

---

## 4. Yakuniy Tavsiya va Baholash (Architectural Verdict)

### 🏆 TAVSIYA: **VARIANT C (Bosqichma-bosqich Evolyutsiya)**

Nima uchun Variant C tavsiya etiladi?

1. **Biznes uzluksizligi:** Hozirgi paytda ta'lim markazlari `Group` va `Room` bog'liqligi asosida real ishlayapti. Uni bitta PR yoki bitta sprintda keskin o'chirish ishlab turgan ta'lim jarayonini xavf ostiga qo'yadi.
2. **Kelajakka yo'l:** EduHub 78% universallikka ega bo'lib, avtomaktab va servis markazlarini qo'llab-quvvatlashi kerak. `Resource` tizimi bunga to'liq javob beradi. Uni o'chirish xato.
3. **Texnik qarzni yopish strategiyasi:**
   * **1-Bosqich (Hozirgi holat):** Hech narsaga tegilmaydi. Kod bazasi barqaror ishlaydi.
   * **2-Bosqich (Keyingi reja):** `rooms.service.ts` ichida yangi xona yaratilganda, orqa fonda `Resource (type: 'ROOM')` ni ham yaratish (Data synchronization).
   * **3-Bosqich (Yakuniy tozalash):** Barcha tizimlar to'liq `Schedule` va `Resource` ga moslashgandan keyin, sokinlik bilan bitta rejalashtirilgan migratsiya orqali `Room` ni arxivlash.

---

## 5. Taqqoslash Xulosasi

| Ko'rsatkich | Variant A (Faqat Room) | Variant B (Darhol Resource) | Variant C (Evolyutsion / Tavsiya) |
| :--- | :---: | :---: | :---: |
| **Xavf darajasi** | O'rta | Yuqori | **Minimal (Xavfsiz)** |
| **O'zgaradigan fayllar** | ~10 ta | ~20 ta | **0 ta (hozir) / 3 ta (keyin)** |
| **Universallikni saqlash** | ❌ Yo'qotiladi | 🟢 Saqlanadi | 🟢 Saqlanadi |
| **Mavjud ma'lumotlar xavfsizligi** | ⚠️ Schedule uziladi | ⚠️ Xavf ostida | 🟢 **100% Xavfsiz** |
| **Frontendga ta'siri** | ❌ Katta | ❌ Katta | 🟢 **Hech qanday o'zgarishsiz** |

---
*Ushbu hujjat jamoa muhokamasi va tasdig'i uchun tayyorlandi.*
