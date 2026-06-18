import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import { itemDatabase } from "../data/grnitemDatabase";
import { Ionicons } from "@expo/vector-icons";

export function GRNDashboard({ navigation, grnList = [] }) {
  const [activeTab, setActiveTab] = useState("activity");
  const [searchQuery, setSearchQuery] = useState("");
  const [scannedItems, setScannedItems] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredGRNs = grnList.filter((grn) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (grn.grnNumber && grn.grnNumber.toLowerCase().includes(searchTerm)) ||
      (grn.supplier && grn.supplier.toLowerCase().includes(searchTerm)) ||
      (grn.lineItems &&
        grn.lineItems.some(
          (item) => item.item && item.item.toLowerCase().includes(searchTerm),
        ))
    );
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>G</Text>
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.welcomeSmall}>Welcome back,</Text>
          <Text style={styles.welcomeName}>Store Manager</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutIconBtn}
          onPress={() =>
            Alert.alert("Logout", "Are you sure you want to logout?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                style: "destructive",
                onPress: () => navigation.replace("Login"),
              },
            ])
          }
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={22} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "activity" && styles.tabActive]}
          onPress={() => setActiveTab("activity")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "activity" && styles.tabTextActive,
            ]}
          >
            Activity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "items" && styles.tabActive]}
          onPress={() => setActiveTab("items")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "items" && styles.tabTextActive,
            ]}
          >
            Item List
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "activity" ? (
          <ActivityTab
            navigation={navigation}
            grnList={grnList}
            filteredGRNs={filteredGRNs}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            formatDate={formatDate}
          />
        ) : (
          <ItemListTab
            navigation={navigation}
            scannedItems={scannedItems}
            setScannedItems={setScannedItems}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Activity Tab ─────────────────────────────────────────────
function ActivityTab({
  navigation,
  grnList,
  filteredGRNs,
  searchQuery,
  setSearchQuery,
  formatDate,
}) {
  return (
    <FlatList
      data={filteredGRNs}
      keyExtractor={(_, idx) => String(idx)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.body}
      ListHeaderComponent={
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search GRN number, supplier, item..."
              placeholderTextColor="#a0aec0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Action Cards */}
          <View style={styles.cardRow}>
            <TouchableOpacity
              style={[styles.card, styles.cardBlue, { flex: 1 }]}
              onPress={() => navigation.navigate("GRNScanner")}
              activeOpacity={0.85}
            >
              <Text style={styles.cardIcon}>📷</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Scan Barcode</Text>
                <Text style={styles.cardSub}>Scan to start a GRN</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, styles.cardGreen, { flex: 1 }]}
              onPress={() =>
                navigation.navigate("CreateGRN", { scannedItem: null })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.cardIcon}>📝</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Create GRN</Text>
                <Text style={styles.cardSub}>Enter manually</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Recent GRNs</Text>

          {filteredGRNs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No matching GRNs found" : "No GRNs yet"}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : "Create or scan a GRN to get started."}
              </Text>
            </View>
          )}
        </>
      }
      renderItem={({ item: grn, index: idx }) => {
        const grnNumber =
          grn.grnNumber || `GRN-${String(idx + 1).padStart(3, "0")}`;

        if (!grn.lineItems || grn.lineItems.length === 0) {
          return (
            <View style={styles.grnRow}>
              <View style={styles.grnLeft}>
                <View style={styles.grnTagBadge}>
                  <Text style={styles.grnTagText}>{grnNumber}</Text>
                </View>
                <Text style={styles.grnNumber}>{grn.supplier || "—"}</Text>
                <Text style={styles.grnSupplier}>No items recorded</Text>
              </View>
              <View style={styles.grnRight}>
                <Text style={styles.grnDate}>
                  {formatDate(grn.receiptDate)}
                </Text>
              </View>
            </View>
          );
        }

        return (
          <View>
            {grn.lineItems.map((line, lineIdx) => (
              <View
                key={`${idx}-${lineIdx}`}
               style={styles.grnRow}

              >
                <View style={styles.grnLeft}>
                  <View style={styles.grnTagBadge}>
                    <Text style={styles.grnTagText}>{grnNumber}</Text>
                  </View>
                  <Text style={styles.grnNumber}>{line.item}</Text>
                  <Text style={styles.grnSupplier}>{grn.supplier || "—"}</Text>
                </View>
                <View style={styles.grnRight}>
                  <Text style={styles.grnDate}>
                    {formatDate(grn.receiptDate)}
                  </Text>
                  {line.unitCost ? (
                    <Text style={styles.grnTotal}>
                      $
                      {(
                        parseFloat(line.rcvQty || 0) *
                        parseFloat(line.unitCost || 0)
                      ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        );
      }}
      ListFooterComponent={
        filteredGRNs.length > 0 && searchQuery.length > 0 ? (
          <Text style={styles.resultCount}>
            Found {filteredGRNs.length} GRN
            {filteredGRNs.length !== 1 ? "s" : ""}
          </Text>
        ) : null
      }
    />
  );
}

// ── Item List Tab ─────────────────────────────────────────────
function ItemListTab({ navigation, scannedItems, setScannedItems }) {
  const [itemSearch, setItemSearch] = useState("");

  const handleBarcodeScan = (barcode) => {
    if (!barcode) return;
    const found = itemDatabase[barcode];
    const name = found ? found.name : `Unknown Item (${barcode})`;
    setScannedItems((prev) => {
      const exists = prev.find((i) => i.barcode === barcode);
      if (exists) return prev;
      return [{ barcode, name }, ...prev];
    });
  };

  const allItems = [
    ...scannedItems,
    ...Object.entries(itemDatabase)
      .map(([barcode, details]) => ({
        barcode,
        name: details.name,
        quantity: details.quantity,
        location: details.location,
      }))
      .filter((i) => !scannedItems.find((s) => s.barcode === i.barcode)),
  ];

  const filteredItems = allItems.filter(
    (i) =>
      i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      i.barcode.includes(itemSearch),
  );

  return (
    <FlatList
      data={filteredItems}
      keyExtractor={(item) => item.barcode}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.body}
      ListHeaderComponent={
        <>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search item name or barcode..."
              placeholderTextColor="#a0aec0"
              value={itemSearch}
              onChangeText={setItemSearch}
            />
            {itemSearch.length > 0 && (
              <TouchableOpacity
                onPress={() => setItemSearch("")}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.card, styles.cardBlue, { marginBottom: 16 }]}
            onPress={() =>
              navigation.navigate("GRNScanner", {
                mode: "itemList",
                onScanComplete: handleBarcodeScan,
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.cardIcon}>📷</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Scan Barcode</Text>
              <Text style={styles.cardSub}>Scan to add item to list</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>All Items</Text>
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>
            {itemSearch ? "No matching items" : "No items yet"}
          </Text>
          <Text style={styles.emptyText}>
            {itemSearch
              ? `No results for "${itemSearch}"`
              : "Scan a barcode to add items."}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.itemRow}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <View style={styles.itemDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemBarcode}>{item.barcode}</Text>
              {item.quantity !== undefined && (
                <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                  <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemMeta}>{item.location}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f0f4f8" },

  // Header
  header: {
    backgroundColor: "#2b6cb0",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  logoutIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeSmall: { color: "#bee3f8", fontSize: 13 },
  welcomeName: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#2b6cb0", fontSize: 20, fontWeight: "800" },

  // Tabs
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 0,
    backgroundColor: "#e8edf2",
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 9 },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: "500", color: "#94a3b8" },
  tabTextActive: { color: "#1e293b", fontWeight: "700" },

  // Body
  body: { padding: 16, paddingTop: 14, paddingBottom: 32 },

  // Action cards
  card: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardBlue: {
    backgroundColor: "#ebf8ff",
    borderLeftWidth: 4,
    borderLeftColor: "#3182ce",
  },
  cardGreen: {
    backgroundColor: "#f0fff4",
    borderLeftWidth: 4,
    borderLeftColor: "#38a169",
  },
  cardIcon: { fontSize: 26, marginRight: 12 },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 2,
  },
  cardSub: { fontSize: 12, color: "#718096" },
  cardRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: "#2d3748" },
  clearButton: { padding: 6 },
  clearButtonText: { fontSize: 13, color: "#9ca3af", fontWeight: "700" },
  resultCount: {
    fontSize: 11,
    color: "#a0aec0",
    marginTop: 8,
    textAlign: "center",
  },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 44 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.4 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#a0aec0",
    textAlign: "center",
    lineHeight: 20,
  },

  // GRN item cards
  grnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#2b6cb0",
  },
  grnLeft: { flex: 1, marginRight: 12 },
  grnRight: { alignItems: "flex-end", flexShrink: 0 },

  // GRN number badge
  grnTagBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  grnTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1d4ed8",
    letterSpacing: 0.3,
  },

  grnNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a202c",
    marginBottom: 3,
  },
  grnSupplier: { fontSize: 12, color: "#718096", marginBottom: 6 },

  // Meta row (qty, lot, expiry chips)
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  metaChip: {
    fontSize: 11,
    color: "#374151",
    backgroundColor: "#f1f5f9",
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: "hidden",
  },

  grnDate: { fontSize: 11, color: "#9ca3af", marginBottom: 6 },
  grnTotal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 4,
  },

  conditionBadge: {
    backgroundColor: "#fef9c3",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    maxWidth: 90,
  },
  conditionText: {
    fontSize: 9,
    color: "#92400e",
    fontWeight: "600",
  },

  // Item list tab
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2b6cb0",
    marginRight: 12,
  },
  itemName: { fontSize: 14, fontWeight: "600", color: "#1a202c" },
  itemBarcode: { fontSize: 11, color: "#a0aec0", marginTop: 2 },
  itemMeta: { fontSize: 11, color: "#718096", marginTop: 1 },
});
