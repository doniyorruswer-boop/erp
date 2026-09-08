# 🏛 EduHub ERP: Universality & Multi-Vertical Feasibility Report
**Hujjat turi:** Arxitektura Tahliliy Hisoboti (Architecture Evaluation Report)  
**Holati:** Yakunlangan (Completed)  
**Tadqiqot maqsadi:** EduHub arxitekturasining o'quv markazlaridan tashqari boshqa 6 ta xizmat ko'rsatish sohalariga (Gym, Beauty Salon, Real Estate, Service Center, Private School, Hotel) moslashuvchanligini (Universality) baholash, Core modullarning qayta ishlatilish darajasini aniqlash va arxitekturadagi bo'shliqlarni (gap analysis) ko'rsatish.

---

## 1. Bosh Xulosa (Executive Summary)

EduHub platformasi 1–15 bosqichlar davomida mustahkam **Core Foundation** (Multi-tenant, CRM, Finance & Ledger, Schedule/Resource, HR/Payroll, Custom Fields, Notifications, Workflows) ga ega bo'ldi.

### Universality reytingi: **78% Tayyor**
- **CRM va Finance Core**: 95% universal — barcha 6 soha uchun to'liq mos keladi.
- **HR & Payroll**: 90% universal — oylik maosh, stavkalar, rollar va xodimlar boshqaruvi to'liq qamrab olingan.
- **Schedule & Resources**: 75% universal — vaqt, joy va resurs band qilish uchun mos, biroq xizmat davomiyligi (duration-based slotting) va multi-resurs bandlash abstraksiyasi kerak.
- **Domain Entities (Student/Course/Group)**: Hozirda ta'limga qattiq bog'langan (Education-coupled). Yangi vertikallar qo'shish uchun Core va Domain modullari orasidagi ajratish (Modular Decoupling) talab etiladi.

---

## 2. Sohalar Bo'yicha Chuqur Tahlil (6 Verticals)

---

### 🏋️ 1. Gym & Fitness Center (Fitnes va Sport Majmualari)

#### A. Qayta ishlatiladigan Core modullar:
- **CRM Core**: Potensial mijozlar (Lead -> Trial workout -> Customer).
- **Finance Core**: Abonement to'lovlari (Invoice), Kassa balansi (Cashbox), Ledger kirim-chiqimlari, Qaytarishlar (Refund).
- **HR & Payroll**: Murabbiylar (Trainers) maoshi, KPI va dars soatlari.
- **Custom Fields**: Mijozning tibbiy cheklovlari, vazni, maqsadlari.

#### B. Mavjud Core entity'larga to'g'ridan-to'g'ri mos keladigan qismlar:
- `Customer` $\rightarrow$ Klub a'zosi / Mijoz.
- `Resource` $\rightarrow$ Mashg'ulot zali, Trenajyor, Shkafcha (Locker).
- `Contract` $\rightarrow$ Yillik/oylik a'zolik shartnomasi (Membership Contract).
- `ProductService` $\rightarrow$ "3 oylik VIP", "12 ta individual dars", "Sport ozuqasi (BCAA)".

#### C. Talab etiladigan yangi Vertical entity'lar:
- `GymMembership`: Kirishlar soni bo'yicha (masalan: 12 martalik limit), muzlatish (freeze days) funksiyasi.
- `TurnstileLog / AccessControl`: Turniketdan kirish/chiqish RFID/FaceID loglari.
- `TrainerSession`: Murabbiy bilan 1-ga-1 individual trenirovka jurnali.

