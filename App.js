
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const [consumedItems, setConsumedItems] = useState([]);
  const addConsumedItem = (item) => setConsumedItems((prev) => [item, ...prev]);

  // GRN state lifted here so dashboard can read it
  const [grnList, setGrnList] = useState([]);
  const addGRN = (grn) => setGrnList((prev) => [grn, ...prev]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigator
          consumedItems={consumedItems}
          addConsumedItem={addConsumedItem}
          grnList={grnList}
          addGRN={addGRN}
        />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
