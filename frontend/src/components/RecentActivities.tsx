import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { CheckCircle, AttachMoney } from '@mui/icons-material';

interface Activity {
  id: string;
  user: string;
  time: string;
  action: string;
  status: 'completed' | 'payment';
}

const RecentActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      user: 'System',
      time: 'Initial',
      action: 'Welcome to YouVerify Invoice!',
      status: 'completed'
    }
  ]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleInvoiceCreated = (data: { invoice: { clientName?: string } }) => {
      const newActivity: Activity = {
        id: Date.now().toString(),
        user: 'You',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: `Created Invoice for ${data.invoice.clientName || 'Unknown'}`,
        status: 'completed'
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    };

    socket.on('invoice:created', handleInvoiceCreated);

    return () => {
      socket.off('invoice:created', handleInvoiceCreated);
    };
  }, [socket]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-800 text-xl">Recent Activity</h3>
      </div>
      
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>

        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="relative flex items-start space-x-3">
              <div className="flex-shrink-0 relative z-10">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2
                  ${activity.status === 'payment'
                    ? 'bg-green-100 border-green-500'
                    : 'bg-blue-100 border-blue-500'
                  }
                `}>
                  {activity.status === 'payment' ? (
                    <AttachMoney className="text-green-600 w-4 h-4" />
                  ) : (
                    <CheckCircle className="text-blue-600 w-4 h-4" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className={`
                  p-3 rounded-lg border
                  ${activity.status === 'payment'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                  }
                `}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-800">{activity.user}</span>
                      </div>
                      <p className="text-gray-700 text-sm mt-1 leading-tight">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;