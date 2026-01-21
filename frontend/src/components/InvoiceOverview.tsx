import React from 'react';
import { useState } from 'react';
import {
  Settings as SettingsIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import InvoiceForm from './InvoiceForm';
import DevelopmentStatusModal from './DevelopmentStatusModal';


const InvoiceOverview: React.FC = () => {

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">

      {/* Header Section - Fixed for mobile */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
        <div className="order-2 md:order-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Invoice</h1>
          <p className="text-gray-600 text-sm md:text-base">Dashboard overview</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto order-1 md:order-2">

          <button
            onClick={() => setShowDevModal(true)}
            className="bg-white hover:bg-blue-400 text-black border border-blue-300 px-4 py-3 
                 rounded-lg md:rounded-full font-medium flex items-center justify-center gap-2 
                 transition-colors text-sm md:text-base w-full md:w-auto
                 hover:text-white"
          >
            SEE WHAT'S NEW
          </button>

          <button
            onClick={() => setShowInvoiceForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 
                 rounded-lg md:rounded-full font-medium flex items-center justify-center gap-2 
                 transition-colors text-sm md:text-base w-full md:w-auto"
          >
            CREATE
          </button>
          <div>
            {showInvoiceForm && (
              <InvoiceForm onClose={() => setShowInvoiceForm(false)} />
            )}
          </div>

          {/* Development Status Modal */}
          <DevelopmentStatusModal
            isOpen={showDevModal}
            onClose={() => setShowDevModal(false)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">

        <div className="bg-white border-l-4 border border-gray-200 rounded-xl p-4 md:p-6 shadow hover:shadow-lg transition-shadow min-w-0">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="min-w-0">
              <p className="text-gray-600 font-medium text-xs md:text-sm mb-1 truncate">TOTAL: PAID</p>
              <p className="text-blue-600 text-base md:text-lg font-bold">2089</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
              <CheckCircleIcon className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">$4,120,102.75</h3>
        </div>


        <div className="bg-white border-l-4 border border-gray-200 rounded-xl p-4 md:p-6 shadow hover:shadow-lg transition-shadow min-w-0">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="min-w-0">
              <p className="text-gray-600 font-medium text-xs md:text-sm mb-1 truncate">TOTAL: OVERDUE</p>
              <p className="text-red-600 text-base md:text-lg font-bold">23</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
              <WarningIcon className="text-red-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">$23,000.13</h3>
        </div>


        <div className="bg-white border-l-4 border-yellow-500 border rounded-xl p-4 md:p-6 shadow hover:shadow-lg transition-shadow min-w-0">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="min-w-0">
              <p className="text-gray-600 font-medium text-xs md:text-sm mb-1 truncate">TOTAL: DRAFT</p>
              <p className="text-yellow-600 text-base md:text-lg font-bold">45</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
              <EditIcon className="text-yellow-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">$12,200.00</h3>
        </div>


        <div className="bg-white border-l-4 border-purple-500 border rounded-xl p-4 md:p-6 shadow hover:shadow-lg transition-shadow min-w-0">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="min-w-0">
              <p className="text-gray-600 font-medium text-xs md:text-sm mb-1 truncate">TOTAL: UNPAID</p>
              <p className="text-purple-600 text-base md:text-lg font-bold">102</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
              <AttachMoneyIcon className="text-purple-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">$87,102.00</h3>
        </div>
      </div>

      {/* Invoice Actions Section */}
      <div className="border-t border-gray-200 pt-6 md:pt-8">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Invoice Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Create Invoice */}
          <button
            onClick={() => setShowInvoiceForm(true)}
            className="mt-4 md:mt-6 w-full py-2 md:py-3 bg-blue-600 text-white rounded-3xl font-medium 
             group-hover:bg-blue-700 transition-colors text-left text-sm md:text-base"
          >
            <div className="flex flex-col items-start px-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-3 md:mb-4 
                   group-hover:bg-blue-100 transition-colors">
                <AttachMoneyIcon className="text-blue-600 group-hover:text-blue-700 w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h4 className="font-semibold text-white text-base md:text-lg mb-1 group-hover:text-blue-300">
                Create New Invoice
              </h4>
              <p className="text-blue-100 text-xs md:text-sm group-hover:text-blue-200">
                Create new invoices easily
              </p>
            </div>
          </button>

          {/* Change Settings */}
          <button
            onClick={() => console.log('Change settings clicked')}
            className="mt-4 md:mt-6 w-full py-2 md:py-3 bg-transparent border border-purple-300 text-black rounded-3xl font-medium 
             group-hover:bg-purple-50 transition-colors text-left text-sm md:text-base"
          >
            <div className="flex flex-col items-start px-4 md:px-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-3 md:mb-4 
                   group-hover:bg-purple-100 transition-colors">
                <SettingsIcon className="text-purple-600 group-hover:text-purple-700 w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h4 className="font-semibold text-gray-900 text-base md:text-lg mb-1 group-hover:text-purple-600">
                Change Invoice settings
              </h4>
              <p className="text-gray-600 text-xs md:text-sm group-hover:text-gray-700">
                Customize your invoices
              </p>
            </div>
          </button>

          {/* Manage Customers */}
          <button
            onClick={() => console.log('Manage customers clicked')}
            className="mt-4 md:mt-6 w-full py-2 md:py-3 bg-transparent border border-green-300 text-black rounded-3xl font-medium 
             group-hover:bg-green-50 transition-colors text-left text-sm md:text-base"
          >
            <div className="flex flex-col items-start px-4 md:px-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-lg flex items-center justify-center mb-3 md:mb-4 
                   group-hover:bg-green-100 transition-colors">
                <PeopleIcon className="text-green-600 group-hover:text-green-700 w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h4 className="font-semibold text-gray-900 text-base md:text-lg mb-1 group-hover:text-green-600">
                Manage Customer list
              </h4>
              <p className="text-gray-600 text-xs md:text-sm group-hover:text-gray-700">
                Add and remove customers
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceOverview;