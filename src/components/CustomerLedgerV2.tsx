import { useMemo, useState, useCallback } from 'react';
import type { SaleEntry, PaymentEntry } from '../types';

interface CustomerLedgerV2Props {
  customerName: string;
  sales: SaleEntry[];
  payments: PaymentEntry[];
  onClose: () => void;
  onAddPayment: (customer: string) => void;
  onEditPayment?: (payment: PaymentEntry) => void;
  onEditSale?: (sale: SaleEntry) => void;
  onRefresh?: () => Promise<void>;
}

// Combined transaction row type
interface TransactionRow {
  id: string;
  date: string;
  type: 'sale';
  packs: number;
  paidPacks: number;
  pendingPacks: number;
  description?: string;
  amount: number;
  paid: number;
  pending: number;
  sale: SaleEntry;
  payments: PaymentEntry[];
}

export function CustomerLedgerV2({ 
  customerName, 
  sales, 
  payments, 
  onClose,
  onAddPayment,
  onEditPayment,
  onEditSale,
  onRefresh
}: CustomerLedgerV2Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  // Filter payments for this customer only
  const customerPayments = useMemo(() => {
    return payments.filter(p => p.customer === customerName);
  }, [payments, customerName]);

  // Create combined rows - each sale is a row with its payments
  const transactionRows = useMemo<TransactionRow[]>(() => {
    return sales.map(sale => {
      // Find payments for this sale (match by customer and date)
      const salePayments = customerPayments.filter(p => 
        p.date === sale.date
      );
      
      const paid = salePayments.reduce((sum, p) => sum + p.amount_paid, 0);
      const pending = Math.max(0, sale.amount - paid);
      
      // Calculate pack breakdown based on payment proportion
      const paymentRatio = sale.amount > 0 ? paid / sale.amount : 0;
      const paidPacks = Math.round(sale.packs * paymentRatio);
      const pendingPacks = sale.packs - paidPacks;
      
      return {
        id: sale.id,
        date: sale.date,
        type: 'sale' as const,
        packs: sale.packs,
        paidPacks,
        pendingPacks,
        description: sale.description,
        amount: sale.amount,
        paid: paid,
        pending: pending,
        sale: sale,
        payments: salePayments
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, customerPayments]);

  // Calculate totals using only this customer's data
  const totals = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
    const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount_paid, 0);
    const totalPacks = sales.reduce((sum, s) => sum + s.packs, 0);
    const pendingAmount = Math.max(0, totalSales - totalPaid);
    
    // Calculate pack breakdown
    const totalPaidPacks = transactionRows.reduce((sum, row) => sum + row.paidPacks, 0);
    const totalPendingPacks = transactionRows.reduce((sum, row) => sum + row.pendingPacks, 0);
    
    return {
      totalSales,
      totalPaid,
      pendingAmount,
      totalPacks,
      totalPaidPacks,
      totalPendingPacks
    };
  }, [sales, payments, transactionRows]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr;
  };

  // Pull to refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart !== null && window.scrollY === 0) {
      const diff = e.touches[0].clientY - touchStart;
      if (diff > 0) {
        setPullDistance(Math.min(diff * 0.5, 80));
      }
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60 && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    setTouchStart(null);
  }, [pullDistance, onRefresh, isRefreshing]);

  return (
    <div 
      className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-transform"
          style={{ 
            transform: `translateY(${pullDistance}px)`,
            opacity: Math.min(pullDistance / 60, 1)
          }}
        >
          <div className="bg-white rounded-full shadow-lg p-3 flex items-center gap-2">
            {isRefreshing ? (
              <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-[#2e823f] rounded-full"></div>
            ) : (
              <svg 
                className="w-5 h-5 text-[#2e823f]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ transform: `rotate(${Math.min(pullDistance * 2, 180)}deg)` }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span className="text-xs text-gray-600">
              {isRefreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-gradient-to-r from-[#073011] via-[#2e823f] to-[#031d0a] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white hover:text-green-200 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-bold truncate max-w-[200px] sm:max-w-md">
              {customerName}
            </h1>
            <button
              onClick={() => onAddPayment(customerName)}
              className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition"
            >
              + Payment
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">📦</span>
              <span className="text-[9px] sm:text-xs font-medium text-blue-600">Total</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-blue-600">{totals.totalPacks}</p>
            <p className="text-[9px] text-gray-400">packs</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">✅</span>
              <span className="text-[9px] sm:text-xs font-medium text-green-600">Paid</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-green-600">{totals.totalPaidPacks}</p>
            <p className="text-[9px] text-gray-400">packs</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">⏳</span>
              <span className="text-[9px] sm:text-xs font-medium text-red-600">Pending</span>
            </div>
            <p className={`text-sm sm:text-lg font-bold ${totals.totalPendingPacks > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totals.totalPendingPacks}
            </p>
            <p className="text-[9px] text-gray-400">packs</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">💰</span>
              <span className="text-[9px] sm:text-xs font-medium text-gray-600">Sales</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-gray-900">₹{totals.totalSales.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400">total</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">💵</span>
              <span className="text-[9px] sm:text-xs font-medium text-green-600">Paid</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-green-600">₹{totals.totalPaid.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400">received</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">🕐</span>
              <span className="text-[9px] sm:text-xs font-medium text-red-600">Pending</span>
            </div>
            <p className={`text-sm sm:text-lg font-bold ${totals.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{totals.pendingAmount.toLocaleString()}
            </p>
            <p className="text-[9px] text-gray-400">balance</p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-3 sm:px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Transaction History</h3>
          </div>
          
          {transactionRows.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-[10px] sm:text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-2 sm:px-3 py-2 text-left">Date</th>
                    <th className="px-2 sm:px-3 py-2 text-left">Details</th>
                    <th className="px-2 sm:px-3 py-2 text-right">Amount</th>
                    <th className="px-2 sm:px-3 py-2 text-right">Paid</th>
                    <th className="px-2 sm:px-3 py-2 text-right">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactionRows.map((row) => (
                    <tr 
                      key={row.id} 
                      className="hover:bg-gray-50 text-xs sm:text-sm cursor-pointer"
                      onClick={() => onEditSale?.(row.sale)}
                    >
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-600">
                        <div>{formatDate(row.date)}</div>
                        <div className="text-[10px] text-gray-400">{formatTime(row.sale.time)}</div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-600">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{row.packs} packs</span>
                            {/* {row.paidPacks > 0 && (
                              <span className="text-[10px] text-green-600">({row.paidPacks} paid)</span>
                            )} */}
                            {/* {row.pendingPacks > 0 && (
                              <span className="text-[10px] text-red-600">({row.pendingPacks} pending)</span>
                            )} */}
                          </div>
                          {row.description && (
                            <p className="text-[10px] sm:text-xs text-gray-400">{row.description}</p>
                          )}
                          {row.payments.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {row.payments.map((payment, idx) => (
                                <div 
                                  key={payment.id}
                                  className="text-[10px] text-green-600 cursor-pointer hover:underline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditPayment?.(payment);
                                  }}
                                >
                                  💵 {payment.note || 'Payment'}: ₹{payment.amount_paid.toLocaleString()}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-right font-medium text-blue-600">
                        ₹{row.amount.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-right font-medium text-green-600">
                        ₹{row.paid.toLocaleString()}
                      </td>
                      <td className={`px-2 sm:px-3 py-2 sm:py-3 text-right font-semibold ${
                        row.pending > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ₹{row.pending.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
