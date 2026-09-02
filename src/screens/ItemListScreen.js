import React, { useState, useMemo } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { medicineDatabase } from '../data/medicineDatabase';

function buildItems() {
  return Object.entries(medicineDatabase).map(([code, name]) => ({ code, name }));
}

function getCategoryColor(index) {
  const colors = ['#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3', '#ede9fe', '#ffedd5'];
  const text   = ['#1d4ed8', '#15803d', '#a16207', '#be185d', '#6d28d9', '#c2410c'];
  const i = index % colors.length;
  return { bg: colors[i], fg: text[i] };
}

function ItemDetailModal({ item, visible, onClose, onMarkConsumed, alreadyConsumed }) {
  if (!item) return null;

  const handleConsume = () => {
    onMarkConsumed(item);
    Alert.alert(
      'Marked as Consumed',
      `${item.name} has been logged.`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.handle} />

          <View style={modal.header}>
            <View style={modal.iconCircle}>
              <Text style={modal.iconText}>💊</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
              <Text style={modal.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={modal.medicineName}>{item.name}</Text>

          <View style={modal.infoRow}>
            <View style={modal.infoBlock}>
              <Text style={modal.infoLabel}>Barcode</Text>
              <Text style={modal.infoValue} numberOfLines={1}>{item.code}</Text>
            </View>
            <View style={[modal.infoBlock, { alignItems: 'flex-end' }]}>
              <Text style={modal.infoLabel}>Status</Text>
              <View style={[modal.statusPill, alreadyConsumed ? modal.statusConsumed : modal.statusAvail]}>
                <Text style={[modal.statusText, { color: alreadyConsumed ? '#15803d' : '#1d4ed8' }]}>
                  {alreadyConsumed ? 'Consumed' : 'Available'}
                </Text>
              </View>
            </View>
          </View>

          <View style={modal.divider} />

          {alreadyConsumed ? (
            <View style={modal.consumedNote}>
              <Text style={modal.consumedNoteIcon}>✓</Text>
              <Text style={modal.consumedNoteText}>Already marked as consumed today</Text>
            </View>
          ) : (
            <TouchableOpacity style={modal.consumeBtn} onPress={handleConsume} activeOpacity={0.85}>
              <Text style={modal.consumeBtnText}>Mark as Consumed</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
            <Text style={modal.cancelBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function ItemListScreen({ onMarkConsumed, consumedItems = [] }) {
  const [query, setQuery]         = useState('');
  const [selected, setSelected]   = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const allItems = useMemo(() => buildItems(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  const consumedCodes = useMemo(
    () => new Set(consumedItems.map((i) => i.code)),
    [consumedItems]
  );

  const openItem = (item) => {
    setSelected(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  const handleMarkConsumed = (item) => {
    const entry = {
      id: `${item.code}-${Date.now()}`,
      label: item.name,
      code: item.code,
      medicineName: item.name,
      consumedAt: new Date().toLocaleTimeString(),
    };
    onMarkConsumed(entry);
  };

  const renderItem = ({ item, index }) => {
    const { bg, fg } = getCategoryColor(index);
    const consumed   = consumedCodes.has(item.code);

    return (
      <TouchableOpacity
        style={[list.card, consumed && list.cardConsumed]}
        onPress={() => openItem(item)}
        activeOpacity={0.75}
      >
        <View style={[list.avatar, { backgroundColor: bg }]}>
          <Text style={[list.avatarText, { color: fg }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={list.cardBody}>
          <Text style={list.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={list.cardCode} numberOfLines={1}>{item.code}</Text>
        </View>

        <View style={list.cardRight}>
          {consumed ? (
            <View style={list.consumedBadge}>
              <Text style={list.consumedBadgeText}>✓ Done</Text>
            </View>
          ) : (
            <Text style={list.chevron}>›</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Search */}
      <View style={screen.searchRow}>
        <View style={screen.searchBox}>
          <Text style={screen.searchIcon}>🔍</Text>
          <TextInput
            style={screen.searchInput}
            placeholder="Search by name or barcode…"
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Stats bar */}
      <View style={screen.statsBar}>
        <Text style={screen.statsText}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {query ? ` for "${query}"` : ''}
        </Text>
        <Text style={screen.statsConsumed}>{consumedCodes.size} consumed</Text>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={screen.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={screen.empty}>
            <Text style={screen.emptyIcon}>🔍</Text>
            <Text style={screen.emptyTitle}>No medicines found</Text>
            <Text style={screen.emptySubtitle}>Try a different name or barcode</Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />

      <ItemDetailModal
        item={selected}
        visible={modalOpen}
        onClose={closeModal}
        onMarkConsumed={handleMarkConsumed}v
        alreadyConsumed={selected ? consumedCodes.has(selected.code) : false}
      />
    </View>
  );
}

const screen = StyleSheet.create({
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  searchBox: {     
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    padding: 0,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsText: { fontSize: 12, color: '#64748b' },
  statsConsumed: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: '#9ca3af' },
});

const list = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 8,
  },
  cardConsumed: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 17, fontWeight: '700' },
  cardBody: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  cardCode: { fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' },
  cardRight: { alignItems: 'center', justifyContent: 'center', minWidth: 48 },
  chevron: { fontSize: 22, color: '#cbd5e1' },
  consumedBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  consumedBadgeText: { fontSize: 11, fontWeight: '600', color: '#15803d' },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 26 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  medicineName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBlock: {},
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
    fontFamily: 'monospace',
    maxWidth: 160,
  },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusAvail: { backgroundColor: '#dbeafe' },
  statusConsumed: { backgroundColor: '#dcfce7' },
  statusText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 },
  consumeBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  consumeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelBtnText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  consumedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  consumedNoteIcon: { fontSize: 18, color: '#16a34a', marginRight: 10 },
  consumedNoteText: { fontSize: 13, color: '#15803d', fontWeight: '500' },
});