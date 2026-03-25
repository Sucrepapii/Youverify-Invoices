import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF, InvoiceData } from '../util/PDFGenerator';
import { toast } from 'react-toastify';
import { Download } from '@mui/icons-material';

type InvoiceStatus = 'paid' | 'overdue' | 'draft' | 'pending payment';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: string;
  status: InvoiceStatus;
  clientName: string;
  title: string;
  // This might contain the full InvoiceData if we store it
  formData?: InvoiceData;
}

const RecentInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.INVOICES, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch invoices');
        const data = await response.json();
        setInvoices(data.invoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [token]);

  const getStatusColor = (status: InvoiceStatus): string => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'pending payment':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
      if (invoice.formData) {
          generateInvoicePDF(invoice.formData);
      } else {
          // Fallback if full data isn't available - generate a basic one
          toast.info('Generating basic PDF as full data is unavailable.');
          // You could implement a basic generator or just alert
      }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Group invoices by date
  const invoicesByDate = invoices.reduce((acc, invoice) => {
    const date = invoice.date.toUpperCase();
    if (!acc[date]) acc[date] = [];
    acc[date].push(invoice);
    return acc;
  }, {} as Record<string, Invoice[]>);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Recent Invoices</h2>
        <button
          className="bg-white hover:bg-blue-300 border border-blue-400 text-black px-10 py-5 
                       rounded-full font-medium flex items-center gap-2 transition-colors"
        >
          VIEW ALL
        </button>
      </div>

      <div className="space-y-8">
        {Object.keys(invoicesByDate).length === 0 ? (
          <p className="text-center text-gray-500 py-10">No invoices found.</p>
        ) : (
          Object.entries(invoicesByDate).map(([date, group]) => (
            <div key={date} className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <p className="text-md font-bold text-gray-700">{date}</p>
              </div>

              <div className="space-y-4">
                {group.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="hidden md:grid md:grid-cols-4 items-center gap-4">
                      {/* Left column: Invoice Number */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            Invoice - {invoice.invoiceNumber}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500">{invoice.clientName}</p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm text-gray-500 mb-1">DUE DATE</p>
                        <p className="font-medium text-gray-900">{invoice.dueDate || 'N/A'}</p>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="text-xl font-bold text-gray-900 mb-1">
                          ${parseFloat(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <span className={`px-4 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleDownloadPDF(invoice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download />
                        </button>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-3">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-900">
                                INV - {invoice.invoiceNumber}
                            </h3>
                            <button 
                              onClick={() => handleDownloadPDF(invoice)}
                              className="text-blue-600"
                            >
                                <Download fontSize="small" />
                            </button>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Client:</span>
                            <span className="font-medium">{invoice.clientName}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Amount:</span>
                            <span className="font-bold">${parseFloat(invoice.amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                {invoice.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentInvoices;