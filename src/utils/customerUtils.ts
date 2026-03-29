import type { CashbookEntry } from '../types';

export interface CustomerSummary {
  customer: string;
  totalPacks: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  entryCount: number;
  entries: CashbookEntry[];
}

export function groupByCustomer(entries: CashbookEntry[]): CustomerSummary[] {
  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.customer]) {
      acc[entry.customer] = {
        customer: entry.customer,
        totalPacks: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        entryCount: 0,
        entries: [],
      };
    }
    
    const customer = acc[entry.customer];
    customer.totalPacks += entry.packs;
    customer.totalAmount += entry.amount;
    customer.entryCount += 1;
    customer.entries.push(entry);
    
    if (entry.status === 'paid') {
      customer.paidAmount += entry.amount;
    } else {
      customer.pendingAmount += entry.amount;
    }
    
    return acc;
  }, {} as Record<string, CustomerSummary>);

  // Sort by total amount descending
  return Object.values(grouped).sort((a, b) => b.totalAmount - a.totalAmount);
}

export function getCustomerEntries(entries: CashbookEntry[], customerName: string): CashbookEntry[] {
  return entries
    .filter(entry => entry.customer === customerName)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function calculateCustomerTotals(entries: CashbookEntry[]) {
  return entries.reduce(
    (acc, entry) => {
      acc.totalPacks += entry.packs;
      acc.totalAmount += entry.amount;
      if (entry.status === 'paid') {
        acc.paidAmount += entry.amount;
        acc.paidPacks += entry.packs;
      } else {
        acc.pendingAmount += entry.amount;
        acc.pendingPacks += entry.packs;
      }
      return acc;
    },
    { totalPacks: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0, paidPacks: 0, pendingPacks: 0 }
  );
}
