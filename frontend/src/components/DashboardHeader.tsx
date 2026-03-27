import React, { useState, useEffect } from 'react';
import { Notifications, Search, Menu, DarkMode, LightMode, KeyboardArrowDown, Logout, Person } from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

interface NotificationData {
  message: string;
  invoice?: {
    title: string;
    date: string;
  };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const { socket } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('invoice:created', (data: { message: string, invoice: { title: string; date: string } }) => {
        const notificationData: NotificationData = {
          message: data.message || 'New invoice saved',
          invoice: data.invoice,
        };
        setNotifications((prev) => [notificationData, ...prev]);
        toast.info(notificationData.message, {
          theme: theme === 'dark' ? 'dark' : 'light',
        });
      });

      return () => {
        socket.off('invoice:created');
      };
    }
  }, [socket, theme]);

  const getUserInitials = () => {
    if (!user || (!user.name && !user.email)) return 'JD';
    const name = user.name || user.email;
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className={`
      sticky top-0 z-40 w-full transition-all duration-300 backdrop-blur-md border-b
      ${theme === 'dark' ? 'bg-[#0f111a]/80 border-gray-800' : 'bg-white/80 border-gray-100'}
    `}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className={`p-2 rounded-xl lg:hidden transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Menu />
            </button>
            
            {/* Search Bar */}
            <div className="relative group hidden sm:block">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${theme === 'dark' ? 'text-gray-600 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} sx={{ fontSize: 20 }} />
              <input
                type="text"
                placeholder="Search invoices, clients..."
                className={`
                  pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium w-64 lg:w-96 transition-all
                  ${theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-700 focus:border-blue-500/50' 
                    : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500 shadow-sm'
                  }
                  focus:ring-4 focus:ring-blue-500/10 outline-none
                `}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 text-yellow-500 hover:bg-gray-700' : 'bg-gray-100 text-indigo-600 hover:bg-gray-200'}`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <LightMode sx={{ fontSize: 20 }} /> : <DarkMode sx={{ fontSize: 20 }} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl transition-all relative ${theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}
              >
                <Notifications sx={{ fontSize: 20 }} />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className={`
                  absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl border py-2 z-50 max-h-[400px] overflow-y-auto
                  ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}
                `}>
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</span>
                    <button onClick={() => setNotifications([])} className="text-[10px] text-blue-500 font-bold hover:underline">Clear all</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-xs text-gray-500 font-medium">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className={`px-4 py-3 border-b last:border-0 border-gray-50 dark:border-gray-800 hover:bg-gray-500/5 transition-colors`}>
                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{n.message}</p>
                        {n.invoice && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <div className="text-[10px] font-bold text-gray-400">
                              {n.invoice.title} • {n.invoice.date}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`
                  flex items-center gap-3 p-1.5 pr-3 rounded-2xl transition-all border
                  ${theme === 'dark' 
                    ? 'bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-800' 
                    : 'bg-gray-50/50 border-gray-100 text-gray-700 hover:bg-white hover:shadow-sm'
                  }
                `}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-600 text-white'}`}>
                  {getUserInitials()}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className={`text-xs font-black leading-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    {user?.role || 'Admin'}
                  </span>
                </div>
                <KeyboardArrowDown sx={{ fontSize: 16 }} className={`transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showProfileDropdown && (
                <div className={`
                  absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl border py-2 z-50
                  ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}
                `}>
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                    <p className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'User'}</p>
                    <p className="text-[10px] font-bold text-gray-500">{user?.email || ''}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                        navigate('/profile');
                        setShowProfileDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
                    <Person sx={{ fontSize: 16 }} />
                    My Profile
                  </button>
                  
                  <div className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1" />
                  
                  <button 
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors text-rose-500 hover:bg-rose-500/5`}>
                    <Logout sx={{ fontSize: 16 }} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
