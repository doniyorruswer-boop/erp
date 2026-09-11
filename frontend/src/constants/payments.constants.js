/**
 * Centralized Payment Constants for EduHub Frontend
 * Synchronized with backend Prisma Schema & Database Enums
 */

export const PAYMENT_METHODS = Object.freeze({
  CASH: "CASH",
  CARD: "CARD",
  BANK: "BANK",
  BANK_TRANSFER: "BANK_TRANSFER",
  PAYME: "PAYME",
  CLICK: "CLICK",
  UZUM: "UZUM",
});

export const PAYMENT_METHOD_LABELS = Object.freeze({
  [PAYMENT_METHODS.CASH]: "Naqd pul",
  [PAYMENT_METHODS.CARD]: "Plastik karta (Humo/Uzcard)",
  [PAYMENT_METHODS.BANK]: "Bank to'lovi",
  [PAYMENT_METHODS.BANK_TRANSFER]: "Bank o'tkazmasi",
  [PAYMENT_METHODS.PAYME]: "Payme",
  [PAYMENT_METHODS.CLICK]: "Click",
  [PAYMENT_METHODS.UZUM]: "Uzum Pay",
});

export const PAYMENT_METHOD_ICONS = Object.freeze({
  [PAYMENT_METHODS.CASH]: "solar:wallet-money-bold",
  [PAYMENT_METHODS.CARD]: "solar:card-bold",
  [PAYMENT_METHODS.BANK]: "solar:buildings-2-bold",
  [PAYMENT_METHODS.BANK_TRANSFER]: "solar:buildings-2-bold",
  [PAYMENT_METHODS.PAYME]: "solar:plain-bold",
  [PAYMENT_METHODS.CLICK]: "solar:smartphone-bold",
  [PAYMENT_METHODS.UZUM]: "solar:shop-2-bold",
});

export const PAYMENT_METHOD_OPTIONS = Object.freeze([
  {
    value: PAYMENT_METHODS.CASH,
    label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.CASH],
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.CASH],
  },
  {
    value: PAYMENT_METHODS.CARD,
    label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.CARD],
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.CARD],
  },
  {
    value: PAYMENT_METHODS.CLICK,
    label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.CLICK],
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.CLICK],
  },
  {
    value: PAYMENT_METHODS.PAYME,
    label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.PAYME],
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.PAYME],
  },
  {
    value: PAYMENT_METHODS.UZUM,
    label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.UZUM],
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.UZUM],
  },
  {
    value: PAYMENT_METHODS.BANK_TRANSFER,
    label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.BANK_TRANSFER],
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.BANK_TRANSFER],
  },
]);

export const PAYMENT_CATEGORIES = Object.freeze({
  TUITION: "TUITION",
  CANTEEN: "CANTEEN",
  TRANSPORT: "TRANSPORT",
  BOOKS: "BOOKS",
  UNIFORM: "UNIFORM",
  EXAM: "EXAM",
  OTHER: "OTHER",
});

export const PAYMENT_CATEGORY_LABELS = Object.freeze({
  [PAYMENT_CATEGORIES.TUITION]: "O'qish to'lovi",
  [PAYMENT_CATEGORIES.CANTEEN]: "Oshxona",
  [PAYMENT_CATEGORIES.TRANSPORT]: "Transport",
  [PAYMENT_CATEGORIES.BOOKS]: "Darsliklar",
  [PAYMENT_CATEGORIES.UNIFORM]: "Maktab formasi",
  [PAYMENT_CATEGORIES.EXAM]: "Imtihon to'lovi",
  [PAYMENT_CATEGORIES.OTHER]: "Boshqa to'lovlar",
});

export const PAYMENT_STATUS = Object.freeze({
  PAID: "PAID",
  PENDING: "PENDING",
  VOID: "VOID",
  REFUNDED: "REFUNDED",
});

export const PAYMENT_STATUS_LABELS = Object.freeze({
  [PAYMENT_STATUS.PAID]: "To'langan",
  [PAYMENT_STATUS.PENDING]: "Kutilmoqda",
  [PAYMENT_STATUS.VOID]: "Bekor qilingan",
  [PAYMENT_STATUS.REFUNDED]: "Qaytarilgan",
});
