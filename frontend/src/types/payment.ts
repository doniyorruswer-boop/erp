/**
 * Payment and Transaction DTOs and interfaces
 */

export type TransactionMethod =
  "CASH" | "UZUM" | "CLICK" | "PAYME" | "CARD" | "BANK_TRANSFER" | string;
export type TransactionStatus = "PAID" | "PENDING" | "VOID" | "REFUNDED" | string;

export interface CreatePaymentDto {
  studentId: string;
  amount: number;
  method: string;
  notes?: string;
}

export interface PaymentSummaryDto {
  totalRevenue: number;
  totalTransactions: number;
  todayRevenue: number;
  monthRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
}
