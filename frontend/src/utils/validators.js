/**
 * EduHub / EduCRM Markazlashtirilgan Validatsiya Tizimi
 * Barcha formalar va maydonlar uchun yagona manba (Single Source of Truth)
 * O'zbek tilidagi standartlashtirilgan xabarlar va moslashuvchan qoidalar
 */

import * as yup from "yup";

// ============================================================================
// 1. O'ZBEKCHA YUP LOKALIZATSIYASI (Yup kutubxonasidan foydalanuvchi joylar uchun)
// ============================================================================
yup.setLocale({
  mixed: {
    default: "Maydon noto'g'ri to'ldirilgan",
    required: "Ushbu maydonni to'ldirish shart",
    notType: "Kiritilgan ma'lumot turi noto'g'ri",
  },
  string: {
    min: ({ min }) => `Kamida ${min} ta belgi kiritilishi lozim`,
    max: ({ max }) => `Ko'pi bilan ${max} ta belgi kiritilishi mumkin`,
    email: "Haqiqiy elektron pochta manzilini kiriting (masalan: foydalanuvchi@mail.uz)",
  },
  number: {
    min: ({ min }) => `Qiymat kamida ${min} bo'lishi kerak`,
    max: ({ max }) => `Qiymat ko'pi bilan ${max} bo'lishi kerak`,
    positive: "Musbat son kiritilishi kerak",
    integer: "Butun son bo'lishi kerak",
  },
});

