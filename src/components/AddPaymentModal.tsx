import { useState, useEffect } from 'react';
import type { PaymentEntry } from '../types';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: Omit<PaymentEntry, 'id' | 'user_id'>) => void;
  onDelete?: (id: string) => void;
  customers: string[];
  preselectedCustomer?: string;
  editingPayment?: PaymentEntry | null;
}

export function AddPaymentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete,
  customers,
  preselectedCustomer,
  editingPayment
}: AddPaymentModalProps) {
  const [formData, setFormData] = useState({
    customer: '',
    amount_paid: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!editingPayment;

  useEffect(() => {
    if (isOpen) {
      if (editingPayment) {
        setFormData({
          customer: editingPayment.customer,
          amount_paid: editingPayment.amount_paid.toString(),
          date: editingPayment.date,
          note: editingPayment.note || ''
        });
      } else {
        setFormData({
          customer: preselectedCustomer || '',
          amount_paid: '',
          date: new Date().toISOString().split('T')[0],
          note: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, preselectedCustomer, editingPayment]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer.trim()) newErrors.customer = 'Customer name is required';
    if (!formData.amount_paid || parseFloat(formData.amount_paid) <= 0) {
      newErrors.amount_paid = 'Amount must be greater than 0';
    }
    if (!formData.date) newErrors.date = 'Date is required';

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
      await onSubmit({
        customer: formData.customer,
        amount_paid: parseFloat(formData.amount_paid),
        date: formData.date,
        note: formData.note
      });
      
      if (!isEditing) {
        setFormData({
          customer: '',
          amount_paid: '',
          date: new Date().toISOString().split('T')[0],
          note: ''
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (editingPayment && onDelete) {
      setIsLoading(true);
      try {
        await onDelete(editingPayment.id);
        setShowDeleteConfirm(false);
        onClose();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-[#2e823f] rounded-full"></div>
            <p className="text-sm font-medium text-gray-600">{isEditing ? 'Saving changes...' : 'Recording payment...'}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#073011] to-[#2e823f] text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold">{isEditing ? 'Edit Payment' : 'Add Payment'}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white hover:bg-[#2e823f] rounded-full p-1 w-8 h-8 flex items-center justify-center transition disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Customer */}
          <div>
            <label htmlFor="customer" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              id="customer"
              name="customer"
              list="payment-customer-suggestions"
              placeholder="Type or select customer name"
              value={formData.customer}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base ${
                errors.customer ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {customers.length > 0 && (
              <datalist id="payment-customer-suggestions">
                {customers.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            )}
            {errors.customer && <p className="text-red-500 text-xs mt-1">{errors.customer}</p>}
          </div>

          {/* Amount Paid */}
          <div>
            <label htmlFor="amount_paid" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Amount Paid (₹) *
            </label>
            <input
              type="number"
              id="amount_paid"
              name="amount_paid"
              placeholder="0.00"
              min="1"
              step="0.01"
              value={formData.amount_paid}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base ${
                errors.amount_paid ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amount_paid && <p className="text-red-500 text-xs mt-1">{errors.amount_paid}</p>}
          </div>

          {/* Date */}
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

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Payment Method (Optional)
            </label>
            <select
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base bg-white"
            >
              <option value="">Select payment method</option>
              <option value="Cash">💵 Cash</option>
              <option value="UPI">📱 UPI</option>
            </select>
            {formData.note === 'Other' && (
              <input
                type="text"
                name="note"
                placeholder="Enter custom note"
                value={formData.note === 'Other' ? '' : formData.note}
                onChange={handleChange}
                className="w-full mt-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base"
              />
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
                <span>{isEditing ? 'Save Changes' : 'Record Payment'}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
                Are you sure you want to delete this payment? This action cannot be undone.
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
          </div>
        </div>
      )}
    </div>
  );
}
