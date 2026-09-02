# PHASE 10.3 — EDUCATION DTOs & API CONTRACTS REPORT

## 1. Project Inspection
* **Framework:** NestJS v10 with TypeScript and `@nestjs/swagger`.
* **Validation Engine:** `class-validator` & `class-transformer` configured globally via `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
* **Tenant Security:** Enforced strictly via `@CurrentTenant()` decorator retrieving `organizationId` from authenticated JWT (`request.user.organizationId`). Header/query/body fallback is completely disabled.
* **Branch Security:** Handled via `@CurrentBranch()` and verified through `assertBranchAccess` / `buildBranchWhere`.
* **Database Models (Phase 10.2 Foundation):** `Student`, `Parent`, `StudentParent` (M:N junction), `Course`, `Group`, `GroupEnrollment`, `Lesson`, `Attendance`, `Exam`, `Grade`, `Contract`, and `Payment`.

---

## 2. Existing DTO Architecture
* DTOs use class-based definitions with validation decorators (`@IsString`, `@IsNotEmpty`, `@IsOptional`, `@IsEnum`, `@IsNumber`, `@Min`, `@Max`, `@IsDateString`, `@IsArray`, `@ValidateNested`).
* Update DTOs extend `PartialType(CreateXDto)` from `@nestjs/swagger` avoiding boilerplate duplication while maintaining strict validation.
* Base pagination is extracted into a reusable `PaginationDto` (`page`, `limit`, `search`, `sortBy`, `sortOrder`).

---

## 3. DTOs Created & Updated

| DTO | Module / File | Purpose | Key Validated Fields | Excluded Server Fields |
| :--- | :--- | :--- | :--- | :--- |
| **`CreateStudentDto`** | `src/students/dto/student.dto.ts` | Talaba yaratish | `firstName`, `lastName`, `phone`, `email`, `birthDate`, `gender`, `status`, `level`, `studyDays`, `studyLanguages`, `passportNumber`, `pinfl`, `address`, `parentName`, `parentPhone`, `parentEmail`, `initialGroupId`, `branchId` | `organizationId`, `balance`, `createdAt`, `updatedAt`, `deletedAt` |
| **`UpdateStudentDto`** | `src/students/dto/student.dto.ts` | Talabani tahrirlash | Barcha `CreateStudentDto` maydonlari ixtiyoriy (`PartialType`) | `organizationId`, `balance`, `deletedAt` |
| **`QueryStudentDto`** | `src/students/dto/student.dto.ts` | Talabalar ro'yxati filtrlari | `search`, `status`, `groupId`, `branchId`, `level`, `page`, `limit`, `sortBy`, `sortOrder` | Audit maydonlari |
| **`CreateParentDto`** | `src/students/dto/parent.dto.ts` | Ota-ona / vasiy profili | `fullName`, `phone`, `relationship`, `isPrimary` | `organizationId`, `studentId` (junction orqali), `deletedAt` |
| **`UpdateParentDto`** | `src/students/dto/parent.dto.ts` | Ota-ona ma'lumotlarini yangilash | `fullName?`, `phone?`, `relationship?`, `isPrimary?` | `organizationId`, `deletedAt` |
| **`LinkStudentParentDto`** | `src/students/dto/parent.dto.ts` | Talaba va Ota-onani bog'lash (M:N) | `studentId`, `parentId`, `relationship`, `isPrimary` | `organizationId`, `id` |
| **`CreateCourseDto`** | `src/courses/dto/course.dto.ts` | Kurs yaratish | `name`, `description`, `price` (>=0), `duration` (>=1), `lessonCount` (>=1), `isActive`, `customFields` | `organizationId`, `deletedAt` |
| **`UpdateCourseDto`** | `src/courses/dto/course.dto.ts` | Kursni yangilash | `PartialType(CreateCourseDto)` | `organizationId`, `deletedAt` |
| **`QueryCourseDto`** | `src/courses/dto/course.dto.ts` | Kurslar qidiruv va filtri | `search`, `isActive`, `page`, `limit`, `sortBy`, `sortOrder` | N/A |
| **`CreateGroupDto`** | `src/groups/dto/group.dto.ts` | Guruh ochish | `name`, `courseId`, `branchId`, `teacherId`, `roomId`, `days` (`LessonDays`), `startTime`, `endTime`, `startDate`, `endDate`, `status` | `organizationId`, `deletedAt` |
| **`UpdateGroupDto`** | `src/groups/dto/group.dto.ts` | Guruhni tahrirlash | `PartialType(CreateGroupDto)` | `organizationId`, `deletedAt` |
| **`QueryGroupDto`** | `src/groups/dto/group.dto.ts` | Guruhlar ro'yxati filtrlari | `courseId`, `teacherId`, `branchId`, `roomId`, `status`, `days`, `search`, pagination | N/A |
| **`CreateGroupEnrollmentDto`** | `src/groups/dto/enrollment.dto.ts` | Talabani guruhga biriktirish | `groupId`, `studentId`, `joinedAt`, `isActive` | `organizationId`, `id` |
| **`CreateLessonDto`** | `src/attendance/dto/lesson.dto.ts` | Dars rejasi yaratish | `groupId`, `title`, `date`, `startTime`, `endTime`, `room`, `topic`, `homework`, `status` | `organizationId`, `id` |
| **`UpdateLessonDto`** | `src/attendance/dto/lesson.dto.ts` | Darsni tahrirlash | `PartialType(CreateLessonDto)` | `organizationId`, `id` |
| **`MarkAttendanceDto`** | `src/attendance/dto/attendance.dto.ts` | Guruh davomatini saqlash | `groupId`, `date`, `lessonId`, `records: [{ studentId, status, comment }]` | `organizationId`, `branchId` |
| **`SingleAttendanceDto`** | `src/attendance/dto/attendance.dto.ts` | Yakka davomat qo'yish | `groupId`, `studentId`, `lessonId`, `date`, `status`, `comment` | `organizationId` |
| **`CreateExamDto`** | `src/groups/dto/exam.dto.ts` | Imtihon e'lon qilish | `groupId`, `title`, `date`, `maxScore` (>=0) | `organizationId`, `deletedAt` |
| **`RecordGradesDto`** | `src/groups/dto/exam.dto.ts` | Guruh baholarini qayd etish | `examId`, `lessonId`, `date`, `grades: [{ studentId, score, feedback }]` | `organizationId` |
| **`CreateContractDto`** | `src/students/dto/contract.dto.ts` | Ta'lim shartnomasi rasmiylashtirish | `studentId`, `contractNumber?`, `totalAmount` (>=0), `discountAmount` (>=0), `startDate`, `endDate`, `status`, `notes` | `organizationId`, `id` |
| **`CreatePaymentDto`** | `src/payments/dto/payment.dto.ts` | To'lov kiritish (Core Finance) | `studentId`, `customerId`, `invoiceId`, `cashboxId`, `contractId`, `branchId`, `amount` (>0), `method`, `category`, `paymentDate`, `notes` | `organizationId`, `status`, `receiptNumber`, `receivedById`, `voidedAt` |

---

## 4. Validation Rules
* **Strict Types:** `@IsString()`, `@IsNumber()`, `@IsInt()`, `@IsBoolean()`, `@IsDateString()`, `@IsEmail()`.
* **String Constraints:** `@MaxLength()` chegaralari xatoliklar va DoS hujumlaridan himoyalash uchun kiritilgan.
* **Positive Financial Constraints:** Narx, shartnoma summasi, to'lov va chegirmalar `@Min(0)` yoki `@Min(0.01)` bilan cheklangan.
* **Enum Enforcement:** `StudentStatus`, `GroupStatus`, `LessonDays`, `AttendanceStatus`, `PaymentMethod`, `PaymentCategory` to'g'ridan-to'g'ri `@IsEnum()` orqali tekshiriladi.
* **Nested Collections:** `@ValidateNested({ each: true })` va `Type(() => ItemDto)` orqali massiv elementlari (davomat yozuvlari, baholar) chuqur tekshiriladi.

---

## 5. Query / Pagination Contracts
* Yangi `PaginationDto` (`src/common/dto/pagination.dto.ts`) yaratildi:
  * `page`: minimal 1, default 1.
  * `limit`: minimal 1, maksimal 100, default 20.
  * `search`: ixtiyoriy matnli qidiruv.
  * `sortBy` & `sortOrder`: `asc` | `desc` xavfsiz saralash.
* Barcha query DTOlar (`QueryStudentDto`, `QueryCourseDto`, `QueryGroupDto`, `QueryContractDto`, `QueryPaymentDto`, `QueryExamDto`, `QueryGradeDto`) `PaginationDto` dan meros oladi.

---

## 6. Response Contracts
* DTO qatlamida faqat mijozdan keluvchi va mijozga qaytuvchi ma'lumotlar shartnomasi belgilangan.
* Parollar, hashlar, ichki server holatlari yoki boshqa tenantlarning ma'lumotlari DTO orqali ochiqlanmaydi.

---

## 7. Tenant Security
* **Mijozdan `organizationId` yoki `tenantId` QABUL QILINMAYDI:** Barcha DTOlardan `organizationId` butunlay chiqarib tashlangan.
* **Mass Assignment Blokirovkasi:** Agar so'rov tanasida (body) tajovuzkor `organizationId`, `tenantId`, `role` yoki `createdAt` yuborsa, NestJS `ValidationPipe` (`forbidNonWhitelisted: true`) so'rovni darhol `400 Bad Request` bilan rad etadi.
* **Majburiy Servis Parametrlari:** Barcha ta'lim servislari `orgId: string` (non-optional) parametri bilan ishlaydi.

---

## 8. Branch Security
* `branchId` DTOda ixtiyoriy tanlov sifatida mavjud, biroq u mustaqil vakolat beruvchi maydon hisoblanmaydi.
* Branch konteksti `@CurrentBranch()` va `assertBranchAccess` / `buildBranchWhere` orqali foydalanuvchining tashkilotdagi biriktirilgan filiallariga qat'iy solishtiriladi.

---

## 9. Mass Assignment Protection
* `main.ts` dagi `ValidationPipe` sozlamalari:
  ```typescript
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  ```
* Barcha noma'lum yoki ruxsat etilmagan maydonlar so'rov boshidanoq filtrlanadi va rad etiladi.

---

## 10. Payment / Finance Integration
* `Payment` modeli alohida ta'lim uchun duplikat qilinmadi — Core Finance'dagi `CreatePaymentDto` ishlatiladi.
* Ta'limga tegishli to'lovlar `studentId`, `contractId`, `invoiceId` orqali Core Finance bilan uzluksiz bog'lanadi.
* Moliyaviy balanslar (`Student.balance`, `Cashbox.balance`) DTO orqali to'g'ridan-to'g'ri o'zgartirilishi qat'iyan taqiqlangan.

---

## 11. Swagger / OpenAPI
* Barcha DTO maydonlariga `@ApiProperty()` va `@ApiPropertyOptional()` annotatsiyalari qo'shildi (`description`, `example`, `enum`, `default`, `minimum`, `maximum`).
* Swagger OpenAPI hujjatlari (`/api/docs`) avtomatik tarzda to'liq va aniq shakllanadi.

---

## 12. Security Tests

| № | Attack Vector / Test Case | Kutilgan Natija | Haqiqiy Natija | Holati |
| :---: | :--- | :---: | :---: | :---: |
| **1** | `Valid CreateStudentDto (Normal)` | Validatsiya muvaffaqiyatli | Qabul qilindi | ✅ PASS |
| **2** | `organizationId` injection in `CreateStudentDto` | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **3** | `tenantId` injection in `CreateStudentDto` | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **4** | `role` injection (`SUPER_ADMIN`) in `CreateStudentDto` | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **5** | `createdAt` & `deletedAt` injection in `CreateStudentDto` | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **6** | Noto'g'ri formatdagi Email (`email: "not-an-email"`) | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **7** | Noto'g'ri formatdagi Tug'ilgan sana (`birthDate`) | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **8** | Mavjud bo'lmagan StudentStatus Enum qiymati | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **9** | Manfiy kurs narxi (`price: -50000`) | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **10**| Noto'g'ri kurs davomiyligi (`duration: 0`) | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **11**| Noto'g'ri dars kunlari (`days: "INVALID_DAYS"`) | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **12**| Manfiy to'lov miqdori (`amount: -100`) | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **13**| Manfiy shartnoma summasi (`totalAmount: -1000`) | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **14**| Manfiy maksimal imtihon bali (`maxScore: -10`) | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **15**| Majburiy maydonlari yo'q ota-ona (`fullName` va `phone`siz) | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **16**| `LinkStudentParentDto` to'g'ri juftlik | Validatsiya muvaffaqiyatli | Qabul qilindi | ✅ PASS |
| **17**| Noto'g'ri davomat holati enum qiymati | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |
| **18**| `CreatePaymentDto` ichiga `receivedById` va `receiptNumber` inyeksiya | 400 Bad Request / Rejected | Rad etildi | ✅ PASS |

**Natija:** 18 ta xavfsizlik testidan 18 tasi muvaffaqiyatli o'tdi (100% PASS).

---

## 13. Typecheck
* Buyruq: `npx tsc --noEmit`
* Natija: **0 errors (Exit code: 0)** ✅

---

## 14. Build
* Buyruq: `nest build`
* Natija: **Muvaffaqiyatli yakunlandi (Exit code: 0)** ✅

---

## 15. Tests
* DTO Validatsiya va Injection sinovlari to'liq o'tkazildi (**18/18 PASS**).

---

## 16. Files Created
1. `src/common/dto/pagination.dto.ts` — Umumiy sahifalash va tartiblash shartnomasi.
2. `src/students/dto/parent.dto.ts` — Ota-onalar va `StudentParent` M:N bog'lanish DTOlari.
3. `src/students/dto/contract.dto.ts` — Ta'lim shartnomalari DTOlari.
4. `src/groups/dto/enrollment.dto.ts` — Guruhga a'zolik DTOlari.
5. `src/attendance/dto/lesson.dto.ts` — Darslar va jadvallar DTOlari.
6. `src/groups/dto/exam.dto.ts` — Imtihonlar va baholash DTOlari.

---

## 17. Files Modified
1. `src/students/dto/student.dto.ts` — Strict validatsiya, Swagger annotatsiyalari, `balance` chiqarib tashlandi, `PaginationDto` ulandi.
2. `src/courses/dto/course.dto.ts` — Swagger annotatsiyalari, Decimal xavfsiz narx validatsiyasi, `PaginationDto` ulandi.
3. `src/groups/dto/group.dto.ts` — To'liq validatsiya, `LessonDays` va `GroupStatus` tekshiruvi, Swagger annotatsiyalari.
4. `src/attendance/dto/attendance.dto.ts` — Davomat massivlari (`records`), `SingleAttendanceDto`, `QueryMonthlyAttendanceDto` qo'shildi.
5. `src/payments/dto/payment.dto.ts` — To'lovlar uchun qat'iy tekshiruvlar, server maydonlari bloklandi, `PaginationDto` ulandi.

---

## 18. Files Deleted
* Hech qanday mavjud fayl o'chirilmadi.

---

## 19. Problems Found
* `UpdateStudentDto` ichida `balance?: number` maydoni mavjud edi. Bu mijozga to'g'ridan-to'g'ri o'z balansini soxtalashtirish xavfini tug'dirar edi. Ushbu maydon DTOdan chiqarib tashlandi — balans faqat kassa va to'lov tranzaksiyalari orqali atomik o'zgartiriladi.

---

## 20. Architecture Risks
* **Xavf:** DTOlar ichiga biznes mantiq yoki baza so'rovlarini kiritish vasvasasi.
* **Yechim:** DTOlar faqat sintaksis va ma'lumotlar shaklini tekshiradi. Tashkilot va filial egaligi, biznes qoidalar va cheklovlar keyingi bosqichda Service qatlamida amalga oshiriladi.

---

## 21. Recommendations
* Phase 10.4 (Service & Controller Implementation) bosqichida barcha Controller metodlarida `@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)` va `@CurrentTenant() orgId: string` qat'iy talab qilinishi lozim.

---

## 22. Final Verification
* [x] Barcha Education input DTOlari qat'iy va to'liq
* [x] `organizationId` va `tenantId` inputlari butunlay yo'qotilgan
* [x] Audit maydonlari (`createdAt`, `deletedAt`) qabul qilinmaydi
* [x] Server nazoratidagi maydonlar (`balance`, `receiptNumber`, `receivedById`) bloklangan
* [x] Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) to'liq saqlangan
* [x] Umumiy `PaginationDto` yaratildi va qayta ishlatildi
* [x] Pul maydonlari Decimal bilan mos holatda xavfsiz tekshiriladi
* [x] DTOlar ichida hech qanday baza so'rovi yoki biznes mantiq yo'q
* [x] Barcha ta'lim servislari uchun `orgId: string` majburiy
* [x] `CurrentTenant` dekoratori qat'iy (fallbacklarsiz) ishlaydi
* [x] Typecheck xatosiz o'tdi (0 errors)
* [x] NestJS Build xatosiz o'tdi (0 errors)
* [x] Xavfsizlik inyeksiya testlari 100% muvaffaqiyatli o'tdi

---

```text
========================================================================
STATUS: PHASE 10.3 — PASS ✅
========================================================================
```
