import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';

const StatsGrid = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100">Total Bookings</p>
              <h3 className="text-2xl font-bold mt-2">{stats.totalBookings}</h3>
            </div>
            <div className="text-2xl">📅</div>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100">Confirmed</p>
              <h3 className="text-2xl font-bold mt-2">{stats.confirmedBookings}</h3>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-yellow-100">Pending</p>
              <h3 className="text-2xl font-bold mt-2">{stats.pendingBookings}</h3>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100">Notifications</p>
              <h3 className="text-2xl font-bold mt-2">{stats.unreadNotifications}</h3>
            </div>
            <div className="text-2xl">🔔</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatsGrid;