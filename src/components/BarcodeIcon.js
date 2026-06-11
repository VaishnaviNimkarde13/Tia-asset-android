import React from 'react';
import { View } from 'react-native';

export function BarcodeIcon() {
  const bars = [3, 1, 4, 1, 3, 1, 2, 1, 3, 1, 4, 1, 2];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 20 }}>
      {bars.map((w, i) =>
        i % 2 === 0 ? (
          <View key={i} style={{ width: w, height: 20, backgroundColor: '#fff', marginHorizontal: 0.5, borderRadius: 0.5 }} />
        ) : (
          <View key={i} style={{ width: w }} />
        )
      )}
    </View>
  );
}
