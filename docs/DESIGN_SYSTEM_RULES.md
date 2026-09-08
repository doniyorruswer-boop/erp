# EduCRM Frontend Design System va Arxitektura Qoidalari (Golden Rules)

Ushbu hujjat EduCRM loyihasida frontend sahifalarini yaratish, refaktoring qilish va kengaytirish bo'yicha **qat'iy qonun-qoidalar** to'plamidir. Har qanday yangi sahifa yoki mavjud kodni o'zgartirish faqat quyidagi standartlarga asoslanishi SHART.

---

## 1. Asosiy Falsafa va Qat'iy Talablar (Core Principles)

1. **DRY (Don't Repeat Yourself):** Hech qachon bir xil UI bloklari (jadval, paginatsiya, filtr dropdown, sana tanlagich, tasdiqlash modali) sahifa ichida noldan qayta yozilmaydi.
2. **UI/UX Mutlaq Bir Xilligi:** CRM, Maktab, Moliya yoki HR sohasidan qat'i nazar, foydalanuvchi interfeysi, shriftlar (`font-lexend`), ranglar, borderlar, soyalar (`shadow-2xs`), dark mode moslashuvi va animatsiyalar 100% yagona tizimda bo'ladi.
3. **Hardcode'ga Cheklov:** To'g'ridan-to'g'ri `<table>`, native `<input type="date">` yoki qat'iy o'lchamdagi har xil tugmalar yozish qat'iyan taqiqlanadi.

---

## 2. Loyihaning Asosiy Komponentlari va Jadval Katakchalari (Table Cell Kit)

| Vazifasi | Yagona Standart Komponent | Qayerda joylashgan | Asosiy xususiyatlari |
|---|---|---|---|
| **1. Jadval** | `<AppTable>` | `@/components/AppTable.vue` | Checkbox tanlash (`selectable`), tartib raqami (`showIndex`), saralash (`sortable`), dinamik slotlar (`#cell(key)`, `#actions`, `#bulkActions`), ichki `AppPagination`. |
| **2. Tugma** | `<AppButton>` | `@/components/AppButton.vue` | Standart variantlar (`primary`, `outline`, `danger`, `secondary`), o'lchamlar (`sm`, `md`, `lg`), avtomatik Iconify ikonkalari. |
| **3. Dropdown Filtr** | `<AppFilterDropdown>` | `@/components/AppFilterDropdown.vue` | Yagona ochiluvchi menyu (Sinf, Holat, Bosqich, Fan, Smena, Yil va h.k.). Avtomatik qidiruv va toza UI. |
| **4. Sana Oralig'i** | `<AppDateRangePicker>` | `@/components/common/AppDateRangePicker.vue` | Dashboard va barcha ro'yxatlarda sana oralig'ini tanlash. Standart segmented date chips bilan birga ishlatiladi. |
| **5. Tasdiqlash Modali** | `<AppConfirmModal>` | `@/components/common/AppConfirmModal.vue` | O'chirish, arxivlash, tiklash va muhim harakatlarni tasdiqlash uchun yagona standart modal. |
| **6. Shaxs / F.I.SH** | `<AppUserCell>` | `@/components/AppUserCell.vue` | Bosh harfli/rasmli avatar, to'q rangli ism, router-link, subtitr va holat tegi. |
| **7. Telefon raqami** | `<AppPhoneCell>` | `@/components/AppPhoneCell.vue` | Avtomatik `+998 (90) 123-45-67` format, telefon ikonkasi, `tel:` havolasi. |
| **8. Sinf / Guruh** | `<AppGroupBadge>` | `@/components/AppGroupBadge.vue` | Standart ko'k nishon (`7-A`, `2-A`, `Bootcamp #1`), o'lchamlar va bosish imkoniyati. |
| **9. Bosqich / Holat** | `<AppStatusBadge>` | `@/components/AppStatusBadge.vue` | Avtomatik rang tanlovchi chip (`O'quvchi`, `Sinov`, `Faol`, `Nofaol`, `Arxiv`). |
| **10. Pul / Qarz** | `<AppMoneyCell>` | `@/components/AppMoneyCell.vue` | Formatlangan summa (`4 700 000 so'm`), `type="debt"` bo'lsa qarz qizil, 0 kulrang. |
| **11. Sana va Yosh** | `<AppDateCell>` | `@/components/AppDateCell.vue` | Standart `DD.MM.YYYY`, tug'ilgan sana uchun avtomatik `23 yosh` nishoni. |
| **12. Hujjat / Nusxa** | `<AppDocCell>` / `<AppCopyCell>` | `@/components/` | Pasport + JSHSHIR, Login nusxalash va bir marta bosish bilan toast xabari. |
| **13. Amallar paneli** | `<AppActionButtons>` | `@/components/AppActionButtons.vue` | Yagona 32x32px ikonka tugmalar (`view`, `edit`, `delete`, `sms`, `pay`) yoki matnli tugmalar. |

---

## 3. Komponentlar bo'yicha Qat'iy Qoidalar

### 1. Jadval Standarti (`AppTable`)

* **Taqiqlanadi:** Sahifa ichida `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` teglari va takroriy paginatsiya kodlarini qo'lda yozish.
* **Qo'llanilishi:**
  * **Maktab / Ta'lim andozasi (Tashqi filtr paneli bilan):**
    `AppTable` ga `title` yoki `searchable` berilmaydi. Shunda u o'zining ichki qidiruv paneli o'rniga tashqi filtrlarga to'liq moslashadi.
  * **CRM andozasi (Ichki qidiruv bilan):**
    `searchable="true"` va `title="..."` berilganda avtomatik ichki qidiruv paneli va elementlar hisoblagichini ko'rsatadi.
  * **Ommaviy amallar:**
    `:selectable="true"` va `v-model="selectedIds"` orqali ulanadi. Tanlov amalga oshirilganda `#bulkActions` sloti avtomatik ochiladi.
  * **Avtomatik Saralash (Smart Sorting):**
    `AppTable` da `autoSortable: true` sukut bo'yicha yoqilgan. Dasturchi har bir ustunga qo'lda `sortable: true` yozishi shart emas — barcha ma'lumot ustunlari (F.I.SH, sinf, telefon, sana, pul, holat, login) avtomatik ravishda `⇅` belgisi bilan ta'minlanadi va bosilganda aqlli saralanadi (sonlar raqam qiymati bo'yicha, sanalar vaqt bo'yicha, matnlar o'zbek alifbosi bo'yicha). Faqat `sortable: false` berilgan yoki amallar ustunlari saralanmaydi.
  * **Ustunlarni sozlash:**
    ```javascript
    tableColumns: [
      { key: "fullName", label: "F.I.SH" },
      { key: "className", label: "Sinf", align: "center" },
      { key: "phone", label: "Telefon" },
      { key: "children", label: "Bog'liq o'quvchilar", sortable: false }, // Saralanmasligi kerak bo'lsa
    ]
    ```
  * **Katakchalarni moslashtirish:**
    ```html
    <template #cell(fullName)="{ row, value }">
      <span class="font-bold text-primary">{{ row.fullName }}</span>
    </template>
    <template #actions="{ row }">
      <!-- Qator amallari -->
    </template>
    ```

---

### 2. Sana Filtr Paneli Standarti

* **Taqiqlanadi:** Native `<input type="date">` ishlatish.
* **Qo'llanilishi:**
  Chap tomonda doimo standart segmented chiplar:
  `Bugun`, `Kecha`, `7 kun`, `Oy`, `Yil`, `Barchasi`.
  O'ng tomonda esa `AppDateRangePicker` komponenti:
  ```html
  <AppDateRangePicker
    :start-date="dateFrom"
    :end-date="dateTo"
    align="right"
    @update:startDate="val => { dateFrom = val; onCustomDateChange(); }"
    @update:endDate="val => { dateTo = val; onCustomDateChange(); }"
    @change="handleDateRangePickerChange"
  />
  ```

---

### 3. F.I.SH / Shaxs Katagi Standarti (`AppUserCell`)

* **Taqiqlanadi:** F.I.SH katagini har bir sahifada qo'lda `<div>`, `class="text-primary"` yoki alohida avatar yasab yozish.
* **Qo'llanilishi:**
  Barcha o'quvchilar, ota-onalar, xodimlar, mijozlar va o'qituvchilar jadvallarida doimo `<AppUserCell>` ishlatiladi:
  ```html
  <!-- Oddiy F.I.SH (Avatar + Ism) -->
  <template #cell(fullName)="{ row }">
    <AppUserCell :name="row.fullName" @click="openDetail(row)" />
  </template>

  <!-- Router-link va Subtitr bilan (masalan o'quvchilar) -->
  <template #cell(fullName)="{ row: st }">
    <AppUserCell
      :name="st.fullName"
      :image="st.avatar"
      :subtitle="'ID: ' + st.studentId"
      :to="'/students/' + st.id"
    />
  </template>

  <!-- Status badge bilan (masalan ota-onalar) -->
  <template #cell(fullName)="{ row: p }">
    <AppUserCell
      :name="p.fullName"
      :badge="p.isActive === false ? 'Nofaol' : ''"
      badge-variant="danger"
    />
  </template>
  ```

---

### 4. Sarlavhalar va Ko'rsatkichlar Standarti

* **Taqiqlanadi:** Sahifa sarlavhasiga `Jami: 25 ta ...` kabi qo'pol hisoblagich pufakchalarini tiqishtirish.
* **Qo'llanilishi:**
  * Sarlavha toza bo'ladi: `Ota-onalar`, `O'quvchilar`, `Chetlatilganlar`.
  * Elementlar soni esa filtr panelida tezkor ko'rsatkichlar (KPI badges) sifatida yoki jadvalning pastki paginatsiya panelida (`AppPagination`) chiroyli va qulay ko'rsatiladi.

---

### 5. Ranglar va Harakatlar Standarti

* **Primary Harakatlar:**
  Yaratish, Saqlash, Qayta tiklash, Asosiy havolalar — faqat `primary` (`bg-primary`, `text-primary`, `hover:bg-primary-600`) bo'ladi.
  *Xato amaliyot:* Qayta tiklash tugmasini sariq (amber) rangda qilish taqiqlanadi (tiklash ijobiy amal hisoblanadi).
* **Xavfli (Destructive) Harakatlar:**
  O'chirish, Chetlash, Bloklash — faqat `rose` / `red` (`bg-rose-600`, `text-rose-600`, `hover:bg-rose-50`) bo'ladi.
* **Neytral / Eksport Harakatlari:**
  Excel yuklab olish, Arxivni ko'rish — `variant="outline"` (`border-gray-300 dark:border-gray-600`).

---

### 6. Shriftlar va Tipografiya Standarti

* **Taqiqlanadi:** Pul, summa yoki sanalar ustuniga dasturchilar shrifti (`font-mono`) berish (chunki nollar ichida chiziqcha `0̸` paydo bo'lib, sahifa dizayniga mos kelmay qoladi).
* **Qo'llanilishi:**
  * Barcha sonlar, to'lovlar, qarzlar va sanalar tizimning asosiy chiroyli brend shriftida (`font-lexend` / sans-serif) chiqadi.
  * `font-mono` faqatgina Pasport seriyasi yoki JSHSHIR kabi sof texnik kodlar uchungina qo'llaniladi.

---

## 4. Yangi Sahifa Yaratish bo'yicha Nazorat Ro'yxati (Checklist)

Yangi sahifa ochilganda quyidagi tartibda yig'iladi:

1. [ ] **Navigatsiya:** Yuqorida `<Breadcrumb :items="[...]">`.
2. [ ] **Sarlavha qatori:** Chapda `<h1>` sarlavha, o'ngda `<AppButton>` (Export, Yangi qo'shish).
3. [ ] **Sana paneli (agar kerak bo'lsa):** Segmented chiplar va `<AppDateRangePicker>`.
4. [ ] **Qidiruv va filtrlar paneli:** Qidiruv inputi, `<AppFilterDropdown>` lar va `Tozalash` tugmasi.
5. [ ] **Jadval:** `<AppTable>` komponenti, kerakli `#cell(...)`, `#actions` va `#bulkActions` slotlari.
6. [ ] **Modallar:** Tasdiqlashlar uchun `<AppConfirmModal>`, shakllar uchun `<vmodal>`.

Ushbu qoidalar tizimning arxitekturaviy tozaligini, oson kengayishini va professional darajadagi foydalanuvchi tajribasini (UX) kafolatlaydi.
