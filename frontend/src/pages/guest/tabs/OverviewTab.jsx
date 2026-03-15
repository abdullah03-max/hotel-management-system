import React from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const OverviewTab = ({ activeTab, bookings, setActiveTab, onLogout, getStatusColor }) => {
  if (activeTab !== 'overview') return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => setActiveTab('rooms')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                🏨 Book a Room
              </Button>
              <Button 
                onClick={() => setActiveTab('bookings')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                📅 View My Bookings
              </Button>
              <Button 
                onClick={() => setActiveTab('notifications')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                🔔 Check Notifications
              </Button>
              <Button 
                onClick={onLogout}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                🚪 Logout
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 3).map(booking => (
                  <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.roomType}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
