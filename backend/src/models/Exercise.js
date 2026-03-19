import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  videoUrl: { type: String }
});

export default mongoose.model('Exercise', exerciseSchema);