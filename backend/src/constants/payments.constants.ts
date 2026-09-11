/**
 * Payment & Transaction Constants (Synchronized with Prisma Schema)
 */

export const PAYMENT_METHODS = {
  CASH: "CASH",
  CARD: "CARD",
  BANK: "BANK",
  BANK_TRANSFER: "BANK_TRANSFER",
  PAYME: "PAYME",
  CLICK: "CLICK",
  UZUM: "UZUM",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_CATEGORIES = {
  TUITION: "TUITION",
  CANTEEN: "CANTEEN",
  TRANSPORT: "TRANSPORT",
  BOOKS: "BOOKS",
  UNIFORM: "UNIFORM",
  EXAM: "EXAM",
  OTHER: "OTHER",
} as const;

export type PaymentCategory = (typeof PAYMENT_CATEGORIES)[keyof typeof PAYMENT_CATEGORIES];

export const PAYMENT_STATUS = {
  PAID: "PAID",
  PENDING: "PENDING",
  VOID: "VOID",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
