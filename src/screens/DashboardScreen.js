import React from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from '../constants/styles';

export function DashboardScreen({ navigation, route, consumedItems }) {
  const user = route.params?.user || 'Nurse';
  const initials = user.charAt(0).toUpperCase();

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="dark" />
      <FlatList
        data={consumedItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.screenContent}
        ListHeaderComponent={
          <>
            <View style={styles.dashHeader}>
              <View>
                <Text style={styles.dashGreeting}>Good day,</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.scanCard} onPress={() => navigation.navigate('Scanner')} activeOpacity={0.85}>
              <View style={{ flex: 1 }}>
                <Text style={styles.scanCardTitle}>Scan Medication</Text>
                <Text style={styles.scanCardSubtitle}>Tap to open the barcode scanner</Text>
              </View>
              <Text style={styles.scanCardArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{consumedItems.length}</Text>
                <Text style={styles.statLabel}>Consumed Today</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#eff6ff' }]}>
                <Text style={[styles.statNumber, { color: '#2563eb', fontSize: 13 }]} numberOfLines={1}>
                  {consumedItems.length > 0 ? consumedItems[0].consumedAt : '—'}
                </Text>
                <Text style={styles.statLabel}>Last Scan</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {consumedItems.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No activity yet</Text>
                <Text style={styles.emptySubtitle}>Scanned items will appear here.</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <View style={styles.historyDot} />
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.historyItemCode} numberOfLines={1} ellipsizeMode="middle">{item.label || item.code}</Text>
              <Text style={styles.historyItemMeta}>Marked consumed · {item.consumedAt}</Text>
            </View>
            <View style={styles.historyBadge}>
              <Text style={styles.historyBadgeText}>Done</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
