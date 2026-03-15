import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { dashboardService } from '../../services/dashboardService';
import { bookingService } from '../../services/bookingService';

const Overview = ({ onQuickAction }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    occupancyRate: 0,
    totalBookings: 0,
    availableRooms: 0,
    totalStaff: 0,
    pendingServices: 0,
    pendingCheckins: 0,
    pendingCheckouts: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [statsResponse, occupancyResponse, bookingsResponse] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getOccupancyStats(),
          bookingService.getBookings({ page: 1, limit: 1 })
        ]);

        const statsData = statsResponse?.data || statsResponse || {};
        const occupancyData = occupancyResponse?.data || occupancyResponse || {};

        const availableRooms = Array.isArray(statsData.roomStatus)
          ? (statsData.roomStatus.find((status) => status._id === 'available')?.count || 0)
          : 0;

        const bookings = Array.isArray(statsData.recentBookings) ? statsData.recentBookings : [];

        setRecentBookings(
          bookings.map((booking) => ({
            id: booking._id,
            guestName: booking.guest?.name || 'Guest',
            room: booking.room?.roomNumber || '-',
            status: booking.bookingStatus || 'pending',
            totalAmount: booking.totalAmount || 0
          }))
        );

        setPendingTasks([
          {
            id: 'checkin',
            title: 'Pending Check-ins',
            count: statsData.pendingCheckins || 0,
            priority: 'High'
          },
          {
            id: 'checkout',
            title: 'Pending Check-outs',
            count: statsData.pendingCheckouts || 0,
            priority: 'Medium'
          },
          {
            id: 'services',
            title: 'Pending Service Requests',
            count: statsData.pendingServices || 0,
            priority: 'Low'
          }
        ]);

        const totalBookings = bookingsResponse?.pagination?.total || 0;

        setDashboardStats({
          totalRevenue: statsData.revenueMonth || 0,
          occupancyRate: Number(occupancyData.occupancyRate || 0),
          totalBookings,
          availableRooms,
          totalStaff: statsData.totalStaff || 0,
          pendingServices: statsData.pendingServices || 0,
          pendingCheckins: statsData.pendingCheckins || 0,
          pendingCheckouts: statsData.pendingCheckouts || 0
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
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
                <h3 className="text-2xl font-bold mt-2">{dashboardStats.occupancyRate.toFixed(1)}%</h3>
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
                <h3 className="text-2xl font-bold mt-2">{dashboardStats.totalStaff}</h3>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-100">Pending Services</p>
                <h3 className="text-2xl font-bold mt-2">{dashboardStats.pendingServices}</h3>
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
            <Button className="w-full" onClick={() => onQuickAction?.('rooms')}>Add New Room</Button>
            <Button className="w-full" onClick={() => onQuickAction?.('staff')}>Manage Staff</Button>
            <Button className="w-full" onClick={() => onQuickAction?.('bookings')}>Create Booking</Button>
            <Button className="w-full" onClick={() => onQuickAction?.('inventory')}>Check Inventory</Button>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
            <div className="space-y-3">
              {recentBookings.length === 0 && (
                <p className="text-sm text-gray-500">No recent bookings found.</p>
              )}

              {recentBookings.map(booking => (
                <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{booking.guestName}</p>
                    <p className="text-sm text-gray-500">Room {booking.room} • ${booking.totalAmount}</p>
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
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-500">Database-driven count</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.count}
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
