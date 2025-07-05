import React, { useEffect, useState } from 'react';

interface KeyboardShortcutsProps {
  onShortcut: (action: string) => void;
}

export default function KeyboardShortcuts({ onShortcut }: KeyboardShortcutsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            onShortcut('checkout');
            break;
          case 'Backspace':
            event.preventDefault();
            onShortcut('void');
            break;
          case 'h':
            event.preventDefault();
            onShortcut('hold');
            break;
          case 'd':
            event.preventDefault();
            onShortcut('discount');
            break;
          case 's':
            event.preventDefault();
            onShortcut('split');
            break;
          case 'p':
            event.preventDefault();
            onShortcut('print');
            break;
          case 'c':
            event.preventDefault();
            onShortcut('clear');
            break;
        }
      }
      
      // Show shortcuts on F1 key
      if (event.key === 'F1') {
        event.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onShortcut, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border p-4 text-xs z-50 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-gray-700">Keyboard Shortcuts</div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-1 text-gray-600">
        <div className="flex justify-between">
          <span>Ctrl+Enter:</span>
                          <span>Process Payment</span>
        </div>
        <div className="flex justify-between">
          <span>Ctrl+Backspace:</span>
          <span>Void Order</span>
        </div>
        <div className="flex justify-between">
          <span>Ctrl+H:</span>
          <span>Hold Order</span>
        </div>
        <div className="flex justify-between">
          <span>Ctrl+D:</span>
          <span>Apply Discount</span>
        </div>
        <div className="flex justify-between">
          <span>Ctrl+S:</span>
          <span>Split Bill</span>
        </div>
        <div className="flex justify-between">
          <span>Ctrl+P:</span>
          <span>Print Receipt</span>
        </div>
        <div className="flex justify-between">
          <span>Ctrl+C:</span>
          <span>Clear Cart</span>
        </div>
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
          <span>F1:</span>
          <span>Toggle Shortcuts</span>
        </div>
      </div>
    </div>
  );
} 