import api from './api.js';

export const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Dashboard stats API error:', error);
      // Return mock data as fallback
      return {
        revenueMonth: 125000,
        totalRooms: 50,
        totalGuests: 342,
        totalStaff: 15,
        pendingCheckins: 8,
        pendingCheckouts: 12,
        pendingServices: 5,
        revenueToday: 8500,
        roomStatus: [
          { _id: 'available', count: 30 },
          { _id: 'occupied', count: 15 },
          { _id: 'maintenance', count: 3 },
          { _id: 'cleaning', count: 2 }
        ],
        recentBookings: [
          {
            _id: '1',
            guest: { name: 'John Doe' },
            room: { roomNumber: '101' },
            bookingStatus: 'checked-in',
            totalAmount: 450,
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            guest: { name: 'Jane Smith' },
            room: { roomNumber: '205' },
            bookingStatus: 'confirmed',
            totalAmount: 320,
            createdAt: new Date().toISOString()
          }
        ]
      };
    }
  },

  // Get revenue chart data
  getRevenueChart: async (period = 'month') => {
    try {
      const response = await api.get('/dashboard/revenue-chart', { 
        params: { period } 
      });
      return response.data;
    } catch (error) {
      console.error('Revenue chart API error:', error);
      // Return mock data as fallback
      return [
        { _id: { month: 1 }, total: 120000 },
        { _id: { month: 2 }, total: 135000 },
        { _id: { month: 3 }, total: 110000 },
        { _id: { month: 4 }, total: 125000 },
        { _id: { month: 5 }, total: 140000 },
        { _id: { month: 6 }, total: 130000 }
      ];
    }
  },

  // Get occupancy stats
  getOccupancyStats: async () => {
    try {
      const response = await api.get('/dashboard/occupancy');
      return response.data;
    } catch (error) {
      console.error('Occupancy stats API error:', error);
      // Return mock data as fallback
      return {
        occupancyRate: 75.5,
        roomTypeOccupancy: [
          { roomType: 'Single', occupied: 8, total: 15 },
          { roomType: 'Double', occupied: 12, total: 20 },
          { roomType: 'Deluxe', occupied: 5, total: 10 },
          { roomType: 'Suite', occupied: 3, total: 5 }
        ]
      };
    }
  },

  // Additional function for backward compatibility
  getRevenueChartData: async () => {
    try {
      const response = await api.get('/dashboard/revenue-chart');
      return response.data;
    } catch (error) {
      console.error('Revenue chart data API error:', error);
      return [
        { _id: { month: 1 }, total: 120000 },
        { _id: { month: 2 }, total: 135000 },
        { _id: { month: 3 }, total: 110000 },
        { _id: { month: 4 }, total: 125000 },
        { _id: { month: 5 }, total: 140000 },
        { _id: { month: 6 }, total: 130000 }
      ];
    }
  }
};