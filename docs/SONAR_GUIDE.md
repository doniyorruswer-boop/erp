# EduHub ERP — SonarQube Sifat Nazorati va Kodni Birlashtirish Bo'yicha Qo'llanma (SONAR_GUIDE.md)

Ushbu qo'llanma EduHub ERP dasturchilari va arxitektorlari uchun tayyorlangan bo'lib, loyihada **SonarQube** orqali kod sifatini tekshirish, 5 ta sifat o'lchamini nazorat qilish va yangi kodni asosiy tarmoqlarga (`develop`, `main`) birlashtirishdan (Merge / Pull Request) oldin bajarilishi majburiy bo'lgan amallarni belgilaydi.

---

## 🎯 1. Kirish va Maqsad

EduHub ERP — ta'lim muassasalari va o'quv markazlarining moliyaviy, akademik va operatsion ma'lumotlarini boshqaruvchi korporativ tizimdir.
Kod bazasining xavfsizligi, unumdorligi va masshtabliligi (`scalability`) quyidagi asosiy tamoyillarga tayanadi:

- **Nol Xavfsizlik Zaifligi:** Moliyaviy va shaxsiy ma'lumotlar ochiq qolmasligi shart.
- **Nazorat qilinadigan Texnik Qarz:** Har bir yangi xususiyat `AGENTS.md` mezonlariga mos kelishi kerak.
- **Avtomatlashtirilgan Sifat Darvozasi (Quality Gate):** Sifat mezonlaridan o'tmagan kod aslo ishlab chiqarishga (Production) kiritilmaydi.

---

## 🔬 2. SonarQube 5 Asosiy Sifat O'lchami (5 Quality Dimensions)

`sonar-project.properties` faylida quyidagi 5 yo'nalish bo'yicha qat'iy tekshiruvlar sozlangan:

### 1. Takroriy Kodlarni Aniqlash (Duplicated Code Detection - CPD)

- **Qoida:** Minimal 50 token va 10 qatordan ortiq takrorlanishlar aniqlanadi.
- **Nega xavfli?** Bir xil biznes mantiq bir necha joyda nusxalansa, keyinchalik xatolikni tuzatish yoki o'zgartirish kiritish paytida barcha nusxalar yangilanmay qoladi va tizimda nomutanosiblik kelib chiqadi.
- **Qanday tuzatiladi?**
  - UI takrorlanishlari ➔ `frontend/src/components/common/` dagi umumiy komponentga ajratiladi.
  - Filtrlash, saralash, hisob-kitob takrorlanishlari ➔ `frontend/src/composables/` ga o'tkaziladi.
  - Yordamchi metodlar ➔ `frontend/src/utils/` yoki `backend/src/common/` ga ko'chiriladi.
- **Cheklov:** Yangi kodda dublikatsiya darajasi **< 3.0%** bo'lishi shart.

---

### 2. Kod Hidlari va Qo'llab-quvvatlanuvchanlik (Code Smells & Maintainability)

- **Qoida:** Tizimda o'lik kodlar, keraksiz o'zgaruvchilar, ortiqcha bog'liqliklar va gigant komponentlar bo'lmasligi kerak.
- **`AGENTS.md` bilan uyg'unlik:**
  - Maksimal komponent hajmi: **250 qator**.
  - Maksimal funksiya hajmi: **40 qator**.
- **Texnik qarz me'yori:** Technical Debt Ratio **< 5%** (Maintainability Rating: **A**).

---

### 3. Xatolar va Ishonchlilik (Bugs & Reliability)

- **Qoida:** Potensial runtime qulashlariga sabab bo'ladigan holatlar (Null Pointer, undefined maydonlarga murojaat qilish, unhandled Promise rejection, cheksiz rekursiyalar).
- **Qanday tuzatiladi?**
  - TypeScript'dagi `strict: true` imkoniyatlaridan foydalanish, majburiy Null/Undefined tekshiruvlari va Type Narrowing qo'llash.
- **Cheklov:** Yangi kodda **0 ta Bug** bo'lishi shart (Reliability Rating: **A**).

---

