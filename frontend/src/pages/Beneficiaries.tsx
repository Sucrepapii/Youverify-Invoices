import React, { useState, useEffect } from 'react';
import { 
  People, 
  Add, 
  Search, 
  Delete, 
  Email, 
  Phone, 
  AccountBalance 
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'react-toastify';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';

interface Beneficiary {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
}

export default function Beneficiaries() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    accountName: '',
    accountNumber: '',
    bankName: ''
  });

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.BENEFICIARIES, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBeneficiaries(data);
      }
    } catch (error) {
      toast.error('Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.BENEFICIARIES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success('Beneficiary added successfully');
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', accountName: '', accountNumber: '', bankName: '' });
        fetchBeneficiaries();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add beneficiary');
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this beneficiary?')) return;
    try {
      const response = await fetch(`${API_ENDPOINTS.BENEFICIARIES}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        toast.success('Beneficiary deleted');
        fetchBeneficiaries();
      }
    } catch (error) {
      toast.error('Failed to delete beneficiary');
    }
  };

  const filtered = beneficiaries.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <People sx={{ fontSize: 28 }} />
                </div>
                <div>
                  <h1 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Beneficiaries</h1>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Manage your clients and payment recipients</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Add sx={{ fontSize: 18 }} />
                Add New Beneficiary
              </button>
            </div>

            {/* Search and Filters */}
            <div className={`mb-8 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
                <input 
                  type="text" 
                  placeholder="SEARCH BY NAME, EMAIL OR PHONE..."
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest outline-none transition-all ${theme === 'dark' ? 'bg-gray-900/40 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50/50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Content list */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading records...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className={`text-center py-20 rounded-[3rem] border border-dashed ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                <People className="text-gray-300 mb-4" sx={{ fontSize: 60 }} />
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No beneficiaries found</h3>
                <p className="text-sm text-gray-400 mb-8 px-4">Create your first beneficiary to speed up your invoicing process.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className={`px-8 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-blue-100 text-blue-600 hover:bg-blue-50'}`}
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(b => (
                  <div key={b.id} className={`group relative p-6 rounded-[2rem] border transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800/10 border-gray-800 hover:bg-gray-800/30' : 'bg-white border-gray-100 hover:shadow-xl hover:shadow-gray-100/50'}`}>
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <button 
                        onClick={() => handleDelete(b.id)}
                        className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all ${theme === 'dark' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                      >
                        <Delete sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                    
                    <h3 className={`text-xl font-black tracking-tight mb-4 break-words ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {b.name || 'Unnamed Beneficiary'}
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 min-h-[1.5em]">
                        <Email sx={{ fontSize: 18 }} className="text-gray-400 shrink-0" />
                        <span className={`text-[13px] font-bold truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{b.email}</span>
                      </div>
                      <div className="flex items-center gap-3 min-h-[1.5em]">
                        <Phone sx={{ fontSize: 18 }} className="text-gray-400 shrink-0" />
                        <span className={`text-[13px] font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{b.phone}</span>
                      </div>
                      {b.accountNumber && (
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <AccountBalance sx={{ fontSize: 16 }} className="text-blue-500/50" />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{b.bankName || 'BANK ACCOUNT'}</span>
                            <span className={`text-[11px] font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{b.accountNumber}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button className={`w-full py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                      Generate Invoice
                    </button>
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
            <h2 className={`text-2xl font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>New Beneficiary</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500'}`}
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email</label>
                  <input 
                    required
                    type="email" 
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500'}`}
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phone</label>
                  <input 
                    required
                    type="tel" 
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500'}`}
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Payment Details (Optional)</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Bank Name</label>
                    <input 
                      type="text" 
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500'}`}
                      placeholder="e.g. Zenith Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Account Name</label>
                    <input 
                      type="text" 
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500'}`}
                      placeholder="e.g. John Doe & Sons"
                      value={formData.accountName}
                      onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Account Number</label>
                    <input 
                      type="text" 
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500'}`}
                      placeholder="e.g. 0123456789"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    />
                  </div>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  Save Beneficiary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
