import React, { useState, useEffect } from 'react';
import { Notifications, Search, Person, Menu } from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const { socket } = useSocket();
  const [hasNotification, setHasNotification] = useState(false);

  interface NotificationData {
    message: string;
    invoice?: {
      title: string;
      description: string;
      date: string;
      id?: string;
    };
    timestamp: string;
  }

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('invoice:created', (data: any) => {
        const notificationData: NotificationData = {
          message: data.message || 'New invoice saved',
          invoice: data.invoice,
          timestamp: new Date().toLocaleTimeString()
        };

        setHasNotification(true);
        setNotifications(prev => [notificationData, ...prev]);

        // Show detailed toast notification
        if (data.invoice) {
          toast.info(
            <div className="flex flex-col gap-1">
              <div className="font-semibold">{data.message}</div>
              <div className="text-sm opacity-90">{data.invoice.description}</div>
              <div className="text-xs opacity-75">Date: {data.invoice.date}</div>
            </div>,
            {
              autoClose: 5000,
              position: 'top-right'
            }
          );
        } else {
          toast.info(data.message);
        }
      });
    }
  }, [socket]);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setHasNotification(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">

          {/* Left: Menu + Title */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu sx={{ fontSize: 24 }} />
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              INVOICE
            </h1>
          </div>

          <div className="flex items-center gap-4">

            {/* Search bar */}
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                sx={{ fontSize: 20 }}
              />
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={handleBellClick}
                className="relative p-2 text-gray-600 hover:text-gray-900"
                aria-label="Notifications"
              >
                <Notifications sx={{ fontSize: 24 }} />
                {hasNotification && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-2 text-sm text-gray-500">No new notifications</p>
                  ) : (
                    notifications.map((notification, idx) => (
                      <div key={idx} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <p className="text-sm font-semibold text-gray-900">{notification.message}</p>
                        {notification.invoice && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-600">{notification.invoice.description}</p>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">Date: {notification.invoice.date}</p>
                              <p className="text-xs text-blue-600">{notification.timestamp}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Person sx={{ fontSize: 20 }} className="text-gray-600" />
              </div>
              <span className="hidden md:inline text-gray-700">Admin</span>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
