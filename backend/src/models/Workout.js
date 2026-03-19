import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true },
  sets: { type: Number },
  reps: { type: Number },
  weight: { type: Number }
});

const workoutSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  workoutDate: { type: String, required: true },
  logs: [logSchema]
});

export default mongoose.model('Workout', workoutSchema);