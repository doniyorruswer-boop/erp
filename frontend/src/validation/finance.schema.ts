import * as yup from "yup";

import type { PaymentMethod } from "@/types/finance";

export const paymentSchema = yup.object({
  studentId: yup.string().required("O'quvchini tanlash shart"),

  amount: yup
    .number()
    .required("To'lov summasini kiritish shart")
    .min(1000, "Minimal to'lov summasi 1,000 so'm"),

  paymentMethod: yup
    .string<PaymentMethod>()
    .required("To'lov usulini tanlash shart")
    .oneOf(
      ["CASH", "CARD", "BANK", "ONLINE", "Naqd", "Karta", "Bank o'tkazmasi"],
      "Noto'g'ri to'lov usuli"
    ),

  comment: yup.string().max(500, "Izoh 500 belgidan oshmasligi kerak").optional(),

  receiptNumber: yup.string().optional(),

  date: yup.string().default(() => new Date().toISOString().split("T")[0]),
});

export const cashboxTransactionSchema = yup.object({
  type: yup
    .string()
    .oneOf(["INCOME", "EXPENSE"], "Tranzaksiya turi noto'g'ri")
    .required("Tranzaksiya turini tanlang"),

  amount: yup
    .number()
    .positive("Summa musbat son bo'lishi kerak")
    .min(500, "Minimal summa 500 so'm")
    .required("Summani kiriting"),

  category: yup.string().required("Kategoriyani tanlang"),

  description: yup.string().max(300, "Tavsif 300 belgidan oshmasligi kerak").optional(),
});

export type PaymentSchemaInput = yup.InferType<typeof paymentSchema>;
export type CashboxTransactionSchemaInput = yup.InferType<typeof cashboxTransactionSchema>;
