import React, { useState, useEffect, useCallback } from 'react';
import {
  ReceiptLong,
  Search,
  FilterList,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Send,
  Edit
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'react-toastify';
import InvoiceForm from './InvoiceForm';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  invoiceNumber?: string;
  title?: string;
  clientName?: string;
  customerName?: string;
  entityName?: string;
  amount?: number;
  total?: number;
  currency?: string;
  status: string;
  dueDate?: string;
  date?: string;
  createdAt?: string;
  items?: InvoiceItem[];
}

// Status values that should appear in Invoice History (saved + sent)
const VISIBLE_STATUSES = ['draft', 'sent', 'paid', 'done', 'cancelled', 'overdue', 'pending payment', 'unpaid'];

const STATUS_FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'sent', label: 'Sent' },
  { key: 'draft', label: 'Draft' },
  { key: 'paid', label: 'Paid' },
  { key: 'done', label: 'Done' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'overdue', label: 'Overdue' },
];

const getStatusStyle = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'paid' || s === 'done') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (s === 'overdue' || s === 'cancelled') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  if (s === 'sent') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  if (s === 'pending payment' || s === 'unpaid') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  if (s === 'draft') return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
};

const getStatusDot = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'paid' || s === 'done') return 'bg-emerald-500';
  if (s === 'overdue' || s === 'cancelled') return 'bg-rose-500';
  if (s === 'sent') return 'bg-blue-500';
  if (s === 'draft') return 'bg-gray-400';
  return 'bg-amber-500';
};

// Terminal statuses get no action buttons
const TERMINAL_STATUSES = ['done', 'cancelled', 'paid'];

