import type { SaleEntry, PaymentEntry } from '../types';

interface UsersListProps {
  sales: SaleEntry[];
  payments: PaymentEntry[];
  onViewCustomer: (customerName: string) => void;
  onClose: () => void;
}

export function UsersList({ sales, payments, onViewCustomer, onClose }: UsersListProps) {
  // Get unique customers with their totals
  const customerStats = sales.reduce((acc, sale) => {
    if (!acc[sale.customer]) {
      acc[sale.customer] = {
        name: sale.customer,
        totalEntries: 0,
        totalPacks: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      };
    }
    acc[sale.customer].totalEntries += 1;
    acc[sale.customer].totalPacks += sale.packs;
    acc[sale.customer].totalAmount += sale.amount;
    return acc;
  }, {} as Record<string, {
    name: string;
    totalEntries: number;
    totalPacks: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  }>);

  // Calculate paid amounts from payments
  payments.forEach(payment => {
    if (customerStats[payment.customer]) {
      customerStats[payment.customer].paidAmount += payment.amount_paid;
    }
  });

  // Calculate pending amounts
  Object.values(customerStats).forEach(customer => {
    customer.pendingAmount = Math.max(0, customer.totalAmount - customer.paidAmount);
  });

  const sortedCustomers = Object.values(customerStats).sort((a, b) => 
    b.totalAmount - a.totalAmount
  );

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <header className="bg-[#3d571d] text-white sticky top-0 z-40 shadow-lg">
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
            <h1 className="text-lg sm:text-xl font-bold">
              Customers List
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Summary Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-[0_0_35px_rgba(0,0,0,0.1)] mb-4 sm:mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[11px] sm:text-xs text-gray-900 mb-1">Total Users</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{sortedCustomers.length}</p>
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-gray-900 mb-1">Total Sales</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{sales.length}</p>
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-gray-900 mb-1">Total Amount</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                ₹{sales.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Users List */}
        {sortedCustomers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <p className="text-base sm:text-lg text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCustomers.map((customer) => (
              <div
                key={customer.name}
                onClick={() => onViewCustomer(customer.name)}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-md hover:shadow-md transition cursor-pointer"
                // className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2f9145] to-[#3d571d] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{customer.name}</h3>
                      <p className="text-xs text-gray-900">{customer.totalEntries} entries</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-md sm:text-xl font-bold text-gray-900">₹{customer.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-900">{customer.totalPacks} packs</p>
                  </div>
                </div>
                
                {/* Status breakdown */}
                <div className="flex gap-2 text-xs">
                  <div className="flex-1 bg-green-200 rounded-lg p-2 text-center">
                    <span className="text-green-900 font-bold">Paid: ₹{customer.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex-1 bg-orange-200 rounded-lg p-2 text-center">
                    <span className="text-orange-900 font-bold">Pending: ₹{customer.pendingAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
