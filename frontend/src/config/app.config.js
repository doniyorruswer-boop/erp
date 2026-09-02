import BRAND_CONFIG from "./brand.config";

export const APP_CONFIG = {
  name: BRAND_CONFIG.name,
  brand: BRAND_CONFIG,
  version: "1.0.1",
  description: BRAND_CONFIG.description,
  apiBaseUrl: process.env.VUE_APP_API_URL || "http://localhost:3000/api",
  
  // Filiallar ro'yxati
  branches: [
    { id: "central", name: "Markaziy", code: "CTR" },
    { id: "turon1", name: "turon1", code: "TR1" },
    { id: "yunusobod1", name: "Yunusobod 1", code: "YN1" },
    { id: "school", name: "SCHOOL", code: "SCH" },
    { id: "nolobay", name: "Nolobay school", code: "NLS" },
    { id: "navoiy1", name: "Navoiy-1", code: "NV1" },
  ],

  // Valyuta va pul birliklari sozlamalari
  currency: {
    code: "UZS",
    symbol: "so'm",
    separator: " ", // Masalan: "45 000 so'm" yoki "," bilan "45,000"
    decimals: 0,
  },

  // Sanalar va vaqt sozlamalari
  date: {
    defaultFormat: "YYYY-MM-DD",
    displayFormat: "DD-MMMM, YYYY",
    months: [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
      "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ],
    monthsShort: [
      "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
      "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"
    ],
    weekDays: ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"],
    weekDaysShort: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
  },

  // O'quvchi statuslari
  studentStatuses: [
    { id: "active", label: "O'qimoqda", color: "emerald" },
    { id: "debtor", label: "Qarzdor", color: "rose" },
    { id: "trial", label: "Sinov darsi", color: "amber" },
    { id: "graduated", label: "Bitirgan", color: "blue" },
    { id: "frozen", label: "Muzlatilgan", color: "gray" },
  ],

  // Lid bosqichlari (Kanban)
  leadStages: [
    { id: "new", label: "Yangi Lidlar", color: "blue" },
    { id: "contacted", label: "Bog'lanildi", color: "amber" },
    { id: "trial", label: "Sinov Darsi", color: "purple" },
    { id: "decision", label: "O'ylamoqda", color: "cyan" },
    { id: "registered", label: "Guruhga Qabul", color: "emerald" },
    { id: "cancelled", label: "Rad Etildi", color: "rose" },
  ],

  // To'lov usullari
  paymentMethods: [
    { id: "payme", name: "Payme", icon: "solar:card-bold", color: "cyan" },
    { id: "click", name: "Click", icon: "solar:card-bold", color: "blue" },
    { id: "cash", name: "Naqd pul", icon: "solar:wallet-money-bold", color: "emerald" },
    { id: "terminal", name: "Bank kartasi / Terminal", icon: "solar:card-2-bold", color: "purple" },
    { id: "uzum", name: "Uzum Pay", icon: "solar:card-recive-bold", color: "indigo" },
  ],
};

/**
 * Pul summasini chiroyli probel yoki vergul bilan formatlash
 * @param {number|string} amount - Summa (masalan: 45000)
 * @param {boolean} withSymbol - "so'm" qo'shimchasi bilan chiqarish
 * @param {string} separator - " " (probel) yoki "," (vergul)
 * @returns {string} Masalan: "45 000 so'm" yoki "45,000 UZS"
 */
export function formatMoney(amount, withSymbol = true, separator = " ") {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0 ${withSymbol ? APP_CONFIG.currency.symbol : ""}`.trim();
  }

  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return withSymbol ? `${formatted} ${APP_CONFIG.currency.symbol}` : formatted;
}

/**
 * Formatlangan summa satridan sof raqamni ajratib olish
 * @param {string} formattedStr - Masalan: "45 000", "45,000 so'm"
 * @returns {number} Masalan: 45000
 */
export function parseMoney(formattedStr) {
  if (!formattedStr) return 0;
  const clean = String(formattedStr).replace(/[^\d.-]/g, "");
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
}

/**
 * Sanani o'zbekcha chiroyli formatda ko'rsatish
 * @param {string|Date} dateVal - Masalan: "2026-08-29"
 * @param {boolean} includeYear - Yilni ham qo'shish
 * @returns {string} Masalan: "29-Avgust, 2026"
 */
export function formatDateUz(dateVal, includeYear = true) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const day = d.getDate();
  const monthName = APP_CONFIG.date.months[d.getMonth()];
  const year = d.getFullYear();

  return includeYear ? `${day}-${monthName}, ${year}` : `${day}-${monthName}`;
}

/**
 * Telefon raqamini O'zbekiston formati bo'yicha formatlash
 * @param {string} phone - Masalan: "998901234567"
 * @returns {string} Masalan: "+998 90 123 45 67"
 */
export function formatPhone(phone) {
  if (!phone) return "";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 9) {
    return `+998 ${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)}`;
  }
  if (clean.length === 12 && clean.startsWith("998")) {
    return `+${clean.slice(0, 3)} ${clean.slice(3, 5)} ${clean.slice(5, 8)} ${clean.slice(8, 10)} ${clean.slice(10, 12)}`;
  }
  return phone;
}

export default APP_CONFIG;
