import gql from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    goal: String
    focus: String
    isPremium: Boolean
    exercisesCompleted: Int
    friendIds: [ID]
    pendingRequestIds: [ID]
    trainingDays: [String]
  }

  type Exercise {
    id: ID!
    name: String!
    subtitle: String
    muscleGroup: String
    videoUrl: String
    idealRest: Int
  }

  type Measurement {
    id: ID!
    userId: ID
    weight: Float
    height: Float
    bodyFatPercentage: Float
    arm: Float
    waist: Float
    thigh: Float
    hip: Float
    date: String
  }

  type ComparisonResult {
    weightDifference: Float
    bodyFatDifference: Float
    evolutionMessage: String
  }

  type ProgressionData {
    workoutDate: String
    maxWeight: Float
    totalVolume: Float
  }

  # NOVO: Tipo para a IA de sugestão de Carga
  type ExerciseInsight {
    suggestion: String
    status: String
  }

  type Workout {
    id: ID!
    userId: ID
    workoutDate: String
    logs: [WorkoutLog]
  }

  type WorkoutLog {
    exerciseId: String
    weight: Float
    reps: Int
    sets: Int
  }

  input WorkoutLogInput {
    exerciseId: String!
    weight: Float!
    reps: Int!
    sets: Int!
  }

  input CreateWorkoutInput {
    workoutDate: String
    logs: [WorkoutLogInput]!
  }

  type Query {
    me: User
    getAllUsers: [User]
    getFriends(userId: ID!): [User]
    getAllExercises: [Exercise]
    getExercise(id: ID!): Exercise
    getMyMeasurements: [Measurement]
    getUserMeasurements: [Measurement]
    compareMeasurements(m1Id: ID!, m2Id: ID!): ComparisonResult
    getUserWorkouts(date: String): [Workout]
    
    # NOVAS ROTAS DE DADOS AVANÇADOS
    getExerciseProgression(exerciseId: ID!): [ProgressionData]
    getExerciseInsights(exerciseId: ID!): ExerciseInsight
    getUserStreak: Int
  }

  type Mutation {
    updateUser(name: String, email: String, goal: String, focus: String): User
    deleteUser(id: ID!): Boolean
    addMeasurement(weight: Float!, bodyFatPercentage: Float!): Measurement
    addBodyMeasurement(weight: Float!, height: Float!, bodyFatPercentage: Float!, arm: Float, waist: Float, thigh: Float, hip: Float): Measurement
    addFriend(userId: ID!, friendId: ID!): User
    sendFriendRequest(userId: ID!, targetId: ID!): User
    respondToRequest(userId: ID!, requesterId: ID!, accept: Boolean!): User
    createExercise(name: String!, muscleGroup: String!, videoUrl: String): Exercise
    
    # ROTAS DE TREINO ATUALIZADAS
    finishWorkout(exerciseCount: Int!, duration: Int, totalVolume: Float): User
    createWorkout(input: CreateWorkoutInput!): Workout
    deleteWorkoutLog(workoutId: ID!, logIndex: Int!): Workout
  }
`;