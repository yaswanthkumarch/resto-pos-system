import React, { useState, useEffect } from 'react';
import { CartItem } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import receiptService from '../services/receiptService';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface PaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  selectedTableId: string | null;
  onComplete: (orderData: any) => Promise<any>;
}

interface Table {
  id: string;
  number: string;
  name: string;
}

export default function PaymentSelectionModal({ isOpen, onClose, items, total, selectedTableId, onComplete }: PaymentSelectionModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital_wallet'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPayNowModal, setShowPayNowModal] = useState(false);
  const [showPayLaterModal, setShowPayLaterModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  useEffect(() => {
    if (isOpen && !hasFetchedData) {
      fetchCustomers();
      fetchTables();
      setHasFetchedData(true);
      // Reset modal states when opening
      setShowPayNowModal(false);
      setShowPayLaterModal(false);
      setCurrentOrder(null);
    }
  }, [isOpen, hasFetchedData]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data);
      } else if (response.status === 429) {
        console.warn('Rate limited when fetching customers, will retry later');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/tables', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTables(data.data);
      } else if (response.status === 429) {
        console.warn('Rate limited when fetching tables, will retry later');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handlePayNow = async () => {
    if (items.length === 0) return;

    if (!selectedTableId) {
      toast.error('TABLE MUST BE SELECTED to proceed');
      return;
    }

    if (isLoading) return; // Prevent multiple submissions

    setIsLoading(true);
    try {
      const orderData = {
        customer_id: selectedCustomer,
        items: items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: total,
        tax: 0,
        discount: 0,
        total: total,
        status: 'pending',
        payment_status: 'paid',
        payment_method: paymentMethod,
      };

      const result = await onComplete(orderData);
      setCurrentOrder({
        ...orderData,
        items: items,
        payment_received: parseFloat(cashAmount) || total,
        change: parseFloat(cashAmount) - total,
      });
      setShowPayNowModal(true);
      
      // Generate receipts for immediate payment
      const receiptData = {
        order: {
          ...result.data,
          items: items.map(item => ({
            id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,

          })),
        },
        paymentDetails: {
          payment_received: parseFloat(cashAmount) || total,
          change: parseFloat(cashAmount) - total,
          payment_method: paymentMethod,
        },
      };
      
      receiptService.generateBothReceipts(receiptData);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayLater = async () => {
    if (items.length === 0) return;

    if (!selectedTableId) {
      toast.error('TABLE MUST BE SELECTED to proceed');
      return;
    }

    if (isLoading) return; // Prevent multiple submissions

    setIsLoading(true);
    try {
      const orderData = {
        customer_id: selectedCustomer,
        items: items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: total,
        tax: 0,
        discount: 0,
        total: total,
        status: 'pending',
        payment_status: 'pending',
      };

      const result = await onComplete(orderData);
      const selectedTable = tables.find(t => t.id === selectedTableId);
      setCurrentOrder({
        ...orderData,
        items: items,
        table_id: selectedTableId,
        table_number: selectedTable?.number || 'N/A',
        table_name: selectedTable?.name || 'N/A',
        order_number: result?.data?.order_number || 'N/A',
        customer_name: customers.find(c => c.id === selectedCustomer)?.name || 'Walk-in Customer',
      });
      setShowPayLaterModal(true);
      
      // Generate kitchen receipt for pay later orders
      const receiptData = {
        order: {
          ...result.data,
          items: items.map(item => ({
            id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
          })),
        },
      };
      
      receiptService.generateKitchenReceipt(receiptData);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const changeAmount = parseFloat(cashAmount) - total;

  const resetForm = () => {
    setSelectedCustomer(null);
    setPaymentMethod('cash');
    setCashAmount('');
    setCurrentOrder(null);
    setHasFetchedData(false);
  };

  const handleClosePayNowModal = () => {
    setShowPayNowModal(false);
    setCurrentOrder(null);
    resetForm();
    onClose();
  };

  const handleClosePayLaterModal = () => {
    setShowPayLaterModal(false);
    setCurrentOrder(null);
    resetForm();
    onClose();
  };

  return (
    <>
      {/* Main Payment Selection Modal */}
      {isOpen && !showPayNowModal && !showPayLaterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Payment Selection</h2>
                          <button
              onClick={() => {
                resetForm();
                onClose();
              }}
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

            {/* Customer Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer</h3>
              <select
                value={selectedCustomer || ''}
                onChange={(e) => setSelectedCustomer(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Table Selection Warning */}
            {!selectedTableId && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="text-red-500 mr-2">⚠️</div>
                  <span className="text-red-700 font-medium">TABLE MUST BE SELECTED to proceed with payment</span>
                </div>
              </div>
            )}

            {/* Payment Method (for Pay Now) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Method</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 border rounded-lg text-center ${
                    paymentMethod === 'cash'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">💵</div>
                  <div className="font-medium">Cash</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border rounded-lg text-center ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-medium">Card</div>
                </button>
                              <button
                onClick={() => setPaymentMethod('digital_wallet')}
                className={`p-4 border rounded-lg text-center ${
                  paymentMethod === 'digital_wallet'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">📱</div>
                <div className="font-medium">Digital Wallet</div>
              </button>
              </div>
            </div>

            {/* Cash Payment Details */}
            {paymentMethod === 'cash' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cash Payment</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Received
                    </label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  {cashAmount && changeAmount > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-green-800">Change:</span>
                        <span className="font-bold text-green-800">${changeAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t bg-gray-50 flex space-x-3">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayLater}
              disabled={isLoading || items.length === 0 || !selectedTableId}
              className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                isLoading || items.length === 0 || !selectedTableId
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : !selectedTableId ? 'Select a Table First' : 'Pay Later'}
            </button>
            <button
              onClick={handlePayNow}
              disabled={isLoading || items.length === 0 || !selectedTableId || (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total))}
              className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                isLoading || items.length === 0 || !selectedTableId || (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total))
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : !selectedTableId ? 'Select a Table First' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Pay Now Success Modal */}
      {showPayNowModal && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
                <button
                  onClick={handleClosePayNowModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-gray-600">Payment received - Order is pending for preparation</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">${currentOrder.total.toFixed(2)}</span>
                </div>
                {currentOrder.payment_received && (
                  <div className="flex justify-between">
                    <span className="font-medium">Amount Received:</span>
                    <span className="font-bold">${currentOrder.payment_received.toFixed(2)}</span>
                  </div>
                )}
                {currentOrder.change > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Change:</span>
                    <span className="font-bold">${currentOrder.change.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleClosePayNowModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    receiptService.printAllReceipts();
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  Print Receipts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Later Kitchen Receipt Modal */}
      {showPayLaterModal && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-yellow-600">Order Placed Successfully!</h2>
                <button
                  onClick={handleClosePayLaterModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-600">Order sent to kitchen</p>
              </div>
              
              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Order Number:</span>
                    <span className="font-bold text-indigo-600">{currentOrder.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Customer:</span>
                    <span className="font-bold">{currentOrder.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Table:</span>
                    <span className="font-bold">Table {currentOrder.table_number} - {currentOrder.table_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Order Total:</span>
                    <span className="font-bold text-lg">${currentOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Payment Status:</span>
                    <span className="font-bold text-yellow-600">Pending</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {currentOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-1 border-b border-gray-100">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleClosePayLaterModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    receiptService.printAllReceipts();
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700"
                >
                  Print Kitchen Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 