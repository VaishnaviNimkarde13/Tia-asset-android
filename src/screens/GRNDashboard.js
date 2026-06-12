import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';

export function GRNDashboard({ navigation, grnList = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter GRNs based on search query
  const filteredGRNs = grnList.filter(grn => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (grn.grnNumber && grn.grnNumber.toLowerCase().includes(searchTerm)) ||
      (grn.supplier && grn.supplier.toLowerCase().includes(searchTerm)) ||
      (grn.lineItems && grn.lineItems.some(item => 
        item.item && item.item.toLowerCase().includes(searchTerm)
      ))
    );
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeSmall}>Welcome back,</Text>
          <Text style={styles.welcomeName}>GRN Manager</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>G</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>

        {/* Scan to create GRN */}
        <TouchableOpacity
          style={[styles.card, styles.cardBlue]}
          onPress={() => navigation.navigate('GRNScanner')}
        >
          <Text style={styles.cardIcon}>📷</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Scan Barcode</Text>
            <Text style={styles.cardSub}>Scan item barcode to start a GRN</Text>
          </View>
        </TouchableOpacity>

        {/* Create GRN manually */}
        <TouchableOpacity
          style={[styles.card, styles.cardGreen]}
          onPress={() => navigation.navigate('CreateGRN', { scannedItem: null })}
        >
          <Text style={styles.cardIcon}>📝</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Create GRN Manually</Text>
            <Text style={styles.cardSub}>Enter item details without scanning</Text>
          </View>
        </TouchableOpacity>

        {/* Recent GRNs Section */}
        <View style={styles.listSection}>
          <Text style={styles.listHeading}>Recent GRNs</Text>
          
          {/* Search Bar - Only show when there are GRNs */}
          {grnList.length > 0 && (
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by GRN number, supplier, or item..."
                placeholderTextColor="#a0aec0"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {filteredGRNs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching GRNs found' : 'No GRNs yet'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? `No results for "${searchQuery}"` 
                  : 'Items will appear here.'}
              </Text>
            </View>
          ) : (
            filteredGRNs.map((grn, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.grnRow}
                onPress={() => navigation.navigate('GRNDetails', { grn })}
              >
                <View style={styles.grnLeft}>
                  <Text style={styles.grnNumber}>{grn.grnNumber || `GRN-${String(idx + 1).padStart(3, '0')}`}</Text>
                  <Text style={styles.grnSupplier}>{grn.supplier || '—'}</Text>
                  {grn.lineItems && grn.lineItems.length > 0 && (
                    <View style={styles.grnItemsPreview}>
                      <Text style={styles.grnItemsPreviewText}>
                        {grn.lineItems.slice(0, 2).map(item => item.item).join(', ')}
                        {grn.lineItems.length > 2 && ` +${grn.lineItems.length - 2} more`}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.grnRight}>
                  <Text style={styles.grnDate}>{formatDate(grn.receiptDate)}</Text>
                  <View style={[
                    styles.grnBadge,
                    grn.status === 'Pending' && styles.badgePending,
                    grn.status === 'Short Delivery' && styles.badgeWarning,
                    grn.status === 'Completed' && styles.badgeCompleted,
                  ]}>
                    <Text style={styles.grnBadgeText}>
                      {grn.itemCount || grn.lineItems?.length || 0} item{grn.itemCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  {grn.totalValue && (
                    <Text style={styles.grnTotal}>{grn.totalValue}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
          
          {/* Show result count */}
          {filteredGRNs.length > 0 && searchQuery.length > 0 && (
            <Text style={styles.resultCount}>
              Found {filteredGRNs.length} result{filteredGRNs.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    backgroundColor: '#2b6cb0',
    padding: 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeSmall: { color: '#bee3f8', fontSize: 13 },
  welcomeName: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#2b6cb0', fontSize: 20, fontWeight: '800' },
  body: { padding: 16, gap: 16 },
  card: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardBlue: { backgroundColor: '#ebf8ff', borderLeftWidth: 4, borderLeftColor: '#3182ce' },
  cardGreen: { backgroundColor: '#f0fff4', borderLeftWidth: 4, borderLeftColor: '#38a169' },
  cardIcon: { fontSize: 30, marginRight: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a202c', marginBottom: 3 },
  cardSub: { fontSize: 13, color: '#718096' },

  // GRN list section
  listSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  listHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b6cb0',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  
  // Search bar styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#a0aec0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2d3748',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#a0aec0',
    fontWeight: '600',
  },
  resultCount: {
    fontSize: 11,
    color: '#a0aec0',
    marginTop: 12,
    textAlign: 'center',
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#a0aec0',
    textAlign: 'center',
  },
  
  // GRN row
  grnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  grnLeft: { 
    flex: 1,
    marginRight: 12,
  },
  grnNumber: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#1a202c',
    marginBottom: 2,
  },
  grnSupplier: { 
    fontSize: 12, 
    color: '#718096', 
    marginBottom: 4,
  },
  grnItemsPreview: {
    marginTop: 4,
  },
  grnItemsPreviewText: {
    fontSize: 11,
    color: '#a0aec0',
  },
  grnRight: { 
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  grnDate: { 
    fontSize: 11, 
    color: '#a0aec0', 
    marginBottom: 6,
  },
  grnBadge: {
    backgroundColor: '#ebf8ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  badgePending: {
    backgroundColor: '#fef3c7',
  },
  badgeWarning: {
    backgroundColor: '#fed7aa',
  },
  badgeCompleted: {
    backgroundColor: '#d1fae5',
  },
  grnBadgeText: { 
    fontSize: 10, 
    color: '#2b6cb0', 
    fontWeight: '600',
  },
  grnTotal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
});