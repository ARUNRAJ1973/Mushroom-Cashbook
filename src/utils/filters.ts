import type { CashbookEntry } from '../types';

export function filterByMonth(entries: CashbookEntry[], month: string): CashbookEntry[] {
  if (!month) return entries;
  return entries.filter(entry => entry.date.startsWith(month));
}

export function filterByDateRange(
  entries: CashbookEntry[],
  fromDate: string,
  toDate: string
): CashbookEntry[] {
  if (!fromDate || !toDate) return entries;
  return entries.filter(entry => entry.date >= fromDate && entry.date <= toDate);
}

export function getMonthsFromEntries(entries: CashbookEntry[]): string[] {
  const months = new Set<string>();
  entries.forEach(entry => {
    const month = entry.date.substring(0, 7); // YYYY-MM
    months.add(month);
  });
  return Array.from(months).sort().reverse();
}
