import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { CreateReportScreen } from '../screens/CreateReportScreen';
import { IncidentReport } from '../types';

export type RootStackParamList = {
  Home: undefined;
  CreateReport: { report?: IncidentReport };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Reportes Offline-First' }} />
        <Stack.Screen name="CreateReport" component={CreateReportScreen} options={{ title: 'Registro de Incidencia' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
