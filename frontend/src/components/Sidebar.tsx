import React from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Home,
  Description,
  People,
  Settings,
  AccountBalance,
  PieChart,
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
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  count?: number;
  hasRoute?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', hasRoute: true },
    { icon: Description, label: 'Overview', path: '/overview', hasRoute: false },
    { icon: AccountBalance, label: 'Accounts', path: '/accounts', count: 5, hasRoute: false },
    { icon: People, label: 'Invoices', path: '/recent-invoices', count: 8, hasRoute: true },
    { icon: PieChart, label: 'Beneficiary Management', path: '/beneficiaries', hasRoute: false },
    { icon: HelpOutline, label: 'Help & Support', path: '/support', hasRoute: false },
    { icon: Settings, label: 'Settings', path: '/settings', hasRoute: true },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (!item.hasRoute) {
      toast.info(`"${item.label}" page is under development. Coming soon!`);
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}



      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">YouVerify</h1>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Close fontSize="small" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Invoice Management System</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            if (!item.hasRoute) {
              return (
                <button
                  key={item.path}
                  onClick={() => handleMenuItemClick(item)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg
                    transition-colors duration-200 text-left
                    hover:bg-gray-50 hover:text-gray-900 text-gray-700
                    cursor-pointer
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      fontSize="small"
                      className="text-gray-500"
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.count && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                        {item.count}
                      </span>
                    )}
                    <ChevronRight fontSize="small" className="text-gray-400" />
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${active
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    fontSize="small"
                    className={active ? 'text-blue-500' : 'text-gray-500'}
                  />
                  <span className={`font-medium ${active ? 'text-blue-700' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.count && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${active ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                      {item.count}
                    </span>
                  )}
                  <ChevronRight fontSize="small" className="text-gray-400" />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Logout fontSize="small" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;