### 4. Xavfsizlik Zaifliklari (Vulnerabilities & Security Hotspots)

- **Qoida:** OWASP Top 10 talablari bo'yicha SQL Injection, XSS (Cross-Site Scripting), zaif kriptografiya va ochiq qoldirilgan parollar/tokenlar.
- **Qat'iy taqiq:**
  - Kod ichida aslo ochiq parollar, API kalitlar yoki JWT sirlari (`hardcoded secrets`) yozilmaydi (`.env` orqali olinadi).
  - `localStorage` ga xom obyektlar yozilmaydi, faqat xavfsiz `safeJsonParse` ishlatiladi.
- **Cheklov:** **0 ta Zaiflik** (Security Rating: **A**), Security Hotspots **100%** ko'rib chiqilgan bo'lishi kerak.

---

### 5. Murakkablik Tahlili (Cognitive & Cyclomatic Complexity)

- **Qoida:** Kognitiv murakkablik (kodni inson miyasi qanchalik qiyin tushunishi) bitta funksiya uchun **<= 15** bo'lishi belgilangan (`sonar.typescript.cognitiveComplexity.threshold=15`).
- **Qanday kamaytiriladi?**
  - Qat-qat `if-else` lar o'rniga **Guard Clause (Early Return)** qo'llash.
  - Murakkab shartlarni kichik nomli predikat funksiyalarga ajratish.
  - Katta `switch-case` larni Dictionary / Lookup Object ga o'tkazish.

---

## 💻 3. Lokal Muhitda SonarQube'ni Ishga Tushirish

Dasturchilar kodni masofaviy serverga yuborishdan oldin o'z kompyuterlarida tahlilni ishga tushirishlari mumkin.

### A. Docker orqali SonarQube konteynerini ko'tarish:

```bash
docker run -d \
  --name eduhub-sonarqube \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  sonarqube:community
```

- Brauzerda oching: `http://localhost:9000`
- Boshlang'ich login/parol: `admin` / `admin` (tizim yangi parol so'raydi).
- Administrator panelidan yangi token oling: `My Account` ➔ `Security` ➔ `Generate Token`.

### B. Unit testlarni Coverage bilan ishga tushirish:

SonarQube kod qamrovini (Code Coverage) ko'rishi uchun LCOV fayli generatsiya qilinishi lozim:

```bash
# Backend unit testlar coverage hisoboti
npm --prefix backend run test:cov
```

