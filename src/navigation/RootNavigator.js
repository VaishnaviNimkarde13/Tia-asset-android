import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { GRNDashboard } from '../screens/GRNDashboard';
import { GRNScannerScreen } from '../screens/GRNScannerScreen';
import { CreateGRNScreen } from '../screens/CreateGRNScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator({ consumedItems, addConsumedItem, grnList, addGRN }) {
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
        {(props) => <ScannerScreen {...props} onMarkConsumed={addConsumedItem} />}
      </Stack.Screen>

      {/* ── GRN screens ── */}
      <Stack.Screen name="GRNDashboard">
        {(props) => <GRNDashboard {...props} grnList={grnList} />}
      </Stack.Screen>
      <Stack.Screen name="GRNScanner" component={GRNScannerScreen} />
      <Stack.Screen name="CreateGRN">
        {(props) => <CreateGRNScreen {...props} addGRN={addGRN} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}