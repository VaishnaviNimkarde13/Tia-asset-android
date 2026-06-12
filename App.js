import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
 
export default function App() {
  const [consumedItems, setConsumedItems] = useState([]);
  const addConsumedItem = (item) => setConsumedItems((prev) => [item, ...prev]);
 
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigator consumedItems={consumedItems} addConsumedItem={addConsumedItem} />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}