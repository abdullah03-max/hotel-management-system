import api from './api.js';

export const roomService = {
  // Get all rooms with filters
  getRooms: async (params = {}) => {
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  // Get available rooms
  getAvailableRooms: async (params = {}) => {
    const response = await api.get('/rooms/available', { params });
    return response.data;
  },

  // Get room by ID
  getRoomById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // Create room (admin only)
  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  // Update room (admin only)
  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  // Delete room (admin only)
  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  // Get room status statistics
  getRoomStats: async () => {
    const response = await api.get('/rooms/stats/status');
    return response.data;
  },
};