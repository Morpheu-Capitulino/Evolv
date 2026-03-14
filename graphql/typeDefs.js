export const typeDefs = `#graphql
  type User { id: ID!, name: String, email: String, friendIds: [String] }
  type Exercise { id: ID!, name: String, muscleGroup: String, videoUrl: String }
  type WorkoutLog { exerciseId: String, sets: Int, reps: Int, weight: Float }
  type Workout { id: ID!, userId: String, workoutDate: String, logs: [WorkoutLog] }
  type BodyMeasurement { id: ID!, userId: String, weight: Float, height: Float, bodyFatPercentage: Float, date: String }
  
  type Comparison { weightDifference: Float, bodyFatDifference: Float, evolutionMessage: String }
  type ProgressionData { workoutDate: String, maxWeight: Float, totalVolume: Float }

  input WorkoutLogInput { exerciseId: String, sets: Int, reps: Int, weight: Float }
  input CreateWorkoutInput { userId: String!, workoutDate: String, logs: [WorkoutLogInput]! }

  type Query {
    # UserController & FriendController
    getAllUsers: [User]
    getFriends(userId: String!): [User]
    
    # ExerciseController
    getAllExercises: [Exercise]
    
    # WorkoutController
    getUserWorkouts(userId: String!): [Workout]
    
    # MeasurementController & ProfileController
    getUserMeasurements(userId: String!): [BodyMeasurement]
    getMyMeasurements: [BodyMeasurement]
    compareMeasurements(m1Id: String!, m2Id: String!): Comparison
    
    # EvolutionController
    getExerciseProgression(exerciseId: String!): [ProgressionData]
  }

  type Mutation {
    # UserController & FriendController
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): Boolean
    addFriend(userId: String!, friendId: String!): User

    # ExerciseController
    createExercise(name: String!, muscleGroup: String!, videoUrl: String): Exercise
    
    # WorkoutController
    createWorkout(input: CreateWorkoutInput!): Workout
    
    # MeasurementController & ProfileController
    addMeasurement(userId: String!, weight: Float, height: Float, bodyFatPercentage: Float, date: String): BodyMeasurement
    addBodyMeasurement(weight: Float!, height: Float!, bodyFatPercentage: Float!): BodyMeasurement
  }
`;