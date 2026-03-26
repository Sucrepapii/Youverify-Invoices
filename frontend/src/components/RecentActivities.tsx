import React, { useEffect, useState } from 'react';
import { 
  History, 
  CheckCircle, 
  Refresh, 
  Mail, 
  Receipt,
  MoreVert
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'status_change' | 'email_sent';
  message: string;
  timestamp: string;
  user?: string;
  invoiceId?: string;
}

const RecentActivities: React.FC = () => {
  const { theme } = useTheme();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const socket = io(API_URL);

    socket.on('invoiceActivity', (newActivity: Activity) => {
      setActivities(prev => [newActivity, ...prev].slice(0, 10));
    });

    // Mock initial activities if empty
    if (activities.length === 0) {
      setActivities([
        { id: '1', type: 'create', message: 'New invoice generated for Client #882', timestamp: new Date().toISOString(), invoiceId: 'INV-2024-001' },
        { id: '2', type: 'email_sent', message: 'Billing notice dispatched to Apple Inc.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), invoiceId: 'INV-2024-002' },
        { id: '3', type: 'status_change', message: 'Invoice #992 marked as cleared', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), invoiceId: 'INV-2024-003' },
      ]);
    }

    return () => {
      socket.disconnect();
    };
  }, [activities.length]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'create': return <Receipt sx={{ fontSize: 14 }} />;
      case 'status_change': return <CheckCircle sx={{ fontSize: 14 }} />;
      case 'email_sent': return <Mail sx={{ fontSize: 14 }} />;
      default: return <Refresh sx={{ fontSize: 14 }} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'create': return 'text-blue-500 bg-blue-500/10';
      case 'status_change': return 'text-emerald-500 bg-emerald-500/10';
      case 'email_sent': return 'text-violet-500 bg-violet-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className={`
      rounded-[2rem] p-8 transition-all duration-300 border h-full
      ${theme === 'dark' ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}
    `}>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
           <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <History sx={{ fontSize: 20 }} />
           </div>
           <div>
              <h3 className={`font-black tracking-tight text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Updates</span>
              </div>
           </div>
        </div>
        <button className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
           <MoreVert sx={{ fontSize: 20 }} />
        </button>
      </div>
      
      <div className="relative space-y-8">
        <div className={`absolute left-5 top-2 bottom-2 w-[1.5px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
        
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex gap-6 group">
            <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-white shadow-sm'} group-hover:scale-110 transition-transform`}>
               <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${getColor(activity.type)}`}>
                  {getIcon(activity.type)}
               </div>
            </div>
            
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between mb-1">
                 <p className={`text-[11px] font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {activity.message}
                 </p>
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
              </div>
              {activity.invoiceId && (
                 <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-gray-800/50 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <Receipt sx={{ fontSize: 10 }} />
                    {activity.invoiceId}
                 </div>
              )}
            </div>
          </div>
        ))}

        <button className={`w-full mt-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800' : 'border-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
           View Full activity log
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;