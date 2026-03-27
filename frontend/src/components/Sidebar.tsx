import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import {
  Home,
  ReceiptLong,
  People,
  Person,
  AccountBalanceWallet,
  HelpOutline,
  Logout,
  Close,
  ChevronRight
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ComponentType<import('@mui/material').SvgIconProps>;
  label: string;
  path: string;
  count?: number;
  hasRoute?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', hasRoute: true },
    { icon: AccountBalanceWallet, label: 'Accounts', path: '/accounts', hasRoute: true },
    { icon: ReceiptLong, label: 'Invoices', path: '/recent-invoices', hasRoute: true },
    { icon: People, label: 'Beneficiaries', path: '/beneficiaries', hasRoute: true },
    { icon: HelpOutline, label: 'Support', path: '/support', hasRoute: true },
    { icon: Person, label: 'My Profile', path: '/profile', hasRoute: true },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (!item.hasRoute) {
      toast.info(`"${item.label}" page is under development. Coming soon!`, {
        theme: theme === 'dark' ? 'dark' : 'light'
      });
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-68 transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen border-r
        ${theme === 'dark' 
          ? 'bg-gray-900 border-gray-800 text-gray-300' 
          : 'bg-white border-gray-200 text-gray-600'
        }
      `}>
        {/* Logo Section */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-black text-xl">Y</span>
              </div>
              <div>
                <h1 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>YouVerify</h1>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Invoicing Platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`lg:hidden p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <Close fontSize="small" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-4 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            const content = (
              <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden">
                {active && (
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                )}
                
                <div className="flex items-center space-x-3 z-10">
                  <Icon
                    fontSize="small"
                    className={`transition-colors ${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`}
                  />
                  <span className={`font-semibold text-sm transition-colors ${
                    active 
                      ? (theme === 'dark' ? 'text-white' : 'text-gray-900') 
                      : (theme === 'dark' ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-900')
                  }`}>
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center space-x-2 z-10">
                  {item.count && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                  <ChevronRight fontSize="inherit" className={`transition-all ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'} text-blue-500`} />
                </div>

                {/* Hover Background */}
                <div className={`
                  absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  ${active 
                    ? (theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50') 
                    : (theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50')
                  }
                `} />
              </div>
            );

            if (!item.hasRoute) {
              return (
                <button
                  key={item.path}
                  onClick={() => handleMenuItemClick(item)}
                  className="w-full block"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="w-full block"
              >
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group
              ${theme === 'dark' ? 'text-gray-400 hover:bg-red-500/10 hover:text-red-500' : 'text-gray-600 hover:bg-red-50 hover:text-red-600'}
            `}
          >
            <Logout fontSize="small" className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;