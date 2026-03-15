import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AddInventoryForm = ({ onClose, onItemAdded }) => {
  const [formData, setFormData] = useState({
    item: '',
    category: 'linens',
    quantity: '',
    threshold: '',
    unit: 'pieces',
    supplier: '',
    cost: '',
    location: 'storage'
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'linens', label: 'Linens' },
    { value: 'toiletries', label: 'Toiletries' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'cleaning', label: 'Cleaning Supplies' },
    { value: 'office', label: 'Office Supplies' },
    { value: 'kitchen', label: 'Kitchen Items' },
    { value: 'maintenance', label: 'Maintenance Tools' }
  ];

  const units = [
    { value: 'pieces', label: 'Pieces' },
    { value: 'packs', label: 'Packs' },
    { value: 'liters', label: 'Liters' },
    { value: 'kilograms', label: 'Kilograms' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'bottles', label: 'Bottles' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newItem = {
        id: Date.now(),
        ...formData,
        status: parseInt(formData.quantity) > parseInt(formData.threshold) ? 'In Stock' : 'Low Stock',
        lastRestocked: new Date().toISOString().split('T')[0]
      };

      onItemAdded(newItem);
      onClose();
      
    } catch (error) {
      console.error('Error adding inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Add Inventory Item</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
              <input type="text" name="item" required value={formData.item} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter item name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input type="number" name="quantity" required value={formData.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter quantity" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
              <select name="unit" required value={formData.unit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold *</label>
              <input type="number" name="threshold" required value={formData.threshold} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Alert when below this number" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost per Unit ($)</label>
              <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter cost" min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
              <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter supplier name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Storage Location</label>
              <select name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="storage">Main Storage</option>
                <option value="kitchen">Kitchen</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="front-desk">Front Desk</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Adding Item...' : 'Add Item'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddInventoryForm;
