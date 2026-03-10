import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReceptionistLayout from '../../components/layouts/ReceptionistLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [todaysCheckIns, setTodaysCheckIns] = useState([]);
  const [todaysCheckOuts, setTodaysCheckOuts] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setTodaysCheckIns([
        { id: 1, guestName: 'John Smith', room: '101', checkIn: '14:00', status: 'pending' },
        { id: 2, guestName: 'Sarah Johnson', room: '201', checkIn: '16:00', status: 'confirmed' },
        { id: 3, guestName: 'Mike Davis', room: '301', checkIn: '18:00', status: 'pending' }
      ]);

      setTodaysCheckOuts([
        { id: 1, guestName: 'Emily Wilson', room: '102', checkOut: '11:00', status: 'pending' },
        { id: 2, guestName: 'Robert Brown', room: '202', checkOut: '12:00', status: 'confirmed' }
      ]);

      setAvailableRooms([
        { number: '101', type: 'Single', price: 99 },
        { number: '103', type: 'Double', price: 149 },
        { number: '201', type: 'Deluxe', price: 199 },
        { number: '301', type: 'Suite', price: 299 }
      ]);

      setOccupiedRooms([
        { number: '102', guestName: 'Emily Wilson', checkOut: '2024-01-20' },
        { number: '104', guestName: 'David Miller', checkOut: '2024-01-21' },
        { number: '202', guestName: 'Robert Brown', checkOut: '2024-01-19' },
        { number: '302', guestName: 'Lisa Taylor', checkOut: '2024-01-22' }
      ]);
    }, 1000);
  }, []);

  const stats = {
    todaysCheckIns: todaysCheckIns.length,
    todaysCheckOuts: todaysCheckOuts.length,
    occupiedRooms: occupiedRooms.length,
    availableRooms: availableRooms.length
  };

  const handleCheckIn = (bookingId) => {
    alert(`Checking in booking ${bookingId}`);
    // Implement check-in logic here
  };

  const handleCheckOut = (bookingId) => {
    alert(`Checking out booking ${bookingId}`);
    // Implement check-out logic here
  };

  return (
    <ReceptionistLayout title="Receptionist Dashboard">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👩‍💼 Receptionist Dashboard
            </h1>
            <p className="text-gray-600">
              Manage guest check-ins, check-outs, and room assignments efficiently
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
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
                  <p className="text-blue-100">Today's Check-ins</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.todaysCheckIns}</h3>
                </div>
                <div className="text-2xl">📥</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100">Today's Check-outs</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.todaysCheckOuts}</h3>
                </div>
                <div className="text-2xl">📤</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-yellow-100">Occupied Rooms</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.occupiedRooms}</h3>
                </div>
                <div className="text-2xl">🏨</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100">Available Rooms</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.availableRooms}</h3>
                </div>
                <div className="text-2xl">🛏️</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: 'overview', name: 'Overview', icon: '📊' },
                  { id: 'checkins', name: 'Check-ins', icon: '📥' },
                  { id: 'checkouts', name: 'Check-outs', icon: '📤' },
                  { id: 'rooms', name: 'Room Status', icon: '🏨' },
                  { id: 'bookings', name: 'Bookings', icon: '📅' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Today's Check-ins */}
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Check-ins</h3>
                        <div className="space-y-3">
                          {todaysCheckIns.map(checkIn => (
                            <div key={checkIn.id} className="flex justify-between items-center p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{checkIn.guestName}</p>
                                <p className="text-sm text-gray-500">Room {checkIn.room} • {checkIn.checkIn}</p>
                              </div>
                              <button
                                onClick={() => handleCheckIn(checkIn.id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                              >
                                Check-in
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Today's Check-outs */}
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Check-outs</h3>
                        <div className="space-y-3">
                          {todaysCheckOuts.map(checkOut => (
                            <div key={checkOut.id} className="flex justify-between items-center p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{checkOut.guestName}</p>
                                <p className="text-sm text-gray-500">Room {checkOut.room} • {checkOut.checkOut}</p>
                              </div>
                              <button
                                onClick={() => handleCheckOut(checkOut.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              >
                                Check-out
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          📥 Check-in Guest
                        </Button>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          📤 Check-out Guest
                        </Button>
                        <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                          🏨 View Room Status
                        </Button>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          📅 Manage Bookings
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Check-ins Tab */}
              {activeTab === 'checkins' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Check-ins</h3>
                  <div className="space-y-4">
                    {todaysCheckIns.map(checkIn => (
                      <div key={checkIn.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{checkIn.guestName}</p>
                          <p className="text-sm text-gray-500">Room {checkIn.room} • Check-in: {checkIn.checkIn}</p>
                          <span className={`inline-flex mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                            checkIn.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {checkIn.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Process
                          </Button>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Check-outs Tab */}
              {activeTab === 'checkouts' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Check-outs</h3>
                  <div className="space-y-4">
                    {todaysCheckOuts.map(checkOut => (
                      <div key={checkOut.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{checkOut.guestName}</p>
                          <p className="text-sm text-gray-500">Room {checkOut.room} • Check-out: {checkOut.checkOut}</p>
                          <span className={`inline-flex mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                            checkOut.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {checkOut.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Process
                          </Button>
                          <Button size="sm" variant="outline">
                            Bill
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Status Tab */}
              {activeTab === 'rooms' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Available Rooms</h4>
                        <div className="space-y-2">
                          {availableRooms.map(room => (
                            <div key={room.number} className="flex justify-between items-center p-3 border rounded">
                              <span className="font-medium">Room {room.number}</span>
                              <span className="text-sm text-gray-500">{room.type} - ${room.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Occupied Rooms</h4>
                        <div className="space-y-2">
                          {occupiedRooms.map(room => (
                            <div key={room.number} className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <span className="font-medium">Room {room.number}</span>
                                <p className="text-sm text-gray-500">{room.guestName}</p>
                              </div>
                              <span className="text-sm text-gray-500">Check-out: {room.checkOut}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Bookings</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        New Booking
                      </Button>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        View All Bookings
                      </Button>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Modify Booking
                      </Button>
                    </div>
                    <Card>
                      <div className="p-6">
                        <p className="text-gray-600 text-center">
                          Booking management features will be implemented here.
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </ReceptionistLayout>
  );
};

export default ReceptionistDashboard;