import React, { useState, useEffect } from 'react';
import { CartItem } from '../contexts/CartContext';
import TableSelector from './TableSelector';

interface OrderModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
  onSave: (orderData: any) => void;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category_name?: string;
  sku: string;
}

export default function OrderModificationModal({ isOpen, onClose, orderId, onSave }: OrderModificationModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrder();
      fetchProducts();
      fetchCustomers();
    }
  }, [isOpen, orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
        setSelectedTableId(data.data.table_id);
        setOrderNotes(data.data.notes || '');
        setCustomerId(data.data.customer_id);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

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
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const addItem = (product: Product) => {
    if (!order) return;

    const newItem: OrderItem = {
      id: Date.now(), // Temporary ID
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: Number(product.price || 0),
      total_price: Number(product.price || 0),
      notes: '',
    };

    setOrder({
      ...order,
      items: [...order.items, newItem],
    });
  };

  const removeItem = (itemId: number) => {
    if (!order) return;

    setOrder({
      ...order,
      items: order.items.filter((item: OrderItem) => item.id !== itemId),
    });
  };

  const updateItemQuantity = (itemId: number, quantity: number) => {
    if (!order) return;

    setOrder({
      ...order,
      items: order.items.map((item: OrderItem) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  };

  const updateItemNotes = (itemId: number, notes: string) => {
    if (!order) return;

    setOrder({
      ...order,
      items: order.items.map((item: OrderItem) =>
        item.id === itemId ? { ...item, notes } : item
      ),
    });
  };

  const calculateTotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum: number, item: OrderItem) => sum + Number(item.total_price || 0), 0);
  };

  const handleSave = () => {
    if (!order) return;

    const orderData = {
      customer_id: customerId,
      table_id: selectedTableId,
      items: order.items.map((item: OrderItem) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.unit_price,
        notes: item.notes,
      })),
      total_amount: calculateTotal(),
      notes: orderNotes,
    };

    onSave(orderData);
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-center">Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Modify Order #{orderId}</h2>
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

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Order Details */}
            <div className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <select
                  value={customerId || ''}
                  onChange={(e) => setCustomerId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">No Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Table Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Table</label>
                <TableSelector
                  selectedTableId={selectedTableId}
                  onTableSelect={setSelectedTableId}
                />
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Special instructions, allergies, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Current Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {order?.items.map((item: OrderItem) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Price</label>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItemNotes(item.id, e.target.value)}
                            step="0.01"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Notes</label>
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => updateItemNotes(item.id, e.target.value)}
                          placeholder="Item notes"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="mt-2 text-right">
                        <span className="font-medium">${Number(item.total_price || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Product Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => addItem(product)}
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.category_name} • SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-indigo-600">${Number(product.price || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Click to add</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 