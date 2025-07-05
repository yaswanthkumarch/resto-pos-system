import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  sku: string;
  category_name?: string;
}

interface ProductSearchProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onSearch: (term: string) => void;
}

// Utility function to safely convert price to number
const safePrice = (price: any): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') return parseFloat(price) || 0;
  return 0;
};

export default function ProductSearch({ products, onAddProduct, onSearch }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8);
    
    setSelectedIndex(0);
    setShowResults(searchTerm.length > 0 && filtered.length > 0);
    
    return filtered;
  }, [searchTerm, products]);

  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredProducts.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredProducts.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredProducts[selectedIndex]) {
          handleSelectProduct(filteredProducts[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        inputRef.current?.blur();
        break;
    }
  }, [showResults, filteredProducts, selectedIndex]);

  const handleSelectProduct = useCallback((product: Product) => {
    onAddProduct(product);
    setSearchTerm('');
    setShowResults(false);
    inputRef.current?.focus();
  }, [onAddProduct]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search products by name or SKU..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
        autoComplete="off"
      />

      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    SKU: {product.sku} • {product.category_name}
                  </div>
                </div>
                <div className="text-lg font-bold text-indigo-600">
                  ${(safePrice(product.price) || 0).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-100 px-4 py-2 text-xs text-gray-600 border-t">
          <div className="flex justify-between">
            <span>↑↓ Navigate • Enter Select • Esc Close</span>
            <span>{filteredProducts.length} results</span>
          </div>
        </div>
      )}
    </div>
  );
} 