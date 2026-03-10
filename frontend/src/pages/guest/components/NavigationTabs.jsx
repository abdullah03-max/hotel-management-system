import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';

const NavigationTabs = ({ activeTab, setActiveTab, unreadNotifications, children }) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'bookings', name: 'My Bookings', icon: '📅' },
    { id: 'services', name: 'Services', icon: '🛎️' }, // Added Services tab
    { id: 'notifications', name: 'Notifications', icon: '🔔', badge: unreadNotifications },
    { id: 'rooms', name: 'Available Rooms', icon: '🏨' },
    { id: 'profile', name: 'Profile', icon: '👤' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {children}
        </div>
      </Card>
    </motion.div>
  );
};

export default NavigationTabs;