// ============================================================================
// 2. REGEX VA YORDAMCHI FORMATLASH FUNKSIYALARI
// ============================================================================
export const REGEX = {
  // O'zbekiston telefon raqami (+998 xx xxx xx xx yoki 998xxxxxxxxx yoki 90xxxxxxx)
  PHONE_UZ: /^(\+?998)?[0-9]{9}$/,
  // Faqat harflar, bo'shliqlar, defis va apostroflar (Ism va F.I.SH uchun)
  NAME: /^[a-zA-Zа-яА-ЯёЁўЎғҒshShchChngNg'\s-]+$/,
  // Login: harflar, raqamlar, nuqta, pastki chiziq va defis
  LOGIN: /^[a-zA-Z0-9._-]+$/,
  // Telegram username (@username)
  TELEGRAM: /^@?[a-zA-Z0-9_]{5,32}$/,
  // Email
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

/**
 * Telefon raqamini toza raqamlarga keltirish
 */
export function sanitizePhone(val) {
  if (!val) return "";
  return String(val).replace(/\D/g, "");
}

/**
 * O'zbekiston telefon raqamini chiroyli maskaga keltirish
 * Masalan: 998901234567 -> +998 (90) 123-45-67
 */
export function formatPhone(val) {
  if (!val) return "";
  const digits = String(val).replace(/\D/g, "");
  let clean = digits;
  if (clean.startsWith("998")) {
    clean = clean.slice(3);
  }
  clean = clean.slice(0, 9); // Maksimal 9 ta raqam (operator + raqam)

  if (clean.length === 0) return "+998 ";
  if (clean.length <= 2) return `+998 (${clean}`;
  if (clean.length <= 5) return `+998 (${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 7)
    return `+998 (${clean.slice(0, 2)}) ${clean.slice(2, 5)}-${clean.slice(5)}`;
  return `+998 (${clean.slice(0, 2)}) ${clean.slice(2, 5)}-${clean.slice(5, 7)}-${clean.slice(7, 9)}`;
}

// ============================================================================
// 3. ATOMIK VALIDATSIYA QOIDALARI (Rules Engine)
// Har bir qoida (value) => string | null qaytaradi (null = xatolik yo'q)
// ============================================================================
export const rules = {
  /**
   * Majburiy maydon tekshiruvi
   */
  required: (label = "Ushbu maydon") => (val) => {
    if (val === null || val === undefined) return `«${label}» to'ldirilishi shart`;
    if (typeof val === "string" && !val.trim()) return `«${label}» to'ldirilishi shart`;
    if (Array.isArray(val) && val.length === 0) return `Kamida bitta «${label}» tanlanishi shart`;
    return null;
  },

  /**
   * Minimal uzunlik
   */
  minLength: (min, label = "Maydon") => (val) => {
    if (!val) return null;
    const str = String(val).trim();
    if (str.length < min) {
      return `«${label}» kamida ${min} ta belgidan iborat bo'lishi kerak`;
    }
    return null;
  },

  /**
   * Maksimal uzunlik
   */
  maxLength: (max, label = "Maydon") => (val) => {
    if (!val) return null;
    const str = String(val).trim();
    if (str.length > max) {
      return `«${label}» ko'pi bilan ${max} ta belgidan oshmasligi kerak`;
    }
    return null;
  },

  /**
   * Ism / F.I.SH tekshiruvi (Kamida 2 ta belgi, raqamsiz)
   */
  name: (label = "F.I.SH", min = 3) => (val) => {
    if (!val) return null;
    const str = String(val).trim();
    if (str.length < min) {
      return `«${label}» kamida ${min} ta harfdan iborat bo'lishi kerak`;
    }
    if (/\d/.test(str)) {
      return `«${label}» tarkibida raqamlar bo'lishi mumkin emas`;
    }
    return null;
  },

  /**
   * O'zbekiston telefon raqami formati
   */
  phone: (label = "Telefon raqami") => (val) => {
    if (!val) return null;
    const digits = String(val).replace(/\D/g, "");
    if (digits.length === 9 || (digits.length === 12 && digits.startsWith("998"))) {
      return null;
    }
    return `«${label}» noto'g'ri kiritilgan (+998 XX XXX-XX-XX formatida bo'lsin)`;
  },

  /**
   * Email tekshiruvi
   */
  email: (label = "Elektron pochta") => (val) => {
    if (!val) return null;
    const str = String(val).trim();
    if (!REGEX.EMAIL.test(str)) {
      return `Haqiqiy «${label}» manzilini kiriting (masalan: info@maktab.uz)`;
    }
    return null;
  },

  /**
   * Login tekshiruvi (faqat lotin, raqam va . _ -)
   */
  login: (label = "Login", min = 4) => (val) => {
    if (!val) return null;
    const str = String(val).trim();
    if (str.length < min) {
      return `«${label}» kamida ${min} ta belgidan iborat bo'lishi kerak`;
    }
    if (!REGEX.LOGIN.test(str)) {
      return `«${label}» faqat lotin harflari, raqamlar va (. - _) belgilaridan iborat bo'lishi mumkin`;
    }
    return null;
  },

  /**
   * Parol mustahkamligi
   */
  password: (label = "Parol", min = 6) => (val) => {
    if (!val) return null;
    const str = String(val);
    if (str.length < min) {
      return `«${label}» kamida ${min} ta belgidan iborat bo'lishi kerak`;
    }
    return null;
  },

  /**
   * Musbat son / Narx / To'lov summasi
   */
  positiveNumber: (label = "Summa", min = 0) => (val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(String(val).replace(/\s/g, ""));
    if (isNaN(num)) {
      return `«${label}» faqat raqamlardan iborat bo'lishi kerak`;
    }
    if (num < min) {
      return `«${label}» kamida ${min.toLocaleString("uz-UZ")} bo'lishi kerak`;
    }
    return null;
  },

  /**
   * Telegram username tekshiruvi
   */
  telegram: (label = "Telegram") => (val) => {
    if (!val) return null;
    const str = String(val).trim();
    if (!REGEX.TELEGRAM.test(str)) {
      return `«${label}» noto'g'ri (masalan: @foydalanuvchi)`;
    }
    return null;
  },

  /**
   * Moslik tekshiruvi (Parolni tasdiqlash uchun)
   */
  match: (targetVal, targetLabel = "parol", label = "Tasdiqlash") => (val) => {
    if (val !== targetVal) {
      return `«${label}» kiritilgan «${targetLabel}» bilan mos kelmadi`;
    }
    return null;
  },

  /**
   * Maxsus funksiya orqali tekshirish
   */
  custom: (fn, errorMessage) => (val) => {
    try {
      const ok = fn(val);
      return ok ? null : errorMessage;
    } catch {
      return errorMessage;
    }
  },
};

// ============================================================================
// 4. UNIVERSAL VALIDATSIYA RUNNER (Form & Field darajasida)
// ============================================================================

/**
 * Bitta maydonni qoidalar ro'yxati bo'yicha tekshiradi
 * @param {any} value
 * @param {Array<Function>} ruleList
 * @returns {string | null}
 */
export function validateField(value, ruleList = []) {
  if (!Array.isArray(ruleList) || ruleList.length === 0) return null;
  for (const rule of ruleList) {
    if (typeof rule === "function") {
      const err = rule(value);
      if (err) return err; // Birinchi uchragan xatoni qaytaradi
    }
  }
  return null;
}

/**
 * Butun formani berilgan qoidalar xaritasi bo'yicha tekshiradi
 * @param {Object} formData - Form ma'lumotlari obyekti
 * @param {Object} schemaRules - { fieldName: [rule1, rule2] }
 * @returns {{ isValid: boolean, errors: Record<string, string>, firstError: string | null }}
 */
export function validateForm(formData = {}, schemaRules = {}) {
  const errors = {};
  let firstError = null;

  for (const [field, ruleList] of Object.entries(schemaRules)) {
    const val = formData[field];
    const fieldError = validateField(val, ruleList);
    if (fieldError) {
      errors[field] = fieldError;
      if (!firstError) {
        firstError = fieldError;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
}

// ============================================================================
// 5. TAYYOR STANDART QOIDALAR TO'PLAMLARI (CRM Modellari uchun)
// ============================================================================

/**
 * Ota-ona formasi uchun qoidalar
 */
export const parentValidationRules = {
  fullName: [rules.required("F.I.SH"), rules.name("F.I.SH", 3)],
  phone: [rules.required("Telefon raqami"), rules.phone("Telefon raqami")],
  login: [rules.login("Login", 4)],
  telegram: [rules.telegram("Telegram")],
};

/**
 * O'quvchi formasi uchun qoidalar
 */
export const studentValidationRules = {
  fullName: [rules.required("F.I.SH"), rules.name("F.I.SH", 3)],
  className: [rules.required("Sinf")],
  phone: [rules.phone("O'quvchi telefoni")],
  parentPhone: [rules.phone("Ota-ona telefoni")],
  monthlyFee: [rules.positiveNumber("Oylik to'lov", 0)],
};

/**
 * SMS xabarnoma formasi uchun qoidalar
 */
export const smsValidationRules = {
  message: [rules.required("Xabar matni"), rules.minLength(3, "Xabar matni")],
};

/**
 * Tizimga kirish (Login) formasi uchun qoidalar
 */
export const loginValidationRules = {
  email: [rules.required("Email, login yoki telefon")],
  password: [rules.required("Parol")],
};

/**
 * To'lov qabul qilish formasi uchun qoidalar
 */
export const paymentValidationRules = {
  amount: [rules.required("To'lov summasi"), rules.positiveNumber("To'lov summasi", 1000)],
  paymentMethod: [rules.required("To'lov usuli")],
};

/**
 * Sinf / Guruh formasi uchun qoidalar
 */
export const classValidationRules = {
  name: [rules.required("Sinf nomi"), rules.minLength(2, "Sinf nomi")],
  parallel: [rules.required("Bosqich / Parallel")],
  capacity: [rules.required("Sig'im"), rules.positiveNumber("Sig'im", 1)],
  plan: [rules.positiveNumber("Reja summasi", 0)],
};

/**
 * Daraja guruhi / to'garak formasi uchun qoidalar
 */
export const levelValidationRules = {
  name: [rules.required("Guruh nomi"), rules.minLength(3, "Guruh nomi")],
  subject: [rules.required("Fan")],
  teacherName: [rules.required("O'qituvchi"), rules.name("O'qituvchi", 3)],
  capacity: [rules.required("Maksimal sig'im"), rules.positiveNumber("Maksimal sig'im", 1)],
};

/**
 * O'quvchi ma'lumotlarini tahrirlash formasi uchun qoidalar
 */
export const studentEditValidationRules = {
  fullName: [rules.required("F.I.SH"), rules.name("F.I.SH", 3)],
  className: [rules.required("Sinf")],
  phone: [rules.phone("Telefon")],
  monthlyFee: [rules.positiveNumber("Oylik to'lov", 0)],
  debt: [rules.positiveNumber("Qarz summasi", 0)],
};

/**
 * Ro'yxatdan o'tish (Register) formasi uchun qoidalar
 */
export const registerValidationRules = {
  fullName: [rules.required("F.I.SH"), rules.name("F.I.SH", 3)],
  email: [rules.required("Elektron pochta"), rules.email("Elektron pochta")],
  phone: [rules.required("Telefon"), rules.phone("Telefon")],
  password: [rules.required("Parol"), rules.password("Parol", 6)],
};

export const registerFormRules = {
  firstName: [rules.required("Ism"), rules.name("Ism", 2)],
  lastName: [rules.required("Familiya"), rules.name("Familiya", 2)],
  phone: [rules.required("Telefon raqami"), rules.phone("Telefon raqami")],
  orgName: [rules.required("O'quv markazi nomi"), rules.minLength(3, "O'quv markazi nomi")],
  password: [rules.required("Parol"), rules.password("Parol", 6)],
};

/**
 * Parolni tiklash (Forgot Password) formasi uchun qoidalar
 */
export const forgotPasswordValidationRules = {
  email: [rules.required("Elektron pochta"), rules.email("Elektron pochta")],
};

/**
 * Foydalanuvchilar (Users) formasi uchun qoidalar
 */
export const userCreateValidationRules = {
  firstName: [rules.required("Ism"), rules.name("Ism", 2)],
  lastName: [rules.required("Familiya"), rules.name("Familiya", 2)],
  phone: [rules.required("Telefon raqami"), rules.phone("Telefon raqami")],
  role: [rules.required("Tizimdagi roli")],
  password: [rules.required("Parol"), rules.password("Parol", 6)],
};

export const userEditValidationRules = {
  firstName: [rules.required("Ism"), rules.name("Ism", 2)],
  lastName: [rules.required("Familiya"), rules.name("Familiya", 2)],
  phone: [rules.required("Telefon raqami"), rules.phone("Telefon raqami")],
  role: [rules.required("Tizimdagi roli")],
};

/**
 * Xodimlar (HR Employees) formasi uchun qoidalar
 */
export const employeeValidationRules = {
  firstName: [rules.required("Ism"), rules.name("Ism", 2)],
  lastName: [rules.required("Familiya"), rules.name("Familiya", 2)],
  phone: [rules.required("Telefon raqami"), rules.phone("Telefon raqami")],
  position: [rules.required("Lavozim"), rules.minLength(2, "Lavozim")],
  baseSalary: [rules.required("Asosiy oylik maosh"), rules.positiveNumber("Asosiy oylik maosh", 100000)],
};

/**
 * Oylik maosh to'lash (Payroll) formasi uchun qoidalar
 */
export const payrollValidationRules = {
  period: [rules.required("Davr (Oy)")],
  baseAmount: [rules.required("Asosiy miqdor"), rules.positiveNumber("Asosiy miqdor", 1000)],
  paidVia: [rules.required("To'lov usuli")],
};

/**
 * Rollar va ruxsatlar (Roles & Permissions) formasi uchun qoidalar
 */
export const roleValidationRules = {
  name: [rules.required("Rol nomi"), rules.minLength(2, "Rol nomi")],
  code: [rules.required("Rol kodi"), rules.minLength(2, "Rol kodi")],
};

/**
 * Kurslar (Courses) formasi uchun qoidalar
 */
export const courseValidationRules = {
  name: [rules.required("Kurs nomi"), rules.minLength(2, "Kurs nomi")],
  price: [rules.required("Oylik narxi"), rules.positiveNumber("Oylik narxi", 0)],
  duration: [rules.required("Davomiyligi (oy)"), rules.positiveNumber("Davomiyligi", 1)],
  lessonCount: [rules.required("Darslar soni/oy"), rules.positiveNumber("Darslar soni", 1)],
};

/**
 * Guruhlar (Groups) formasi uchun qoidalar
 */
export const groupValidationRules = {
  name: [rules.required("Guruh nomi"), rules.minLength(2, "Guruh nomi")],
  courseId: [rules.required("Kurs")],
  startTime: [rules.required("Boshlanish vaqti")],
  endTime: [rules.required("Tugash vaqti")],
};

/**
 * Lidlar (Leads) formasi uchun qoidalar
 */
export const leadValidationRules = {
  firstName: [rules.required("Ism"), rules.name("Ism", 2)],
  phone: [rules.required("Telefon raqami"), rules.phone("Telefon raqami")],
};

/**
 * Xabarnomalar (Notifications) yuborish uchun qoidalar
 */
export const notificationValidationRules = {
  channel: [rules.required("Aloqa kanali")],
  recipient: [rules.required("Qabul qiluvchi")],
  title: [rules.required("Sarlavha"), rules.minLength(2, "Sarlavha")],
  body: [rules.required("Xabar matni"), rules.minLength(3, "Xabar matni")],
};

/**
 * Moliya to'lovi qabul qilish formasi uchun qoidalar
 */
export const financePaymentValidationRules = {
  studentId: [rules.required("O'quvchi")],
  amount: [rules.required("To'lov summasi"), rules.positiveNumber("To'lov summasi", 1000)],
  method: [rules.required("To'lov usuli")],
};


// ============================================================================
// 6. YUP SXEMALARI (Yup kutubxonasiga asoslangan komponentlar bilan moslik)
// ============================================================================
export const studentSchema = yup.object({
  fullName: yup.string().required("O'quvchi F.I.Sh ni kiritish shart").min(3, "Kamida 3 ta harf bo'lsin"),
  phone: yup
    .string()
    .required("Telefon raqamni kiritish shart")
    .test("is-phone", "Telefon formati noto'g'ri", (val) => {
      if (!val) return false;
      const clean = sanitizePhone(val);
      return clean.length === 9 || (clean.length === 12 && clean.startsWith("998"));
    }),
  className: yup.string().required("Sinfni tanlash shart"),
});

export const paymentSchema = yup.object({
  amount: yup.number().required("To'lov summasini kiriting").min(1000, "Kamida 1,000 so'm"),
  paymentMethod: yup.string().required("To'lov usulini tanlang"),
});

export { yup };
