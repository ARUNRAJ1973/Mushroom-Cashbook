import { useState, useEffect } from 'react';
import type { CashbookEntry } from '../types';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<CashbookEntry, 'id'>) => void;
  onDelete?: (id: string) => void;
  editingEntry?: CashbookEntry | null;
}

const defaultFormData = {
  date: new Date().toISOString().split('T')[0],
  time: '08:30',
  customer: '',
  packs: '',
  amount: '',
  status: 'pending' as 'paid' | 'pending',
  description: ''
};

export function AddEntryModal({ isOpen, onClose, onSubmit, onDelete, editingEntry }: AddEntryModalProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!editingEntry;

  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setFormData({
          date: editingEntry.date,
          time: editingEntry.time,
          customer: editingEntry.customer,
          packs: editingEntry.packs.toString(),
          amount: editingEntry.amount.toString(),
          status: editingEntry.status,
          description: editingEntry.description || ''
        });
      } else {
        setFormData(defaultFormData);
      }
      setErrors({});
    }
  }, [isOpen, editingEntry]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.customer.trim()) newErrors.customer = 'Customer name is required';
    if (!formData.packs || parseInt(formData.packs) <= 0) newErrors.packs = 'Packs must be greater than 0';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        date: formData.date,
        time: formData.time,
        customer: formData.customer,
        description: formData.description,
        packs: parseInt(formData.packs),
        amount: parseFloat(formData.amount),
        status: formData.status
      });

      if (!isEditing) {
        setFormData(defaultFormData);
      }
      setErrors({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (editingEntry && onDelete && confirm('Are you sure you want to delete this entry?')) {
      setIsLoading(true);
      try {
        await onDelete(editingEntry.id);
        onClose();
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-[#2e823f] rounded-full"></div>
            <p className="text-sm font-medium text-gray-600">
              {isEditing ? 'Saving changes...' : 'Adding entry...'}
            </p>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#073011] to-[#2e823f] text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold">
            {isEditing ? 'Edit Entry' : 'Add New Entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-[#2e823f] rounded-full p-1 w-8 h-8 flex items-center justify-center transition"
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
              placeholder="Enter customer name"
              value={formData.customer}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2e823f] focus:border-transparent text-sm sm:text-base ${
                errors.customer ? 'border-red-500' : 'border-gray-300'
              }`}
            />
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

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'paid' }))}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 transition font-medium text-xs sm:text-sm ${
                  formData.status === 'paid'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                }`}
              >
                <span className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center ${
                  formData.status === 'paid' ? 'border-green-500' : 'border-gray-400'
                }`}>
                  {formData.status === 'paid' && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                  )}
                </span>
                <span>✓ Paid</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'pending' }))}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 transition font-medium text-xs sm:text-sm ${
                  formData.status === 'pending'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
                }`}
              >
                <span className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center ${
                  formData.status === 'pending' ? 'border-red-500' : 'border-gray-400'
                }`}>
                  {formData.status === 'pending' && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></span>
                  )}
                </span>
                <span>⏳ Pending</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 bg-red-200 hover:bg-red-300 text-red-700 font-semibold py-2 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-[#073011] to-[#2e823f] hover:from-[#0a4a1a] hover:to-[#3a9b4e] text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save' : 'Add Entry'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
