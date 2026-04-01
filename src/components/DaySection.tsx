import type { CashbookEntry } from '../types';
import { calculateTotals } from '../utils/calculateTotals';

interface DaySectionProps {
  date: string;
  entries: CashbookEntry[];
  onAddEntry: () => void;
  onEditEntry: (entry: CashbookEntry) => void;
  onViewCustomer?: (customerName: string) => void;
}

export function DaySection({ date, entries, onAddEntry, onEditEntry, onViewCustomer }: DaySectionProps) {
  const totals = calculateTotals(entries);
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const isToday = new Date().toDateString() === dateObj.toDateString();

  return (
    <div className="mb-4 sm:mb-6">
      {/* Date Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md border border-gray-400 flex flex-col items-center justify-center ${
            isToday ? 'bg-[#2e823f] text-white' : 'bg-gray-300 text-gray-800'
          }`}>
            <span className="text-[10px] sm:text-xs font-medium uppercase">{dayName}</span>
            <span className="text-sm sm:text-lg font-bold leading-none">{dateObj.getDate()}</span>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-900">{formattedDate}</p>
            <p className="text-xs text-gray-900">{entries.length} entries</p>
          </div>
        </div>
      </div>

      {/* Entry Cards */}
      <div className="space-y-2 sm:space-y-3">
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            onClick={() => onEditEntry(entry)}
            className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer active:scale-[0.98]"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 
                  className="font-semibold text-[#2e823f] text-sm sm:text-base truncate cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewCustomer?.(entry.customer);
                  }}
                >
                  {entry.customer}
                </h4>
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                      entry.status === 'paid'
                        ? 'bg-green-100 text-green-900'
                        : 'bg-orange-100 text-orange-900'
                    }`}
                  >
                    {entry.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-gray-900">{entry.time} {"→"} {entry.packs} Packs</p>
                {entry.description && (
                  <p className="text-xs text-gray-900 mt-1 truncate">{entry.description}</p>
                )}
              </div>
              <div className="text-right ml-3">
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  ₹{entry.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-900 mt-1">Tap to Edit</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Summary */}
      <div className="mt-2 sm:mt-3 bg-gray-50 rounded-xl p-3 flex items-center justify-between">
        <span className="text-xs text-gray-900">Day Total</span>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs text-gray-900">
            {totals.totalPacks} <span className="text-gray-900">Packs</span>
          </span>
          <span className="text-sm font-bold text-gray-900">
            ₹{totals.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
