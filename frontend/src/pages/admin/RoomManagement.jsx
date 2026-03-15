import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AddRoomForm from "../../components/forms/AddRoomForm"; // Fixed import path

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Load rooms from localStorage on component mount
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = () => {
    try {
      const savedRooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
      if (savedRooms.length === 0) {
        // Add sample data if no rooms exist
        const sampleRooms = [
          { 
            id: 1, 
            number: '101', 
            type: 'single', 
            status: 'available', 
            price: 99, 
            capacity: 1,
            size: '300',
            floor: '1',
            view: 'city',
            amenities: ['WiFi', 'TV', 'AC'],
            image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            description: 'Comfortable single room with basic amenities'
          },
          { 
            id: 2, 
            number: '102', 
            type: 'double', 
            status: 'available', 
            price: 149, 
            capacity: 2,
            size: '400',
            floor: '1',
            view: 'garden',
            amenities: ['WiFi', 'TV', 'AC', 'Minibar'],
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            description: 'Spacious double room with premium amenities'
          }
        ];
        setRooms(sampleRooms);
        localStorage.setItem('hotelRooms', JSON.stringify(sampleRooms));
      } else {
        setRooms(savedRooms);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomAdded = (newRoom) => {
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
  };

  const handleRoomUpdated = (updatedRoom) => {
    const updatedRooms = rooms.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    );
    setRooms(updatedRooms);
    localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
    setEditingRoom(null);
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      const updatedRooms = rooms.filter(room => room.id !== roomId);
      setRooms(updatedRooms);
      localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setShowAddForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'cleaning': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      single: 'Single Room',
      double: 'Double Room',
      deluxe: 'Deluxe Room',
      suite: 'Suite',
      presidential: 'Presidential Suite'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room data...</p>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Room Management</h2>
          <p className="text-gray-600 mt-1">Manage hotel rooms and their availability</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <span className="mr-2">+</span> Add Room
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Rooms</p>
            <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Available</p>
            <p className="text-2xl font-bold text-gray-900">
              {rooms.filter(room => room.status === 'available').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-red-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Occupied</p>
            <p className="text-2xl font-bold text-gray-900">
              {rooms.filter(room => room.status === 'occupied').length}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-l-4 border-l-yellow-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Maintenance</p>
            <p className="text-2xl font-bold text-gray-900">
              {rooms.filter(room => room.status === 'maintenance').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Rooms Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amenities</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTypeLabel(room.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${room.price}/night</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEditRoom(room)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Room Form Modal */}
      {showAddForm && (
        <AddRoomForm
          onClose={() => {
            setShowAddForm(false);
            setEditingRoom(null);
          }}
          onRoomAdded={editingRoom ? handleRoomUpdated : handleRoomAdded}
          editingRoom={editingRoom}
        />
      )}
    </motion.div>
  );
};

export default RoomManagement;
