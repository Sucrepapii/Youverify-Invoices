import React from 'react';
import {
  ArrowForward as ArrowForwardIcon,
  Face as FaceIcon
} from '@mui/icons-material';

interface Activity {
  id: number;
  type: string;
  time: string;
  invoiceNumber: string;
  clientName: string;
  avatarColor: string;
  iconColor: string;
  bubbleColor: string;
}

const RecentActivities: React.FC = () => {
  const activities: Activity[] = [
    {
      id: 1,
      type: 'Payment Pending',
      time: 'Yesterday, 12:05 PM',
      invoiceNumber: '00239434',
      clientName: 'Olaniyi Ojo Adewale',
      avatarColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      bubbleColor: 'bg-yellow-400'
    },
    {
      id: 2,
      type: 'Invoice creation',
      time: 'Yesterday, 12:05 PM',
      invoiceNumber: '00239434',
      clientName: 'Olaniyi Ojo Adewale',
      avatarColor: 'bg-red-100',
      iconColor: 'text-red-600',
      bubbleColor: 'bg-red-400'
    },
    {
      id: 3,
      type: 'Invoice creation',
      time: 'Yesterday, 11:30 AM',
      invoiceNumber: '00239435',
      clientName: 'Chinwe Okonkwo',
      avatarColor: 'bg-red-100',
      iconColor: 'text-red-600',
      bubbleColor: 'bg-red-400'
    },
    {
      id: 4,
      type: 'Payment received',
      time: 'Yesterday, 10:15 AM',
      invoiceNumber: '00239433',
      clientName: 'Mohammed Ali',
      avatarColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      bubbleColor: 'bg-blue-400'
    },
    {
      id: 5,
      type: 'Invoice creation',
      time: '2 days ago, 03:45 PM',
      invoiceNumber: '00239432',
      clientName: 'Sarah Johnson',
      avatarColor: 'bg-red-100',
      iconColor: 'text-red-600',
      bubbleColor: 'bg-red-400'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Recent Activities
        </h2>
        <button
          onClick={() => { }}
          className="bg-white hover:bg-blue-300 border border-blue-400 text-black px-4 py-2 
              rounded-full font-medium flex items-center gap-2 transition-colors text-sm"
        >
          VIEW ALL
        </button>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
          >
            {/* Top row: Type and Time */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">

                <div className={`${activity.avatarColor} p-2 rounded-full flex items-center justify-center mt-1`}>
                  <FaceIcon
                    className={activity.iconColor}
                    style={{ width: 20, height: 20 }}
                  />
                </div>
                <h4 className="font-medium text-gray-900">
                  {activity.type}
                </h4>
              </div>
              <span className="text-sm text-gray-500">
                {activity.time}
              </span>
            </div>

            {/* Bottom row: Avatar and Chat  */}
            <div className="flex items-start gap-3">

              <div className={`${activity.bubbleColor} rounded-2xl rounded-tl-none px-4 py-3 max-w-xs`}>
                <p className="text-gray-800">
                  Created invoice <strong>{activity.invoiceNumber}/{activity.clientName}</strong>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW ALL link at the bottom */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mx-auto">
          VIEW ALL
          <ArrowForwardIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;