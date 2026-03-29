import type { SaleEntry, PaymentEntry, CustomerBalance } from '../types';

// Get unique customers from both sales and payments
export function getAllCustomers(sales: SaleEntry[], payments: PaymentEntry[]): string[] {
  const customers = new Set<string>();
  sales.forEach(s => customers.add(s.customer));
  payments.forEach(p => customers.add(p.customer));
  return Array.from(customers).sort();
}

// Calculate customer balance
export function calculateCustomerBalance(
  customer: string,
  sales: SaleEntry[],
  payments: PaymentEntry[]
): CustomerBalance {
  const customerSales = sales.filter(s => s.customer === customer);
  const customerPayments = payments.filter(p => p.customer === customer);
  
  const totalSales = customerSales.reduce((sum, s) => sum + s.amount, 0);
  const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount_paid, 0);
  const totalPacks = customerSales.reduce((sum, s) => sum + s.packs, 0);
  
  return {
    customer,
    totalSales,
    totalPaid,
    pendingAmount: totalSales - totalPaid,
    totalPacks
  };
}

// Get all customers with their balances
export function getCustomersWithBalances(
  sales: SaleEntry[],
  payments: PaymentEntry[]
): CustomerBalance[] {
  const customers = getAllCustomers(sales, payments);
  return customers
    .map(c => calculateCustomerBalance(c, sales, payments))
    .sort((a, b) => b.pendingAmount - a.pendingAmount);
}

// Get customers with pending balance
export function getCustomersWithPending(
  sales: SaleEntry[],
  payments: PaymentEntry[]
): CustomerBalance[] {
  return getCustomersWithBalances(sales, payments)
    .filter(c => c.pendingAmount > 0);
}

// Calculate dashboard totals
export function calculateDashboardTotals(sales: SaleEntry[], payments: PaymentEntry[]) {
  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalReceived = payments.reduce((sum, p) => sum + p.amount_paid, 0);
  const totalPacks = sales.reduce((sum, s) => sum + s.packs, 0);
  
  return {
    totalSales,
    totalReceived,
    totalPending: totalSales - totalReceived,
    totalPacks
  };
}

// Get sales for a specific customer
export function getCustomerSales(sales: SaleEntry[], customer: string): SaleEntry[] {
  return sales
    .filter(s => s.customer === customer)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get payments for a specific customer
export function getCustomerPayments(payments: PaymentEntry[], customer: string): PaymentEntry[] {
  return payments
    .filter(p => p.customer === customer)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Filter sales by search query
export function filterSales(sales: SaleEntry[], query: string): SaleEntry[] {
  if (!query.trim()) return sales;
  const lowerQuery = query.toLowerCase();
  return sales.filter(s => 
    s.customer.toLowerCase().includes(lowerQuery) ||
    (s.description && s.description.toLowerCase().includes(lowerQuery))
  );
}

// Group sales by date
export function groupSalesByDate(sales: SaleEntry[]): { date: string; sales: SaleEntry[] }[] {
  const grouped = sales.reduce((acc, sale) => {
    if (!acc[sale.date]) acc[sale.date] = [];
    acc[sale.date].push(sale);
    return acc;
  }, {} as Record<string, SaleEntry[]>);
  
  return Object.entries(grouped)
    .map(([date, sales]) => ({ date, sales }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
