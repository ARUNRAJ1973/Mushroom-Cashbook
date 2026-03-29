import type { CashbookEntry } from '../types';

export interface GroupedData {
  date: string;
  entries: CashbookEntry[];
}

export function groupByDate(entries: CashbookEntry[]): GroupedData[] {
  const grouped: Record<string, CashbookEntry[]> = {};

  entries.forEach(entry => {
    if (!grouped[entry.date]) {
      grouped[entry.date] = [];
    }
    grouped[entry.date].push(entry);
  });

  // Sort by date descending (newest first)
  return Object.entries(grouped)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, entries]) => ({ date, entries }));
}
