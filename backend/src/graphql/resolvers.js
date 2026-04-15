import User from '../models/User.js';
import Exercise from '../models/Exercise.js';
import Workout from '../models/Workout.js';
import BodyMeasurement from '../models/BodyMeasurement.js';

export const resolvers = {
  Query: {
    getAllUsers: async () => await User.find(),
    
    me: async (_, __, context) => {
      if (!context.userId) throw new Error("Não autenticado. Faça login novamente.");
      return await User.findById(context.userId);
    },

    getFriends: async (_, { userId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("Usuário não encontrado.");
      if (!user.friendIds || user.friendIds.length === 0) return [];
      return await User.find({ _id: { $in: user.friendIds } });
    },

    getAllExercises: async () => await Exercise.find(),
    
    getUserWorkouts: async (_, { date }, context) => {
      if (!context.userId) throw new Error("Acesso negado.");
      const filter = { userId: context.userId };
      if (date) filter.workoutDate = date;
      return await Workout.find(filter).sort({ workoutDate: -1 });
    },

    getUserMeasurements: async (_, __, context) => {
      if (!context.userId) throw new Error("Acesso negado.");
      return await BodyMeasurement.find({ userId: context.userId }).sort({ date: -1 });
    },

    getMyMeasurements: async (_, __, context) => {
      if (!context.userId) throw new Error("Acesso negado");
      return await BodyMeasurement.find({ userId: context.userId }).sort({ date: -1 });
    },

    getExercise: async (_, { id }) => {
      return await Exercise.findById(id);
    },

    getExerciseProgression: async (_, { exerciseId }, context) => {
      if (!context.userId) throw new Error("Acesso negado.");
      const userWorkouts = await Workout.find({ userId: context.userId }).sort({ workoutDate: 1 });
      
      const grouped = {};

      for (const workout of userWorkouts) {
        const date = workout.workoutDate;
        for (const log of (workout.logs || [])) {
          if (log.exerciseId === exerciseId) {
            if (!grouped[date]) {
              grouped[date] = { workoutDate: date, maxWeight: 0, totalVolume: 0 };
            }
            grouped[date].maxWeight = Math.max(grouped[date].maxWeight, log.weight);
            grouped[date].totalVolume += (log.sets * log.reps * log.weight);
          }
        }
      }
      return Object.values(grouped);
    },

    getExerciseInsights: async (_, { exerciseId }, context) => {
      if (!context.userId) throw new Error("Acesso negado.");
      const progression = await resolvers.Query.getExerciseProgression(_, { exerciseId }, context);
      
      if (progression.length < 2) {
        return { suggestion: "Continue treinando para a IA analisar o seu padrão.", status: "neutral" };
      }

      const last = progression[progression.length - 1];
      const prev = progression[progression.length - 2];

      if (last.maxWeight > prev.maxWeight) {
        return { suggestion: `Excelente! Aumentou a carga em ${last.maxWeight - prev.maxWeight}kg.`, status: "up" };
      } else if (last.maxWeight < prev.maxWeight) {
        return { suggestion: "A carga caiu. Se for falha, tente reduzir 2.5kg e focar na execução.", status: "down" };
      } else {
        if (last.totalVolume > prev.totalVolume) {
          return { suggestion: "Carga mantida, mas volume total aumentou. Hipertrofia em andamento!", status: "up" };
        }
        return { suggestion: "Carga estagnada. Tente aumentar 1 ou 2 repetições nesta sessão.", status: "neutral" };
      }
    },

    getUserStreak: async (_, __, context) => {
      if (!context.userId) throw new Error("Acesso negado.");
      const user = await User.findById(context.userId);
      if (!user || !user.trainingDays || user.trainingDays.length === 0) return 0;
      
      const dates = [...new Set(user.trainingDays)].sort((a, b) => new Date(b) - new Date(a));
      let streak = 0;
      
      const hoje = new Date();
      hoje.setHours(0,0,0,0);

      for (let i = 0; i < dates.length; i++) {
        const dataTreino = new Date(dates[i]);
        dataTreino.setHours(0,0,0,0);
        
        const diffDays = Math.floor((hoje - dataTreino) / (1000 * 60 * 60 * 24));
        
        if (i === 0 && diffDays > 1) break; 
        
        if (i > 0) {
          const dataAnterior = new Date(dates[i-1]);
          dataAnterior.setHours(0,0,0,0);
          const gap = Math.floor((dataAnterior - dataTreino) / (1000 * 60 * 60 * 24));
          if (gap > 1) break; 
        }
        streak++;
      }
      return streak;
    }
  },

  Mutation: {
    createWorkout: async (_, { input }, context) => {
      if (!context.userId) throw new Error("Autenticação inválida ou expirada.");
      
      const { workoutDate, logs } = input;

      logs.forEach(log => {
        if (log.reps <= 0 || log.weight < 0 || log.sets <= 0) {
          throw new Error("Valores de carga ou repetição inválidos.");
        }
      });

      const dataNormalizada = workoutDate 
        ? workoutDate.split('T')[0] 
        : new Date().toISOString().split('T')[0];

      let workout = await Workout.findOne({ userId: context.userId, workoutDate: dataNormalizada });
      
      if (workout) {
        workout.logs.push(...logs);
        await workout.save();
      } else {
        workout = await Workout.create({ userId: context.userId, workoutDate: dataNormalizada, logs });
      }
      return workout;
    },

    deleteWorkoutLog: async (_, { workoutId, logIndex }, context) => {
      if (!context.userId) throw new Error("Acesso negado.");
      const workout = await Workout.findOne({ _id: workoutId, userId: context.userId });
      if (!workout) throw new Error("Treino não encontrado.");
      
      workout.logs.splice(logIndex, 1); 
      await workout.save();
      return workout;
    },

    updateUser: async (_, { id, name, email, goal, focus }, context) => {
      if (id !== context.userId) throw new Error("Operação não permitida.");
      return await User.findByIdAndUpdate(id, { $set: { name, email, goal, focus } }, { new: true });
    },

    finishWorkout: async (_, { exerciseCount, duration, totalVolume }, context) => {
      if (!context.userId) throw new Error("Não autenticado");
      const user = await User.findById(context.userId);
      
      user.exercisesCompleted = (user.exercisesCompleted || 0) + exerciseCount;
      const dataNormalizada = new Date().toISOString().split('T')[0];
      if (!user.trainingDays.includes(dataNormalizada)) {
        user.trainingDays.push(dataNormalizada);
      }
      
      await user.save();
      return user;
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

    addBodyMeasurement: async (_, args, context) => {
      if (!context.userId) throw new Error("Acesso negado.");
      return await BodyMeasurement.create({ userId: context.userId, ...args, date: new Date().toISOString() });
    }
  }
};