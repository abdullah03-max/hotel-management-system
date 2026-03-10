import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ReportsAnalytics = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading reports data
    setTimeout(() => {
      setReports([
        { id: 1, type: 'Monthly Revenue', period: 'Jan 2024', value: 125430, trend: 'up' },
        { id: 2, type: 'Occupancy Rate', period: 'Jan 2024', value: 78, trend: 'up' },
        { id: 3, type: 'Guest Satisfaction', period: 'Jan 2024', value: 4.5, trend: 'stable' },
        { id: 4, type: 'Staff Performance', period: 'Jan 2024', value: 4.2, trend: 'up' },
        { id: 5, type: 'Revenue Growth', period: 'Q1 2024', value: 15, trend: 'up' },
        { id: 6, type: 'Expense Analysis', period: 'Jan 2024', value: 65400, trend: 'down' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports data...</p>
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
          <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">View hotel performance reports and analytics</p>
        </div>
        <Button>
          <span className="mr-2">📊</span> Generate Report
        </Button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{report.type}</h3>
                <span className={`text-xl ${
                  report.trend === 'up' ? 'text-green-500' : 
                  report.trend === 'down' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {report.trend === 'up' ? '📈' : report.trend === 'down' ? '📉' : '➡️'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">{report.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium text-lg">
                    {report.type.includes('Revenue') || report.type.includes('Expense') ? '$' : ''}
                    {report.value}
                    {report.type.includes('Rate') ? '%' : ''}
                    {report.type.includes('Satisfaction') || report.type.includes('Performance') ? '/5' : ''}
                    {report.type.includes('Growth') ? '%' : ''}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700">
                  View Details
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Report Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="w-full">Daily Report</Button>
            <Button className="w-full">Weekly Report</Button>
            <Button className="w-full">Monthly Report</Button>
            <Button className="w-full">Custom Report</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ReportsAnalytics;