import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StaffLayout from '../../components/layout/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SecurityDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [patrolSchedule, setPatrolSchedule] = useState([]);

  useEffect(() => {
    // Mock data
    setIncidents([
      { id: 1, type: 'Unauthorized Access', location: 'Main Gate', time: '22:30', status: 'resolved' },
      { id: 2, type: 'Noise Complaint', location: 'Room 205', time: '23:15', status: 'investigating' },
      { id: 3, type: 'Suspicious Activity', location: 'Parking Lot', time: '01:45', status: 'pending' }
    ]);

    setPatrolSchedule([
      { area: 'Lobby & Reception', time: 'Every 30 mins', lastPatrol: '02:00', status: 'Completed' },
      { area: 'Guest Floors 1-3', time: 'Every 45 mins', lastPatrol: '01:15', status: 'Completed' },
      { area: 'Parking Area', time: 'Every 60 mins', lastPatrol: '00:30', status: 'Pending' },
      { area: 'Pool & Recreation', time: 'Every 90 mins', lastPatrol: '23:45', status: 'Completed' }
    ]);
  }, []);

  return (
    <StaffLayout title="Security Dashboard" role="security">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🛡️ Security Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor security incidents and patrol schedules
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-100">Active Incidents</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {incidents.filter(i => i.status !== 'resolved').length}
                  </h3>
                </div>
                <div className="text-2xl">🚨</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100">Patrols Today</p>
                  <h3 className="text-2xl font-bold mt-2">24</h3>
                </div>
                <div className="text-2xl">👮</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100">Resolved Issues</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {incidents.filter(i => i.status === 'resolved').length}
                  </h3>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incidents */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
              <div className="space-y-3">
                {incidents.map(incident => (
                  <div key={incident.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{incident.type}</p>
                        <p className="text-sm text-gray-500">{incident.location} • {incident.time}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        incident.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Patrol Schedule */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patrol Schedule</h3>
              <div className="space-y-3">
                {patrolSchedule.map((patrol, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{patrol.area}</p>
                      <p className="text-sm text-gray-500">{patrol.time}</p>
                      <p className="text-xs text-gray-400">Last: {patrol.lastPatrol}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      patrol.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {patrol.status}
                    </span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                Start Next Patrol
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
};

export default SecurityDashboard;
