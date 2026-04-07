import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/api';
import {
  Close,
  Mail,
  Person,
  Phone,
  Business,
  Add,
  DeleteOutline,
  Description as DescriptionIcon,
  Payment,
  Notes,
  CalendarMonth,
  AccountBalanceWallet,
  History,
  ReceiptLong,
  SvgIconComponent
} from '@mui/icons-material';
import { generateInvoicePDF } from '../util/PDFGenerator';

// Move interfaces outside
interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceFormData {
  invoiceNo: string;
  sender: {
    name: string;
    phone1: string;
    phone2: string;
    email: string;
  };
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  invoiceDate: string;
  dueDate: string;
  billingCurrency: string;
  items: InvoiceItem[];
  notes: string;
  discountRate: number;
  accountName: string;
  accountNumber: string;
  bankAddress: string;
  achRoutingNo: string;
}

interface ExistingInvoice {
  id: string;
  invoiceNo?: string;
  invoiceNumber?: string;
  sender?: { name: string; phone1: string; phone2: string; email: string };
  customer?: { name?: string; phone?: string; email?: string };
  customerName?: string;
  clientName?: string;
  invoiceDate?: string;
  date?: string;
  dueDate?: string;
  billingCurrency?: string;
  items?: Array<{ id: number; description: string; quantity: number; price: number; total: number }>;
  notes?: string;
  discountRate?: number;
  accountName?: string;
  accountNumber?: string;
  bankAddress?: string;
  achRoutingNo?: string;
  [key: string]: unknown;
}

interface Beneficiary {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
}

interface Account {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankAddress?: string;
  achRoutingNo?: string;
}

interface InvoiceFormProps {
  onClose: () => void;
  invoice?: ExistingInvoice;
}

interface SectionHeaderProps {
  icon: SvgIconComponent;
  title: string;
  subtitle?: string;
  theme: string;
}

interface InputFieldProps {
  label: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: SvgIconComponent;
  theme: string;
  required?: boolean;
}

// Move components outside to avoid remounting issues
const SectionHeader = ({ icon: Icon, title, subtitle, theme }: SectionHeaderProps) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
      <Icon sx={{ fontSize: 18 }} />
    </div>
    <div>
      <h3 className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      {subtitle && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{subtitle}</p>}
    </div>
  </div>
);

