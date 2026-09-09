# EduHub ERP — Scheduling Model Texnik Auditi: Guruh Darsi vs 1:1 Qabul (Appointment)

> **Hujjat:** `docs/SCHEDULING_MODEL_AUDIT.md`  
> **Maqsad:** Ta'lim tizimidagi "Guruh darsi" (`Schedule.groupId`) va Klinika/Xizmat ko'rsatish sohasidagi "1:1 Appointment" (Shifokor qabuli / `Schedule.studentId`) modellarining mavjud holatini kod darajasida (fayl:qator) audit qilish va model ajratish (split) bo'yicha aniq arxitekturaviy xulosa berish.  
> **Holati:** Yakunlangan (Faqat audit, kodga o'zgartirish kiritilmagan).

---

## 1. Kirish va Kontekst

Hozirgi `backend/prisma/schema.prisma` dagi `Schedule` modelida ham guruh darsiga (`groupId`), ham individual shaxsga (`studentId`) tegishli ustunlar bitta jadvalda jamlangan. Sirtmoqdan qaraganda, bu ikkisi "bitta universal jadval"dek ko'rinadi.

Ushbu audit kod satrlariga tayangan holda 5 ta asosiy mezon bo'yicha bu modelning haqiqiy imkoniyatlari va cheklovlarini tekshiradi.

---

## 2. 5 Ta Asosiy Mezon Bo'yicha Audit Natijalari

### 1-Mezon: `detectConflicts()` va Ish Vaqti (Working Hours) Chegarasi

- **Tahlil qilingan kod:**
  - [`backend/src/scheduling/services/schedule.service.ts#L15-L87`](file:///home/ruswer/Documents/erp-own/erp/backend/src/scheduling/services/schedule.service.ts#L15-L87)
- **Koddagi fakt:**
  `detectConflicts()` funksiyasi o'qituvchi/mutaxassis bandligini tekshirish uchun faqatgina quyidagi so'rovni bajaradi:
  ```typescript
  // backend/src/scheduling/services/schedule.service.ts:57-66
  const instructorConflict = await this.prisma.schedule.findFirst({
    where: {
      organizationId: params.orgId,
      deletedAt: null,
      instructorId: params.instructorId,
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      ...excludeWhere,
      ...branchWhere,
    },
    ...
  });
  ```
- **Topilma:**
  1. `detectConflicts()` faqat va faqat mavjud `Schedule` jadvallaridagi boshqa yozuvlar bilan to'qnashuvni tekshiradi.
  2. **Ish vaqti (Working Hours/Shifts) umuman yo'q:** Butun `schema.prisma` da (`backend/prisma/schema.prisma`) va backend servislarida xodim yoki shifokorning ish vaqti (masalan, 09:00 - 18:00, tushlik 13:00 - 14:00, qabul kunlari: dushanba-juma) saqlanadigan **hech qanday jadval yoki ustun mavjud emas**.
  3. **Oqibat:** Shifokorni yarim tunda (soat 03:00 da) yoki uning dam olish kunida ham qabulga yozib qo'yish mumkin, tizim bunga hech qanday e'tiroz bildirmaydi (chunki soat 03:00 da boshqa schedule yozuvi yo'q).

---

### 2-Mezon: Guruh Darsi (Haftalik) va 1:1 Qabulning `detectConflicts()` orqali Birgalikda Ishlashi

- **Tahlil qilingan kod:**
  - [`backend/src/scheduling/services/schedule.service.ts#L222-L262`](file:///home/ruswer/Documents/erp-own/erp/backend/src/scheduling/services/schedule.service.ts#L222-L262)
  - [`backend/prisma/schema.prisma#L81-L86`](file:///home/ruswer/Documents/erp-own/erp/backend/prisma/schema.prisma#L81-L86) (`enum RecurrenceType { NONE, DAILY, WEEKLY, CUSTOM }`)
- **Koddagi fakt:**
  1. Guruh darsi `recurrence: WEEKLY` sifatida yaratilganda, backend bazada **faqat bitta yozuv** hosil qiladi ([`schedule.service.ts#L241-L262`](file:///home/ruswer/Documents/erp-own/erp/backend/src/scheduling/services/schedule.service.ts#L241-L262)):
     ```typescript
     // startAt: 2026-09-07T10:00:00Z, endAt: 2026-09-07T11:30:00Z, recurrence: 'WEEKLY'
     ```
  2. Tizimda kelgusi haftalar yoki oylar uchun takrorlanuvchi yozuvlarni generatsiya qiluvchi (cron generator yoki dynamic recurrence expansion) **hech qanday mexanizm yo'q**.
  3. `detectConflicts()` faqat so'rovda yuborilgan sana bo'yicha aniq `startAt` va `endAt` oralig'ini qidiradi ([`schedule.service.ts#L62-L63`](file:///home/ruswer/Documents/erp-own/erp/backend/src/scheduling/services/schedule.service.ts#L62-L63)).
- **Topilma va Kritik Bo'shliq:**
  - Agar shifokor/o'qituvchining har dushanba 10:00 da guruh darsi bo'lsa (yozuv sanasi: `2026-09-07`), bemor keyingi dushanbaga (`2026-09-14`) soat 10:00 da 1:1 appointmentga yozilsa, `detectConflicts` `2026-09-14` sanasida hech qanday yozuv topmaydi va **to'qnashuvni sezmay qoladi**!
  - Natija: `recurrence !== NONE` bo'lganda, `detectConflicts()` amalda **yaroqsiz holga keladi**.

---

### 3-Mezon: `recurrenceRule` (Json) Formati va Foydalanilishi

- **Tahlil qilingan kod:**
  - [`backend/prisma/schema.prisma#L928`](file:///home/ruswer/Documents/erp-own/erp/backend/prisma/schema.prisma#L928) (`recurrenceRule Json?`)
  - [`backend/src/scheduling/dto/schedule.dto.ts#L42`](file:///home/ruswer/Documents/erp-own/erp/backend/src/scheduling/dto/schedule.dto.ts#L42) (`recurrenceRule?: Record<string, unknown>`)
  - [`backend/src/scheduling/services/schedule.service.ts#L254`](file:///home/ruswer/Documents/erp-own/erp/backend/src/scheduling/services/schedule.service.ts#L254)
- **Koddagi fakt:**
  1. Backendda `recurrenceRule` shunchaki xom JSON ko'rinishida saqlanadi (`JSON.parse(JSON.stringify(data.recurrenceRule))`).
  2. Butun backend va frontend kodbazasida `recurrenceRule` ni o'qiydigan, tahlil qiladigan yoki iCalendar RRULE formatida ishlatadigan **bitta ham kod satri yo'q** (Frontendda 0 ta natija).
  3. Bir martalik appointment (1:1 qabul) uchun bu maydon umuman ma'noga ega emas va har doim `null` qoladi.

---

### 4-Mezon: Frontend UI dagi Taxminlar (Group vs Individual)

- **Tahlil qilingan kod:**
  - [`frontend/src/views/education/ScheduleView.vue#L20-L100`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/views/education/ScheduleView.vue#L20-L100)
  - [`frontend/src/views/education/ClassScheduleView.vue#L145-L192`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/views/education/ClassScheduleView.vue#L145-L192)
  - [`frontend/src/views/calendar/CalendarView.vue`](file:///home/ruswer/Documents/erp-own/erp/frontend/src/views/calendar/CalendarView.vue)
- **Koddagi fakt:**
  1. `frontend/src/views/calendar/CalendarView.vue` — Bu umumiy tadbirlar va vazifalar (events & tasks) ro'yxati, `Schedule` backend API'siga umuman bog'lanmagan.
  2. `frontend/src/views/education/ScheduleView.vue` va `ClassScheduleView.vue`:
     - **100% Ta'limga moslashtirilgan:** Tablar: "Sinflar bo'yicha", "Darajalar bo'yicha", "O'qituvchilar bo'yicha", "Xonalar bo'yicha".
     - **Choraklar va Paralar:** Vaqt kataklari 45 daqiqalik maktab paralariga bo'lingan (`08:00 - 08:45`, `08:50 - 09:35`).
     - **Har doim N o'quvchi bor deb qaraladi:** Katakcha bosilganda ochiladigan `ClassLessonDetailModal` butun sinf o'quvchilari ro'yxatini chiqarib, davomat (Attendance) olishga mo'ljallangan.
  3. **Klinika/Xizmat ko'rinishi mavjud emas:** Shifokor jadvali (kunlik vaqt shkalasi, 15-30 daqiqalik erkin/band slotlar, bitta bemor ismi, qabul maqsadi) frontendda **mavjud emas**.

---

### 5-Mezon: Bekor Qilish / Ko'chirish (Cancel / Reschedule) Workflow

- **Tahlil qilingan kod:**
  - [`backend/src/scheduling/services/schedule.service.ts#L277-L364`](file:///home/ruswer/Documents/erp-own/erp/backend/src/scheduling/services/schedule.service.ts#L277-L364)
  - [`backend/prisma/schema.prisma#L909-L937`](file:///home/ruswer/Documents/erp-own/erp/backend/prisma/schema.prisma#L909-L937)
- **Koddagi fakt:**
  1. **Lifecycle Status umuman yo'q:** `Schedule` modelida hech qanday `status` ustuni yo'q!
     - Masalan: `SCHEDULED`, `CONFIRMED`, `ARRIVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW` kabi qabul bosqichlari mavjud emas.
  2. Ko'chirish faqat `update({ startAt, endAt })` orqali qilinadi (qayta ko'chirish sababi yoki tarixi saqlanmaydi).
  3. Bekor qilish faqat `remove()` orqali amalga oshiriladi va u yozuvni shunchaki `deletedAt: new Date()` qilib yashirib qo'yadi.
  4. **Klinika uchun mos emas:** Shifokor qabuli bekor qilinganda sababi (`cancellationReason`), kim bekor qilgani (`cancelledBy`), kechikish yoki kelmaslik (`NO_SHOW`) hisobi yuritilishi shart. Yozuvni shunchaki o'chirib yuborish klinikada tahliliy hisobotlarni buzadi.

---

## 3. Taqqoslash Jadvali: Guruh Darsi vs 1:1 Qabul (Appointment)

| Xususiyat                 | Guruh Darsi (Education Timetable)       | 1:1 Qabul (Clinic / Service Appointment)                   | Hozirgi `Schedule` holati                                 |
| :------------------------ | :-------------------------------------- | :--------------------------------------------------------- | :-------------------------------------------------------- |
| **Ishtirokchilar**        | 1 O'qituvchi — N O'quvchi (Guruh)       | 1 Shifokor/Usta — 1 Bemor/Mijoz                            | Ikkalasi ham bor (`groupId`, `studentId`)                 |
| **Vaqt strukturasi**      | Haftalik takrorlanuvchi, 45-90 min dars | Slot-based (15/30/60 min), bir martalik                    | `startAt`/`endAt` bor, lekin slot tushunchasi yo'q        |
| **Takrorlanish**          | Doimiy (3-9 oy davomida har hafta)      | Odatda bir martalik yoki alohida qayta qabul               | `recurrence: WEEKLY` bor, lekin generatsiya yo'q          |
| **Status Workflow**       | O'tkazildi / O'tkazilmadi               | Rejalashtirildi → Keldi → Jarayonda → Yakunlandi / Kelmadi | **Umuman yo'q (`status` ustuni mavjud emas)**             |
| **Xodim ish grafigi**     | Dars jadvali orqali belgilanadi         | Shifokorning ish vaqti va tanaffusiga bog'liq              | **Umuman yo'q (Ish vaqti tekshirilmaydi)**                |
| **Bog'liq xizmat/to'lov** | Guruh oylik to'lovi / shartnoma         | Ko'rsatilgan xizmat/muolaja cheki (POS/Kassa)              | To'g'ridan-to'g'ri xizmat (`ProductService`) bog'lanmagan |

---

## 4. Arxitekturaviy Xulosa va Aniq Tavsiya

### 🎯 ANIQ JAVOB: Model Darajasida SPLIT (Ajratish) KERAKMI?

> **JAVOB: HA, MODEL DARAJASIDA SPLIT KERAK.**

Hozirgi `Schedule` modeliga sun'iy ravishda 15 ta yangi ustun (`status`, `cancelReason`, `serviceId`, `price`, `paymentStatus`, `complaint`, `diagnosisNotes`) tiqish — uni "katta botqoq" (God Model) ga aylantiradi va mavjud Education dars jadvalini buzadi.

### 🏗️ Tavsiya Etiladigan Yechim Arxitekturasi:

Klinika va Xizmat ko'rsatish sohalarini to'g'ri integratsiya qilish uchun **3 ta aniq qatlam** kerak:

#### 1. Core Resource & Shift Layer (Umumiy Qatlam)

- **`Resource` (Mavjud):** Xonalar (`ROOM`), kabinetlar, tibbiy uskunalar.
- **`StaffWorkingHours` (Yangi yengil model yoki konfiguratsiya):** Xodimning ish kunlari va soatlari (masalan: Dr. Karimov, Dush-Juma 09:00 - 17:00).
- Bu qatlam ham Ta'limga, ham Klinikaga birdek xizmat qiladi.

#### 2. Education Timetable (Ta'lim uchun mavjud model)

- `Group` + `Lesson` + `Schedule` — Guruh darslari, choraklar, paralar va jurnallar uchun o'z o'rnida qoladi.

#### 3. Service Appointment Engine (Klinika va Xizmat uchun `Appointment` modeli)

- **Yangi model:** `Appointment`
  - `id`, `organizationId`, `branchId`
  - `clientId` (`studentId` — barqaror ID)
  - `specialistId` (`instructorId`)
  - `resourceId` (Kabinet/Xona)
  - `serviceId` (`ProductService` — muolaja yoki xizmat)
  - `startAt`, `endAt`
  - `status`: `SCHEDULED`, `CONFIRMED`, `ARRIVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
  - `cancelReason`: String?
  - `notes`: String?
- **Validatsiya:** `detectConflicts()` shifokorning `StaffWorkingHours` va boshqa `Appointment` yozuvlariga qarab bo'sh slotlarni (Time Slots) avtomatik hisoblab beradi.

---

## 5. Keyingi Qadam (B2 Implementatsiyasi uchun tavsiya)

B2 bosqichida butun bazani qayta qurish shart emas:

1. `backend`: `Appointment` modeli va uning slot-based konflikt tekshiruvi (`AppointmentService`);
2. `backend`: Shifokor/Xodim ish vaqti (`workingHours`) sozlamasi;
3. `frontend`: Klinika/Xizmat uchun toza, zamonaviy **Appointment Calendar / Slot Picker** komponenti.
