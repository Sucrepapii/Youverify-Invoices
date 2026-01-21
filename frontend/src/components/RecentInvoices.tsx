import React from 'react';

type InvoiceStatus = 'paid' | 'overdue' | 'draft' | 'pending payment';


interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: string;
  status: InvoiceStatus;
}

const RecentInvoices: React.FC = () => {
  const invoicesByDate: Record<string, Invoice[]> = {
    'TODAY - 27TH NOVEMBER, 2022': [
      {
        id: '1',
        invoiceNumber: '1023494 - 2304',
        date: 'TODAY - 27TH NOVEMBER, 2022',
        dueDate: 'May 19th, 2023',
        amount: '$1,311,750.12',
        status: 'paid'
      },
      {
        id: '2',
        invoiceNumber: '1023494 - 2304',
        date: 'TODAY - 27TH NOVEMBER, 2022',
        dueDate: 'May 19th, 2023',
        amount: '$1,311,750.12',
        status: 'overdue'
      }
    ],
    '8TH DECEMBER, 2022': [
      {
        id: '3',
        invoiceNumber: '1023494 - 2304',
        date: '8TH DECEMBER, 2022',
        dueDate: 'May 19th, 2023',
        amount: '$1,311,750.12',
        status: 'draft'
      },
      {
        id: '4',
        invoiceNumber: '1023494 - 2304',
        date: '8TH DECEMBER, 2022',
        dueDate: 'May 19th, 2023',
        amount: '$1,311,750.12',
        status: 'pending payment'
      }
    ],
    '8TH DECEMBER, 2023': [
      {
        id: '3',
        invoiceNumber: '1023494 - 2304',
        date: '8TH DECEMBER, 2022',
        dueDate: 'May 19th, 2023',
        amount: '$1,311,750.12',
        status: 'paid'
      },
      {
        id: '4',
        invoiceNumber: '1023494 - 2304',
        date: '8TH DECEMBER, 2022',
        dueDate: 'May 19th, 2023',
        amount: '$1,311,750.12',
        status: 'pending payment'
      }
    ]
  };

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

  const getStatusText = (status: InvoiceStatus): string => {
    switch (status) {
      case 'paid':
        return 'PAID';
      case 'overdue':
        return 'OVERDUE';
      case 'draft':
        return 'DRAFT';
      case 'pending payment':
        return 'PENDING PAYMENT';
    }
  };

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
        {Object.entries(invoicesByDate).map(([date, invoices]) => (
          <div key={date} className="space-y-4">

            <div className="border-b border-gray-200 pb-2">
              <p className="text-md font-bold text-gray-700">{date}</p>
            </div>

            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="md:hidden space-y-3">

                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Invoice - {invoice.invoiceNumber}
                      </h3>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-gray-500 mb-1">DUE DATE</p>
                      <p className="font-medium text-gray-900">{invoice.dueDate}</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-xl font-bold text-gray-900">
                        {invoice.amount}
                      </div>
                      <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:grid md:grid-cols-3 items-center gap-4">
                    {/* Left column: Invoice Number */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          Invoice - {invoice.invoiceNumber}
                        </h3>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-500 mb-1">DUE DATE</p>
                      <p className="font-medium text-gray-900">{invoice.dueDate}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xl font-bold text-gray-900 mb-3">
                        {invoice.amount}
                      </div>
                      <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentInvoices;