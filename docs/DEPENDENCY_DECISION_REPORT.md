# EduHub ERP — Bog'liqliklar (Dependencies) Bo'yicha Qarorlar Hisoboti

**Hujjat Maqsadi:** `frontend/package.json` faylida mavjud bo'lgan, Knip tomonidan to'liq yoki qisman ishlatilmayotgan deb aniqlangan barcha npm paketlarni tahlil qilish va har biri bo'yicha aniq arxitekturaviy qaror qabul qilish.

---

## 📊 Umumiy Ko'rib Chiqish

| Paket                   |  Versiya   |         Toifa         |        Qaror         |                 Harakat                 |
| :---------------------- | :--------: | :-------------------: | :------------------: | :-------------------------------------: |
| **`vee-validate`**      | `^4.15.1`  | Asosiy (Dependencies) | **KEEP & INTEGRATE** |       `src/validation/` ga ulash        |
| **`yup`**               |  `^1.7.1`  | Asosiy (Dependencies) | **KEEP & INTEGRATE** |         Sxemalarni kengaytirish         |
| **`validator`**         | `^13.9.0`  | Asosiy (Dependencies) |      **REMOVE**      |        `npm uninstall validator`        |
| **`lodash`**            | `^4.17.21` | Asosiy (Dependencies) |      **REMOVE**      |         `npm uninstall lodash`          |
| **`perfect-scrollbar`** |  `^1.5.5`  | Asosiy (Dependencies) |      **REMOVE**      |    `npm uninstall perfect-scrollbar`    |
| **`core-js`**           |  `^3.8.3`  | Asosiy (Dependencies) | **KEEP & DOCUMENT**  | Babel/Webpack polyfill sifatida saqlash |
| **`@storybook/blocks`** | `^8.6.14`  | Dev (devDependencies) | **KEEP & DOCUMENT**  |        Storybook 8 uchun saqlash        |
| **`@vue/cli-plugin-*`** |  `~5.0.0`  | Dev (devDependencies) | **KEEP & DOCUMENT**  |         Build tizimi plaginlari         |

---

## 🔍 Har Bir Paket Bo'yicha Chuqur Tahlil

### 1. `vee-validate`

- **Package:** `vee-validate` (`^4.15.1`)
- **Current status:** O'rnatilgan, biroq to'g'ridan-to'g'ri import qilinmagan.
- **Why installed:** Vue 3 formalarini validatsiya qilish (reaktiv form state, field-level error messages, submit nazorati).
- **Current usage:** Hozirgi formalar sodda qo'lda yozilgan `v-model` va ichki if shartlari orqali tekshirilmoqda.
- **Possible future usage:** O'quvchi qabuli (Student Admission), Xodim ishga olish (Employee Onboarding), Kassa to'lov operatsiyalari, Shartnomalar tuzish kabi 15+ ta maydondan iborat murakkab ERP formalarida asinxron va qat'iy sxemaviy validatsiya.
- **Business value:** Juda yuqori. Noto'g'ri kiritilgan moliyaviy yoki shaxsiy ma'lumotlar backend bazasiga tushishining oldini oladi.
- **Recommendation:** O'chirilmasin! `yup` bilan birgalikda markaziy `src/validation/` qatlami orqali loyihaga rasmiy joriy etilsin.
- **Action:** **KEEP & INTEGRATE**

---

### 2. `yup`

- **Package:** `yup` (`^1.7.1`)
- **Current status:** O'rnatilgan va qisman `src/utils/validators.js` da ishlatilgan (`studentSchema`, `paymentSchema`).
- **Why installed:** TypeScript tiplari bilan birlashuvchi deklarativ ob'ekt sxemalari validatsiyasi.
- **Current usage:** `src/utils/validators.js` da eksport qilingan.
- **Possible future usage:** Barcha ERP entitiylari uchun schema-first validatsiya.
- **Business value:** Yuqori. Backend DTO (`class-validator`) qoidalari bilan frontend formalarini bir xil qoidada ushlab turish imkonini beradi.
- **Recommendation:** Saqlansin va `src/validation/` katalogiga ko'chirilsin.
- **Action:** **KEEP & INTEGRATE**

---

### 3. `validator`

- **Package:** `validator` (`^13.9.0`)
- **Current status:** O'rnatilgan, ammo `src/` da 0 marta import qilingan.
- **Why installed:** String qiymatlarni (email, URL, telefon) tekshirish.
- **Current usage:** Yo'q. Loyihada o'zining `@/utils/validators.js` fayli mavjud bo'lib, barcha tekshiruvlar mahalliy regexlar orqali amalga oshirilgan.
- **Possible future usage:** `yup` mavjud bo'lgani sababli `validator` ga hech qanday ehtiyoj yo'q.
- **Business value:** Nol (ortiqcha dublikatsiya).
- **Recommendation:** Xavfsiz o'chirish.
- **Action:** **REMOVE** (`npm uninstall validator`)

---

### 4. `lodash`

- **Package:** `lodash` (`^4.17.21`)
- **Current status:** O'rnatilgan, lekin kodda 0 ta import mavjud.
- **Why installed:** Massiv va ob'ektlar bilan ishlash yordamchilari.
- **Current usage:** Yo'q.
- **Possible future usage:** Zamonaviy JavaScript (ES2022+): `structuredClone()`, `?.` optional chaining, `??` nullish coalescing, `Array.prototype.flat()`, `Object.fromEntries()` kabi barcha funksiyalarni o'z ichiga olgan. Lodash butun bundle'ga ~70KB ortiqcha yuk beradi. Kelgusida faqat debounce kerak bo'lsa, 5 qatorlik composable yoki modulli `lodash-es` ishlatish maqsadga muvofiq.
- **Business value:** Hozirgi ko'rinishida salbiy (ortiqcha yuk).
- **Recommendation:** Xavfsiz o'chirish.
- **Action:** **REMOVE** (`npm uninstall lodash`)

---

### 5. `perfect-scrollbar`

- **Package:** `perfect-scrollbar` (`^1.5.5`)
- **Current status:** O'rnatilgan, biroq to'g'ridan-to'g'ri chaqirilmagan.
- **Why installed:** Brauzer scrollbarini stilizatsiya qilish.
- **Current usage:** Loyihada `vue3-perfect-scrollbar` ishlatiladi va u o'zining kerakli mexanizmlariga ega. Xom `perfect-scrollbar` esa `package.json` da unreferenced qolib ketgan.
- **Business value:** Nol (dublikat).
- **Recommendation:** Xavfsiz o'chirish.
- **Action:** **REMOVE** (`npm uninstall perfect-scrollbar`)

---

### 6. `core-js`

- **Package:** `core-js` (`^3.8.3`)
- **Current status:** O'rnatilgan.
- **Why installed:** Eski brauzerlar uchun JavaScript API polyfill'lari (Promise, Symbol, Array metodlari).
- **Current usage:** `@vue/cli-plugin-babel` va Webpack kompilyatsiya jarayonida avtomatik qo'llaniladi.
- **Business value:** Tizimning turli brauzerlarda (Chrome, Safari, Firefox, Edge) xatosiz ishlashini kafolatlaydi.
- **Recommendation:** O'chirilmasin!
- **Action:** **KEEP & DOCUMENT**

---

### 7. `@storybook/blocks`

- **Package:** `@storybook/blocks` (`^8.6.14`)
- **Current status:** DevDependency.
- **Why installed:** Storybook 8 komponentlar katalogida avtomatik hujjatlashtirish (MDX, ArgsTable, Canvas bloklari).
- **Business value:** Dizayn tizimini (`src/components/common/`) ishlab chiquvchilar uchun qulay vizuallashtirish.
- **Recommendation:** Saqlab qolish.
- **Action:** **KEEP & DOCUMENT**

---

### 8. `@vue/cli-plugin-babel`, `@vue/cli-plugin-router`, `vue-cli-plugin-tailwind`

- **Package:** CLI servis plaginlari.
- **Current status:** DevDependency.
- **Why installed:** Vue CLI orqali loyihani kompilyatsiya qilish va o'rnatish.
- **Business value:** Build pipeline barqarorligi.
- **Recommendation:** Saqlab qolish.
- **Action:** **KEEP & DOCUMENT**

---

## 🛠️ Amalga Oshirish Natijasi

O'chiriladigan paketlar:

```bash
npm --prefix frontend uninstall validator perfect-scrollbar lodash
```

Ushbu o'chirish orqali:

- `node_modules` hajmi qisqaradi;
- Security auditdagi potensial xavflar kamayadi;
- Bundle hajmi toza saqlanadi;
- Tizimning barcha E2E va unit testlari 100% ishlashda davom etadi.
