import type { CashbookEntry } from "../types";

interface EntryTableProps {
  entries: CashbookEntry[];
  onAddEntry: () => void;
  onEditEntry: (entry: CashbookEntry) => void;
  onViewCustomer?: (customerName: string) => void;
}

export function EntryTable({ entries, onAddEntry, onEditEntry, onViewCustomer }: EntryTableProps) {
  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, CashbookEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="mb-4 sm:mb-6">
      {/* Mobile View */}
      <div className="sm:hidden space-y-4">
        {entries.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
            <p className="text-base mb-4">No pending entries</p>
          </div>
        ) : (
          sortedDates.map((date) => {
            const dateObj = new Date(date);
            const dayEntries = groupedEntries[date];
            const isToday = new Date().toDateString() === dateObj.toDateString();

            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center ${
                    isToday ? 'bg-[#2e823f] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className="text-[8px] font-medium uppercase">
                      {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-xs font-bold leading-none">{dateObj.getDate()}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' , year: 'numeric' })}
                  </span>
                  <span className="text-xs text-gray-700">{"→"} {dayEntries.length} entries</span>
                </div>

                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <div 
                      key={entry.id}
                      onClick={() => onEditEntry(entry)}
                      className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 
                              className="font-semibold text-[#2e823f] text-sm truncate cursor-pointer hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewCustomer?.(entry.customer);
                              }}
                            >
                              {entry.customer}
                            </h4>
                            <span
                              className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                entry.status === 'paid'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-900'
                              }`}
                            >
                              {entry.status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{entry.time} {"→"} {entry.packs} Packs</p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-base font-bold text-gray-900">
                            ₹{entry.amount.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">Edit</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Packs
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg mb-4">No entries found</p>
                    <button
                      onClick={onAddEntry}
                      className="bg-[#073011] hover:bg-[#2e823f] text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                      + Add First Entry
                    </button>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => onEditEntry(entry)}
                    className="hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          weekday: 'short',
                        })}
                      </div>
                      
                      <div className="text-xs text-gray-500">{entry.time}</div>
                    </td>
                    <td 
                      className="px-6 py-4 text-sm font-medium text-[#2e823f] cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCustomer?.(entry.customer);
                      }}
                    >
                      {entry.customer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {entry.packs}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ₹{entry.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          entry.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : "bg-red-100 text-red-900"
                        }`}
                      >
                        {entry.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {entries.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={onAddEntry}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              + Add Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
