import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Overview = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 125430,
    occupancyRate: 78,
    totalBookings: 0,
    availableRooms: 0,
    staffOnline: 0,
    maintenanceRequests: 0,
    lowStockItems: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setRecentBookings([
        { id: 1, guestName: 'John Doe', room: '101', checkIn: '2024-01-20', checkOut: '2024-01-25', status: 'confirmed', totalAmount: 495 },
        { id: 2, guestName: 'Jane Smith', room: '102', checkIn: '2024-01-22', checkOut: '2024-01-24', status: 'pending', totalAmount: 298 },
        { id: 3, guestName: 'Mike Johnson', room: '202', checkIn: '2024-01-26', checkOut: '2024-01-28', status: 'confirmed', totalAmount: 598 }
      ]);

      setPendingTasks([
        { id: 1, room: '201', issue: 'AC Not Working', priority: 'High', status: 'pending' },
        { id: 2, room: '105', issue: 'Leaky Faucet', priority: 'Medium', status: 'in-progress' },
        { id: 3, room: '308', issue: 'TV Remote', priority: 'Low', status: 'pending' }
      ]);

      setDashboardStats(prev => ({
        ...prev,
        totalBookings: 3,
        availableRooms: 2,
        staffOnline: 8,
        maintenanceRequests: 3,
        lowStockItems: 2
      }));

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-2">${dashboardStats.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100">Occupancy Rate</p>
                <h3 className="text-2xl font-bold mt-2">{dashboardStats.occupancyRate}%</h3>
              </div>
              <div className="text-2xl">🏨</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100">Total Bookings</p>
                <h3 className="text-2xl font-bold mt-2">{dashboardStats.totalBookings}</h3>
              </div>
              <div className="text-2xl">📅</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-100">Available Rooms</p>
                <h3 className="text-2xl font-bold mt-2">{dashboardStats.availableRooms}</h3>
              </div>
              <div className="text-2xl">🚪</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-100">Staff Online</p>
                <h3 className="text-2xl font-bold mt-2">{dashboardStats.staffOnline}</h3>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-100">Low Stock Items</p>
                <h3 className="text-2xl font-bold mt-2">{dashboardStats.lowStockItems}</h3>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="w-full">Add New Room</Button>
            <Button className="w-full">Manage Staff</Button>
            <Button className="w-full">Create Booking</Button>
            <Button className="w-full">Check Inventory</Button>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
            <div className="space-y-3">
              {recentBookings.map(booking => (
                <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{booking.guestName}</p>
                    <p className="text-sm text-gray-500">Room {booking.room}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pending Tasks</h3>
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Room {task.room}</p>
                    <p className="text-sm text-gray-500">{task.issue}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Overview;