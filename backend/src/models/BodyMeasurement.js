import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  weight: { type: Number },
  height: { type: Number },
  bodyFatPercentage: { type: Number },
  arm: { type: Number },     // Braço
  waist: { type: Number },   // Cintura
  thigh: { type: Number },   // Coxa
  hip: { type: Number },     // Quadril
  date: { type: String }
});

export default mongoose.model('BodyMeasurement', measurementSchema);