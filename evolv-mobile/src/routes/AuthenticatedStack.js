import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomePage from '../pages/HomePage';
import TreinoPage from '../pages/TreinoPage';
import ProgressoPage from '../pages/ProgressoPage';
import AmigosPage from '../pages/AmigosPage';
import OnboardingPage from '../pages/OnboardingPage';
import ExerciseDetail from '../pages/ExerciseDetail';
import SeriesRecord from '../pages/SeriesRecord'; 
import PerfilPage from '../pages/PerfilPage'; 

const Stack = createNativeStackNavigator();

export default function AuthenticatedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Treino" component={TreinoPage} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetail} />
      <Stack.Screen name="RegistroSerie" component={SeriesRecord} />
      <Stack.Screen name="Progresso" component={ProgressoPage} />
      <Stack.Screen name="Amigos" component={AmigosPage} />
      <Stack.Screen name="Onboarding" component={OnboardingPage} />
      <Stack.Screen name="Perfil" component={PerfilPage} />
    </Stack.Navigator>
  );
}