import { useState, useMemo } from 'react';
import type {  DailySummary, CashbookSummary, CashbookEntry } from '../types';
import { SummaryCard } from './SummaryCard';
import { DailySection } from './DailySection';
import { AddEntryModal } from './AddEntryModal';

interface DashboardProps {
  initialEntries: CashbookEntry[];
}

export function Dashboard({ initialEntries }: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState<CashbookEntry[]>(initialEntries);
  const handleAddEntry = (newEntry: Omit<CashbookEntry, 'id'>) => {
    const entry: CashbookEntry = {
      ...newEntry,
      id: Date.now().toString() // Simple ID generation
    };
    setEntries(prev => [entry, ...prev]);
    setIsModalOpen(false);
  };

  const { summary, dailySummaries } = useMemo(() => {
    // Calculate overall summary
    const summary: CashbookSummary = {
      totalPacks: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0
    };

    // Group entries by date and calculate summaries
    const groupedByDate: Record<string, CashbookEntry[]> = {};

    entries.forEach((entry) => {
      summary.totalPacks += entry.packs;
      summary.totalAmount += entry.amount;

      if (entry.status === 'paid') {
        summary.paidAmount += entry.amount;
      } else {
        summary.pendingAmount += entry.amount;
      }

      if (!groupedByDate[entry.date]) {
        groupedByDate[entry.date] = [];
      }
      groupedByDate[entry.date].push(entry);
    });

    // Create daily summaries sorted by date (newest first)
    const dailySummaries: DailySummary[] = Object.entries(groupedByDate)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, dateEntries]) => {
        const dailySummary: DailySummary = {
          date,
          entries: dateEntries,
          totalPacks: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0
        };

        dateEntries.forEach((entry) => {
          dailySummary.totalPacks += entry.packs;
          dailySummary.totalAmount += entry.amount;

          if (entry.status === 'paid') {
            dailySummary.paidAmount += entry.amount;
          } else {
            dailySummary.pendingAmount += entry.amount;
          }
        });

        return dailySummary;
      });

    return { summary, dailySummaries };
  }, [entries]);

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__header-top">
          <div>
            <h1 className="dashboard__title">AR Organic Cashbook</h1>
            <p className="dashboard__subtitle">Track your cashbook entries and payments</p>
          </div>
          <button 
            className="btn btn-primary btn-add-entry"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Entry
          </button>
        </div>
      </div>

      <div className="dashboard__summary-cards">
        <SummaryCard 
          label="Total Packs" 
          value={summary.totalPacks}
          variant="default"
        />
        <SummaryCard 
          label="Total Amount" 
          value={summary.totalAmount}
          unit="₹"
          variant="default"
        />
        <SummaryCard 
          label="Paid Amount" 
          value={summary.paidAmount}
          unit="₹"
          variant="success"
        />
        <SummaryCard 
          label="Pending Amount" 
          value={summary.pendingAmount}
          unit="₹"
          variant="warning"
        />
      </div>

      <div className="dashboard__daily-sections">
        {dailySummaries.map((dailySummary) => (
          <DailySection key={dailySummary.date} dailySummary={dailySummary} />
        ))}
      </div>

      <AddEntryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEntry}
      />
    </div>
  );
}
