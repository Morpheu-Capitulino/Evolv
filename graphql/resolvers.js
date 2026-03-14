import User from '../models/User.js';
import Exercise from '../models/Exercise.js';
import Workout from '../models/Workout.js';
import BodyMeasurement from '../models/BodyMeasurement.js';

export const resolvers = {
  Query: {
    getAllUsers: async () => await User.find(),
    
    // Verifica se o usuário existe antes de listar os amigos
    getFriends: async (_, { userId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("Usuário não encontrado no banco de dados.");
      
      if (!user.friendIds || user.friendIds.length === 0) return [];
      return await User.find({ _id: { $in: user.friendIds } });
    },

    getAllExercises: async () => await Exercise.find(),

    // Verifica se o usuário é real antes de listar treinos
    getUserWorkouts: async (_, { userId }) => {
      const userExists = await User.findById(userId);
      if (!userExists) throw new Error("Usuário não encontrado no banco de dados.");
      
      return await Workout.find({ userId });
    },

    // Verifica se o usuário é real antes de listar medidas
    getUserMeasurements: async (_, { userId }) => {
      const userExists = await User.findById(userId);
      if (!userExists) throw new Error("Usuário não encontrado no banco de dados.");
      
      return await BodyMeasurement.find({ userId });
    },

    compareMeasurements: async (_, { m1Id, m2Id }) => {
      const m1 = await BodyMeasurement.findById(m1Id);
      const m2 = await BodyMeasurement.findById(m2Id);
      if (!m1 || !m2) throw new Error("Uma das medidas não foi encontrada no sistema.");

      const weightDiff = Math.round((m2.weight - m1.weight) * 100) / 100;
      const fatDiff = Math.round((m2.bodyFatPercentage - m1.bodyFatPercentage) * 100) / 100;
      
      let evolutionMessage = "Foco na dieta! Vamos ajustar os treinos para voltar a queimar.";
      if (fatDiff < 0) {
        evolutionMessage = "Incrível! Você perdeu percentual de gordura. O projeto está dando certo!";
      }

      return { weightDifference: weightDiff, bodyFatDifference: fatDiff, evolutionMessage };
    },

    // --- PROFILE CONTROLLER ---
    getMyMeasurements: async (_, args, context) => {
      if (!context.userId) throw new Error("Acesso negado: Token ausente ou inválido");
      return await BodyMeasurement.find({ userId: context.userId }).sort({ date: -1 });
    },

    // --- EVOLUTION CONTROLLER ---
    getExerciseProgression: async (_, { exerciseId }, context) => {
      if (!context.userId) throw new Error("Acesso negado: Token ausente ou inválido");
      
      const userWorkouts = await Workout.find({ userId: context.userId }).sort({ workoutDate: 1 });
      const progressionData = [];

      for (const workout of userWorkouts) {
        if (!workout.logs) continue;
        for (const log of workout.logs) {
          if (log.exerciseId === exerciseId) {
            const totalVolume = log.sets * log.reps * log.weight;
            progressionData.push({
              workoutDate: workout.workoutDate,
              maxWeight: log.weight,
              totalVolume: totalVolume
            });
          }
        }
      }
      return progressionData;
    }
  },

  Mutation: {
    // 1. Valida o Utilizador E os Exercícios
    createWorkout: async (_, { input }) => {
      const userExists = await User.findById(input.userId);
      if (!userExists) {
        throw new Error("Operação negada: Utilizador não encontrado na base de dados.");
      }

      if (input.logs && input.logs.length > 0) {
        for (const log of input.logs) {
          const exerciseExists = await Exercise.findById(log.exerciseId);
          if (!exerciseExists) {
            throw new Error(`Operação negada: O exercício com ID '${log.exerciseId}' não existe no catálogo do Evolv.`);
          }
        }
      }

      return await Workout.create(input);
    },

    // 2. ATUALIZAÇÃO DE DADOS
    updateUser: async (_, { id, name, email }) => {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("Operação negada: Impossível atualizar. Utilizador não existe.");
      }
      
      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      
      return await User.findByIdAndUpdate(id, updates, { new: true });
    },

    // 3. BLINDAGEM NA EXCLUSÃO DE CONTA
    deleteUser: async (_, { id }) => {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("Operação negada: Este utilizador já foi eliminado ou não existe.");
      }
      
      await User.findByIdAndDelete(id);
      return true;
    },
    addFriend: async (_, { userId, friendId }) => {
      const user = await User.findById(userId);
      const friend = await User.findById(friendId);
      if (!user || !friend) throw new Error("Usuário ou amigo não encontrado");

      if (!user.friendIds.includes(friendId)) {
        user.friendIds.push(friendId);
        await user.save();
      }
      return user;
    },

    // --- EXERCISE CONTROLLER ---
    createExercise: async (_, { name, muscleGroup, videoUrl }) => {
      return await Exercise.create({ name, muscleGroup, videoUrl });
    },

    // Impede a criação de medidas para fantasma
    addMeasurement: async (_, args) => {
      const userExists = await User.findById(args.userId);
      if (!userExists) {
        throw new Error("Operação negada: Usuário não encontrado no banco de dados.");
      }
      return await BodyMeasurement.create(args);
    },
    addBodyMeasurement: async (_, { weight, height, bodyFatPercentage }, context) => {
      if (!context.userId) throw new Error("Acesso negado: Token ausente ou inválido");
      return await BodyMeasurement.create({
        userId: context.userId,
        weight,
        height,
        bodyFatPercentage
      });
    }
  }
};