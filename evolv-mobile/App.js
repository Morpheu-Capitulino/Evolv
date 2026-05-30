import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ApolloProvider } from '@apollo/client';
import client from './src/services/apolloClient';

import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';
import AuthenticatedStack from './src/routes/AuthenticatedStack';
import OnboardingPage from './src/pages/OnboardingPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Register" component={RegisterPage} />
          <Stack.Screen name="Onboarding" component={OnboardingPage} />
          <Stack.Screen name="Main" component={AuthenticatedStack} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}