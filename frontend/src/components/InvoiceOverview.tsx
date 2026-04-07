import React, { useEffect, useState } from 'react';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp,
  Bolt,
  AccountBalance
} from '@mui/icons-material';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
const EXCHANGE_RATES: Record<string, number> = {
  'USD ($)': 1.0,
  'EUR (€)': 0.92,
  'GBP (£)': 0.79,
  'NGN (₦)': 1580.0,
};

const convertToUSD = (amount: number, currency: string) => {
  if (!currency || currency === '$' || currency === 'USD ($)') return amount;
  
  // Try to find rate by symbol or full string
  const rate = EXCHANGE_RATES[currency] || 
               Object.entries(EXCHANGE_RATES).find(([k]) => k.includes(currency))?.[1] || 
               1.0;
               
  return amount / rate;
};
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Mock data for sparklines and main chart
const sparklineData = [
  { value: 400 }, { value: 300 }, { value: 600 }, { value: 800 }, { value: 500 }, { value: 900 }, { value: 1100 }
];

const cashFlowData = [
  { name: 'Mon', revenue: 4000, outstanding: 2400 },
  { name: 'Tue', revenue: 3000, outstanding: 1398 },
  { name: 'Wed', revenue: 2000, outstanding: 9800 },
  { name: 'Thu', revenue: 2780, outstanding: 3908 },
  { name: 'Fri', revenue: 1890, outstanding: 4800 },
  { name: 'Sat', revenue: 2390, outstanding: 3800 },
  { name: 'Sun', revenue: 3490, outstanding: 4300 },
];

const MiniSparkline = ({ color }: { color: string }) => (
  <div className="h-8 w-16">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={sparklineData}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const InvoiceOverview: React.FC = () => {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalPaidCount: 0,
    totalPaidAmount: 0,
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
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const paid = data.filter((inv: { status: string }) => inv.status === 'paid');
            const overdue = data.filter((inv: { status: string }) => inv.status === 'overdue');
            const draft = data.filter((inv: { status: string }) => inv.status === 'draft');
            const unpaid = data.filter((inv: { status: string }) => inv.status === 'pending payment' || inv.status === 'unpaid');
  
            setStats({
              totalPaidCount: paid.length,
              totalPaidAmount: paid.reduce((sum: number, inv: any) => sum + convertToUSD(Number(inv.amount), inv.billingCurrency || inv.currency || '$'), 0),
              overdueCount: overdue.length,
              overdueAmount: overdue.reduce((sum: number, inv: any) => sum + convertToUSD(Number(inv.amount), inv.billingCurrency || inv.currency || '$'), 0),
              draftCount: draft.length,
              draftAmount: draft.reduce((sum: number, inv: any) => sum + convertToUSD(Number(inv.amount), inv.billingCurrency || inv.currency || '$'), 0),
              unpaidCount: unpaid.length,
              unpaidAmount: unpaid.reduce((sum: number, inv: any) => sum + convertToUSD(Number(inv.amount), inv.billingCurrency || inv.currency || '$'), 0)
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    if (token) fetchStats();
  }, [token]);

  const StatCard = ({ title, amount, count, icon: Icon, color, trend }: { title: string, amount: number, count: number, icon: any, color: string, trend?: number }) => (
    <div className={`p-5 rounded-3xl border transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800/50 hover:bg-gray-800/30' : 'bg-white border-gray-100 hover:shadow-xl hover:shadow-gray-100'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : color === 'rose' ? 'bg-rose-500/10 text-rose-500' : color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-violet-500/10 text-violet-500'}`}>
          <Icon sx={{ fontSize: 20 }} />
        </div>
        <MiniSparkline color={color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : color === 'amber' ? '#f59e0b' : '#8b5cf6'} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</p>
          {trend && (
            <span className={`text-[9px] font-black ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <h3 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          ${amount.toLocaleString()}
        </h3>
        <p className="text-[10px] font-bold text-gray-400 capitalize">{count} Transactions</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Bento Row 1: Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" amount={stats.totalPaidAmount} count={stats.totalPaidCount} icon={CheckCircleIcon} color="emerald" trend={12} />
        <StatCard title="Outstanding" amount={stats.unpaidAmount} count={stats.unpaidCount} icon={AttachMoneyIcon} color="violet" trend={8} />
        <StatCard title="Overdue" amount={stats.overdueAmount} count={stats.overdueCount} icon={WarningIcon} color="rose" trend={2} />
        <StatCard title="Drafts" amount={stats.draftAmount} count={stats.draftCount} icon={EditIcon} color="amber" />
      </div>

      {/* Bento Row 2: Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cash Flow Analysis Card */}
        <div className={`lg:col-span-8 p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800/50' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cash Flow Analysis</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Revenue vs. Outstanding Over Time</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              Last 7 Days
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1f2937' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 800 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="outstanding" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Premium Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <button 
             onClick={() => setShowInvoiceForm(true)}
             className="flex-1 p-8 rounded-[2.5rem] bg-blue-600 hover:bg-blue-700 transition-all group overflow-hidden relative"
           >
              <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 text-left h-full flex flex-col justify-between">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <Bolt className="text-white" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white leading-tight mb-2">Create New<br />Invoice</h3>
                    <p className="text-xs font-bold text-blue-100/70 uppercase tracking-widest">Instant Transaction Ledger</p>
                 </div>
              </div>
           </button>

           <div className={`flex-1 p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-gray-800/10 border-gray-800/50' : 'bg-gray-50 border-gray-100'} flex flex-col justify-between`}>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                    <TrendingUp sx={{ fontSize: 20 }} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Assets</p>
                    <h4 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>$124.5k</h4>
                 </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                 <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                    <AccountBalance sx={{ fontSize: 14, text: '#94a3b8' }} />
                 </div>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Synchronized with 3 accounts</span>
              </div>
           </div>
        </div>
      </div>

      {showInvoiceForm && <InvoiceForm onClose={() => setShowInvoiceForm(false)} />}
    </div>
  );
};

export default InvoiceOverview;