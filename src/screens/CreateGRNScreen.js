import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// ← Moved OUTSIDE so it never re-creates on re-render
const Field = ({
  label,
  required,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  numberOfLines,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>
      <Text style={styles.labelIcon}>{icon}</Text> {label}{" "}
      {required && <Text style={styles.requiredStar}>*</Text>}
    </Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#a0aec0"
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
  </View>
);

export function CreateGRNScreen({ navigation, route, addGRN }) {
  const scannedItem = route?.params?.scannedItem;
  const linkedPO = route?.params?.linkedPO;

  const [form, setForm] = useState({
    grnNumber: "",
    linkedPO: linkedPO?.id || "",
    supplier: linkedPO?.supplier || "",
    receiptDate: "",
    receivedBy: "",
    deliveryNote: "",
    condition: "",
    location: "",
    remarks: "",
    shipmentDate: "",
    supplierInvoice: "",
    tradingPartnerLicense: "",
    tsConfirmed: false,
  });

  const [lines, setLines] = useState([
    {
      id: Date.now(),
      item: "",
      itemCode: "",
      ndc: "",
      category: "",
      supplier: "",
      unitCost: "",
      uom: "",
      poQty: "",
      rcvQty: "1",
      condition: "",
      lotNo: "",
      expiry: "",
    },
  ]);

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: Date.now(),
        item: "",
        itemCode: "",
        ndc: "",
        category: "",
        supplier: "",
        unitCost: "",
        uom: "",
        poQty: "",
        rcvQty: "1",
        condition: "",
        lotNo: "",
        expiry: "",
      },
    ]);
  };

  const removeLine = (id) => {
    if (lines.length > 1) {
      setLines((prev) => prev.filter((line) => line.id !== id));
    }
  };

  const updateLine = (id, key, val) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, [key]: val } : line))
    );
  };

  const filledLines = lines.filter((l) => l.item.trim());

  const linesWithMissingRequired = lines.filter(
    (line) => line.item && (!line.lotNo?.trim() || !line.expiry?.trim())
  );

  const isSubmitDisabled = () => {
    return (
      filledLines.length === 0 ||        // ← at least one item required
      linesWithMissingRequired.length > 0 ||
      !form.linkedPO ||
      !form.location ||
      !form.tsConfirmed
    );
  };

  const calcTotal = () => {
    return lines
      .filter((l) => l.item)
      .reduce(
        (sum, l) =>
          sum + (parseFloat(l.rcvQty) || 0) * (parseFloat(l.unitCost) || 0),
        0
      );
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);

    if (isSubmitDisabled()) {
      let errorMsg = "Please fix the following:\n";
      if (filledLines.length === 0) errorMsg += "• At least one item is required\n";  // ← new
      if (!form.linkedPO) errorMsg += "• Linked PO is required\n";
      if (!form.location) errorMsg += "• Location is required\n";
      if (!form.tsConfirmed)
        errorMsg += "• Transaction Statement must be confirmed\n";
      if (linesWithMissingRequired.length > 0)
        errorMsg += `• ${linesWithMissingRequired.length} item(s) missing Lot # or Expiry\n`;
      Alert.alert("Missing Information", errorMsg);
      return;
    }

    const totalValue = calcTotal();

    const newGRN = {
      grnNumber: form.grnNumber,
      supplier: form.supplier,
      receiptDate: form.receiptDate,
      location: form.location,
      itemCount: filledLines.length,
      totalValue: totalValue,
    };
    addGRN(newGRN);

    Alert.alert(
      "GRN Created",
      `GRN ${form.grnNumber || "N/A"}\nSupplier: ${form.supplier}\nLocation: ${form.location}\nItems: ${filledLines.length}\nTotal Value: $${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      [{ text: "OK", onPress: () => navigation.navigate("GRNDashboard") }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create GRN</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Scanned badge */}
          {scannedItem && (
            <View style={styles.scannedBadge}>
              <Text style={styles.scannedIcon}>✅</Text>
              <Text style={styles.scannedText}>
                Scanned: {scannedItem.barcode}
              </Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            <Field
              label="GRN Number"
              icon="📄"
              value={form.grnNumber}
              onChangeText={(v) => setField("grnNumber", v)}
              placeholder="Enter GRN number (e.g., GRN-2024-001)"
            />
            <Field
              label="Linked PO"
              required
              icon="📦"
              value={form.linkedPO}
              onChangeText={(v) => setField("linkedPO", v)}
              placeholder="Enter PO number (e.g., PO-2024-001)"
            />
            <Field
              label="Supplier"
              required
              icon="🏭"
              value={form.supplier}
              onChangeText={(v) => setField("supplier", v)}
              placeholder="Enter supplier name"
            />
            <Field
              label="Receipt Date"
              required
              icon="📅"
              value={form.receiptDate}
              onChangeText={(v) => setField("receiptDate", v)}
              placeholder="YYYY-MM-DD"
            />
            <Field
              label="Received By"
              icon="👤"
              value={form.receivedBy}
              onChangeText={(v) => setField("receivedBy", v)}
              placeholder="Enter name"
            />
            <Field
              label="Delivery Note #"
              icon="📋"
              value={form.deliveryNote}
              onChangeText={(v) => setField("deliveryNote", v)}
              placeholder="e.g., DN-2026-0482"
            />
            <Field
              label="Store To (Location)"
              required
              icon="📍"
              value={form.location}
              onChangeText={(v) => setField("location", v)}
              placeholder="Enter warehouse/location"
            />

            {/* Items Section */}
            <View style={styles.itemsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📦 Items Received</Text>
                <TouchableOpacity style={styles.addButton} onPress={addLine}>
                  <Text style={styles.addButtonText}>+ Add Item</Text>
                </TouchableOpacity>
              </View>

              {/* ← show error under section header if no items filled */}
              {submitAttempted && filledLines.length === 0 && (
                <Text style={styles.errorText}>At least one item is required</Text>
              )}

              {lines.map((line, idx) => {
                const missingLot =
                  submitAttempted && line.item && !line.lotNo?.trim();
                const missingExpiry =
                  submitAttempted && line.item && !line.expiry?.trim();

                return (
                  <View key={line.id} style={styles.lineCard}>
                    <Text style={styles.lineTitle}>Item {idx + 1}</Text>

                    <Field
                      label="Item"
                      required
                      icon="💊"
                      value={line.item}
                      onChangeText={(v) => updateLine(line.id, "item", v)}
                      placeholder="Enter item name"
                    />

                    <View style={styles.row}>
                      <View style={styles.rowHalf}>
                        <Field
                          label="PO Qty"
                          icon="📊"
                          value={line.poQty}
                          onChangeText={(v) => updateLine(line.id, "poQty", v)}
                          placeholder="0"
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.rowHalf}>
                        <Field
                          label="Received Qty"
                          required
                          icon="✅"
                          value={line.rcvQty}
                          onChangeText={(v) => updateLine(line.id, "rcvQty", v)}
                          placeholder="0"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.rowHalf}>
                        <Field
                          label="Lot #"
                          required
                          icon="🔢"
                          value={line.lotNo}
                          onChangeText={(v) => updateLine(line.id, "lotNo", v)}
                          placeholder="Enter lot number"
                        />
                        {missingLot && (
                          <Text style={styles.errorText}>Lot # required</Text>
                        )}
                      </View>
                      <View style={styles.rowHalf}>
                        <Field
                          label="Expiry Date"
                          required
                          icon="📅"
                          value={line.expiry}
                          onChangeText={(v) => updateLine(line.id, "expiry", v)}
                          placeholder="YYYY-MM-DD"
                        />
                        {missingExpiry && (
                          <Text style={styles.errorText}>Expiry required</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.rowHalf}>
                        <Field
                          label="Unit Cost"
                          icon="💰"
                          value={line.unitCost}
                          onChangeText={(v) => updateLine(line.id, "unitCost", v)}
                          placeholder="$0.00"
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.rowHalf}>
                        <Field
                          label="UOM"
                          icon="📏"
                          value={line.uom}
                          onChangeText={(v) => updateLine(line.id, "uom", v)}
                          placeholder="EA/Box/Strip"
                        />
                      </View>
                    </View>

                    <Field
                      label="Condition"
                      icon="⚠️"
                      value={line.condition}
                      onChangeText={(v) => updateLine(line.id, "condition", v)}
                      placeholder="Good — No Issues / Damaged / Expiry"
                    />

                    {lines.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeLineButton}
                        onPress={() => removeLine(line.id)}
                      >
                        <Text style={styles.removeLineText}>Remove Item</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Total Value */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Received Value:</Text>
              <Text style={styles.totalValue}>
                ${calcTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.divider} />

           
            <Field
              label="Remarks / Discrepancy Notes"
              icon="💬"
              value={form.remarks}
              onChangeText={(v) => setField("remarks", v)}
              placeholder="Note short shipments, damage, cold-chain issues..."
              multiline
              numberOfLines={3}
            />

            {/* DSCSA Section */}
            <View style={styles.dscsaSection}>
              <Text style={styles.dscsaTitle}>
                🔒 DSCSA Transaction Information
              </Text>
              <Field
                label="Shipment Date"
                icon="🚚"
                value={form.shipmentDate}
                onChangeText={(v) => setField("shipmentDate", v)}
                placeholder="YYYY-MM-DD"
              />
              <Field
                label="Supplier Invoice No."
                icon="📄"
                value={form.supplierInvoice}
                onChangeText={(v) => setField("supplierInvoice", v)}
                placeholder="e.g., INV-2026-0482"
              />
              <Field
                label="Trading Partner License / DEA No."
                icon="🔒"
                value={form.tradingPartnerLicense}
                onChangeText={(v) => setField("tradingPartnerLicense", v)}
                placeholder="e.g., DEA Lic. BA1234567"
              />

              <View style={styles.confirmationBox}>
                <View style={styles.checkboxRow}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setField("tsConfirmed", !form.tsConfirmed)}
                  >
                    <Text style={styles.checkboxIcon}>
                      {form.tsConfirmed ? "☑" : "☐"}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.confirmationText}>
                    I confirm this Transaction Statement (TS): The entity
                    transferring ownership is an authorised trading partner...
                  </Text>
                </View>
                {submitAttempted && !form.tsConfirmed && (
                  <Text style={styles.errorText}>
                    Must confirm Transaction Statement
                  </Text>
                )}
              </View>
            </View>

            {submitAttempted && linesWithMissingRequired.length > 0 && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxTitle}>
                  Please fix the following:
                </Text>
                <Text style={styles.errorBoxText}>
                  • {linesWithMissingRequired.length} item(s) missing Lot # or Expiry
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.9}
          >
            <Text style={styles.submitText}>✓ Submit GRN</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f0f4f8" },
  header: {
    backgroundColor: "#2b6cb0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 16 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backText: { color: "#fff", fontSize: 24, fontWeight: "600" },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  body: { padding: 16, paddingBottom: 40 },
  scannedBadge: {
    backgroundColor: "#c6f6d5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9ae6b4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scannedIcon: { fontSize: 18, marginRight: 8 },
  scannedText: { color: "#276749", fontWeight: "700", fontSize: 14, flex: 1 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  fieldContainer: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4a5568",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  labelIcon: { fontSize: 14, marginRight: 4 },
  requiredStar: { color: "#ef4444" },
  input: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#2d3748",
  },
  textArea: { height: 90, textAlignVertical: "top", paddingTop: 12 },
  row: { flexDirection: "row", gap: 12 },
  rowHalf: { flex: 1 },
  itemsSection: { marginTop: 8, marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#2563eb" },
  addButton: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: { color: "#2563eb", fontSize: 12, fontWeight: "600" },
  lineCard: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  lineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 12,
  },
  removeLineButton: { marginTop: 12, alignSelf: "flex-end" },
  removeLineText: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalLabel: { fontSize: 13, color: "#6b7280", marginRight: 8 },
  totalValue: { fontSize: 20, fontWeight: "800", color: "#111827" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 16 },
  dscsaSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  dscsaTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 12,
  },
  confirmationBox: {
    backgroundColor: "#f5f3ff",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { padding: 2 },
  checkboxIcon: { fontSize: 20, color: "#6366f1" },
  confirmationText: { fontSize: 12, color: "#374151", flex: 1, lineHeight: 18 },
  errorText: { fontSize: 11, color: "#ef4444", marginTop: 4 },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: 6,
  },
  errorBoxText: { fontSize: 12, color: "#991b1b", marginBottom: 2 },
  submitBtn: {
    backgroundColor: "#10b981",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});