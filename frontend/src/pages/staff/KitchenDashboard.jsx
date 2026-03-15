import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StaffLayout from '../../components/layout/StaffLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    // Mock data
    setOrders([
      { id: 1, room: '101', items: 'Breakfast Set A', status: 'pending', time: '08:30 AM' },
      { id: 2, room: '205', items: 'Lunch Special', status: 'preparing', time: '12:15 PM' },
      { id: 3, room: '312', items: 'Dinner Package', status: 'ready', time: '07:45 PM' }
    ]);

    setInventory([
      { item: 'Eggs', quantity: 120, unit: 'pieces', lowStock: false },
      { item: 'Milk', quantity: 8, unit: 'liters', lowStock: true },
      { item: 'Bread', quantity: 25, unit: 'loaves', lowStock: false },
      { item: 'Chicken', quantity: 15, unit: 'kg', lowStock: false }
    ]);
  }, []);

  const handleOrderStatus = (orderId, status) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  return (
    <StaffLayout title="Kitchen Dashboard" role="kitchen">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👨‍🍳 Kitchen Dashboard
            </h1>
            <p className="text-gray-600">
              Manage food orders and kitchen inventory
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-orange-100">Pending Orders</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {orders.filter(o => o.status === 'pending').length}
                  </h3>
                </div>
                <div className="text-2xl">📝</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-yellow-100">Preparing</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {orders.filter(o => o.status === 'preparing').length}
                  </h3>
                </div>
                <div className="text-2xl">👨‍🍳</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100">Ready</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {orders.filter(o => o.status === 'ready').length}
                  </h3>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Orders</h3>
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Room {order.room}</p>
                      <p className="text-sm text-gray-500">{order.items}</p>
                      <p className="text-xs text-gray-400">{order.time}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'ready' ? 'bg-green-100 text-green-800' : 
                        order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => handleOrderStatus(order.id, 'preparing')}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleOrderStatus(order.id, 'ready')}
                        className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Ready
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Inventory */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
              <div className="space-y-3">
                {inventory.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.item}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    {item.lowStock && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
};

export default KitchenDashboard;
