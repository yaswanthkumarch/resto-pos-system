import React, { useState } from 'react';
import toast from 'react-hot-toast';
import receiptService from '../services/receiptService';

interface Order {
  id: number;
  order_number: string;
  customer_name?: string;
  customer_email?: string;
  table_number?: number;
  table_name?: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  status: string;
  payment_status?: string;
  notes?: string;
  created_at: string;
  created_by_user?: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPaymentComplete: () => void;
}

export default function PaymentModal({ isOpen, onClose, order, onPaymentComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital_wallet'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const changeAmount = cashAmount ? Math.round((parseFloat(cashAmount) - (order?.total || 0)) * 100) / 100 : 0;

  const handleProcessPayment = async () => {
    if (!order) return;

    if (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < order.total)) {
      toast.error('Cash amount must be equal to or greater than the total');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Decode JWT token to get user ID
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.id;
      
      // Create payment record
      const paymentResponse = await fetch('http://localhost:3001/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
          method: paymentMethod,
          status: 'paid',
          createdBy: userId,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(`Failed to create payment record: ${errorData.error || paymentResponse.statusText}`);
      }

      // Update order payment status
      const orderResponse = await fetch(`http://localhost:3001/api/orders/${order.id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_status: 'paid',
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(`Failed to update order payment status: ${errorData.error || orderResponse.statusText}`);
      }

      // Ensure proper number handling to avoid precision issues
      const receivedAmount = paymentMethod === 'cash' && cashAmount ? 
        Math.round(parseFloat(cashAmount) * 100) / 100 : 
        Number(order.total);
      const calculatedChange = Math.round((receivedAmount - Number(order.total)) * 100) / 100;
      

      
      setPaymentDetails({
        order_number: order.order_number,
        total: Number(order.total),
        payment_received: receivedAmount,
        change: calculatedChange > 0 ? calculatedChange : 0,
        payment_method: paymentMethod,
        customer_name: order.customer_name || 'Walk-in Customer',
        table_info: order.table_number ? `Table ${order.table_number} - ${order.table_name}` : 'N/A',
      });

      setShowSuccessModal(true);
      toast.success('Payment processed successfully!');
      
      // Generate receipts
      const receiptData = {
        order: order,
        paymentDetails: {
          payment_received: receivedAmount,
          change: calculatedChange > 0 ? calculatedChange : 0,
          payment_method: paymentMethod,
        },
      };
      
      // Generate both customer and kitchen receipts
      receiptService.generateBothReceipts(receiptData);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setPaymentDetails(null);
    onClose();
    onPaymentComplete();
  };

  const resetForm = () => {
    setPaymentMethod('cash');
    setCashAmount('');
    setPaymentDetails(null);
  };

  if (!isOpen || !order) return null;

  return (
    <>
      {/* Main Payment Modal */}
      {!showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Process Payment</h2>
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
              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Order Number:</span>
                    <span className="font-bold text-indigo-600">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Customer:</span>
                    <span className="font-bold">{order.customer_name || 'Walk-in Customer'}</span>
                  </div>
                  {order.table_number && (
                    <div className="flex justify-between">
                      <span className="font-medium">Table:</span>
                      <span className="font-bold">Table {order.table_number} - {order.table_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Order Total:</span>
                    <span className="font-bold text-lg">${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-1 border-b border-gray-100">
                      <div>
                        <span className="font-medium">{item.product_name}</span>
                        <span className="text-gray-500 ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-medium">${Number(item.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
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
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    {cashAmount && changeAmount > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-green-800">Change:</span>
                          <span className="font-bold text-green-800">${Number(changeAmount).toFixed(2)}</span>
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
                onClick={handleProcessPayment}
                disabled={isLoading || (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < order.total))}
                className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                  isLoading || (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < order.total))
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : 'Process Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && paymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
                <button
                  onClick={handleCloseSuccessModal}
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
                <p className="text-gray-600">Payment received successfully</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="font-medium">Order Number:</span>
                  <span className="font-bold">{paymentDetails.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span className="font-bold">{paymentDetails.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Table:</span>
                  <span className="font-bold">{paymentDetails.table_info}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">${Number(paymentDetails.total).toFixed(2)}</span>
                </div>
                {paymentDetails.payment_received && (
                  <div className="flex justify-between">
                    <span className="font-medium">Amount Received:</span>
                    <span className="font-bold">${Number(paymentDetails.payment_received).toFixed(2)}</span>
                  </div>
                )}
                {paymentDetails.change > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Change:</span>
                    <span className="font-bold">${Number(paymentDetails.change).toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseSuccessModal}
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
    </>
  );
} 