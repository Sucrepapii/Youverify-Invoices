import React, { useEffect, useState } from 'react';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  AttachMoney as AttachMoneyIcon,
  Settings as SettingsIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import InvoiceForm from './InvoiceForm';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const InvoiceOverview: React.FC = () => {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [stats, setStats] = useState({
    paidCount: 0,
    paidAmount: 0,
    overdueCount: 0,
    overdueAmount: 0,
    draftCount: 0,
    draftAmount: 0,
    unpaidCount: 0,
    unpaidAmount: 0
  });
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.INVOICES, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;
        const data = await response.json();
        const invoices = data.invoices || [];

        const newStats = invoices.reduce((acc: typeof stats, inv: { status: string; amount: string }) => {
          const amt = parseFloat(inv.amount) || 0;
          if (inv.status === 'paid') {
            acc.paidCount++;
            acc.paidAmount += amt;
          } else if (inv.status === 'overdue') {
            acc.overdueCount++;
            acc.overdueAmount += amt;
          } else if (inv.status === 'draft') {
            acc.draftCount++;
            acc.draftAmount += amt;
          } else {
            acc.unpaidCount++;
            acc.unpaidAmount += amt;
          }
          return acc;
        }, {
          paidCount: 0, paidAmount: 0,
          overdueCount: 0, overdueAmount: 0,
          draftCount: 0, draftAmount: 0,
          unpaidCount: 0, unpaidAmount: 0
        });

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [token, showInvoiceForm]); // Refresh when form closes (might have added new invoice)

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Invoice Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">Real-time financial overview</p>
        </div>

        <button
          onClick={() => setShowInvoiceForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 
               rounded-full font-medium flex items-center justify-center gap-2 
               transition-colors text-sm md:text-base w-full md:w-auto"
        >
          CREATE INVOICE
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Paid Stats */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-blue-600 font-bold text-xs uppercase">Paid</p>
              <p className="text-blue-800 text-lg font-bold">{stats.paidCount}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900">${stats.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>

        {/* Overdue Stats */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-red-600 font-bold text-xs uppercase">Overdue</p>
              <p className="text-red-800 text-lg font-bold">{stats.overdueCount}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <WarningIcon className="text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900">${stats.overdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>

        {/* Draft Stats */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-yellow-600 font-bold text-xs uppercase">Draft</p>
              <p className="text-yellow-800 text-lg font-bold">{stats.draftCount}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <EditIcon className="text-yellow-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900">${stats.draftAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>

        {/* Unpaid Stats */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-purple-600 font-bold text-xs uppercase">Unpaid</p>
              <p className="text-purple-800 text-lg font-bold">{stats.unpaidCount}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <AttachMoneyIcon className="text-purple-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900">${stats.unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setShowInvoiceForm(true)}>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <AttachMoneyIcon className="text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900">Create Invoice</h4>
              <p className="text-sm text-gray-500">Generate professional invoices in seconds.</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <SettingsIcon className="text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900">Settings</h4>
              <p className="text-sm text-gray-500">Configure your branding and payments.</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <PeopleIcon className="text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900">Customers</h4>
              <p className="text-sm text-gray-500">Manage your client relationships.</p>
          </div>
      </div>

      {showInvoiceForm && (
        <InvoiceForm onClose={() => setShowInvoiceForm(false)} />
      )}
    </div>
  );
};

export default InvoiceOverview;