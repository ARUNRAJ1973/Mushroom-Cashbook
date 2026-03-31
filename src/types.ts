// Sale Entry (no status - sales are just recorded)
export interface SaleEntry {
  id: string;
  date: string;
  time: string;
  customer: string;
  description?: string;
  packs: number;
  amount: number;
  status?: 'paid' | 'pending';
  user_id: string;
}

// Payment Entry (separate from sales)
export interface PaymentEntry {
  id: string;
  customer: string;
  amount_paid: number;
  date: string;
  note?: string;
  user_id: string;
}

// Legacy type for backward compatibility
export interface CashbookEntry {
  id: string;
  date: string;
  time: string;
  customer: string;
  description?: string;
  packs: number;
  amount: number;
  status: 'paid' | 'pending';
  user_id?: string;
}

// Ledger Item (combined view of sales and payments)
export interface LedgerItem {
  id: string;
  date: string;
  type: 'sale' | 'payment';
  customer: string;
  amount: number;
  description?: string;
  packs?: number;
  note?: string;
}

// Customer Balance
export interface CustomerBalance {
  customer: string;
  totalSales: number;
  totalPaid: number;
  pendingAmount: number;
  totalPacks: number;
}

export interface DailySummary {
  date: string;
  entries: CashbookEntry[];
  totalPacks: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface CashbookSummary {
  totalPacks: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}
