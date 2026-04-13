import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: String }], 
  friendIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingRequestIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  exercisesCompleted: { type: Number, default: 0 },
  trainingDays: [{ type: String }],
  goal: { type: String, default: 'Não definido' },   
  focus: { type: String, default: 'Geral' },       
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);