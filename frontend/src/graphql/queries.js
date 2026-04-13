import { gql } from '@apollo/client';

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      name
      email
    }
  }
`;

export const GET_ALL_EXERCISES = gql`
  query GetAllExercises {
    getAllExercises {
      id
      name
      muscleGroup
      videoUrl
    }
  }
`;

export const GET_MY_MEASUREMENTS = gql`
  query GetMyMeasurements {
    getMyMeasurements {
      id
      weight
      height
      bodyFatPercentage
      date
    }
  }
`;

export const ADD_BODY_MEASUREMENT = gql`
  mutation AddBodyMeasurement($weight: Float!, $height: Float!, $bodyFatPercentage: Float!) {
    addBodyMeasurement(weight: $weight, height: $height, bodyFatPercentage: $bodyFatPercentage) {
      id
      weight
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $email: String) {
    updateUser(id: $id, name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

export const CREATE_WORKOUT = gql`
  mutation CreateWorkout($input: CreateWorkoutInput!) {
    createWorkout(input: $input) {
      id
      workoutDate
    }
  }
`;