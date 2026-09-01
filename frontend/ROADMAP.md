# EduCRM - O'zbekiston O'quv Markazlari Uchun CRM Tizimi

Ushbu hujjat o'quv markazlari (Language schools, IT akademiyalar, o'quv markazlar) uchun maxsus ishlab chiqiladigan EduCRM tizimining to'liq yo'l xaritasi, arxitekturasi va bajariladigan bosqichlarini belgilaydi.

---

## 🏗 Texnologik Stek

* **Backend:** NestJS (Node.js framework), TypeScript
* **Database:** PostgreSQL (WSL / Ubuntu) + Prisma ORM
* **Frontend:** Vue.js 3 (Composition API), Tailwind CSS, Pinia, Vue Router
* **Autentifikatsiya:** JWT (JSON Web Tokens), Role-Based Access Control (RBAC)
* **Tashqi Integratsiyalar (Mahalliy):**
  * **SMS:** Eskiz.uz / PlayMobile API
  * **To'lovlar:** Payme, Click, Uzum Pay
  * **Bot:** Telegram Bot API (Ota-onalar, o'qituvchilar va o'quvchilar uchun)

---

## 📋 Bosqichlar va Modullar

### 🏁 1-Faza: MVP (Dastlabki Ishchi Versiya)
Ushbu bosqichda o'quv markazining kundalik eng muhim jarayonlari avtomatlashtiriladi:

1. **Autentifikatsiya & Foydalanuvchilar (Auth & RBAC):**
   * Login, profil, parolni tiklash.
   * Rollar: Super Admin, Filial Menejeri, O'qituvchi, Kassir/Administrator, O'quvchi.
2. **Kurslar va Guruhlar (Courses & Groups):**
   * Kurslar (nomi, narxi, davomiyligi, dars soni).
   * Guruhlar (kunlari: Juft/Toq/Har kuni, vaqtlari, xonasi, o'qituvchisi).
   * Xonalar va dars jadvali boshqaruvi.
3. **O'quvchilar Boshqaruvi (Students):**
   * O'quvchilarni ro'yxatga olish (F.I.SH, telefon, ota-ona ma'lumotlari, manzili).
   * O'quvchini guruhga biriktirish, ko'chirish yoki muzlatish (freeze).
   * O'quvchi balansi va qarzdorlik holati.
4. **Davomat Tizimi (Attendance):**
   * Guruh bo'yicha kunlik davomat olish (Keldi, Kelmadi, Sababli, Kechikdi).
   * O'qituvchi va administrator uchun oson belgilash interfeysi.
5. **Moliya & Kassa (Payments & Finance Basic):**
   * Naqd pul, karta va o'tkazma orqali to'lov qabul qilish.
   * Kvitansiya/Chek shakllantirish.
   * Qarzdorlar ro'yxati va to'lov hisobotlari.

---

### 🚀 2-Faza: Sotuvlar va Lidlar (CRM Marketing & Leads)
1. **Lidlar Voronkasi (Kanban Pipeline):**
   * Yangi murojaat -> Bog'lanildi -> Sinov darsiga yozildi -> Sinov darsiga keldi -> To'lov qildi (Guruhga qo'shildi) -> Rad etildi.
2. **Manbalar tahlili (UTM / Reklama kanallari):**
   * Instagram, Telegram, Banner, Do'st tavsiyasi va boshqalar.

---

### 📲 3-Faza: O'zbekiston Mahalliy Integratsiyalari
1. **SMS Xabarnomalar (Eskiz.uz):**
   * Yangi o'quvchi ro'yxatdan o'tganda xush kelibsiz xabari.
   * To'lov qabul qilinganda SMS chek.
   * Qarzdorlik eslatmalari (oyning ma'lum sanasida avtomatik).
   * Darsga kelmaganida ota-onaga avtomatik SMS.
2. **To'lov Agregatorlari (Click / Payme / Uzum Pay):**
   * Onlayn to'lov havolasi (Invoicing).
   * To'lov o'tganda balansni avtomatik to'ldirish.
3. **Telegram Bot:**
   * Ota-onalar uchun: farzandining davomati, baholari va to'lov holati.
   * O'qituvchilar uchun: kunlik dars jadvali va davomat olish.

---

### 📊 4-Faza: Kengaytirilgan Boshqaruv & Filiallar
1. **Filiallar (Multi-branch):**
   * Bitta tizimda bir nechta filialni alohida va umumiy boshqarish.
2. **O'qituvchilar Maoshi (Payroll / KPI):**
   * Foizli stavka (% har bir o'quvchidan), soatbay yoki qat'iy maosh hisoblash.
3. **Chuqur Analitika va Hisobotlar:**
   * LTV (Mijozning umumiy qiymati), Churn rate (O'qishni tashlab ketganlar).
   * O'qituvchilar samaradorligi reytingi.

---

## 🎯 Hozirgi Harakatlar Rejasi (Next Steps)
1. NestJS backend loyihasi `educrm/backend` papkasida.
2. PostgreSQL (Ubuntu WSL) bilan ulanish (Prisma ORM).
3. Vue 3 frontend loyihasi `educrm/crm` papkasida.
