import type { SaleEntry, PaymentEntry } from '../types';
import { useMemo } from 'react';

interface AnalyticsProps {
  sales: SaleEntry[];
  payments: PaymentEntry[];
  onClose: () => void;
}

export function Analytics({ sales, payments, onClose }: AnalyticsProps) {
  const stats = useMemo(() => {
    if (sales.length === 0) {
      return {
        totalPacks: 0,
        totalRevenue: 0,
        totalPending: 0,
        avgPacksPerDay: 0,
        bestSellingDay: null as { date: string; packs: number } | null,
        dailyData: [] as { date: string; packs: number; revenue: number }[],
        paidAmount: 0,
        pendingAmount: 0,
      };
    }

    // Group sales by date
    const byDate = sales.reduce((acc, sale) => {
      if (!acc[sale.date]) {
        acc[sale.date] = { packs: 0, revenue: 0 };
      }
      acc[sale.date].packs += sale.packs;
      acc[sale.date].revenue += sale.amount;
      return acc;
    }, {} as Record<string, { packs: number; revenue: number }>);

    const dailyData = Object.entries(byDate)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalPacks = sales.reduce((sum, s) => sum + s.packs, 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
    
    // Calculate paid amount from payments
    const paidAmount = payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const pendingAmount = Math.max(0, totalRevenue - paidAmount);
    
    const uniqueDays = Object.keys(byDate).length;
    const avgPacksPerDay = uniqueDays > 0 ? totalPacks / uniqueDays : 0;
    
    const bestSellingDay = dailyData.reduce((best, current) => 
      current.packs > best.packs ? current : best
    , dailyData[0]);

    return {
      totalPacks,
      totalRevenue,
      totalPending: pendingAmount,
      paidAmount,
      pendingAmount,
      avgPacksPerDay,
      bestSellingDay,
      dailyData: dailyData.slice(0, 7), // Last 7 days for chart
    };
  }, [sales, payments]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate max for bar chart scaling
  const maxPacks = Math.max(...stats.dailyData.map(d => d.packs), 1);

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2a803d] via-[#2a803d] to-[#2a803d] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white hover:text-green-200 transition"
            >
              {/* <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg> */}
              <span className="text-xs sm:text-sm font-medium">◀️ Back</span>
            </button>
            <h1 className="text-base sm:text-xl font-bold">Analytics</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {sales.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-lg text-gray-900">No data available for analytics</p>
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 ">
              {/* Total Packs */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-[0_0_35px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-sm sm:text-lg">📦</span>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-900 uppercase">Total Packs</span>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.totalPacks.toLocaleString()}</p>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-[0_0_35px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-sm sm:text-lg">💰</span>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-900 uppercase">Revenue</span>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>

              {/* Total Pending */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-[0_0_35px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-sm sm:text-lg">⏳</span>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-900 uppercase">Pending</span>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-orange-600">₹{stats.totalPending.toLocaleString()}</p>
              </div>

              {/* Avg Packs/Day */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-[0_0_35px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-sm sm:text-lg">📊</span>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-900 uppercase">Avg Packs/Day</span>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-blue-600">{stats.avgPacksPerDay.toFixed(1)}</p>
              </div>
            </div>

            {/* Best Selling Day */}
            {stats.bestSellingDay && (
              <div className="bg-gradient-to-r from-[#25803a] to-[#207534] rounded-xl p-3 sm:p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm sm:text-sm mb-1">🏆 Best Selling Day</p>
                    <p className="text-lg sm:text-3xl font-bold">{formatDate(stats.bestSellingDay.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl sm:text-4xl font-bold">{stats.bestSellingDay.packs}</p>
                    <p className="text-white text-xs sm:text-sm">packs sold</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Status Breakdown */}
            <div className="bg-white rounded-xl p-3 sm:p-6 border border-gray-100 shadow-[0_0_35px_rgba(0,0,0,0.1)] mb-6">
              <h3 className="text-xs sm:text-sm font-medium text-gray-800 uppercase tracking-wide mb-3 sm:mb-4">Payment Status</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-green-100 border border-green-500 rounded-xl p-3 sm:p-4 text-center shadow-sm">
                  <p className="text-green-900 text-[12px] sm:text-xs font-medium mb-1">Paid</p>
                  <p className="text-base sm:text-2xl font-bold text-green-900">₹{stats.paidAmount.toLocaleString()}</p>
                </div>
                <div className="bg-orange-100 border border-orange-500 rounded-xl p-3 sm:p-4 text-center shadow-sm">
                  <p className="text-orange-900 text-[12px] sm:text-xs font-medium mb-1">Pending</p>
                  <p className="text-base sm:text-2xl font-bold text-orange-900">₹{stats.pendingAmount.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-5 sm:mt-5">
                <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-300 to-green-600 rounded-full transition-all"
                    style={{ 
                      width: `${stats.totalRevenue > 0 ? (stats.paidAmount / stats.totalRevenue) * 100 : 0}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[12px] sm:text-xs text-gray-900">
                  <span>{stats.totalRevenue > 0 ? ((stats.paidAmount / stats.totalRevenue) * 100).toFixed(0) : 0}% Paid</span>
                  <span>{stats.totalRevenue > 0 ? ((stats.pendingAmount / stats.totalRevenue) * 100).toFixed(0) : 0}% Pending</span>
                </div>
              </div>
            </div>

            {/* Daily Performance Chart */}
            {stats.dailyData.length > 0 && (
              <div className="bg-white rounded-xl p-3 sm:p-6 border border-gray-100 shadow-[0_0_35px_rgba(0,0,0,0.1)]">
                <h3 className="text-xs sm:text-sm font-medium text-gray-800 uppercase tracking-wide mb-3 sm:mb-4">Last 7 Days Performance</h3>
                <div className="space-y-2 sm:space-y-3">
                  {stats.dailyData.map((day) => (
                    <div key={day.date} className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[11px] sm:text-xs text-gray-800 w-12 sm:w-16 flex-shrink-0">{formatDate(day.date)}</span>
                      <div className="flex-1 h-6 sm:h-8 bg-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#2e823f] to-[#4ade80] rounded-lg flex items-center px-2 transition-all"
                          style={{ width: `${(day.packs / maxPacks) * 100}%` }}
                        >
                          <span className="text-white text-[11px] sm:text-xs font-medium">{day.packs}</span>
                        </div>
                      </div>
                      <span className="text-[11px] sm:text-xs text-gray-900 w-12 sm:w-16 text-right">₹{day.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
