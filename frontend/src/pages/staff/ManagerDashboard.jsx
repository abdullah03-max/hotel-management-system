import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StaffLayout from '../../components/layout/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ManagerDashboard = () => {
  const [hotelStats, setHotelStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Mock data
    setHotelStats({
      occupancy: '78%',
      revenue: '$12,450',
      checkIns: 15,
      checkOuts: 8,
      staffOnDuty: 12,
      maintenanceIssues: 3
    });

    setRecentActivities([
      { id: 1, action: 'New Booking', details: 'Room 301 - 3 nights', time: '10:30 AM', user: 'Reception' },
      { id: 2, action: 'Check-in', details: 'Room 205 - John Smith', time: '11:15 AM', user: 'Reception' },
      { id: 3, action: 'Maintenance Request', details: 'AC Repair - Room 101', time: '11:45 AM', user: 'Guest' },
      { id: 4, action: 'Staff Added', details: 'New Housekeeping Staff', time: '12:30 PM', user: 'Admin' }
    ]);
  }, []);

  return (
    <StaffLayout title="Manager Dashboard" role="manager">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👨‍💼 Manager Dashboard
            </h1>
            <p className="text-gray-600">
              Overview of hotel operations and performance metrics
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100">Occupancy Rate</p>
                  <h3 className="text-2xl font-bold mt-2">{hotelStats.occupancy}</h3>
                </div>
                <div className="text-2xl">🏨</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100">Today's Revenue</p>
                  <h3 className="text-2xl font-bold mt-2">{hotelStats.revenue}</h3>
                </div>
                <div className="text-2xl">💰</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100">Staff on Duty</p>
                  <h3 className="text-2xl font-bold mt-2">{hotelStats.staffOnDuty}</h3>
                </div>
                <div className="text-2xl">👥</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-yellow-100">Today's Check-ins</p>
                  <h3 className="text-2xl font-bold mt-2">{hotelStats.checkIns}</h3>
                </div>
                <div className="text-2xl">📥</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-100">Maintenance Issues</p>
                  <h3 className="text-2xl font-bold mt-2">{hotelStats.maintenanceIssues}</h3>
                </div>
                <div className="text-2xl">🔧</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-indigo-100">Today's Check-outs</p>
                  <h3 className="text-2xl font-bold mt-2">{hotelStats.checkOuts}</h3>
                </div>
                <div className="text-2xl">📤</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  View Reports
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Staff Schedule
                </Button>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Inventory
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Financials
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex justify-between items-start p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.details}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time} • By {activity.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
};

export default ManagerDashboard;
