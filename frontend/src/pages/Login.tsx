import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { Mail, Lock, Loader2, ArrowRight, Zap } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = isLoginMode ? API_ENDPOINTS.AUTH.LOGIN : API_ENDPOINTS.AUTH.SIGNUP;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLoginMode ? { email, password } : { email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isLoginMode) {
        login(data.token);
        toast.success('Welcome to the premium experience', { theme: theme === 'dark' ? 'dark' : 'light' });
        navigate('/');
      } else {
        toast.success('Registration successful! Please sign in.', { theme: theme === 'dark' ? 'dark' : 'light' });
        setIsLoginMode(true);
      }
    } catch (error: any) {
      toast.error(error.message, { theme: theme === 'dark' ? 'dark' : 'light' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`
      min-h-screen flex items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden
      ${theme === 'dark' ? 'bg-[#0f111a]' : 'bg-gray-50'}
    `}>
      {/* Background Ornaments */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-500 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-500 ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'}`} />

      <div className="max-w-md w-full relative z-10">
        <div className={`
          p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-300
          ${theme === 'dark' ? 'bg-gray-800/20 border-gray-700/50 shadow-2xl' : 'bg-white/80 border-gray-200/50 shadow-xl'}
        `}>
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-6 group hover:scale-110 transition-transform">
              <Zap className="text-white fill-white" size={32} />
            </div>
            <h1 className={`text-3xl font-black tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest px-4">
              Premium Invoicing & Transaction Management
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginMode && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${theme === 'dark' ? 'text-gray-600 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`
                      w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all
                      ${theme === 'dark' 
                        ? 'bg-gray-800/40 border-gray-700 text-white placeholder-gray-600 focus:bg-gray-700/50' 
                        : 'bg-gray-50/50 border-gray-100 text-gray-900 placeholder-gray-400 focus:bg-white focus:shadow-lg'
                      }
                      focus:border-blue-500 outline-none focus:ring-4 focus:ring-blue-500/10
                    `}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${theme === 'dark' ? 'text-gray-600 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`
                    w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all
                    ${theme === 'dark' 
                      ? 'bg-gray-800/40 border-gray-700 text-white placeholder-gray-600 focus:bg-gray-700/50' 
                      : 'bg-gray-50/50 border-gray-100 text-gray-900 placeholder-gray-400 focus:bg-white focus:shadow-lg'
                    }
                    focus:border-blue-500 outline-none focus:ring-4 focus:ring-blue-500/10
                  `}
                  placeholder="yourname@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${theme === 'dark' ? 'text-gray-600 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`
                    w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all
                    ${theme === 'dark' 
                      ? 'bg-gray-800/40 border-gray-700 text-white placeholder-gray-600 focus:bg-gray-700/50' 
                      : 'bg-gray-50/50 border-gray-100 text-gray-900 placeholder-gray-400 focus:bg-white focus:shadow-lg'
                    }
                    focus:border-blue-500 outline-none focus:ring-4 focus:ring-blue-500/10
                  `}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group mt-8 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-100 group-hover:scale-105 transition-transform duration-300" />
              <div className="relative py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-white">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your login details to access the admin dashboard
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-blue-600'}`}
            >
              {isLoginMode ? "Don't have an account? Create Account" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-10 flex items-center justify-center gap-6 opacity-30 select-none grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-500">
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <Zap size={14} /> <span>Powered by YouVerify</span>
           </div>
        </div>
      </div>
    </div>
  );
}
