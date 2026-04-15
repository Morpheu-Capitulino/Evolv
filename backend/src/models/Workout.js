import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workoutDate: { type: String, required: true }, 
  logs: [{
    exerciseId: { type: String, required: true },
    weight: Number,
    reps: Number,
    sets: Number,
    timestamp: { type: Date, default: Date.now }
  }]
});

workoutSchema.index({ userId: 1, workoutDate: 1 });

export default mongoose.model('Workout', workoutSchema);