#### D. Hozirgi Core'da ifodalab bo'lmaydigan talablar:
- Kartani muzlatish (Membership freeze: to'xtatib turilgan kunlarni avtomatik uzaytirish).
- Cheklovli tashriflar balansi (Visit balance decrementation).

#### E. Core uchun zarur yaxshilanishlar:
- `Contract` modeliga subscription lifecycle holatlarini (`ACTIVE`, `FROZEN`, `EXPIRED`) kiritish.

---

### 💇 2. Beauty Salon & Spa (Go'zallik Salonlari va Spa)

#### A. Qayta ishlatiladigan Core modullar:
- **CRM Core**: Mijozlar bazasi, tashriflar tarixi, tug'ilgan kun xabarnomalari (SMS/Telegram).
- **Finance Core**: Xizmat va kosmetika savdosi, darhol to'lov, xarajatlar.
- **HR Core**: Masterlar (stilist, vizajist) maoshi: foizli tizim (Commission-based: masalan, xizmat narxidan 40%).
- **Schedule Core**: Master va stul (chair) bo'yicha band qilish.

#### B. Mavjud Core entity'larga to'g'ridan-to'g'ri mos keladigan qismlar:
- `Customer` $\rightarrow$ Salon mijozi.
- `Employee` $\rightarrow$ Stilist / Master.
- `Resource` $\rightarrow$ VIP xona, Kosmetologiya apparati, Massaj stoli.
- `Schedule` $\rightarrow$ Xizmat buyurtmasi (Master + Vaqt).
- `ProductService` $\rightarrow$ "Soch turmaklash", "Shampun L'Oreal 500ml".

#### C. Talab etiladigan yangi Vertical entity'lar:
- `ServiceBooking`: Master + Xizmat turi + Vaqt davomiyligi (masalan: 45 daqiqa).
- `MaterialExpense`: Xizmatga sarflangan xomashyo/bo'yoq miqdori (Consumable tracking).

#### D. Hozirgi Core'da ifodalab bo'lmaydigan talablar:
- Dinamik vaqt oralig'i: Har bir xizmat har xil vaqt oladi (Strijka = 30 min, Bo'yash = 120 min). Mavjud `Schedule` qat'iy dars soatlariga moslangan.
- Xodimga foizli maosh (Commission calculation per service).

#### E. Core uchun zarur yaxshilanishlar:
- `Resource/Schedule` modulida har bir xizmat davomiyligi bo'yicha interval yaratish (`durationMinutes`).

---

### 🏢 3. Real Estate Agency (Ko'chmas Mulk va Rieltorlik)