const InputField = ({ label, placeholder, value, onChange, type = "text", icon: Icon, theme, required }: InputFieldProps) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block ml-1">
      {label} {required && <span className="text-red-500 font-black ml-0.5">*</span>}
    </label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" sx={{ fontSize: 16 }} />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full transition-all duration-300 text-sm font-bold
          ${Icon ? 'pl-9' : 'px-4'} py-3.5 rounded-2xl border-2
          ${theme === 'dark' 
            ? 'bg-gray-800/10 border-gray-800 text-white placeholder-gray-600 focus:bg-gray-800/20 focus:border-blue-500/50' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 shadow-sm focus:shadow-blue-500/10'
          }
          focus:ring-4 focus:ring-blue-500/5 outline-none
        `}
      />
    </div>
  </div>
);

const getCurrencySymbol = (billingCurrency: string) => {
  const match = billingCurrency.match(/\(([^)]+)\)/);
  return match ? match[1] : '$';
};

const EXCHANGE_RATES: Record<string, number> = {
  'USD ($)': 1.0,
  'EUR (€)': 0.92,
  'GBP (£)': 0.79,
  'NGN (₦)': 1580.0,
};

const convertAmount = (amount: number, fromCurrency: string, toCurrency: string) => {
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1.0;
  const toRate = EXCHANGE_RATES[toCurrency] || 1.0;
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
};

export default function InvoiceForm({ onClose, invoice: existingInvoice }: InvoiceFormProps) {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (!token) return;
      try {
        const response = await fetch(API_ENDPOINTS.BENEFICIARIES, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setBeneficiaries(data);
        }
      } catch (error) {
        console.error('Failed to fetch beneficiaries');
      }
    };

    const fetchAccounts = async () => {
      if (!token) return;
      try {
        const response = await fetch(API_ENDPOINTS.ACCOUNTS, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        }
      } catch (error) {
        console.error('Failed to fetch accounts');
      }
    };

    fetchBeneficiaries();
    fetchAccounts();
  }, [token]);

  const handleBeneficiarySelect = (beneficiary: Beneficiary) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        name: beneficiary.name,
        email: beneficiary.email,
        phone: beneficiary.phone
      }
    }));
  };

  const handleAccountSelect = (account: Account) => {
    setFormData(prev => ({
      ...prev,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankAddress: account.bankAddress || '',
      achRoutingNo: account.achRoutingNo || ''
    }));
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  };

  const getDueDateDefault = () => {
    const now = new Date();
    now.setDate(now.getDate() + 30);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  };

  const initialFormData = useMemo(() => {
    if (existingInvoice) {
      return {
        invoiceNo: existingInvoice.invoiceNo || existingInvoice.invoiceNumber || `INV-${Math.floor(Math.random() * 900000) + 100000}`,
        sender: existingInvoice.sender || { name: '', phone1: '', phone2: '', email: '' },
        customer: {
          name: existingInvoice.customer?.name || existingInvoice.customerName || existingInvoice.clientName || '',
          phone: existingInvoice.customer?.phone || '',
          email: existingInvoice.customer?.email || '',
        },
        invoiceDate: existingInvoice.invoiceDate || existingInvoice.date || getCurrentDate(),
        dueDate: existingInvoice.dueDate || getDueDateDefault(),
        billingCurrency: existingInvoice.billingCurrency || 'USD ($)',
        items: existingInvoice.items?.length
          ? existingInvoice.items
          : [{ id: 1, description: '', quantity: 1, price: 0, total: 0 }],
        notes: existingInvoice.notes || '',
        discountRate: Number(existingInvoice.discountRate) || 0,
        accountName: existingInvoice.accountName || '',
        accountNumber: existingInvoice.accountNumber || '',
        bankAddress: existingInvoice.bankAddress || '',
        achRoutingNo: existingInvoice.achRoutingNo || '',
      };
    }
    return {
      invoiceNo: `INV-${Math.floor(Math.random() * 900000) + 100000}`,
      sender: { name: '', phone1: '', phone2: '', email: '' },
      customer: { name: '', phone: '', email: '' },
      invoiceDate: getCurrentDate(),
      dueDate: getDueDateDefault(),
      billingCurrency: 'USD ($)',
      items: [{ id: 1, description: '', quantity: 1, price: 0, total: 0 }],
      notes: '',
      discountRate: 0,
      accountName: '',
      accountNumber: '',
      bankAddress: '',
      achRoutingNo: ''
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);

  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (formData.discountRate / 100);
  const totalAmount = subtotal - discountAmount;
  const currencySymbol = getCurrencySymbol(formData.billingCurrency);

  const handleItemChange = (id: number, field: keyof InvoiceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'price') updated.total = (Number(updated.quantity) || 0) * (Number(updated.price) || 0);
          return updated;
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), description: '', quantity: 1, price: 0, total: 0 }]
    }));
  };

  const removeItem = (id: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    }
  };

  const getMissingMandatoryFields = () => {
    const missing = [];
    if (!formData.sender.name) missing.push('Entity Name');
    if (!formData.sender.email) missing.push('Email Address');
    if (!formData.sender.phone1) missing.push('Phone Number');
    if (!formData.customer.name) missing.push('Customer Name');
    if (!formData.customer.email) missing.push('Client Email');
    if (!formData.customer.phone) missing.push('Contact Number');
    if (!formData.accountName) missing.push('Account Name');
    if (!formData.accountNumber) missing.push('Account Number');
    if (formData.items.length === 0 || !formData.items.some(item => item.description.trim() !== '')) {
      missing.push('at least one Invoice Item');
    }
    return missing;
  };

  const createInvoice = async (action: 'save' | 'send') => {
    // Unified validation for both save and send
    const missing = getMissingMandatoryFields();
    if (missing.length > 0) {
      toast.error(`Please fill the mandatory fields: ${missing.join(', ')}`, { 
        theme: theme === 'dark' ? 'dark' : 'light',
        position: "top-center"
      });
      return;
    }

    if (!token) {
      toast.error('Session expired. Please log in again.', { theme: theme === 'dark' ? 'dark' : 'light' });
      return;
    }

    setIsSubmitting(true);
    const isEditing = !!existingInvoice;
    const url = isEditing
      ? `${API_ENDPOINTS.INVOICES}/${existingInvoice!.id}`
      : API_ENDPOINTS.INVOICES;
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          date: formData.invoiceDate,
          title: formData.customer.name || `Draft: ${formData.invoiceNo}`,
          clientName: formData.customer.name || 'Unspecified Client',
          amount: totalAmount.toFixed(2),
          status: action === 'send' ? 'pending payment' : 'draft',
          image: 'https://via.placeholder.com/300',
          currency: currencySymbol, // Ensure symbol is saved for dashboard
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired or invalid. Please log out and sign in again.', { theme: theme === 'dark' ? 'dark' : 'light' });
          setIsSubmitting(false);
          return;
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to process invoice');
      }
      const successMsg = action === 'send'
        ? 'Invoice sent successfully!'
        : (isEditing ? 'Draft updated successfully!' : 'Invoice saved successfully!');
      
      toast.success(successMsg, { theme: theme === 'dark' ? 'dark' : 'light' });
      onClose();
    } catch (error) {
      toast.error('Failed to process invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showConfirmClose, setShowConfirmClose] = useState(false);


  const isFormDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const handleCloseAttempt = () => {
    if (!isFormDirty) {
      onClose();
      return;
    }
    setShowConfirmClose(true);
  };

  const ConfirmCloseModal = () => (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10001] p-4 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`
        w-full max-w-md p-8 rounded-[2rem] shadow-2xl border animate-in fade-in zoom-in duration-300
        ${theme === 'dark' ? 'bg-[#1a1d2e] border-gray-800' : 'bg-white border-gray-100'}
      `}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
            <Notes />
          </div>
          <div>
            <h3 className={`text-lg font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Unsaved Changes</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Do you want to save this invoice?</p>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => createInvoice('save')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
          >
            Save as Draft & Close
          </button>
          <button 
            onClick={onClose}
            className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${theme === 'dark' ? 'border-gray-800 text-gray-400 hover:text-rose-500 hover:bg-rose-500/5' : 'border-gray-100 text-gray-500 hover:text-rose-600 hover:bg-rose-50'}`}
          >
            Discard Changes
          </button>
          <button 
            onClick={() => setShowConfirmClose(false)}
            className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start justify-center p-4 z-[9999] overflow-y-auto cursor-pointer"
      onClick={handleCloseAttempt}
    >
      {showConfirmClose && <ConfirmCloseModal />}
      <div 
        className={`
          w-full max-w-7xl my-4 rounded-[2.5rem] shadow-2xl overflow-hidden border transition-all duration-300 cursor-default
          ${theme === 'dark' ? 'bg-[#0f111a] border-gray-800' : 'bg-white border-gray-100'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Bar */}
        <div className={`
          px-8 py-6 border-b flex justify-between items-center sticky top-0 z-50 backdrop-blur-md
          ${theme === 'dark' ? 'bg-[#0f111a]/80 border-gray-800' : 'bg-white/80 border-gray-100'}
        `}>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <DescriptionIcon className="text-white" />
             </div>
              <div>
                 <h1 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                   {formData.invoiceNo} <span className={`font-medium ml-2 ${existingInvoice ? 'text-amber-500' : 'text-blue-500'}`}>{existingInvoice ? 'EDITING' : 'DRAFT'}</span>
                 </h1>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{existingInvoice ? 'Edit saved draft — update and send' : 'New Invoice Details'}</p>
              </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={() => generateInvoicePDF(formData)}
               className={`hidden md:flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
             >
                Download PDF
             </button>
             <button 
                onClick={() => createInvoice('save')}
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
             >
                {isSubmitting ? 'Saving...' : 'Save Draft'}
             </button>
             <button 
                onClick={() => createInvoice('send')}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
             >
                {isSubmitting ? 'Processing...' : 'Send Invoice'}
             </button>
             <button 
                onClick={handleCloseAttempt} 
                title={isFormDirty ? "Review unsaved changes" : "Close invoice"}
                className={`p-3 rounded-2xl transition-all active:scale-95 relative group ${theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
              >
                 <Close sx={{ fontSize: 22 }} />
                 {isFormDirty && (
                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white dark:border-[#0f111a] rounded-full animate-pulse shadow-sm shadow-blue-500/50" />
                 )}
              </button>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             {/* Main Content Area */}
             <div className="lg:col-span-8 space-y-12">

                {/* Header Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className={`p-8 rounded-[2rem] border ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800' : 'bg-blue-50/30 border-blue-100'}`}>
                      <SectionHeader icon={Business} title="From" subtitle="Your Company Details" theme={theme} />
                       <div className="space-y-4">
                          <InputField label="Entity Name" required placeholder="Your Company Name" value={formData.sender.name} onChange={(e) => setFormData({...formData, sender: {...formData.sender, name: e.target.value}})} icon={Business} theme={theme} />
                          <InputField label="Email Address" required placeholder="email@address.com" value={formData.sender.email} onChange={(e) => setFormData({...formData, sender: {...formData.sender, email: e.target.value}})} icon={Mail} theme={theme} />
                          <div className="grid grid-cols-2 gap-4">
                             <InputField label="Phone Number" required placeholder="+1..." value={formData.sender.phone1} onChange={(e) => setFormData({...formData, sender: {...formData.sender, phone1: e.target.value}})} icon={Phone} theme={theme} />
                             <InputField label="Secondary Phone" placeholder="+1..." value={formData.sender.phone2} onChange={(e) => setFormData({...formData, sender: {...formData.sender, phone2: e.target.value}})} icon={Phone} theme={theme} />
                          </div>
                       </div>
                   </div>

                   <div className={`p-8 rounded-[2rem] border ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800' : 'bg-indigo-50/30 border-indigo-100'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <SectionHeader icon={Person} title="To" subtitle="Customer Details" theme={theme} />
                        {beneficiaries.length > 0 && (
                          <div className="relative group">
                            <select
                              className={`
                                appearance-none pl-3 pr-8 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all outline-none cursor-pointer
                                ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-blue-400 hover:bg-gray-750' : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50'}
                              `}
                              onChange={(e) => {
                                const b = beneficiaries.find(ben => ben.id === e.target.value);
                                if (b) handleBeneficiarySelect(b);
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>QUICK SELECT</option>
                              {beneficiaries.map(b => (
                                <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                              ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]">▼</div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <InputField label="Customer Name" required placeholder="Customer Name" value={formData.customer.name} onChange={(e) => setFormData({...formData, customer: {...formData.customer, name: e.target.value}})} icon={Person} theme={theme} />
                          <InputField label="Client Email" required placeholder="client@address.com" value={formData.customer.email} onChange={(e) => setFormData({...formData, customer: {...formData.customer, email: e.target.value}})} icon={Mail} theme={theme} />
                          <InputField label="Contact Number" required placeholder="+1..." value={formData.customer.phone} onChange={(e) => setFormData({...formData, customer: {...formData.customer, phone: e.target.value}})} icon={Phone} theme={theme} />
                        </div>
                      </div>
                   </div>
                </div>

                {/* Line Items Table */}
                <div>
                   <SectionHeader icon={ReceiptLong} title="Invoice Items" subtitle="Services & Goods Rendered" theme={theme} />
                   <div className={`rounded-3xl border overflow-hidden ${theme === 'dark' ? 'border-gray-800 bg-gray-800/10' : 'border-gray-100 bg-gray-50/50'}`}>
                      <table className="w-full">
                         <thead>
                            <tr className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'} text-[10px] font-black uppercase tracking-[0.2em] text-gray-500`}>
                               <th className="px-6 py-4 text-left">Description</th>
                               <th className="px-6 py-4 text-center w-24">Qty</th>
                               <th className="px-6 py-4 text-right w-32">Price</th>
                               <th className="px-6 py-4 text-right w-40">Total</th>
                               <th className="w-16"></th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {formData.items.map((item) => (
                               <tr key={item.id} className="group hover:bg-blue-500/5 transition-colors">
                                  <td className="px-6 py-4">
                                     <textarea
                                        className={`w-full bg-transparent border-none focus:ring-0 text-sm font-semibold transition-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                        placeholder="Item description..."
                                        rows={1}
                                        value={item.description}
                                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                     />
                                  </td>
                                  <td className="px-6 py-4">
                                     <input
                                        type="number"
                                        className={`w-full bg-transparent border-none text-center focus:ring-0 text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                     />
                                  </td>
                                  <td className="px-6 py-4">
                                     <input
                                        type="number"
                                        className={`w-full bg-transparent border-none text-right focus:ring-0 text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                        value={item.price}
                                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                     />
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <span className={`text-sm font-black ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {currencySymbol}{item.total.toLocaleString()}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                     <button onClick={() => removeItem(item.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                                        <DeleteOutline sx={{ fontSize: 18 }} />
                                     </button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                      <div className="p-4 bg-gray-50/50 dark:bg-gray-800/10">
                         <button
                            onClick={addItem}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${theme === 'dark' ? 'text-blue-400 hover:bg-blue-400/10' : 'text-blue-600 hover:bg-blue-50'}`}
                         >
                            <Add sx={{ fontSize: 14 }} /> Add Line Item
                         </button>
                      </div>
                   </div>
                </div>

                {/* Financial Totals */}
                <div className="flex justify-end pt-6">
                   <div className={`w-full max-sm p-8 rounded-[2rem] border space-y-4 ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800' : 'bg-gray-50/30 border-gray-100'}`}>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                         <span>Subtotal</span>
                         <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{currencySymbol}{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                         <span>Discount Rate</span>
                         <div className="flex items-center gap-2">
                            <input
                               type="number"
                               className="w-12 bg-transparent border-none text-right p-0 focus:ring-0 font-black text-rose-500"
                               value={formData.discountRate}
                               onChange={(e) => setFormData({...formData, discountRate: Number(e.target.value)})}
                            />
                            <span>%</span>
                         </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                         <span className="text-sm font-black uppercase tracking-[0.2em] text-blue-500">Total Due</span>
                         <span className={`text-3xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {currencySymbol}{totalAmount.toLocaleString()}
                         </span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Sidebar Settings Area */}
             <div className="lg:col-span-4 space-y-8">
                {/* Configuration Card */}
                 <div className={`p-8 rounded-[2rem] border ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}>
                    <SectionHeader icon={History} title="Invoice Schedule" subtitle="Dates and Currency" theme={theme} />
                     <div className="space-y-6">
                        <InputField label="Invoice Date" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} icon={CalendarMonth} theme={theme} />
                        <InputField label="Due Date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} icon={CalendarMonth} theme={theme} />
                        
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Billing Currency</label>
                          <select
                             className={`w-full py-2.5 rounded-xl border text-sm font-semibold transition-all ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'}`}
                             value={formData.billingCurrency}
                             onChange={(e) => {
                                const newCurrency = e.target.value;
                                const oldCurrency = formData.billingCurrency;
                                
                                setFormData(prev => ({
                                  ...prev,
                                  billingCurrency: newCurrency,
                                  items: prev.items.map(item => ({
                                    ...item,
                                    price: Number(convertAmount(item.price, oldCurrency, newCurrency).toFixed(2)),
                                    total: Number(convertAmount(item.total, oldCurrency, newCurrency).toFixed(2))
                                  })),
                                  discountRate: prev.discountRate // Rate is percentage, stays same
                                }));
                              }}
                          >
                             <option>USD ($)</option>
                             <option>EUR (€)</option>
                             <option>GBP (£)</option>
                             <option>NGN (₦)</option>
                          </select>
                       </div>
                    </div>
                 </div>

                {/* Settlement Instructions */}
                <div className={`p-8 rounded-[2rem] border ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}>
                   <div className="flex items-center justify-between mb-6">
                     <SectionHeader icon={AccountBalanceWallet} title="Payment Details" subtitle="Bank Settlement Information" theme={theme} />
                     {accounts.length > 0 && (
                       <div className="relative group">
                         <select
                           className={`
                             appearance-none pl-3 pr-8 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all outline-none cursor-pointer
                             ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-emerald-400 hover:bg-gray-750' : 'bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-50'}
                           `}
                           onChange={(e) => {
                             const acc = accounts.find(a => a.id === e.target.value);
                             if (acc) handleAccountSelect(acc);
                           }}
                           defaultValue=""
                         >
                           <option value="" disabled>QUICK SETTLEMENT</option>
                           {accounts.map(acc => (
                             <option key={acc.id} value={acc.id}>{acc.bankName.toUpperCase()} - {acc.accountNumber}</option>
                           ))}
                         </select>
                         <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]">▼</div>
                       </div>
                     )}
                   </div>
                   <div className="space-y-6">
                      <InputField label="Account Name" required placeholder="Full Account Name" value={formData.accountName} onChange={(e) => setFormData({...formData, accountName: e.target.value})} icon={AccountBalanceWallet} theme={theme} />
                      <InputField label="Account Number" required placeholder="Account or IBAN" value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} icon={ReceiptLong} theme={theme} />
                      <InputField label="Bank Address" placeholder="City, Country" value={formData.bankAddress} onChange={(e) => setFormData({...formData, bankAddress: e.target.value})} icon={Business} theme={theme} />
                      <InputField label="Routing / SWIFT" placeholder="SWIFT / ACH / SORT" value={formData.achRoutingNo} onChange={(e) => setFormData({...formData, achRoutingNo: e.target.value})} icon={Payment} theme={theme} />
                   </div>
                </div>

                {/* Footer Notes */}
                <div className={`p-8 rounded-[2rem] border ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800' : 'bg-amber-50/20 border-amber-100'}`}>
                   <SectionHeader icon={Notes} title="Notes" subtitle="Additional Information" theme={theme} />
                   <textarea 
                      className={`w-full bg-transparent border-none focus:ring-0 text-sm font-medium min-h-[120px] transition-all ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                      placeholder="Enter additional terms or gratitude..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                   />
                </div>
             </div>
          </div>

          <div className="mt-20 pt-12 border-t border-gray-100 dark:border-gray-800">
             <SectionHeader icon={History} title="Draft History" subtitle="Recent changes" theme={theme} />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { user: 'You', action: 'Draft Created', time: 'Just now' },
                  { user: 'System', action: 'Saved to cloud', time: 'Just now' }
                ].map((act, i) => (
                   <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <div>
                         <p className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{act.action}</p>
                         <p className="text-[10px] font-bold text-gray-500">{act.user} • {act.time}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}