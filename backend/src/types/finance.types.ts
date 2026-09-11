export type PaymentMethod =
  "CASH" | "CARD" | "BANK_TRANSFER" | "PAYME" | "CLICK" | "UZUM" | "OTHER";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";

export type TransactionType = "INCOME" | "EXPENSE" | "REFUND" | "TRANSFER";

export interface CashboxSummary {
  cashboxId: string;
  cashboxName: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface FinanceSummaryStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalDebt: number;
  debtorCount: number;
}
