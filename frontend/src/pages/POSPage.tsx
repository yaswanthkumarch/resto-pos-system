import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import PaymentSelectionModal from '../components/PaymentSelectionModal';
import ProductSearch from '../components/ProductSearch';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import StatusBar from '../components/StatusBar';
import TableSelector from '../components/TableSelector';
import SplitBillModal from '../components/SplitBillModal';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category_name?: string;
  sku: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface SplitBill {
  payment_method: 'cash' | 'card' | 'mobile' | 'gift_card';
  amount: number;
  notes: string;
}

// Utility function to safely convert price to number
const safePrice = (price: any): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') return parseFloat(price) || 0;
  return 0;
};

export default function POSPage() {
  const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isOnline, setIsOnline] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      } else if (response.status === 429) {
        console.warn('Rate limited when fetching categories, will retry later');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const productsWithNumericPrice = data.data.map((product: any) => ({
          ...product,
          price: safePrice(product.price)
        }));
        setProducts(productsWithNumericPrice);
      } else if (response.status === 429) {
        console.warn('Rate limited when fetching products, will retry later');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = !selectedCategory || product.category_name === categories.find(c => c.id === selectedCategory)?.name;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, categories, searchTerm]);

  const handleAddToCart = useCallback((product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: safePrice(product.price),
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  }, [addItem]);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleCheckout = useCallback(() => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    if (!selectedTableId) {
      toast.error('TABLE MUST BE SELECTED to proceed');
      return;
    }

    if (isProcessingPayment) {
      toast.error('Please wait, processing previous request...');
      return;
    }
    
    setShowPaymentSelection(true);
  }, [items.length, selectedTableId, isProcessingPayment]);

  const updateTableStatus = useCallback(async (tableId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        console.error('Failed to update table status');
      }
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  }, []);

  const handleCompleteOrder = useCallback(async (orderData: any) => {
    if (isProcessingPayment) {
      throw new Error('Another payment is being processed');
    }

    setIsProcessingPayment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...orderData,
          table_id: selectedTableId,
          notes: orderNotes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentOrderId(result.data.id);
        toast.success('Order placed successfully!');
        clearCart();
        setOrderNotes('');
        
        if (selectedTableId && orderData.status === 'completed') {
          await updateTableStatus(selectedTableId, 'available');
        }
        if (orderData.status === 'completed') {
          setSelectedTableId(null);
        }
        
        return result;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order');
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  }, [items.length, selectedTableId, isProcessingPayment, updateTableStatus, clearCart, orderNotes]);

  const handleSplitBill = async (splits: SplitBill[]) => {
    if (!currentOrderId) {
      toast.error('No active order to split');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/orders/${currentOrderId}/split`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ splits }),
      });

      if (response.ok) {
        toast.success('Bill split successfully!');
        setCurrentOrderId(null);
      } else {
        throw new Error('Failed to split bill');
      }
    } catch (error) {
      console.error('Error splitting bill:', error);
      toast.error('Failed to split bill');
    }
  };

  const handleQuickActions = {
    void: async () => {
      if (items.length === 0) {
        toast.error('No items to void');
        return;
      }
      if (window.confirm('Are you sure you want to void this order?')) {
        // Update table status to available when order is voided
        if (selectedTableId) {
          await updateTableStatus(selectedTableId, 'available');
        }
        clearCart();
        setSelectedTableId(null);
        setOrderNotes('');
        toast.success('Order voided');
      }
    },
    hold: () => {
      if (items.length === 0) {
        toast.error('No items to hold');
        return;
      }
      toast.success('Order held');
    },
    discount: () => {
      toast('Discount feature coming soon');
    },
    split: () => {
      if (items.length === 0) {
        toast.error('No items to split');
        return;
      }
      setShowSplitBill(true);
    },
    print: () => {
      toast('Print receipt feature coming soon');
    },
  };

  const handleKeyboardShortcut = async (action: string) => {
    switch (action) {
      case 'checkout':
        handleCheckout();
        break;
      case 'void':
        await handleQuickActions.void();
        break;
      case 'hold':
        handleQuickActions.hold();
        break;
      case 'discount':
        handleQuickActions.discount();
        break;
      case 'split':
        handleQuickActions.split();
        break;
      case 'print':
        handleQuickActions.print();
        break;
      case 'clear':
        clearCart();
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search and Categories */}
          <div className="bg-white border-b px-6 py-3 flex-shrink-0">
            <div className="flex space-x-4 mb-3">
              <div className="flex-1">
                <ProductSearch
                  products={products}
                  onAddProduct={handleAddToCart}
                  onSearch={setSearchTerm}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
            
            {/* Category Tabs */}
            <div className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedCategory === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Display */}
          <div className="flex-1 overflow-y-auto p-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleAddToCart(product)}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-xl">🍽️</span>
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-2 truncate">
                        {product.category_name}
                      </p>
                      <p className="text-base font-bold text-indigo-600">
                        ${(product.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleAddToCart(product)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🍽️</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                          <p className="text-gray-500 text-xs">{product.category_name} • SKU: {product.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-indigo-600">${(product.price || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Click to add</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border-t p-3 flex-shrink-0">
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={handleQuickActions.void}
                className="flex flex-col items-center p-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="text-lg mb-1">❌</div>
                <span className="text-xs font-medium text-red-700">Void</span>
              </button>
              
              <button
                onClick={handleQuickActions.hold}
                className="flex flex-col items-center p-2 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="text-lg mb-1">⏸️</div>
                <span className="text-xs font-medium text-yellow-700">Hold</span>
              </button>
              
              <button
                onClick={handleQuickActions.discount}
                className="flex flex-col items-center p-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-lg mb-1">💰</div>
                <span className="text-xs font-medium text-green-700">Discount</span>
              </button>
              
              <button
                onClick={handleQuickActions.split}
                className="flex flex-col items-center p-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-lg mb-1">✂️</div>
                <span className="text-xs font-medium text-blue-700">Split</span>
              </button>
              
              <button
                onClick={handleQuickActions.print}
                className="flex flex-col items-center p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-lg mb-1">🖨️</div>
                <span className="text-xs font-medium text-gray-700">Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="w-80 bg-white border-l flex flex-col flex-shrink-0">
          <div className="p-4 border-b flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Order Summary</h2>
            
            {/* Table Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Table</label>
              <TableSelector
                selectedTableId={selectedTableId}
                onTableSelect={setSelectedTableId}
              />
            </div>

            {/* Order Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Special instructions, allergies, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                rows={2}
              />
            </div>
            
            {/* Cart Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                    <p className="text-gray-500 text-xs">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 text-xs"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 text-xs"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-1 text-red-500 hover:text-red-700 text-sm"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-3 border-t">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="p-4 mt-auto flex-shrink-0">
            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || !selectedTableId || isProcessingPayment}
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                items.length === 0 || !selectedTableId || isProcessingPayment
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : !selectedTableId ? 'Select Table First' : `Process Payment (${total.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 text-white px-4 py-2 text-xs flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Order:</span>
            <span className="font-medium">
              {itemCount} items • ${total.toFixed(2)}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">{new Date().toLocaleTimeString()}</span>
            <span className="text-gray-300">System Ready</span>
          </div>
        </div>
      </div>

      <PaymentSelectionModal
        isOpen={showPaymentSelection}
        onClose={() => setShowPaymentSelection(false)}
        items={items}
        total={total}
        selectedTableId={selectedTableId}
        onComplete={handleCompleteOrder}
      />

      <SplitBillModal
        isOpen={showSplitBill}
        onClose={() => setShowSplitBill(false)}
        items={items}
        total={total}
        onSplit={handleSplitBill}
      />

      <KeyboardShortcuts onShortcut={handleKeyboardShortcut} />
    </div>
  );
} 