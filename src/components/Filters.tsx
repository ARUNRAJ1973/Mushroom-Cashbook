import { useState } from 'react';

interface FiltersProps {
  month: string;
  fromDate: string;
  toDate: string;
  searchQuery: string;
  availableMonths: string[];
  onMonthChange: (month: string) => void;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onSearchChange: (query: string) => void;
  onExportCSV: () => void;
}

export function Filters({
  month,
  fromDate,
  toDate,
  searchQuery,
  availableMonths,
  onMonthChange,
  onFromDateChange,
  onToDateChange,
  onSearchChange,
  onExportCSV
}: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = month || fromDate || toDate || searchQuery;

  return (
    <div className="mb-3 sm:mb-6">
      {/* Mobile Filter Toggle */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition ${
            hasActiveFilters
              ? 'bg-green-50 border-green-200 text-[#2e823f]'
              : 'bg-white border-gray-200 text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🔍</span>
            <span className="font-medium text-xs">
              {hasActiveFilters ? 'Filters On' : 'Filter'}
            </span>
            {hasActiveFilters && (
              <span className="bg-[#2e823f] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px]">
                {[month, fromDate, toDate, searchQuery].filter(Boolean).length}
              </span>
            )}
          </div>
          <span className={`transform transition-transform text-xs ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} sm:block mt-2 sm:mt-0`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2.5 sm:p-4">
          {/* Mobile: Compact horizontal scroll layout */}
          <div className="sm:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
              {/* Search by Name */}
              <div className="flex-shrink-0 w-32">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search customer "
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#2e823f] focus:border-[#2e823f]"
                />
              </div>

              {/* Month Select */}
              <div className="flex-shrink-0 w-28">
                <select
                  value={month}
                  onChange={(e) => onMonthChange(e.target.value)}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#2e823f] focus:border-[#2e823f]"
                >
                  <option value="">All</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {new Date(m + '-01').toLocaleDateString('en-US', {
                        month: 'short',
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="flex-shrink-0 w-28">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => onFromDateChange(e.target.value)}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#2e823f] focus:border-[#2e823f]"
                  placeholder="From"
                />
              </div>
              <div className="flex-shrink-0 w-28">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => onToDateChange(e.target.value)}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#2e823f] focus:border-[#2e823f]"
                  placeholder="To"
                />
              </div>

              {/* Action Buttons */}
              <button
                onClick={onExportCSV}
                className="flex-shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition"
              >
                {/* 🚀 */}
                ⤓ Download
              </button>

              <button
                onClick={() => {
                  onMonthChange('');
                  onFromDateChange('');
                  onToDateChange('');
                  onSearchChange('');
                }}
                disabled={!hasActiveFilters}
                className="flex-shrink-0 px-3 py-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-500 text-red-500 disabled:text-gray-300 rounded-lg text-xs font-medium transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Desktop: Full grid layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Search Name
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by customer name..."
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent focus:bg-white text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => onMonthChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent focus:bg-white text-sm transition"
              >
                <option value="">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {new Date(m + '-01').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent focus:bg-white text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent focus:bg-white text-sm transition"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={onExportCSV}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                <span>📥</span>
                <span>Download</span>
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  onMonthChange('');
                  onFromDateChange('');
                  onToDateChange('');
                  onSearchChange('');
                }}
                disabled={!hasActiveFilters}
                className="w-full bg-red-50 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 text-red-600 disabled:text-gray-400 font-medium py-2.5 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                <span>✕</span>
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
