import React from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const BookingsTab = ({ activeTab, bookings, setActiveTab, onLogout, getStatusColor }) => {
  if (activeTab !== 'bookings') return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">My Bookings</h3>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setActiveTab('rooms')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + New Booking
          </Button>
          <Button 
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            🚪 Logout
          </Button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-6">Start by booking your first stay with us!</p>
            <Button 
              onClick={() => setActiveTab('rooms')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Browse Available Rooms
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <Card key={booking.id}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{booking.roomType}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Check-in</p>
                        <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Check-out</p>
                        <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Guests</p>
                        <p className="font-medium">{booking.guests} {booking.guests > 1 ? 'Guests' : 'Guest'}</p>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">
                          <strong>Special Requests:</strong> {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-lg font-bold text-green-600">${booking.totalAmount}</p>
                      <div className="text-sm text-gray-500">
                        Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsTab;