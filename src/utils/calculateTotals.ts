import type { CashbookEntry } from "../types";


export interface Totals {
  totalPacks: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export function calculateTotals(entries: CashbookEntry[]): Totals {
  return entries.reduce(
    (acc, entry) => ({
      totalPacks: acc.totalPacks + entry.packs,
      totalAmount: acc.totalAmount + entry.amount,
      paidAmount: acc.paidAmount + (entry.status === 'paid' ? entry.amount : 0),
      pendingAmount: acc.pendingAmount + (entry.status === 'pending' ? entry.amount : 0),
    }),
    { totalPacks: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0 }
  );
}
