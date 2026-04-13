import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subtitle: { type: String },         
  muscleGroup: { type: String },      
  videoUrl: { type: String },         
  idealRest: { type: Number, default: 90 }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Exercise', exerciseSchema);