_(Natijada `backend/coverage/lcov.info` hosil bo'ladi)_

### C. SonarScanner orqali tahlilni boshlash:

Loyihaning ildiz papkasida turib:

```bash
npx sonar-scanner \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=SIZNING_SONAR_TOKENINGIZ
```

_Tahlil yakunlangach, konsolda batafsil hisobot havolasi paydo bo'ladi (masalan: `http://localhost:9000/dashboard?id=eduhub-erp`)._

---

## 🚦 4. Kod Birlashtirishdan Oldingi Majburiy Checklist (Pre-Merge Quality Checklist)

Har qanday dasturchi o'z branch'ini `develop` yoki `main` tarmog'iga birlashtirishdan (Merge) yoki Pull Request (PR) ochishdan oldin quyidagi **6 ta qadamni ketma-ketlikda bajarishi shart**:

```
┌───────────────────────────────────────────────────────────┐
│              PRE-MERGE QUALITY GATE PIPELINE              │
├─────────┬───────────────────────────────────┬─────────────┤
│ 1-Qadam │ TypeScript Typecheck              │ 0 xatolik   │
│ 2-Qadam │ ESLint & Prettier Linting         │ 0 xatolik   │
│ 3-Qadam │ Unit & Integration Tests (Jest)   │ 100% yashil │
│ 4-Qadam │ Dead Code & Dependencies (Knip)   │ Toza        │
│ 5-Qadam │ Playwright E2E Tests              │ 100% yashil │
│ 6-Qadam │ SonarQube Quality Gate            │ PASSED      │
└─────────┴───────────────────────────────────┴─────────────┘
```

### 1-Qadam: Qat'iy TypeScript Tekshiruvi

```bash
npm --prefix backend run typecheck
```

- **Kutilayotgan natija:** 0 ta xatolik (`tsc --noEmit` toza o'tishi).

### 2-Qadam: ESLint & Prettier Sifat Tekshiruvi

```bash
npm --prefix frontend run lint
```

- **Kutilayotgan natija:** 0 ta xatolik, 0 ta ogohlantirish.
- _Maslahat:_ Agar formatlashda xatolik bo'lsa, `npm --prefix frontend run lint:fix` orqali to'g'rilang.

### 3-Qadam: Backend Unit Testlar va Coverage

```bash
npm --prefix backend run test:cov
```

- **Kutilayotgan natija:** Barcha 14 ta test to'plami yashil o'tishi va `backend/coverage/lcov.info` yangilanishi.

### 4-Qadam: O'lik Kodlar va Paketlar Nazorati

```bash
npm --prefix frontend run analyze
```

- **Kutilayotgan natija:** Yangi kiritilgan fayllar yoki eksportlar foydalanilmasdan unutilib ketmaganligini tasdiqlash.

### 5-Qadam: Playwright E2E Brauzer Testlari

```bash
npm --prefix frontend run test:e2e
```

- **Kutilayotgan natija:** Barcha 6 ta kritik biznes jarayon (Login, Moliya, O'quvchilar ro'yxati) yashil o'tishi.

### 6-Qadam: SonarQube Quality Gate Statusini Tekshirish

Agar PR ochilgan bo'lsa yoki lokal skan qilingan bo'lsa, SonarQube ko'rsatkichi **PASSED** bo'lishi shart:

- **Coverage:** >= 80%
- **Duplications:** <= 3.0%
- **Bugs:** 0 ta
- **Vulnerabilities:** 0 ta
- **Code Smells (Blocker/Critical):** 0 ta

---

## 🛠️ 5. Xatoliklarni Bartaraf Etish Bo'yicha Amaliy Qo'llanma

### Misol 1: Kognitiv Murakkablikni Kamaytirish (Cognitive Complexity Fix)

❌ **Noto'g'ri (Kognitiv murakkablik = 18):**

```typescript
function calculateDiscount(user, course, isEarlyBird) {
  let discount = 0;
  if (user) {
    if (user.role === "STUDENT") {
      if (course && course.price > 1000000) {
        if (isEarlyBird) {
          discount = 20;
        } else {
          discount = 10;
        }
      } else {
        discount = 5;
      }
    }
  }
  return discount;
}
```

✅ **To'g'ri (Guard Clause orqali Kognitiv murakkablik = 3):**

```typescript
function calculateDiscount(user, course, isEarlyBird): number {
  if (!user || user.role !== "STUDENT") return 0;
  if (!course || course.price <= 1000000) return 5;
  return isEarlyBird ? 20 : 10;
}
```

---

### Misol 2: Takroriy Kodni Composable'ga Ajratish (Duplication Fix)

❌ **Noto'g'ri:** Ikkita alohida view faylida (`SchoolStudentsView.vue` va `EmployeesList.vue`) bir xil matn qidiruvi va saralash kodini nusxalab yozish.

✅ **To'g'ri:** `AGENTS.md` ga muvofiq, umumiy `useTableFilter` composable'idan foydalanish:

```typescript
import { useTableFilter } from "@/composables/useTableFilter";

const { filteredItems, searchQuery } = useTableFilter(studentsList, {
  searchFields: ["fullName", "phone"],
});
```

---

## 🤖 6. CI/CD Pipeline (GitHub Actions) Integratsiyasi

Har bir Pull Request avtomatik ravishda GitHub Actions orqali tekshiriladi (`.github/workflows/ci.yml`):

1. Testlar va coverage avtomatik yig'iladi.
2. SonarQube skaneri ishga tushadi.
3. Agar SonarQube holati `FAILED` bo'lsa, **"Merge" tugmasi avtomatik bloklanadi**.

Dasturchi faqatgina Quality Gate mezonlariga to'liq javob bergandagina kod bazaga qo'shilishi kafolatlanadi.
