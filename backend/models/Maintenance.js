import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  // your schema definition
});

export const Maintenance = mongoose.model('Maintenance', maintenanceSchema);