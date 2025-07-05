import React from 'react';

interface QuickActionsProps {
  onVoid: () => void;
  onHold: () => void;
  onDiscount: () => void;
  onSplit: () => void;
  onPrint: () => void;
}

export default function QuickActions({ onVoid, onHold, onDiscount, onSplit, onPrint }: QuickActionsProps) {
  return (
    <div className="bg-white border-t p-4">
      <div className="grid grid-cols-5 gap-3">
        <button
          onClick={onVoid}
          className="flex flex-col items-center p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <div className="text-2xl mb-1">❌</div>
          <span className="text-xs font-medium text-red-700">Void</span>
        </button>
        
        <button
          onClick={onHold}
          className="flex flex-col items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <div className="text-2xl mb-1">⏸️</div>
          <span className="text-xs font-medium text-yellow-700">Hold</span>
        </button>
        
        <button
          onClick={onDiscount}
          className="flex flex-col items-center p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <div className="text-2xl mb-1">💰</div>
          <span className="text-xs font-medium text-green-700">Discount</span>
        </button>
        
        <button
          onClick={onSplit}
          className="flex flex-col items-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="text-2xl mb-1">✂️</div>
          <span className="text-xs font-medium text-blue-700">Split</span>
        </button>
        
        <button
          onClick={onPrint}
          className="flex flex-col items-center p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="text-2xl mb-1">🖨️</div>
          <span className="text-xs font-medium text-gray-700">Print</span>
        </button>
      </div>
    </div>
  );
} 