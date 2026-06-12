import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ScannerScreen } from '../screens/ScannerScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator({ consumedItems, addConsumedItem }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard">
        {(props) => (
          <DashboardScreen
            {...props}
            consumedItems={consumedItems}
            onMarkConsumed={addConsumedItem}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Scanner">
        {(props) => (
          <ScannerScreen {...props} onMarkConsumed={addConsumedItem} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}