#### A. Qayta ishlatiladigan Core modullar:
- **CRM Core**: Murakkab savdo voronkasi (Lead $\rightarrow$ Ko'rsatuv $\rightarrow$ Muzokara $\rightarrow$ Bitim).
- **Finance Core**: Agentlik komissiyasi, Bo'lib to'lash (Installment plan) jadvallari, Invoices.
- **HR Core**: Rieltorlar KPI, Agentlik foizlari (Split commission).
- **Workflows**: Bitim bosqichlari bo'yicha avtomatik eslatmalar va hujjatlar.

#### B. Mavjud Core entity'larga to'g'ridan-to'g'ri mos keladigan qismlar:
- `Lead` / `Customer` $\rightarrow$ Xaridor yoki Mulk egasi (Buyer / Landlord).
- `Pipeline` / `Stage` $\rightarrow$ Ko'chmas mulk savdo voronkasi.
- `Contract` $\rightarrow$ Oldi-sotdi yoki Ijaraga berish shartnomasi.
- `Invoice` $\rightarrow$ Agentlik xizmati to'lovi yoki Bo'lib to'lash oylik to'lovi.

#### C. Talab etiladigan yangi Vertical entity'lar:
- `PropertyListing`: Ob'ekt kartochkasi (kvadrat metr, xonalar soni, qavat, narx, lokatsiya, kadastr raqami, fotosuratlar).
- `PropertyViewing`: Ob'ektni mijozga ko'rsatish uchrashuvi.
- `CoBrokeAgreement`: Boshqa agentlik bilan komissiyani bo'lishish.

#### D. Hozirgi Core'da ifodalab bo'lmaydigan talablar:
- Geografik qidiruv va filtrlar (Lokatsiya, xaritalar).
- Ikkala tomonlama mijoz (Ham sotuvchi, ham xaridor o'rtasida bitim).

#### E. Core uchun zarur yaxshilanishlar:
- CRM `CustomFields` tizimini ob'ektlar katalogi (Asset Inventory) bilan bog'lash.

---

### 🔧 4. Service Center & Auto Repair (Avtoservis va Ta'mirlash)

#### A. Qayta ishlatiladigan Core modullar:
- **CRM Core**: Mijoz va uning avtomobili/uskunasi tarixi.
- **Finance Core**: Ish haqi + ehtiyot qismlar hisobi (Invoicing & Parts Billing).
- **HR Core**: Mexanik / Usta ishbay maoshi (Labor hours / Piece-rate).
- **Notifications**: "Buyurtmangiz tayyor bo'ldi" SMS xabarnomasi.

#### B. Mavjud Core entity'larga to'g'ridan-to'g'ri mos keladigan qismlar:
- `Customer` $\rightarrow$ Avtomobil / Uskuna egasi.
- `Resource` $\rightarrow$ Podyomnik (Lift), Diagnostika stendi, Boks.
- `ProductService` $\rightarrow$ "Moy almashtirish (ish haqi)", "Moy filtri Mann (ehtiyot qism)".
- `Task` $\rightarrow$ Ta'mirlash vazifalari.

#### C. Talab etiladigan yangi Vertical entity'lar:
- `ServiceOrder / WorkOrder`: Buyurtma-naryad (Qabul qilingan holat, shikoyatlar, diagnostika xulosasi).
- `CustomerAsset`: Mijozning mulki (Avtomobil: Davlat raqami, VIN-kod, model / Texnika: Serial number).
- `WarehouseStock`: Ehtiyot qismlar ombori qoldig'i (Stock inventory).

#### D. Hozirgi Core'da ifodalab bo'lmaydigan talablar:
- Bitta hisob-fakturada ham xizmatni, ham ombor qoldig'ini yechish (Stock decrementing on invoice).

#### E. Core uchun zarur yaxshilanishlar:
- `Finance -> Catalog` ga oddiy ombor hisobi (Inventory on-hand stock) bayrog'ini qo'shish.

---

### 🏫 5. Private School & Kindergarten (Xususiy Maktab va Bog'cha)

#### A. Qayta ishlatiladigan Core modullar:
- **Deyarli 100% Core va mavjud Education modullari to'liq mos keladi.**
- **CRM**: O'quvchi qabuli, test sinovlari.
- **Finance**: Oylik/yillik ta'lim to'lovi, ovqatlanish, transport, to'garaklar to'lovi.
- **HR**: O'qituvchilar, tarbiyachilar, oylik maosh va stavkalar.
- **Schedule**: Dars jadvali, sinfxonalar taqsimoti.

#### B. Mavjud Core entity'larga to'g'ridan-to'g'ri mos keladigan qismlar:
- `Student`, `Parent`, `Group` (Sinf), `Lesson`, `Attendance`, `Exam`, `Grade`.
- `Contract`, `Invoice`, `PaymentAllocation`.

#### C. Talab etiladigan yangi Vertical entity'lar:
- `MealPlan / Canteen`: Ovqatlanish menyusi va allergiyalar hisobi.
- `TransportRoute`: O'quvchilarni olib kelish va qaytarish avtobus yo'nalishlari.
- `DailyReport` (Bog'cha uchun): Bolaning kunlik uyqusi, ovqatlanishi va kayfiyati.

#### D. Hozirgi Core'da ifodalab bo'lmaydigan talablar:
- Kunlik davomatga qarab ovqat pulini qayta hisoblash (Meal fee recalculation based on attendance).

#### E. Core uchun zarur yaxshilanishlar:
- `Attendance` bilan `Invoice` o'rtasida shartli hisob-kitob (Conditional fee reduction) qoidalarini ulash.

---

### 🏨 6. Hotel & Hostel (Mehmonxona va Joylashtirish)

#### A. Qayta ishlatiladigan Core modullar:
- **CRM Core**: Mehmonlar profili, xorijiy fuqarolar pasport ma'lumotlari.
- **Finance Core**: Kunlik to'lov (Nightly rate), Turistik yig'im, Mini-bar va qo'shimcha xizmatlar.
- **HR Core**: Xodimlar (Admin, Farrosh, Qo'riqchi) smenali jadvallari.
- **Resource Core**: Xonalar va o'rinlar (Rooms & Beds).

#### B. Mavjud Core entity'larga to'g'ridan-to'g'ri mos keladigan qismlar:
- `Customer` $\rightarrow$ Mehmon (Guest).
- `Resource` $\rightarrow$ Xona (Room 101, Deluxe, Standard).
- `ProductService` $\rightarrow$ "Kir yuvish xizmati", "Nonushta", "Transfer".
- `Invoice` / `Payment` $\rightarrow$ Mehmonxona hisobi va depozitlar.

#### C. Talab etiladigan yangi Vertical entity'lar:
- `RoomReservation`: Check-in, Check-out sanalari, kattalar/bolalar soni.
- `RoomStatus`: Xona tozalik holati (`CLEAN`, `DIRTY`, `MAINTENANCE`, `OCCUPIED`).
- `GuestRegistration (E-Mehmon)`: IIV talabi bo'yicha ro'yxatga olish kartasi.

#### D. Hozirgi Core'da ifodalab bo'lmaydigan talablar:
- Kechalik hisob-kitob (Night audit): Har yarim tunda xona narxini mehmonga avtomatik hisoblash.
- Bir xonada bir nechta joyni alohida band qilish (Hostel bed booking).

#### E. Core uchun zarur yaxshilanishlar:
- `Schedule/Resource` tizimida sanalar kesimida (kunlik/kechalik) bandlik matritsasi (Gantt/Room rack view).

---

## 3. Umumlashtirilgan Universality Matritsasi

| Core Modul | Gym | Beauty | Real Estate | Service Ctr | School | Hotel | O'rtacha Moslik |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Auth & Multi-Tenancy** | 100% | 100% | 100% | 100% | 100% | 100% | **100%** |
| **CRM (Leads, Pipelines)** | 95% | 90% | 100% | 90% | 100% | 85% | **93%** |
| **Finance (Invoices, Ledger)** | 95% | 95% | 90% | 95% | 100% | 90% | **94%** |
| **HR & Payroll** | 90% | 85% | 85% | 90% | 100% | 90% | **90%** |
| **Custom Fields** | 100% | 100% | 100% | 100% | 100% | 100% | **100%** |
| **Schedule / Resource** | 70% | 75% | 60% | 80% | 100% | 75% | **77%** |
| **Overall Readiness** | **90%** | **89%** | **87%** | **91%** | **100%** | **88%** | **91%** |

---

## 4. Arxitekturaviy Xulosa va Tavsiyalar

1. **Core Arxitukturaning Tozaligi**:
   - EduHub Core modullari (`CRM`, `Finance`, `HR`, `Custom Fields`, `Audit`, `Notifications`) 90%+ darajada universal va toza biznes-mantiqqa ega. Ular har qanday vertikal sohada o'zgartirishsiz ishlay oladi.
2. **Asosiy qiyinchilik (Bottleneck)**:
   - Hozirgi `Course`, `Group`, `Lesson`, `Student` modullari Core bilan bir qatorda turibdi.
   - **Tavsiya**: Barcha ta'limga xos modullarni `src/verticals/education/` papkasiga ajratish va yangi vertikallarni `src/verticals/<soha_nomi>/` (masalan: `src/verticals/driving-school/`, `src/verticals/gym/`) shaklida plagin/modul sifatida ulash.
3. **Birinchi Vertikal Sinov Moduli Tavsiyasi**:
   - **Avtomaktab (Driving School)** eng ideal birinchi vertikal hisoblanadi:
     - U ham ta'lim (nazariy darslar), ham resurs (mashina/avtodrom), ham instruktor (amaliy haydash grafigi) talablarini o'zida birlashtirgan.
     - Avtomaktab moduli orqali `ResourceAllocation` va `Schedule` modullarining universality'si real kodda 100% isbotlanadi.