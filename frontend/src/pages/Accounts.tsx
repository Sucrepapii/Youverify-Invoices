import React, { useState, useEffect } from 'react';
import { 
  AccountBalance, 
  Add, 
  Delete, 
  AccountBalanceWallet,
  Business,
  Numbers,
  Person
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'react-toastify';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';

interface Account {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankAddress?: string;
  achRoutingNo?: string;
}

export default function Accounts() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    bankAddress: '',
    achRoutingNo: ''
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.ACCOUNTS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.ACCOUNTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success('Account added successfully');
        setIsModalOpen(false);
        setFormData({ bankName: '', accountName: '', accountNumber: '', bankAddress: '', achRoutingNo: '' });
        fetchAccounts();
      }
    } catch (error) {
      toast.error('Failed to add account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      const response = await fetch(`${API_ENDPOINTS.ACCOUNTS}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        toast.success('Account deleted');
        fetchAccounts();
      }
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0f111a]' : 'bg-gray-50'}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-6 overflow-auto h-[calc(100vh-80px)]">
          <div className="max-w-6xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  <AccountBalance sx={{ fontSize: 28 }} />
                </div>
                <div>
                  <h1 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Bank Accounts</h1>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Manage your settlement destinations</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Add sx={{ fontSize: 18 }} />
                Add New Account
              </button>
            </div>

            {/* Content list */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading records...</p>
              </div>
            ) : accounts.length === 0 ? (
              <div className={`text-center py-20 rounded-[3rem] border border-dashed ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                <AccountBalanceWallet className="text-gray-300 mb-4" sx={{ fontSize: 60 }} />
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No accounts found</h3>
                <p className="text-sm text-gray-400 mb-8 px-4">Add your first bank account to start receiving payments.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className={`px-8 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'}`}
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(acc => (
                  <div key={acc.id} className={`group relative p-6 rounded-[2rem] border transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800/10 border-gray-800 hover:bg-gray-800/30' : 'bg-white border-gray-100 hover:shadow-xl hover:shadow-gray-100/50'}`}>
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        <AccountBalanceWallet />
                      </div>
                      <button 
                        onClick={() => handleDelete(acc.id)}
                        className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all ${theme === 'dark' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                      >
                        <Delete sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                    
                    <h3 className={`text-lg font-black tracking-tight mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{acc.accountName}</h3>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">{acc.bankName}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <Numbers sx={{ fontSize: 16 }} className="text-gray-400" />
                        <span className={`text-[13px] font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{acc.accountNumber}</span>
                      </div>
                      {acc.bankAddress && (
                        <div className="flex items-center gap-3">
                          <Business sx={{ fontSize: 16 }} className="text-gray-400" />
                          <span className={`text-[11px] font-bold text-gray-500 truncate`}>{acc.bankAddress}</span>
                        </div>
                      )}
                      {acc.achRoutingNo && (
                        <div className="flex flex-col pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Routing / SWIFT</span>
                          <span className={`text-[11px] font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{acc.achRoutingNo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className={`relative w-full max-w-md p-8 rounded-[2.5rem] border shadow-2xl animate-in fade-in zoom-in duration-300 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-2xl font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>New Bank Account</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Bank Name</label>
                <input 
                  required
                  type="text" 
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-emerald-500'}`}
                  placeholder="e.g. Chase Bank, Zenith Bank"
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Account Name</label>
                <div className="relative">
                  <Person className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 18 }} />
                  <input 
                    required
                    type="text" 
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-emerald-500'}`}
                    placeholder="Full Account Holder Name"
                    value={formData.accountName}
                    onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Account Number</label>
                <div className="relative">
                  <Numbers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 18 }} />
                  <input 
                    required
                    type="text" 
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-emerald-500'}`}
                    placeholder="e.g. 0123456789"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Routing / SWIFT</label>
                  <input 
                    type="text" 
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-emerald-500'}`}
                    placeholder="Optional"
                    value={formData.achRoutingNo}
                    onChange={(e) => setFormData({...formData, achRoutingNo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Bank Address</label>
                  <input 
                    type="text" 
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-emerald-500'}`}
                    placeholder="Optional"
                    value={formData.bankAddress}
                    onChange={(e) => setFormData({...formData, bankAddress: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
