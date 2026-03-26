// src/App.jsx
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DashboardHeader from './components/DashboardHeader'
import InvoiceOverview from './components/InvoiceOverview'
import RecentInvoices from './components/RecentInvoices'
import RecentActivities from './components/RecentActivities'
import Sidebar from './components/Sidebar'
import SettingsPage from './components/pages/Settings'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <BrowserRouter>
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <ToastContainer position="top-right" autoClose={3000} theme={theme} />
        <SocketProvider>
          <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <RequireAuth>
                    <DashboardPage />
                  </RequireAuth>
                } />
                <Route path="/dashboard" element={
                <RequireAuth>
                    <DashboardPage />
                </RequireAuth>
                } />
                <Route path="/overview" element={
                <RequireAuth>
                    <DashboardPage />
                </RequireAuth>
                } />
                <Route path="/accounts" element={
                <RequireAuth>
                    <PlaceholderPage title="Accounts" description="Manage your bank accounts and balances" icon="AccountBalance" />
                </RequireAuth>
                } />
                <Route path="/recent-invoices" element={
                <RequireAuth>
                    <RecentInvoicesPage />
                </RequireAuth>
                } />
                <Route path="/beneficiaries" element={
                <RequireAuth>
                    <PlaceholderPage title="Beneficiaries" description="Manage your clients and payment recipients" icon="People" />
                </RequireAuth>
                } />
                <Route path="/support" element={
                <RequireAuth>
                    <PlaceholderPage title="Support" description="Get help with your account or invoices" icon="HelpOutline" />
                </RequireAuth>
                } />
                <Route path="/settings" element={
                <RequireAuth>
                    <SettingsPage />
                </RequireAuth>
                } />
            </Routes>
          </SocketProvider>
        </div>
    </BrowserRouter>
  )
}

// Premium Placeholder Page
function PlaceholderPage({ title, description }: { title: string, description: string, icon: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0f111a]' : 'bg-gray-50'}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-6 flex items-center justify-center h-[calc(100vh-80px)]">
           <div className={`
             max-w-lg w-full p-12 rounded-[3rem] border backdrop-blur-xl text-center transition-all duration-500
             ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}
           `}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-[2rem] shadow-lg shadow-blue-500/30 mb-8 animate-pulse text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <h2 className={`text-3xl font-black tracking-tight mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">{description}</p>
              
              <div className={`inline-block px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                 Deploying to Production...
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

// Dashboard Page
function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0f111a]' : 'bg-gray-50'}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-6 overflow-auto h-[calc(100vh-80px)]">
          <div className="mb-6">
            <InvoiceOverview />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentInvoices />
            </div>

            <div className="space-y-6">
              <RecentActivities />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function RecentInvoicesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0f111a]' : 'bg-gray-50'}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-6 overflow-auto h-[calc(100vh-80px)]">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <RecentInvoicesIcon />
                </div>
                <h1 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Invoice History</h1>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed">View and manage your past invoices and billing records</p>
            </div>
          </div>
          <div className="max-w-6xl mx-auto">
            <RecentInvoices />
          </div>
        </main>
      </div>
    </div>
  )
}

// Simple Helper for the icon in the page header
function RecentInvoicesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>
  );
}

export default App