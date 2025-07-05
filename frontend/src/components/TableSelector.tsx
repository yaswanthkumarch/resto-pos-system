import React, { useState, useEffect } from 'react';

interface Table {
  id: string;
  number: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location?: string;
  current_order_id?: string;
  order_status?: string;
  total_amount?: number;
}

interface TableSelectorProps {
  selectedTableId: string | null;
  onTableSelect: (tableId: string | null) => void;
  disabled?: boolean;
}

export default function TableSelector({ selectedTableId, onTableSelect, disabled = false }: TableSelectorProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updatingTableId, setUpdatingTableId] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

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
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTableStatus = async (tableId: string, status: string) => {
    setUpdatingTableId(tableId);
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

      if (response.ok) {
        // Update the local state to reflect the change
        setTables(prevTables => 
          prevTables.map(table => 
            table.id === tableId 
              ? { ...table, status: status as any }
              : table
          )
        );
      } else {
        console.error('Failed to update table status');
      }
    } catch (error) {
      console.error('Error updating table status:', error);
    } finally {
      setUpdatingTableId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cleaning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return '✅';
      case 'occupied':
        return '🟢';
      case 'reserved':
        return '⏰';
      case 'cleaning':
        return '🧹';
      default:
        return '❓';
    }
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
        <span className="text-sm text-gray-600">Loading tables...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Table Display */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowModal(true)}
          disabled={disabled}
          className={`px-3 py-2 border rounded-lg text-sm font-medium ${
            selectedTable
              ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {selectedTable ? (
            <div className="flex items-center space-x-2">
              <span>{getStatusIcon(selectedTable.status)}</span>
              <span>Table {selectedTable.number}</span>
              {selectedTable.name && <span>({selectedTable.name})</span>}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>🪑</span>
              <span>Select Table</span>
            </div>
          )}
        </button>
        
        {selectedTable && (
          <button
            onClick={async () => {
              // Change table status back to available when clearing selection
              await updateTableStatus(selectedTable.id, 'available');
              onTableSelect(null);
            }}
            disabled={disabled}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Select Table</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    onClick={async () => {
                      if (table.status === 'available' || table.status === 'occupied') {
                        // If selecting a table, update its status to occupied
                        if (table.status === 'available') {
                          await updateTableStatus(table.id, 'occupied');
                        }
                        onTableSelect(table.id);
                        setShowModal(false);
                      }
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors relative ${
                      table.status === 'available'
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : table.status === 'occupied'
                        ? 'border-red-300 bg-red-50 hover:bg-red-100'
                        : 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed'
                    } ${updatingTableId === table.id ? 'opacity-75' : ''}`}
                  >
                    {updatingTableId === table.id && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-2xl mb-2">{getStatusIcon(table.status)}</div>
                      <h3 className="font-bold text-lg">Table {table.number}</h3>
                      {table.name && (
                        <p className="text-sm text-gray-600 mb-1">{table.name}</p>
                      )}
                      <p className="text-sm text-gray-500 mb-2">
                        Capacity: {table.capacity} people
                      </p>
                      {table.location && (
                        <p className="text-xs text-gray-500 mb-2">{table.location}</p>
                      )}
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(table.status)}`}>
                        {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                      </div>
                      
                      {table.status === 'occupied' && table.total_amount && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-600">Current Order:</p>
                          <p className="font-medium">${table.total_amount.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🟢</span>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>⏰</span>
                    <span>Reserved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🧹</span>
                    <span>Cleaning</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 