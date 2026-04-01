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
  isPaid: boolean;
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

  // Calculate customer-level totals first
  const customerTotals = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
    const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount_paid, 0);
    const totalPacks = sales.reduce((sum, s) => sum + s.packs, 0);
    const pendingAmount = Math.max(0, totalSales - totalPaid);
    
    return {
      totalSales,
      totalPaid,
      pendingAmount,
      totalPacks
    };
  }, [sales, customerPayments]);

  // Create transaction rows - show sales with status based on payments for that specific sale
  const transactionRows = useMemo<TransactionRow[]>(() => {
    return sales.map(sale => {
      // Find payments for this sale date (to determine sale status)
      const salePayments = customerPayments.filter(p => 
        p.date === sale.date
      );
      
      const salePaidAmount = salePayments.reduce((sum, p) => sum + p.amount_paid, 0);
      const isPaid = salePaidAmount >= sale.amount;
      
      return {
        id: sale.id,
        date: sale.date,
        type: 'sale' as const,
        packs: sale.packs,
        paidPacks: isPaid ? sale.packs : 0,
        pendingPacks: isPaid ? 0 : sale.packs,
        description: sale.description,
        amount: sale.amount,
        paid: salePaidAmount,
        pending: Math.max(0, sale.amount - salePaidAmount),
        isPaid,
        sale: sale,
        payments: salePayments
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, customerPayments]);

  // Calculate display totals using customer-level calculations
  const totals = useMemo(() => {
    const { totalSales, totalPaid, pendingAmount, totalPacks } = customerTotals;
    
    // Calculate pack breakdown based on payment ratio
    const paymentRatio = totalSales > 0 ? totalPaid / totalSales : 0;
    const totalPaidPacks = Math.round(totalPacks * paymentRatio);
    const totalPendingPacks = totalPacks - totalPaidPacks;
    
    return {
      totalSales,
      totalPaid,
      pendingAmount,
      totalPacks,
      totalPaidPacks,
      totalPendingPacks
    };
  }, [customerTotals]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
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
      <header className="bg-gradient-to-r from-[#3d571d] via-[#3d571d] to-[#3d571d] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center text-white hover:text-green-200 transition"
            >
                  {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg> */}
              <span className="text-sm font-medium">◀️ Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-bold truncate max-w-[200px] sm:max-w-md">
              {customerName}
            </h1>
            {/* <button
              onClick={() => onAddPayment(customerName)}
              className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition"
            >
              + Payment
            </button> */}
            <div className="w-8"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-md">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">📦</span>
              <span className="text-[11px] sm:text-xs font-bold text-blue-600">Total</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-blue-600">{totals.totalPacks}</p>
            <p className="text-[11px] text-gray-900">packs</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-md">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">✅</span>
              <span className="text-[11px] sm:text-xs font-bold text-green-600">Paid</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-green-600">{totals.totalPaidPacks}</p>
            <p className="text-[11px] text-gray-900">packs</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-md">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">⏳</span>
              <span className="text-[11px] sm:text-xs font-bold text-orange-900">Pending</span>
            </div>
            <p className={`text-sm sm:text-lg font-bold ${totals.totalPendingPacks > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {totals.totalPendingPacks}
            </p>
            <p className="text-[11px] text-gray-900">packs</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-md">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">💰</span>
              <span className="text-[11px] sm:text-xs font-bold text-gray-600">Sales</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-gray-900">₹{totals.totalSales.toLocaleString()}</p>
            <p className="text-[11px] text-gray-900">total</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-md">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">💵</span>
              <span className="text-[11px] sm:text-xs font-bold text-green-600">Paid</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-green-600">₹{totals.totalPaid.toLocaleString()}</p>
            <p className="text-[11px] text-gray-900">received</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-md">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs sm:text-lg">🕐</span>
              <span className="text-[11px] sm:text-xs font-bold text-orange-900">Pending</span>
            </div>
            <p className={`text-sm sm:text-lg font-bold ${totals.pendingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              ₹{totals.pendingAmount.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-800">balance</p>
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
                    <th className="px-2 sm:px-3 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactionRows.map((row) => (
                    <tr 
                      key={row.id} 
                      className="hover:bg-gray-50 text-xs sm:text-sm cursor-pointer"
                      onClick={() => onEditSale?.(row.sale)}
                    >
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-900">
                        <div>{formatDate(row.date)}</div>
                        <div className="text-[10px] text-gray-900">{formatTime(row.sale.time)}</div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-900">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{row.packs} packs</span>
                          </div>
                          {row.description && (
                            <p className="text-[10px] sm:text-xs text-gray-900">{row.description}</p>
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
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-blue-600">
                        ₹{row.amount.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                        {row.isPaid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-900">
                            Pending
                          </span>
                        )}
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
