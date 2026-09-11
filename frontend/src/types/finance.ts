/**
 * Finance domain types and interfaces
 */

export type PaymentMethod =
  "CASH" | "CARD" | "BANK" | "ONLINE" | "Naqd" | "Karta" | "Bank o'tkazmasi";
export type PaymentStatus = "COMPLETED" | "PENDING" | "CANCELLED" | "REFUNDED";

export interface Payment {
  id: string;
  studentId?: string;
  studentName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentType?: string;
  status: PaymentStatus;
  date: string;
  comment?: string;
  receiptNumber?: string;
}

export interface DebtRecord {
  studentId: string;
  studentName: string;
  className?: string;
  phone?: string;
  debtAmount: number;
  lastPaymentDate?: string;
}

export interface PaymentStats {
  totalRevenue: number;
  totalDebt: number;
  paidThisMonth: number;
  debtorsCount: number;
  monthlyTarget?: number;
}
