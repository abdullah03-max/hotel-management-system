@echo off
echo Creating missing backend files...

cd C:\Users\Abdullah\Desktop\hotel-management-system\backend

:: Create maintenanceController.js
echo import Maintenance from '../models/Maintenance.js';
echo import { asyncHandler } from '../middleware/authMiddleware.js';
echo.
echo export const createMaintenanceTask = asyncHandler(async (req, res) => {
echo   const maintenance = await Maintenance.create({
echo     ...req.body,
echo     reportedBy: req.user.id
echo   });
echo   res.status(201).json({ success: true, data: maintenance, message: 'Maintenance task created successfully' });
echo });
echo.
echo export const getMaintenanceTasks = asyncHandler(async (req, res) => {
echo   const tasks = await Maintenance.find().populate('room').populate('reportedBy');
echo   res.json({ success: true, data: tasks });
echo });
echo.
echo export const updateMaintenanceStatus = asyncHandler(async (req, res) => {
echo   const maintenance = await Maintenance.findById(req.params.id);
echo   if (!maintenance) return res.status(404).json({ success: false, message: 'Maintenance task not found' });
echo   Object.assign(maintenance, req.body);
echo   await maintenance.save();
echo   res.json({ success: true, data: maintenance, message: 'Maintenance task updated successfully' });
echo });
echo.
echo export const getMaintenanceStats = asyncHandler(async (req, res) => {
echo   const stats = await Maintenance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
echo   res.json({ success: true, data: stats });
echo });
) > controllers\maintenanceController.js

echo ✅ Created maintenanceController.js

:: Create Maintenance model
echo import mongoose from 'mongoose';
echo.
echo const maintenanceSchema = new mongoose.Schema({
echo   taskId: { type: String, unique: true, default: () => ^`MT^${Date.now()}^` },
echo   room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
echo   title: { type: String, required: true },
echo   description: { type: String, required: true },
echo   priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
echo   status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
echo   reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
echo   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
echo }, { timestamps: true });
echo.
echo export default mongoose.model('Maintenance', maintenanceSchema);
) > models\Maintenance.js

echo ✅ Created Maintenance.js model

echo.
echo ✅ All missing files created!
echo.
pause