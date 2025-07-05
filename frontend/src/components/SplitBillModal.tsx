import React, { useState, useEffect } from 'react';
import { CartItem } from '../contexts/CartContext';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onSplit: (splits: SplitBill[]) => void;
}

interface SplitBill {
  payment_method: 'cash' | 'card' | 'mobile' | 'gift_card';
  amount: number;
  notes: string;
}

export default function SplitBillModal({ isOpen, onClose, items, total, onSplit }: SplitBillModalProps) {
  const [splits, setSplits] = useState<SplitBill[]>([]);
  const [currentSplit, setCurrentSplit] = useState<SplitBill>({
    payment_method: 'cash',
    amount: 0,
    notes: ''
  });
  const [remainingAmount, setRemainingAmount] = useState(total);

  useEffect(() => {
    if (isOpen) {
      setSplits([]);
      setRemainingAmount(total);
      setCurrentSplit({
        payment_method: 'cash',
        amount: 0,
        notes: ''
      });
    }
  }, [isOpen, total]);

  const addSplit = () => {
    if (currentSplit.amount <= 0) return;
    if (currentSplit.amount > remainingAmount) return;

    setSplits([...splits, currentSplit]);
    setRemainingAmount(remainingAmount - currentSplit.amount);
    setCurrentSplit({
      payment_method: 'cash',
      amount: 0,
      notes: ''
    });
  };

  const removeSplit = (index: number) => {
    const removedSplit = splits[index];
    setSplits(splits.filter((_, i) => i !== index));
    setRemainingAmount(remainingAmount + removedSplit.amount);
  };

  const handleComplete = () => {
    if (Math.abs(remainingAmount) < 0.01) {
      onSplit(splits);
      onClose();
    }
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setCurrentSplit({ ...currentSplit, amount });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'mobile':
        return '📱';
      case 'gift_card':
        return '🎁';
      default:
        return '💰';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Split Bill</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-indigo-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Split Progress */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Split Progress</span>
              <span className="text-sm text-gray-600">
                ${(total - remainingAmount).toFixed(2)} / ${total.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((total - remainingAmount) / total) * 100}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm">
              {remainingAmount > 0 ? (
                <span className="text-orange-600">Remaining: ${remainingAmount.toFixed(2)}</span>
              ) : remainingAmount < 0 ? (
                <span className="text-red-600">Over by: ${Math.abs(remainingAmount).toFixed(2)}</span>
              ) : (
                <span className="text-green-600">✓ Split complete</span>
              )}
            </div>
          </div>

          {/* Current Splits */}
          {splits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Splits</h3>
              <div className="space-y-2">
                {splits.map((split, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getPaymentMethodIcon(split.payment_method)}</span>
                      <div>
                        <div className="font-medium capitalize">{split.payment_method.replace('_', ' ')}</div>
                        {split.notes && <div className="text-sm text-gray-600">{split.notes}</div>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">${split.amount.toFixed(2)}</span>
                      <button
                        onClick={() => removeSplit(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Split */}
          {remainingAmount > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Split</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={currentSplit.payment_method}
                    onChange={(e) => setCurrentSplit({ ...currentSplit, payment_method: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile">Mobile Payment</option>
                    <option value="gift_card">Gift Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={currentSplit.amount || ''}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={remainingAmount}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentSplit.notes}
                    onChange={(e) => setCurrentSplit({ ...currentSplit, notes: e.target.value })}
                    placeholder="e.g., John's portion"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={addSplit}
                  disabled={currentSplit.amount <= 0 || currentSplit.amount > remainingAmount}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Split
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={Math.abs(remainingAmount) >= 0.01}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Split
          </button>
        </div>
      </div>
    </div>
  );
} 