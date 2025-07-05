import React from 'react';

interface ReceiptItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface ReceiptProps {
  order: {
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
    items: ReceiptItem[];
  };
  paymentDetails?: {
    payment_received: number;
    change: number;
    payment_method: string;
  };
  type: 'customer' | 'kitchen';
  onClose?: () => void;
}

export default function Receipt({ order, paymentDetails, type, onClose }: ReceiptProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getReceiptTitle = () => {
    return type === 'customer' ? 'CUSTOMER RECEIPT' : 'KITCHEN ORDER';
  };

  const getRestaurantInfo = () => {
    return {
      name: 'RESTAURANT POS',
      address: '123 Main Street, City, State 12345',
      phone: '(555) 123-4567',
      website: 'www.restaurantpos.com',
    };
  };

  const restaurant = getRestaurantInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{getReceiptTitle()}</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6">
          {/* Restaurant Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{restaurant.name}</h1>
            <p className="text-sm text-gray-600 mb-1">{restaurant.address}</p>
            <p className="text-sm text-gray-600 mb-1">Phone: {restaurant.phone}</p>
            <p className="text-sm text-gray-600 mb-3">{restaurant.website}</p>
            <div className="border-t border-gray-300 pt-3">
              <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* Order Information */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900">Order #:</span>
              <span className="font-bold text-gray-900">{order.order_number}</span>
            </div>
            {order.customer_name && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">Customer:</span>
                <span className="text-gray-900">{order.customer_name}</span>
              </div>
            )}
            {order.table_number && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">Table:</span>
                <span className="text-gray-900">
                  {order.table_number} {order.table_name && `(${order.table_name})`}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900">Server:</span>
              <span className="text-gray-900">{order.created_by_user}</span>
            </div>
            {order.notes && (
              <div className="mb-2">
                <span className="font-semibold text-gray-900">Notes:</span>
                <p className="text-gray-900 text-sm mt-1">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-6">
            <div className="border-b border-gray-300 pb-2 mb-3">
              <h3 className="font-bold text-gray-900 text-lg">
                {type === 'customer' ? 'Items Ordered' : 'Kitchen Items'}
              </h3>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(item.total_price)}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-1 ml-4">
                        Note: {item.notes}
                      </p>
                    )}
                    {type === 'kitchen' && (
                      <div className="text-xs text-gray-500 mt-1 ml-4">
                        @ {formatCurrency(item.unit_price)} each
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals - Only show for customer receipt */}
          {type === 'customer' && (
            <div className="mb-6">
              <div className="border-t border-gray-300 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-gray-900">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information - Only for customer receipt */}
          {type === 'customer' && paymentDetails && (
            <div className="mb-6">
              <div className="border-t border-gray-300 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="text-gray-900 capitalize">
                    {paymentDetails.payment_method.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Received:</span>
                  <span className="text-gray-900">{formatCurrency(paymentDetails.payment_received)}</span>
                </div>
                {paymentDetails.change > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Change:</span>
                    <span className="font-bold">{formatCurrency(paymentDetails.change)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kitchen Instructions - Only for kitchen receipt */}
          {type === 'kitchen' && (
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-2">Kitchen Instructions:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Prepare items in order of priority</li>
                  <li>• Check for special notes on each item</li>
                  <li>• Notify server when order is ready</li>
                  <li>• Maintain food quality standards</li>
                </ul>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center border-t border-gray-300 pt-4">
            {type === 'customer' ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Thank you for dining with us!</p>
                <p className="text-sm text-gray-600">Please come again</p>
                <p className="text-xs text-gray-500 mt-4">
                  Receipt generated on {new Date().toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-semibold">KITCHEN COPY</p>
                <p className="text-xs text-gray-500">
                  Order time: {formatDate(order.created_at)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50 flex space-x-3">
          <button
            onClick={() => window.print()}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Print Receipt
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 