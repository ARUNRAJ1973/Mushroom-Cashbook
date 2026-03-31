import { useState, useEffect } from 'react';
import type { SaleEntry, PaymentEntry } from '../types';

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sale: Omit<SaleEntry, 'id' | 'user_id'> & { status?: 'paid' | 'pending' }, paymentAmount?: number, paymentType?: 'Cash' | 'UPI') => void;
  onDelete?: (id: string) => void;
  onDeletePayment?: (paymentId: string) => void;
  customers: string[];
  editingSale?: (SaleEntry & { status?: 'paid' | 'pending' }) | null;
  existingPayments?: PaymentEntry[];
}

export function AddSaleModal({ isOpen, onClose, onSubmit, onDelete, onDeletePayment, customers, editingSale, existingPayments = [] }: AddSaleModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    customer: '',
    packs: '',
    amount: '',
    description: '',
    status: 'pending' as 'paid' | 'pending',
    amountReceived: '',
    paymentType: 'Cash' as 'Cash' | 'UPI'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'warning' | 'confirm'>('warning');
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const isEditing = !!editingSale;

  useEffect(() => {
    if (isOpen) {
      if (editingSale) {
        setFormData({
          date: editingSale.date,
          time: editingSale.time,
          customer: editingSale.customer,
          packs: editingSale.packs.toString(),
          amount: editingSale.amount.toString(),
          description: editingSale.description || '',
          status: editingSale.status || 'pending',
          amountReceived: '',
          paymentType: 'Cash'
        });
      } else {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          time: '08:30',
          customer: '',
          packs: '',
          amount: '',
          description: '',
          status: 'pending',
          amountReceived: '',
          paymentType: 'Cash'
        });
      }
      setErrors({});
    }
  }, [isOpen, editingSale]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.customer.trim()) newErrors.customer = 'Customer name is required';
    if (!formData.packs || parseInt(formData.packs) <= 0) newErrors.packs = 'Packs must be greater than 0';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    
    // Validate amount received doesn't exceed sale amount
    if (formData.amountReceived) {
      const received = parseFloat(formData.amountReceived);
      const total = parseFloat(formData.amount);
      if (received > total) {
        newErrors.amountReceived = 'Cannot exceed sale amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const paymentAmount = formData.amountReceived ? parseFloat(formData.amountReceived) : undefined;
      
      await onSubmit({
        date: formData.date,
        time: formData.time,
        customer: formData.customer,
        description: formData.description,
        packs: parseInt(formData.packs),
        amount: parseFloat(formData.amount),
        status: formData.status
      }, paymentAmount, formData.paymentType);

      if (!isEditing) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          time: '08:30',
          customer: '',
          packs: '',
          amount: '',
          description: '',
          status: 'pending',
          amountReceived: '',
          paymentType: 'Cash'
        });
      }
      setErrors({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    // Check if there are payments for this sale
    if (salePayments.length > 0) {
      setDeleteStep('warning');
    } else {
      setDeleteStep('confirm');
    }
    setShowDeleteConfirm(true);
  };

  const handleProceedToDelete = () => {
    setDeleteStep('confirm');
  };

  const handleConfirmDelete = async () => {
    if (editingSale && onDelete) {
      setIsLoading(true);
      try {
        await onDelete(editingSale.id);
        // Modal will be closed by parent after data refresh
      } finally {
        setIsLoading(false);
        setShowDeleteConfirm(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteStep('warning');
    setPaymentToDelete(null);
  };

  const handleDeletePaymentClick = (paymentId: string) => {
    setPaymentToDelete(paymentId);
  };

  const handleConfirmDeletePayment = async () => {
    if (paymentToDelete && onDeletePayment) {
      setIsLoading(true);
      try {
        await onDeletePayment(paymentToDelete);
        setPaymentToDelete(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelDeletePayment = () => {
    setPaymentToDelete(null);
  };

  // Get payments for this specific sale (matching customer and date)
  const salePayments = isEditing && existingPayments.length > 0
    ? existingPayments.filter(p => p.customer === editingSale?.customer && p.date === editingSale?.date)
    : [];
  
  const existingPaidAmount = salePayments.reduce((sum, p) => sum + p.amount_paid, 0);
  
  const saleAmount = parseFloat(formData.amount) || 0;
  const newReceivedAmount = parseFloat(formData.amountReceived) || 0;
  const totalReceivedAmount = existingPaidAmount + newReceivedAmount;
  const pendingAmount = saleAmount - totalReceivedAmount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-[#2e823f] rounded-full"></div>
            <p className="text-sm font-medium text-gray-600">{isEditing ? 'Saving changes...' : 'Recording sale...'}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#073011] to-[#2e823f] text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold">{isEditing ? 'Edit Sale' : 'Add Sale'}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white hover:bg-[#2e823f] rounded-full p-1 w-8 h-8 flex items-center justify-center transition disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="date" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="time" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label htmlFor="customer" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              id="customer"
              name="customer"
              list="customer-suggestions"
              placeholder="Type or select customer name"
              value={formData.customer}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base ${
                errors.customer ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {customers.length > 0 && (
              <datalist id="customer-suggestions">
                {customers.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            )}
            {errors.customer && <p className="text-red-500 text-xs mt-1">{errors.customer}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="e.g., Button Mushrooms, Oyster Mix"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="packs" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Packs *
              </label>
              <input
                type="number"
                id="packs"
                name="packs"
                placeholder="0"
                min="1"
                value={formData.packs}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base ${
                  errors.packs ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.packs && <p className="text-red-500 text-xs mt-1">{errors.packs}</p>}
            </div>

            <div>
              <label htmlFor="amount" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Amount (₹) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
          </div>

          {/* Status Radio Buttons */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Status
            </label>
            <div className="flex gap-3">
              <label 
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.status === 'pending' 
                    ? 'border-orange-400 bg-orange-50' 
                    : 'border-gray-200 bg-white hover:border-orange-200'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={formData.status === 'pending'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  formData.status === 'pending' ? 'border-orange-500' : 'border-gray-400'
                }`}>
                  {formData.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                </span>
                <span className={`text-sm font-medium ${
                  formData.status === 'pending' ? 'text-orange-700' : 'text-gray-600'
                }`}>Pending</span>
              </label>
              
              <label 
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.status === 'paid' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-green-200'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="paid"
                  checked={formData.status === 'paid'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  formData.status === 'paid' ? 'border-green-600' : 'border-gray-400'
                }`}>
                  {formData.status === 'paid' && <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>}
                </span>
                <span className={`text-sm font-medium ${
                  formData.status === 'paid' ? 'text-green-700' : 'text-gray-600'
                }`}>Paid</span>
              </label>
            </div>
          </div>

          {/* Existing Payments Section - Only when editing */}
          {isEditing && salePayments.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200">
              <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">Existing Payments</h4>
              <div className="space-y-2">
                {salePayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                    <div className="flex-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        ₹{payment.amount_paid.toLocaleString()}
                      </span>
                      {payment.note && (
                        <span className="text-[10px] sm:text-xs text-gray-500 ml-2">({payment.note})</span>
                      )}
                    </div>
                    {onDeletePayment && (
                      <button
                        type="button"
                        onClick={() => handleDeletePaymentClick(payment.id)}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                        title="Delete this payment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-blue-600 mt-2">
                Click the trash icon to remove a payment and reduce the paid amount
              </p>
            </div>
          )}

          {/* Payment Section */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Add New Payment (Optional)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-500 text-sm">₹</span>
              <input
                type="number"
                name="amountReceived"
                placeholder="0"
                min="0"
                max={formData.amount || undefined}
                step="0.01"
                value={formData.amountReceived}
                onChange={handleChange}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base ${
                  errors.amountReceived ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.amountReceived && <p className="text-red-500 text-xs">{errors.amountReceived}</p>}
            
            {/* Payment Type Dropdown */}
            <div className="mt-2">
              <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">
                Payment Type
              </label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-xs sm:text-sm bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            
            {/* Balance Summary */}
            {saleAmount > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Sale Amount:</span>
                  <span className="font-medium">₹{saleAmount.toLocaleString()}</span>
                </div>
                {isEditing && existingPaidAmount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Already Paid:</span>
                    <span className="font-medium text-blue-600">₹{existingPaidAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">New Payment:</span>
                  <span className="font-medium text-green-600">₹{newReceivedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm pt-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-700 font-medium">Total Paid:</span>
                  <span className="font-bold text-green-700">₹{totalReceivedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-700 font-medium">Pending:</span>
                  <span className={`font-bold ${pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{pendingAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 sm:gap-3 pt-4 border-t border-gray-200">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="px-4 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-[#073011] to-[#2e823f] hover:from-[#0a4a1a] hover:to-[#3a9b4e] text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Save'}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Sale Modal - Combined Warning + Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            {deleteStep === 'warning' && salePayments.length > 0 ? (
              /* Step 1: Warning when payments exist */
              <>
                <div className="text-center mb-5">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Payments Exist!</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    This sale has <span className="font-bold text-orange-600">{salePayments.length} payment(s)</span> totalling <span className="font-bold text-orange-600">₹{existingPaidAmount.toLocaleString()}</span>.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Deleting this sale will also <span className="font-semibold text-red-600">delete all related payments</span> to keep the balance correct.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProceedToDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              /* Step 2: Final Confirmation */
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Sale?</h3>
                  <p className="text-gray-500 text-sm">
                    Are you sure you want to delete this sale{salePayments.length > 0 ? ' and its related payments' : ''}? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Delete</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      {paymentToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Payment?</h3>
              <p className="text-gray-500 text-sm">
                Are you sure you want to delete this payment? This will reduce the paid amount and increase the pending amount.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDeletePayment}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePayment}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