const RecentInvoices: React.FC = () => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.INVOICES, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        const raw: Invoice[] = Array.isArray(data) ? data : (data.invoices || []);
        // Show all statuses — the filter tabs handle what's visible
        setInvoices(raw.filter(inv => VISIBLE_STATUSES.includes((inv.status || '').toLowerCase())));
      }
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const updateStatus = async (invoiceId: string, newStatus: 'done' | 'cancelled') => {
    setUpdatingId(invoiceId);
    try {
      const response = await fetch(`${API_ENDPOINTS.INVOICES}/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setInvoices(prev =>
          prev.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv)
        );
        toast.success(`Invoice marked as ${newStatus}`);
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Failed to update invoice status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getDisplayName = (inv: Invoice) =>
    inv.clientName || inv.customerName || inv.entityName || inv.title || 'Unknown';

  const getAmount = (inv: Invoice) =>
    Number(inv.amount || inv.total || 0);

  const getDate = (inv: Invoice) => {
    const raw = inv.createdAt || inv.date || inv.dueDate;
    if (!raw) return '—';
    return new Date(raw).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDueDate = (inv: Invoice) => {
    if (!inv.dueDate) return null;
    return new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getCurrencyDisplay = (inv: any) => {
    const billingCurrency = inv.billingCurrency || '';
    const match = billingCurrency.match(/\(([^)]+)\)/);
    if (match) return match[1];
    return inv.currency || 'NGN';
  };

  const filtered = invoices.filter(inv => {
    const matchesSearch =
      getDisplayName(inv).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.title || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' || inv.status?.toLowerCase() === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const invoicesByDate = filtered.reduce((acc, invoice) => {
    const date = getDate(invoice);
    if (!acc[date]) acc[date] = [];
    acc[date].push(invoice);
    return acc;
  }, {} as Record<string, Invoice[]>);

  return (
    <div className={`
      rounded-[2rem] p-8 transition-all duration-300 border
      ${theme === 'dark' ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}
    `}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <ReceiptLong sx={{ fontSize: 20 }} />
          </div>
          <div>
            <h2 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Invoice History
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
              {invoices.length} total record{invoices.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-1 max-w-md items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 18 }} />
            <input
              type="text"
              placeholder="Search client or invoice ID..."
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

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {STATUS_FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`
              px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border
              ${activeFilter === tab.key
                ? (theme === 'dark' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-600 text-white border-blue-600')
                : (theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-gray-400 hover:text-white' : 'bg-gray-50 border-gray-100 text-gray-500 hover:text-gray-900')
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div className="space-y-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Loading invoices...</p>
          </div>
        ) : Object.keys(invoicesByDate).length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ReceiptLong className="text-gray-400" />
            </div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">No invoices found</p>
            <p className="text-[10px] text-gray-400 mt-2">Create your first invoice to get started</p>
          </div>
        ) : (
          Object.entries(invoicesByDate).map(([date, dateInvoices]) => (
            <div key={date}>
              <div className="flex items-center gap-4 mb-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{date}</h4>
                <div className={`h-[1px] w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`} />
              </div>

              <div className="space-y-3">
                {dateInvoices.map((invoice) => {
                  const isTerminal = TERMINAL_STATUSES.includes(invoice.status?.toLowerCase());
                  const isUpdating = updatingId === invoice.id;

                  return (
                    <div
                      key={invoice.id}
                      className={`
                        flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all duration-300
                        ${theme === 'dark'
                          ? 'bg-gray-800/10 border-gray-800/50 hover:bg-gray-800/30'
                          : 'bg-white border-gray-100 hover:shadow-lg hover:shadow-gray-100/80 hover:border-transparent'
                        }
                      `}
                    >
                      {/* Left: Avatar + Info */}
                      <div className="flex items-center gap-4 mb-4 md:mb-0 flex-1 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {getDisplayName(invoice).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h5 className={`font-black text-sm mb-0.5 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {getDisplayName(invoice)}
                          </h5>
                          <div className="flex items-center gap-2 flex-wrap">
                            {invoice.invoiceNumber && (
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                #{invoice.invoiceNumber}
                              </p>
                            )}
                            {invoice.dueDate && (
                              <>
                                <span className="text-gray-300">•</span>
                                <p className="text-[10px] font-bold text-gray-400">
                                  Due {getDueDate(invoice)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount + Status + Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0">
                        {/* Edit Button — Only for drafts */}
                        {invoice.status?.toLowerCase() === 'draft' && (
                          <button
                            onClick={() => setEditingInvoice(invoice)}
                            className={`
                              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                              ${theme === 'dark'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100'
                              }
                            `}
                          >
                            <Edit sx={{ fontSize: 13 }} />
                            Edit
                          </button>
                        )}

                        {/* Amount */}
                        <div className="text-right">
                          <p className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {getCurrencyDisplay(invoice)}{getAmount(invoice).toLocaleString()}
                          </p>
                          {invoice.items && (
                            <p className="text-[10px] font-bold text-gray-400">
                              {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                        {/* Status badge */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(invoice.status)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(invoice.status)}`} />
                          {invoice.status}
                        </div>

                        {/* Action Buttons — only for non-terminal invoices */}
                        {!isTerminal && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStatus(invoice.id, 'done')}
                              disabled={isUpdating}
                              title="Mark as Done"
                              className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                                ${theme === 'dark'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                }
                                disabled:opacity-40 disabled:cursor-not-allowed
                              `}
                            >
                              {isUpdating ? (
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle sx={{ fontSize: 13 }} />
                              )}
                              Done
                            </button>

                            <button
                              onClick={() => updateStatus(invoice.id, 'cancelled')}
                              disabled={isUpdating}
                              title="Mark as Cancelled"
                              className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                                ${theme === 'dark'
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                                  : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                                }
                                disabled:opacity-40 disabled:cursor-not-allowed
                              `}
                            >
                              {isUpdating ? (
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Cancel sx={{ fontSize: 13 }} />
                              )}
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Terminal status icon */}
                        {isTerminal && (
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                            {invoice.status?.toLowerCase() === 'done' || invoice.status?.toLowerCase() === 'paid' ? (
                              <CheckCircle sx={{ fontSize: 18 }} className="text-emerald-400" />
                            ) : invoice.status?.toLowerCase() === 'cancelled' ? (
                              <Cancel sx={{ fontSize: 18 }} className="text-rose-400" />
                            ) : (
                              <HourglassEmpty sx={{ fontSize: 18 }} className="text-amber-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend for icon usage (suppress unused import warnings) */}
      <span className="hidden"><Send /></span>

      {/* Edit Modal */}
      {editingInvoice && (
        <InvoiceForm 
          invoice={editingInvoice as any} 
          onClose={() => {
            setEditingInvoice(null);
            fetchInvoices();
          }} 
        />
      )}
    </div>
  );
};

export default RecentInvoices;