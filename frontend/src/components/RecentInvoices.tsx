import React, { useState } from 'react';
import {
  ReceiptLong,
  Search,
  FilterList
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

interface Invoice {
  _id: string;
  invoiceId: string;
  clientName: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  createdAt: string;
}

interface RecentInvoicesProps {
  invoices?: Invoice[];
}

const RecentInvoices: React.FC<RecentInvoicesProps> = ({ invoices = [] }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(invoice => 
    invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const invoicesByDate = filteredInvoices.reduce((acc, invoice) => {
    const date = new Date(invoice.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(invoice);
    return acc;
  }, {} as Record<string, Invoice[]>);

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'paid') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'overdue') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (s === 'pending payment' || s === 'unpaid') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  return (
    <div className={`
      rounded-[2rem] p-8 transition-all duration-300 border
      ${theme === 'dark' ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}
    `}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3">
           <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <ReceiptLong sx={{ fontSize: 20 }} />
           </div>
           <h2 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Invoice History</h2>
        </div>
        
        <div className="flex flex-1 max-w-md items-center gap-3">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 18 }} />
               <input 
                 type="text" 
                 placeholder="Search client or ID..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className={`
                   w-full pl-10 pr-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                   ${theme === 'dark' 
                     ? 'bg-gray-800/40 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800' 
                     : 'bg-gray-50/50 border-gray-100 text-gray-900 placeholder-gray-400 focus:bg-white focus:shadow-sm'
                   }
                   outline-none focus:border-blue-500/50
                 `}
               />
            </div>
            <button className={`p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-gray-400 hover:text-white' : 'bg-gray-50/50 border-gray-100 text-gray-500 hover:text-gray-900'}`}>
               <FilterList sx={{ fontSize: 18 }} />
            </button>
        </div>
      </div>

      <div className="space-y-12">
        {Object.keys(invoicesByDate).length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <ReceiptLong className="text-gray-400" />
            </div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">No transaction records found</p>
          </div>
        ) : (
          Object.entries(invoicesByDate).map(([date, dateInvoices]) => (
            <div key={date}>
              <div className="flex items-center gap-4 mb-6">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{date}</h4>
                 <div className={`h-[1px] w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
              </div>
              <div className="space-y-3">
                {dateInvoices.map((invoice) => (
                  <div 
                    key={invoice._id}
                    className={`
                      group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer
                      ${theme === 'dark' 
                        ? 'bg-gray-800/10 border-gray-800/50 hover:bg-gray-800/30' 
                        : 'bg-white border-gray-100 hover:shadow-xl hover:shadow-gray-100 hover:border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-5 mb-4 md:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                        {invoice.clientName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h5 className={`font-black text-sm mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {invoice.clientName}
                        </h5>
                        <div className="flex items-center gap-2">
                           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID: {invoice.invoiceId}</p>
                           <span className="text-gray-300">•</span>
                           <p className="text-[10px] font-bold text-gray-400">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-10">
                      <div className="text-right">
                         <p className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${Number(invoice.amount).toLocaleString()}
                         </p>
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{invoice.currency}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(invoice.status)}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${
                            invoice.status.toLowerCase() === 'paid' ? 'bg-emerald-500' : 
                            invoice.status.toLowerCase() === 'overdue' ? 'bg-rose-500' : 'bg-amber-500'
                         }`} />
                         {invoice.status}
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