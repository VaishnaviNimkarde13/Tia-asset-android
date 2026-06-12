import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from '../constants/styles';
import { ItemListScreen } from './ItemListScreen';

export function DashboardScreen({ navigation, route, consumedItems, onMarkConsumed }) {
  const [activeTab, setActiveTab] = useState('activity');
  const user     = route.params?.user || 'Nurse';
  const initials = user.charAt(0).toUpperCase();

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={dash.topBar}>
        <View>
          <Text style={styles.dashGreeting}>Welcome back, {user}!</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={dash.tabBar}>
        <TouchableOpacity
          style={[dash.tab, activeTab === 'activity' && dash.tabActive]}
          onPress={() => setActiveTab('activity')}
          activeOpacity={0.8}
        >
          <Text style={[dash.tabText, activeTab === 'activity' && dash.tabTextActive]}>
            Activity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dash.tab, activeTab === 'items' && dash.tabActive]}
          onPress={() => setActiveTab('items')}
          activeOpacity={0.8}
        >
          <Text style={[dash.tabText, activeTab === 'items' && dash.tabTextActive]}>
            Item List
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'activity' ? (
          <ActivityTab navigation={navigation} consumedItems={consumedItems} />
        ) : (
          <ItemListScreen consumedItems={consumedItems} onMarkConsumed={onMarkConsumed} />
        )}
      </View>
    </View>
  );
}

function ActivityTab({ navigation, consumedItems }) {
  return (
    <FlatList
      data={consumedItems}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.screenContent}
      ListHeaderComponent={
        <>
          <TouchableOpacity
            style={styles.scanCard}
            onPress={() => navigation.navigate('Scanner')}
            activeOpacity={0.85}
          >
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
              <Text
                style={[styles.statNumber, { color: '#2563eb', fontSize: 13 }]}
                numberOfLines={1}
              >
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
            <Text style={styles.historyItemCode} numberOfLines={1} ellipsizeMode="middle">
              {item.label || item.code}
            </Text>
            <Text style={styles.historyItemMeta}>Marked consumed · {item.consumedAt}</Text>
          </View>
          <View style={styles.historyBadge}>
            <Text style={styles.historyBadgeText}>Done</Text>
          </View>
        </View>
      )}
    />
  );
}

const dash = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#1e293b',
    fontWeight: '700',
  },
});