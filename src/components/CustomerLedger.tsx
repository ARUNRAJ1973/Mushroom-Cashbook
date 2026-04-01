import type { CashbookEntry } from '../types';
import { calculateCustomerTotals } from '../utils/customerUtils';

interface CustomerLedgerProps {
  customerName: string;
  entries: CashbookEntry[];
  onClose: () => void;
  onMarkAsPaid: (entryId: string) => void;
  onEditEntry: (entry: CashbookEntry) => void;
}

export function CustomerLedger({ 
  customerName, 
  entries, 
  onClose, 
  onMarkAsPaid,
  onEditEntry 
}: CustomerLedgerProps) {
  const totals = calculateCustomerTotals(entries);
  
  // Group entries by date
  const groupedByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, CashbookEntry[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#073011] via-[#2e823f] to-[#031d0a] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white hover:text-green-200 transition"
            >
              {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg> */}
              <span className="text-sm font-medium">◀️ Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-bold truncate max-w-[200px] sm:max-w-md">
              {customerName}
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Customer Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {/* Total Packs */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-xs sm:text-lg">📦</span>
              <span className="text-[9px] sm:text-xs font-medium text-blue-600">Total Packs</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-blue-600">{totals.totalPacks}</p>
          </div>

          {/* Total Amount */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-xs sm:text-lg">💰</span>
              <span className="text-[9px] sm:text-xs font-medium text-gray-800">Total Amount</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-gray-900">₹{totals.totalAmount.toLocaleString()}</p>
          </div>
          
          {/* Paid Packs */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-xs sm:text-lg">✅</span>
              <span className="text-[9px] sm:text-xs font-medium text-green-800">Paid Packs</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-green-800">{totals.paidPacks}</p>
          </div>

          {/* Paid Amount */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-xs sm:text-lg">💵</span>
              <span className="text-[9px] sm:text-xs font-medium text-green-800">Paid</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-green-800">₹{totals.paidAmount.toLocaleString()}</p>
          </div>
          
          {/* Pending Packs */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-xs sm:text-lg">⏳</span>
              <span className="text-[9px] sm:text-xs font-medium text-orange-600">Pending Packs</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-orange-600">{totals.pendingPacks}</p>
          </div>
          
          {/* Pending Amount */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-xs sm:text-lg">💳</span>
              <span className="text-[9px] sm:text-xs font-medium text-orange-600">Pending</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-orange-600">₹{totals.pendingAmount.toLocaleString()}</p>
          </div>



        </div>

        {/* Entries by Date */}
        <div className="space-y-4 sm:space-y-6">
          {sortedDates.map(date => {
            const dateEntries = groupedByDate[date];
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const isToday = new Date().toDateString() === dateObj.toDateString();

            return (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Date Header */}
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex flex-col items-center justify-center ${
                      isToday ? 'bg-[#2e823f] text-white' : 'bg-white text-gray-700 border border-gray-300'
                    }`}>
                      <span className="text-[8px] sm:text-[10px] font-medium uppercase">{dayName}</span>
                      <span className="text-xs sm:text-sm font-bold leading-none">{dateObj.getDate()}</span>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-900">{formattedDate}</p>
                      <p className="text-xs text-gray-800">{dateEntries.length} entries</p>
                    </div>
                  </div>
                </div>

                {/* Entries List */}
                <div className="divide-y divide-gray-100">
                  {dateEntries.map(entry => (
                    <div 
                      key={entry.id}
                      className="p-3 sm:p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-700">{entry.time}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              entry.status === 'paid'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-orange-200 text-orange-900'
                            }`}>
                              {entry.status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                          {entry.description && (
                            <p className="text-xs sm:text-sm text-gray-700 mb-1">{entry.description}</p>
                          )}
                          <p className="text-xs text-gray-700">{entry.packs} Packs</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-bold text-gray-900">
                            ₹{entry.amount.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2 justify-end">
                            {entry.status === 'pending' && (
                              <button
                                onClick={() => onMarkAsPaid(entry.id)}
                                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg transition"
                              >
                                Mark as Paid
                              </button>
                            )}
                            <button
                              onClick={() => onEditEntry(entry)}
                              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {entries.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
            <p className="text-gray-500">No entries found for this customer</p>
          </div>
        )}
      </main>
    </div>
  );
}
