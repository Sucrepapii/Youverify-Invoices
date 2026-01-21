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
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <ToastContainer position="top-right" autoClose={3000} />
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
                <Route path="/recent-invoices" element={
                <RequireAuth>
                    <RecentInvoicesPage />
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
    </AuthProvider>
  )
}

// Dashboard Page
function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-6 overflow-auto h-[calc(100vh-80px)]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">All Recent Invoices</h1>
            <p className="text-gray-600">Full list of recent invoices</p>
          </div>
          {/* Use the RecentInvoices component here */}
          <RecentInvoices />
        </main>
      </div>
    </div>
  )
}

export default App