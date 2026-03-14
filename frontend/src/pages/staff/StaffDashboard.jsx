import React from 'react';
import ReceptionistLayout from '../../components/layout/ReceptionistLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const StaffDashboard = () => {
  return (
    <ReceptionistLayout title="Staff Dashboard">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛠️ Staff Dashboard
          </h1>
          <p className="text-gray-600">
            Access your assigned tasks and responsibilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Tasks</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Room Cleaning</p>
                <p className="text-sm text-gray-500">Rooms: 101, 102, 103</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Maintenance Check</p>
                <p className="text-sm text-gray-500">Floor 2 Common Areas</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View Schedule
              </Button>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Report Issue
              </Button>
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                Request Supplies
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">8/12</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rooms Cleaned</p>
                <p className="text-2xl font-bold text-gray-900">15</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Issues Reported</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ReceptionistLayout>
  );
};

export default StaffDashboard;