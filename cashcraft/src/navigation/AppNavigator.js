import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../context/store';

import TabNavigator from './TabNavigator';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import SalaryScreen from '../screens/onboarding/SalaryScreen';
import BudgetRuleScreen from '../screens/onboarding/BudgetRuleScreen';
import ConfirmScreen from '../screens/onboarding/ConfirmScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const isOnboarded = useAppStore((s) => s.isOnboarded);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isOnboarded ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen
              name="Salary"
              component={SalaryScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="BudgetRule"
              component={BudgetRuleScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Confirm"
              component={ConfirmScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
