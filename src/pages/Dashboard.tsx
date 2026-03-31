import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { SaleEntry, PaymentEntry, CashbookEntry } from "../types";
import { Header } from '../components/Header';
import { SummaryCards } from '../components/SummaryCards';
import { Filters } from '../components/Filters';
import { Tabs } from '../components/Tabs';
import { DaySection } from '../components/DaySection';
import { AddSaleModal } from '../components/AddSaleModal';
import { AddPaymentModal } from '../components/AddPaymentModal';
import { CustomerLedgerV2 } from '../components/CustomerLedgerV2';
import { UsersList } from '../components/UsersList';
import { Analytics } from '../components/Analytics';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { Auth } from '../components/Auth';
import { 
  getAllCustomers, 
  getCustomersWithBalances, 
  getCustomersWithPending,
  calculateDashboardTotals,
  filterSales,
  groupSalesByDate,
  getCustomerSales,
  getCustomerPayments
} from '../utils/salesPayments';
import { supabase } from '../supabaseClient';

export function Dashboard() {
  // Sales and Payments data
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal states
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<string>('');
  const [editingSale, setEditingSale] = useState<SaleEntry | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentEntry | null>(null);
  
  // View states
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending'>('all');
  const [mainView, setMainView] = useState<'dashboard' | 'customers' | 'analytics'>('dashboard');
  const [month, setMonth] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Customer ledger state
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Pull to refresh state
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const REFRESH_THRESHOLD = 80;

  // Fetch sales and payments from Supabase
  const fetchData = async (showRefreshing = false) => {
    if (!userId) return;
    
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    // Fetch sales
    const { data: salesData, error: salesError } = await supabase
      .from('sales_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (salesError) {
      console.error('Error fetching sales:', salesError);
    } else {
      console.log('Raw sales data:', salesData);
      const formattedSales: SaleEntry[] = salesData.map(item => ({
        id: item.id,
        date: item.date,
        time: item.time,
        customer: item.customer_name,
        description: item.description,
        packs: item.packs,
        amount: item.amount,
        status: item.status || 'pending',
        user_id: item.user_id
      }));
      console.log('Formatted sales:', formattedSales);
      setSales(formattedSales);
    }
    
    // Fetch payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
    } else {
      console.log('Raw payments data:', paymentsData);
      const formattedPayments: PaymentEntry[] = paymentsData.map(item => ({
        id: item.id,
        customer: item.customer_name,
        amount_paid: item.amount_paid,
        date: item.date,
        note: item.note,
        user_id: item.user_id
      }));
      console.log('Formatted payments:', formattedPayments);
      setPayments(formattedPayments);
    }
    
    if (showRefreshing) {
      setIsRefreshing(false);
    } else {
      setIsLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch data when userId changes
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  // Pull to refresh handlers (mobile only)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only enable pull to refresh when at the top of the page
    if (window.scrollY === 0) {
      setPullStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStartY;

    // Only pull down, not up
    if (diff > 0) {
      // Add resistance to the pull
      const resistedDistance = Math.min(diff * 0.5, 150);
      setPullDistance(resistedDistance);
      
      // Prevent default scrolling when pulling
      if (diff > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, pullStartY]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= REFRESH_THRESHOLD) {
      // Trigger refresh
      fetchData(true);
    }
    
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance]);

  // Get all customers
  const allCustomers = useMemo(() => {
    return getAllCustomers(sales, payments);
  }, [sales, payments]);

  // Filter sales based on selected filters (includes search for UI display)
  const filteredSales = useMemo(() => {
    let result = [...sales];
    if (month) result = result.filter(s => s.date.startsWith(month));
    if (fromDate && toDate) result = result.filter(s => s.date >= fromDate && s.date <= toDate);
    if (searchQuery.trim()) result = filterSales(result, searchQuery);
    return result;
  }, [sales, month, fromDate, toDate, searchQuery]);

  // Date-only filtered sales for CSV export (no search query, so all entries in range are exported)
  const exportSales = useMemo(() => {
    let result = [...sales];
    if (month) result = result.filter(s => s.date.startsWith(month));
    if (fromDate && toDate) result = result.filter(s => s.date >= fromDate && s.date <= toDate);
    return result;
  }, [sales, month, fromDate, toDate]);

  // Get customers with pending balance
  const customersWithPending = useMemo(() => {
    return getCustomersWithPending(sales, payments);
  }, [sales, payments]);

  // Filter payments matching the same date filter as sales
  const filteredPayments = useMemo(() => {
    let result = [...payments];
    if (month) result = result.filter(p => p.date.startsWith(month));
    if (fromDate && toDate) result = result.filter(p => p.date >= fromDate && p.date <= toDate);
    return result;
  }, [payments, month, fromDate, toDate]);

  // Calculate dashboard totals based on filtered data
  const totals = useMemo(() => {
    return calculateDashboardTotals(filteredSales, filteredPayments);
  }, [filteredSales, filteredPayments]);

  // Get grouped data for display
  const groupedData = useMemo(() => {
    return groupSalesByDate(filteredSales);
  }, [filteredSales]);

  // Calculate sale status based on payments for a specific customer and date
  const getSaleStatus = (sale: SaleEntry): 'paid' | 'pending' => {
    // First check if status is stored in the sale entry
    if (sale.status) {
      return sale.status;
    }
    // Fallback: calculate from payments for this customer and date
    const salePayments = payments.filter(p => 
      p.customer === sale.customer && p.date === sale.date
    );
    const totalPaid = salePayments.reduce((sum, p) => sum + p.amount_paid, 0);
    return totalPaid >= sale.amount ? 'paid' : 'pending';
  };

  // Get available months
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    sales.forEach(s => {
      const month = s.date.substring(0, 7);
      months.add(month);
    });
    return Array.from(months).sort().reverse();
  }, [sales]);

  // Handle add sale
  const handleAddSale = async (saleData: Omit<SaleEntry, 'id' | 'user_id'> & { status?: 'paid' | 'pending' }, paymentAmount?: number, paymentType?: 'Cash' | 'UPI') => {
    const { error } = await supabase
      .from('sales_entries')
      .insert([{
        date: saleData.date,
        time: saleData.time,
        customer_name: saleData.customer,
        description: saleData.description,
        packs: saleData.packs,
        amount: saleData.amount,
        status: saleData.status || 'pending',
        user_id: userId
      }]);

    if (error) {
      console.error('Error adding sale:', error);
      alert('Error adding sale');
      return;
    }

    // If payment amount provided, create payment entry
    if (paymentAmount && paymentAmount > 0) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          customer_name: saleData.customer,
          amount_paid: paymentAmount,
          date: saleData.date,
          note: paymentType || 'Cash',
          user_id: userId
        }]);

      if (paymentError) {
        console.error('Error adding payment:', paymentError);
      }
    }

    await fetchData();
    setIsSaleModalOpen(false);
  };

  // Handle edit sale
  const handleEditSale = async (saleData: Omit<SaleEntry, 'id' | 'user_id'> & { status?: 'paid' | 'pending' }, paymentAmount?: number, paymentType?: 'Cash' | 'UPI') => {
    if (!editingSale) return;

    const { error } = await supabase
      .from('sales_entries')
      .update({
        date: saleData.date,
        time: saleData.time,
        customer_name: saleData.customer,
        description: saleData.description,
        packs: saleData.packs,
        amount: saleData.amount,
        status: saleData.status || 'pending',
      })
      .eq('id', editingSale.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating sale:', error);
      alert('Error updating sale');
      return;
    }

    // If payment amount provided, create payment entry
    if (paymentAmount && paymentAmount > 0) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          customer_name: saleData.customer,
          amount_paid: paymentAmount,
          date: saleData.date,
          note: paymentType || 'Cash',
          user_id: userId
        }]);

      if (paymentError) {
        console.error('Error adding payment:', paymentError);
      }
    }

    setEditingSale(null);
    await fetchData();
    setIsSaleModalOpen(false);
  };

  // Handle delete sale
  const handleDeleteSale = async (saleId: string) => {
    // First, get the sale details to find related payments
    const { data: saleData } = await supabase
      .from('sales_entries')
      .select('customer_name, date')
      .eq('id', saleId)
      .eq('user_id', userId)
      .single();

    if (saleData) {
      // Delete related payments for this customer and date
      const { error: paymentError } = await supabase
        .from('payments')
        .delete()
        .eq('customer_name', saleData.customer_name)
        .eq('date', saleData.date)
        .eq('user_id', userId);

      if (paymentError) {
        console.error('Error deleting payments:', paymentError);
      }
    }

    // Delete the sale
    const { error } = await supabase
      .from('sales_entries')
      .delete()
      .eq('id', saleId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting sale:', error);
      alert('Error deleting sale');
      return;
    }

    setEditingSale(null);
    await fetchData();
    setIsSaleModalOpen(false);
  };

  // Handle edit entry click
  const handleEditEntry = (entry: CashbookEntry) => {
    const saleEntry: SaleEntry = {
      id: entry.id,
      date: entry.date,
      time: entry.time,
      customer: entry.customer,
      description: entry.description,
      packs: entry.packs,
      amount: entry.amount,
      status: entry.status,
      user_id: userId || ''
    };
    setEditingSale(saleEntry);
    setIsSaleModalOpen(true);
  };

  // Update sale status in database based on payments
  const updateSaleStatus = async (customer: string, date: string) => {
    // Find the sale for this customer and date
    const { data: salesData } = await supabase
      .from('sales_entries')
      .select('id, amount')
      .eq('customer_name', customer)
      .eq('date', date)
      .eq('user_id', userId);

    if (!salesData || salesData.length === 0) return;

    // Get all payments for this customer and date
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('customer_name', customer)
      .eq('date', date)
      .eq('user_id', userId);

    const totalPaid = paymentsData?.reduce((sum, p) => sum + p.amount_paid, 0) || 0;

    // Update each sale's status
    for (const sale of salesData) {
      const newStatus = totalPaid >= sale.amount ? 'paid' : 'pending';
      
      await supabase
        .from('sales_entries')
        .update({ status: newStatus })
        .eq('id', sale.id)
        .eq('user_id', userId);
    }
  };

  // Handle add payment
  const handleAddPayment = async (paymentData: Omit<PaymentEntry, 'id' | 'user_id'>) => {
    const { error } = await supabase
      .from('payments')
      .insert([{
        customer_name: paymentData.customer,
        amount_paid: paymentData.amount_paid,
        date: paymentData.date,
        note: paymentData.note,
        user_id: userId
      }]);

    if (error) {
      console.error('Error adding payment:', error);
      alert('Error adding payment');
      return;
    }

    // Update sale status if there's a matching sale
    await updateSaleStatus(paymentData.customer, paymentData.date);

    await fetchData();
    setIsPaymentModalOpen(false);
  };

  // Handle edit payment
  const handleEditPayment = async (paymentData: Omit<PaymentEntry, 'id' | 'user_id'>) => {
    if (!editingPayment) return;

    const { error } = await supabase
      .from('payments')
      .update({
        customer_name: paymentData.customer,
        amount_paid: paymentData.amount_paid,
        date: paymentData.date,
        note: paymentData.note,
      })
      .eq('id', editingPayment.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment');
      return;
    }

    // Update sale status for both old and new customer/date if changed
    await updateSaleStatus(editingPayment.customer, editingPayment.date);
    if (editingPayment.customer !== paymentData.customer || editingPayment.date !== paymentData.date) {
      await updateSaleStatus(paymentData.customer, paymentData.date);
    }

    setEditingPayment(null);
    await fetchData();
    setIsPaymentModalOpen(false);
  };

  // Handle delete payment
  const handleDeletePayment = async (paymentId: string) => {
    // Get payment details before deleting
    const { data: paymentData } = await supabase
      .from('payments')
      .select('customer_name, date')
      .eq('id', paymentId)
      .eq('user_id', userId)
      .single();

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting payment:', error);
      alert('Error deleting payment');
      return;
    }

    // Update sale status after payment deletion
    if (paymentData) {
      await updateSaleStatus(paymentData.customer_name, paymentData.date);
    }

    setEditingPayment(null);
    await fetchData();
  };

  const handleViewCustomer = (customerName: string) => {
    setSelectedCustomer(customerName);
  };

  const handleCloseLedger = () => {
    setSelectedCustomer(null);
  };

  const handleAuthSuccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      setIsAuthenticated(true);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserId(null);
    setSales([]);
    setPayments([]);
    setShowLogoutConfirm(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };



  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // Build filter label for summary
    let filterLabel = 'All Time';
    if (month) filterLabel = `Month: ${month}`;
    else if (fromDate && toDate) filterLabel = `${fromDate} to ${toDate}`;

    // Filter sales and payments based on active tab
    let tabFilteredSales = [...exportSales];
    let tabFilteredPayments = [...filteredPayments];

    if (activeTab === 'paid') {
      // Only fully paid customers (pending = 0 AND has sales)
      const allCustomersWithBalances = getCustomersWithBalances(exportSales, filteredPayments);
      const paidCustomers = new Set(allCustomersWithBalances.filter(c => c.pendingAmount === 0 && c.totalSales > 0).map(c => c.customer));
      tabFilteredSales = exportSales.filter(s => paidCustomers.has(s.customer));
      tabFilteredPayments = filteredPayments.filter(p => paidCustomers.has(p.customer));
    } else if (activeTab === 'pending') {
      // Only customers with pending balance (pending > 0)
      const allCustomersWithBalances = getCustomersWithBalances(exportSales, filteredPayments);
      const pendingCustomers = new Set(allCustomersWithBalances.filter(c => c.pendingAmount > 0).map(c => c.customer));
      console.log('Pending export - All customers with balances:', allCustomersWithBalances);
      console.log('Pending customers set:', Array.from(pendingCustomers));
      tabFilteredSales = exportSales.filter(s => pendingCustomers.has(s.customer));
      tabFilteredPayments = filteredPayments.filter(p => pendingCustomers.has(p.customer));
      console.log('Filtered sales count:', tabFilteredSales.length, 'Filtered payments count:', tabFilteredPayments.length);
    }
    // For 'all' tab, no filtering needed - use all exportSales and filteredPayments

    // Compute export-specific totals (tab-filtered)
    const exportTotalPacks = tabFilteredSales.reduce((sum, s) => sum + s.packs, 0);
    const exportTotalAmount = tabFilteredSales.reduce((sum, s) => sum + s.amount, 0);
    const exportTotalPaid = tabFilteredPayments.reduce((sum, p) => sum + p.amount_paid, 0);
    const exportTotalPending = Math.max(0, exportTotalAmount - exportTotalPaid);

    // Summary section
    const summaryRows = [
      ['AR Organic Cashbook - Export'],
      ['Exported At', new Date().toLocaleString()],
      ['Filter', filterLabel],
      ['Active Tab', activeTab === 'all' ? 'All' : activeTab === 'paid' ? 'Fully Paid' : 'Pending'],
      [],
      ['--- SUMMARY ---'],
      ['Total Packs', exportTotalPacks],
      ['Total Amount (₹)', exportTotalAmount],
      ['Total Paid (₹)', exportTotalPaid],
      ['Total Pending (₹)', exportTotalPending],
      [],
      ['--- SALES ENTRIES ---'],
      ['Date', 'Time', 'Customer', 'Packs', 'Amount (₹)', 'Status', 'Description'],
      ...tabFilteredSales.map(sale => [
        sale.date,
        sale.time,
        sale.customer,
        sale.packs,
        sale.amount,
        sale.status || 'pending',
        sale.description || '',
      ]),
      [],
      ['--- PAYMENTS ---'],
      ['Date', 'Customer', 'Amount Paid (₹)', 'Note'],
      ...tabFilteredPayments.map(p => [
        p.date,
        p.customer,
        p.amount_paid,
        p.note || '',
      ]),
    ];

    const csvContent = summaryRows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ar-cashbook-backup-${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };


  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Full-screen loader while initial data loads
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onLogout={handleLogoutClick} />
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">

          {/* Skeleton: Summary Cards */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-2 sm:p-4 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="h-2 w-8 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-14 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Skeleton: Filter bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3 sm:mb-6 animate-pulse">
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-16 bg-gray-200 rounded-lg ml-auto"></div>
            </div>
          </div>

          {/* Skeleton: Tabs */}
          <div className="flex gap-4 mb-4 border-b border-gray-200 animate-pulse">
            <div className="h-10 w-20 bg-gray-200 rounded-t-lg"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-t-lg"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-t-lg"></div>
          </div>

          {/* Skeleton: Entry cards */}
          {[...Array(3)].map((_, gi) => (
            <div key={gi} className="mb-6 animate-pulse">
              {/* Date header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl"></div>
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-2 w-12 bg-gray-200 rounded"></div>
                </div>
              </div>
              {/* Entry cards */}
              {[...Array(gi === 0 ? 3 : gi === 1 ? 2 : 1)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm mb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-28 bg-gray-200 rounded"></div>
                        <div className="h-4 w-14 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="h-3 w-36 bg-gray-100 rounded"></div>
                    </div>
                    <div className="ml-3 text-right space-y-1">
                      <div className="h-5 w-16 bg-gray-200 rounded"></div>
                      <div className="h-2 w-6 bg-gray-100 rounded mx-auto"></div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Day total bar */}
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between mt-2">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogoutClick} />
      
      {/* Offline/Online Status Indicator */}
      <OfflineIndicator />

      {/* Pull to Refresh Indicator - Mobile Only */}
      <div 
        className="sm:hidden fixed top-16 left-0 right-0 z-30 pointer-events-none flex justify-center"
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.5 - 40, 20)}px)`,
          opacity: Math.min(pullDistance / REFRESH_THRESHOLD, 1),
          transition: isPulling ? 'none' : 'transform 0.3s ease, opacity 0.3s ease'
        }}
      >
        <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
          {isRefreshing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full"></div>
              <span className="text-xs text-gray-600">Refreshing...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-4 h-4 text-gray-600 transition-transform"
                style={{ transform: `rotate(${Math.min(pullDistance * 2, 180)}deg)` }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-xs text-gray-600">
                {pullDistance >= REFRESH_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      <main 
        ref={contentRef}
        className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isPulling ? `translateY(${pullDistance * 0.3}px)` : 'translateY(0)',
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        {/* Summary Cards */}
        <SummaryCards totals={{
          totalPacks: totals.totalPacks,
          totalAmount: totals.totalSales,
          paidAmount: totals.totalReceived,
          pendingAmount: totals.totalPending
        }} />

        {/* Filters */}
        {/* Main Navigation Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-xl">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'customers', label: 'Customers', icon: '👥' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setMainView(view.id as typeof mainView)}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition flex items-center justify-center gap-1.5 sm:gap-2 ${
                mainView === view.id
                  ? 'bg-white text-[#2e823f] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span>{view.icon}</span>
              <span className="hidden sm:inline">{view.label}</span>
              <span className="sm:hidden">{view.label}</span>
            </button>
          ))}
        </div>

        {mainView === 'dashboard' && (
          <>
            <Filters
              month={month}
              fromDate={fromDate}
              toDate={toDate}
              searchQuery={searchQuery}
              availableMonths={availableMonths}
              onMonthChange={setMonth}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              onSearchChange={setSearchQuery}
              onExportCSV={handleExportCSV}
            />

            {/* Add Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setIsSaleModalOpen(true)}
                className="flex-1 bg-gradient-to-r from-[#113D24] to-[#19663B] hover:from-[#0a4a1a] hover:to-[#3a9a4f] text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span>+</span>
                <span>Add Sale</span>
              </button>
              {/* <button
                onClick={() => {
                  setPaymentModalCustomer('');
                  setIsPaymentModalOpen(true);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span>+</span>
                <span>Add Payment</span>
              </button> */}
            </div>

            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'all' && (
              <div>
                {groupedData.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
                    <p className="text-base sm:text-lg text-gray-500 mb-4">No sales found</p>
                    <button
                      onClick={() => setIsSaleModalOpen(true)}
                      className="bg-[#073011] hover:bg-[#2e823f] text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                      + Add First Sale
                    </button>
                  </div>
                ) : (
                  groupedData.map(dayData => (
                    <DaySection
                      key={dayData.date}
                      date={dayData.date}
                      entries={dayData.sales.map(s => ({
                        ...s, 
                        status: getSaleStatus(s), 
                        time: s.time || '00:00'
                      }))}
                      onAddEntry={() => {
                        setEditingSale(null);
                        setIsSaleModalOpen(true);
                      }}
                      onEditEntry={handleEditEntry}
                      onViewCustomer={handleViewCustomer}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'paid' && (
              <div className="space-y-4">
                {/* Fully Paid Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-green-50 px-3 sm:px-4 py-3 border-b border-green-200">
                    <h3 className="font-semibold text-green-800 text-sm sm:text-base">Fully Paid</h3>
                  </div>
                  {(() => {
                    const allCustomersWithBalances = getCustomersWithBalances(sales, payments);
                    // Fully paid: pending is 0 and has sales
                    const fullyPaidCustomers = allCustomersWithBalances.filter(c => c.pendingAmount === 0 && c.totalSales > 0);
                    if (fullyPaidCustomers.length === 0) {
                      return (
                        <div className="p-6 text-center">
                          <p className="text-gray-500 text-sm">No fully paid customers</p>
                        </div>
                      );
                    }
                    return (
                      <div className="divide-y divide-gray-100">
                        {fullyPaidCustomers.map((customer) => (
                          <div 
                            key={customer.customer}
                            onClick={() => handleViewCustomer(customer.customer)}
                            className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{customer.customer}</p>
                              <p className="text-xs text-gray-500">{customer.totalPacks} packs sold</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-700">₹{customer.totalPaid.toLocaleString()}</p>
                              <p className="text-xs text-green-600">fully paid</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Partially Paid Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-orange-50 px-3 sm:px-4 py-3 border-b border-orange-200">
                    <h3 className="font-semibold text-orange-800 text-sm sm:text-base">Partially Paid</h3>
                  </div>
                  {(() => {
                    const allCustomersWithBalances = getCustomersWithBalances(sales, payments);
                    // Partially paid: has paid some amount but still has pending balance
                    const partiallyPaidCustomers = allCustomersWithBalances.filter(c => 
                      c.totalPaid > 0 && c.pendingAmount > 0
                    );
                    if (partiallyPaidCustomers.length === 0) {
                      return (
                        <div className="p-6 text-center">
                          <p className="text-gray-500 text-sm">No partially paid customers</p>
                        </div>
                      );
                    }
                    return (
                      <div className="divide-y divide-gray-100">
                        {partiallyPaidCustomers.map((customer) => (
                          <div 
                            key={customer.customer}
                            onClick={() => handleViewCustomer(customer.customer)}
                            className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{customer.customer}</p>
                              <p className="text-xs text-gray-500">{customer.totalPacks} packs sold</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-700">₹{customer.totalPaid.toLocaleString()}</p>
                              <p className="text-xs text-orange-600">₹{customer.pendingAmount.toLocaleString()} pending</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-3 sm:px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Customers with Pending Balance</h3>
                </div>
                {customersWithPending.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No pending balances</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {customersWithPending.map((customer) => (
                      <div 
                        key={customer.customer}
                        onClick={() => handleViewCustomer(customer.customer)}
                        className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{customer.customer}</p>
                          <p className="text-xs text-gray-500">{customer.totalPacks} packs sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">₹{customer.pendingAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">pending</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


          </>
        )}
      </main>

      {/* Customers View */}
      {mainView === 'customers' && (
        <UsersList
          sales={sales}
          payments={payments}
          onViewCustomer={(name) => {
            setSelectedCustomer(name);
          }}
          onClose={() => setMainView('dashboard')}
        />
      )}

      {/* Analytics View */}
      {mainView === 'analytics' && (
        <Analytics
          sales={sales}
          payments={payments}
          onClose={() => setMainView('dashboard')}
        />
      )}

      {/* Customer Ledger */}
      {selectedCustomer && (
        <CustomerLedgerV2
          customerName={selectedCustomer}
          sales={getCustomerSales(sales, selectedCustomer)}
          payments={getCustomerPayments(payments, selectedCustomer)}
          onClose={handleCloseLedger}
          onAddPayment={(customer) => {
            setEditingPayment(null);
            setPaymentModalCustomer(customer);
            setIsPaymentModalOpen(true);
          }}
          onEditPayment={(payment) => {
            setEditingPayment(payment);
            setPaymentModalCustomer(payment.customer);
            setIsPaymentModalOpen(true);
          }}
          onEditSale={(sale) => {
            setEditingSale(sale);
            setIsSaleModalOpen(true);
          }}
          onRefresh={fetchData}
        />
      )}

      {/* Add Sale Modal */}
      <AddSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setEditingSale(null);
        }}
        onSubmit={editingSale ? handleEditSale : handleAddSale}
        onDelete={editingSale ? handleDeleteSale : undefined}
        onDeletePayment={editingSale ? handleDeletePayment : undefined}
        customers={allCustomers}
        editingSale={editingSale}
        existingPayments={payments}
      />

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setEditingPayment(null);
        }}
        onSubmit={editingPayment ? handleEditPayment : handleAddPayment}
        onDelete={editingPayment ? handleDeletePayment : undefined}
        customers={allCustomers}
        preselectedCustomer={paymentModalCustomer}
        editingPayment={editingPayment}
      />

      {/* Floating Action Button */}
      <button
        onClick={() => setIsSaleModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#186338] hover:bg-[#2e823f] text-white rounded-full shadow-lg shadow-green-900/40 flex items-center justify-center transition transform hover:scale-105 active:scale-95 z-30"
        aria-label="Add new sale"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Bottom Spacer for FAB */}
      <div className="h-20" />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-500 text-sm">Are you sure you want to logout?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
