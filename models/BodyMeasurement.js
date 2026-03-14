import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  weight: { type: Number },
  height: { type: Number },
  bodyFatPercentage: { type: Number },
  date: { type: String }
});

export default mongoose.model('BodyMeasurement', measurementSchema);