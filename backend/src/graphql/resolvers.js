import User from '../models/User.js';
import Exercise from '../models/Exercise.js';
import Workout from '../models/Workout.js';
import BodyMeasurement from '../models/BodyMeasurement.js';

export const resolvers = {
  Query: {
    getAllUsers: async () => await User.find(),
    
    me: async (_, __, context) => {
      if (!context.userId) throw new Error("Não autenticado");
      return await User.findById(context.userId);
    },

    getFriends: async (_, { userId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("Usuário não encontrado.");
      if (!user.friendIds || user.friendIds.length === 0) return [];
      return await User.find({ _id: { $in: user.friendIds } });
    },

    getAllExercises: async () => await Exercise.find(),

    // CORREÇÃO: Agora aceita userId e data como Query
    getUserWorkouts: async (_, { userId, date }) => {
      const filter = { userId };
      if (date) filter.workoutDate = date;
      return await Workout.find(filter);
    },

    getUserMeasurements: async (_, { userId }) => {
      return await BodyMeasurement.find({ userId });
    },

    compareMeasurements: async (_, { m1Id, m2Id }) => {
      const m1 = await BodyMeasurement.findById(m1Id);
      const m2 = await BodyMeasurement.findById(m2Id);
      if (!m1 || !m2) throw new Error("Medidas não encontradas.");

      const weightDiff = Math.round((m2.weight - m1.weight) * 100) / 100;
      const fatDiff = Math.round((m2.bodyFatPercentage - m1.bodyFatPercentage) * 100) / 100;
      
      return { 
        weightDifference: weightDiff, 
        bodyFatDifference: fatDiff, 
        evolutionMessage: fatDiff < 0 ? "Incrível! Perdeu gordura." : "Foco na dieta!" 
      };
    },

    getMyMeasurements: async (_, args, context) => {
      if (!context.userId) throw new Error("Acesso negado");
      return await BodyMeasurement.find({ userId: context.userId }).sort({ date: -1 });
    },

    getExercise: async (_, { id }) => {
      return await Exercise.findById(id);
    },

    getExerciseProgression: async (_, { exerciseId }, context) => {
      if (!context.userId) throw new Error("Acesso negado.");
      const userWorkouts = await Workout.find({ userId: context.userId }).sort({ workoutDate: 1 });
      const progressionData = [];
      for (const workout of userWorkouts) {
        for (const log of (workout.logs || [])) {
          if (log.exerciseId === exerciseId) {
            progressionData.push({
              workoutDate: workout.workoutDate,
              maxWeight: log.weight,
              totalVolume: log.sets * log.reps * log.weight
            });
          }
        }
      }
      return progressionData;
    }
  },

  Mutation: {
    createWorkout: async (_, { input }) => {
      const { userId, workoutDate, logs } = input;
      let workout = await Workout.findOne({ userId, workoutDate });
      if (workout) {
        workout.logs.push(...logs);
        await workout.save();
      } else {
        workout = await Workout.create({ userId, workoutDate, logs });
      }
      return workout;
    },

    updateUser: async (_, { id, name, email, goal, focus }) => {
      return await User.findByIdAndUpdate(id, { $set: { name, email, goal, focus } }, { new: true });
    },

    deleteUser: async (_, { id }) => {
      await User.findByIdAndDelete(id);
      return true;
    },

    addFriend: async (_, { userId, friendId }) => {
      const user = await User.findById(userId);
      if (user && !user.friendIds.includes(friendId)) {
        user.friendIds.push(friendId);
        await user.save();
      }
      return user;
    },

    sendFriendRequest: async (_, { userId, targetId }) => {
      const target = await User.findById(targetId);
      if (target && !target.pendingRequestIds.includes(userId)) {
        target.pendingRequestIds.push(userId);
        await target.save();
      }
      return target;
    },

    respondToRequest: async (_, { userId, requesterId, accept }) => {
      const user = await User.findById(userId);
      const requester = await User.findById(requesterId);
      user.pendingRequestIds = user.pendingRequestIds.filter(id => id.toString() !== requesterId);
      if (accept) {
        if (!user.friendIds.includes(requesterId)) user.friendIds.push(requesterId);
        if (!requester.friendIds.includes(userId)) requester.friendIds.push(userId);
        await requester.save();
      }
      await user.save();
      return user;
    },

    finishWorkout: async (_, { userId, exerciseCount }) => {
      const user = await User.findById(userId);
      user.exercisesCompleted = (user.exercisesCompleted || 0) + exerciseCount;
      const hoje = new Date().toISOString().split('T')[0];
      if (!user.trainingDays.includes(hoje)) user.trainingDays.push(hoje);
      await user.save();
      return user;
    },

    createExercise: async (_, args) => await Exercise.create(args),

    addMeasurement: async (_, args) => await BodyMeasurement.create(args),

    addBodyMeasurement: async (_, args, context) => {
      return await BodyMeasurement.create({ userId: context.userId, ...args, date: new Date().toISOString() });
    }
  }
};