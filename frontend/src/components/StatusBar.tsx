import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

interface StatusBarProps {
  itemCount: number;
  total: number;
  isOnline: boolean;
}

const StatusBar = React.memo(function StatusBar({ itemCount, total, isOnline }: StatusBarProps) {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = useMemo(() => {
    return (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };
  }, []);

  const formatDate = useMemo(() => {
    return (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    };
  }, []);

  const connectionStatus = useMemo(() => ({
    isOnline,
    statusText: isOnline ? 'Online' : 'Offline',
    statusColor: isOnline ? 'bg-green-400' : 'bg-red-400'
  }), [isOnline]);

  return (
    <div className="bg-gray-800 text-white px-4 py-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Order Status */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">Order:</span>
            <span className="font-medium">
              {itemCount} items • ${total.toFixed(2)}
            </span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus.statusColor}`}></div>
            <span className="text-gray-300">
              {connectionStatus.statusText}
            </span>
          </div>

          {/* Current User */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">User:</span>
            <span className="font-medium">{user?.username || 'Unknown'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Date and Time */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">{formatDate(currentTime)}</span>
            <span className="font-mono font-medium">{formatTime(currentTime)}</span>
          </div>

          {/* System Status */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">System Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default StatusBar; 