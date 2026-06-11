import 'react-native-gesture-handler';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';

const Stack = createNativeStackNavigator();
const validUser = { username: 'nurse', password: '1234' };
const { width } = Dimensions.get('window');
const ANDROID_TOP = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

// Medicine Database - Map barcodes to medicine names
const medicineDatabase = {
  '5901234123457': 'Aspirin 500mg',
  '4006381333931': 'Ibuprofen 400mg',
  '8718951051557': 'Paracetamol 500mg',
  '5000123456789': 'Amoxicillin 250mg',
  '5011456999999': 'Metformin 500mg',
  '9780134685991': 'Omeprazole 20mg',
  '1234567890128': 'Lisinopril 10mg',
  '9876543210987': 'Atorvastatin 20mg',
  '5555555555557': 'Test Medicine A',
  '6666666666660': 'Test Medicine B',
};

function BarcodeIcon() {
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

function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username.trim() === validUser.username && password === validUser.password) {
      setError('');
      navigation.replace('Dashboard', { user: username.trim() });
      return;
    }
    setError('Invalid username or password.');
  };

  return (
    <SafeAreaView style={styles.loginScreen}>
      <StatusBar style="dark" />
      <View style={styles.loginCard}>
        <Text style={styles.brandText}>Tia-Asset</Text>
        <Text style={styles.cardTitle}>Welcome Back</Text>
        <Text style={styles.cardSubtitle}>Sign in to continue to the nurse portal.</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput value={username} onChangeText={setUsername} style={styles.input} placeholder="nurse" placeholderTextColor="#94a3b8" autoCapitalize="none" autoCorrect={false} />
        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} style={styles.input} placeholder="••••" placeholderTextColor="#94a3b8" secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity onPress={handleLogin} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>Demo — username: nurse · password: 1234</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DashboardScreen({ navigation, route, consumedItems }) {
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

function ScannerScreen({ navigation, onMarkConsumed }) {
  const [scanned, setScanned] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Barcode scanner permission error:', error);
        setHasPermission(false);
      }
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={[styles.screenWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Requesting Permission…</Text>
        <Text style={styles.permissionSubtitle}>Please wait while we request camera access.</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={[styles.screenWrapper, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionSubtitle}>Enable camera permissions in your device settings to scan barcodes.</Text>
        <TouchableOpacity style={[styles.primaryButton, { width: '100%' }]} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    console.log('📱 Barcode Scanned:');
    console.log('  Type:', type);
    console.log('  Data:', data);
    
    // Look up medicine name from database
    const medicineName = medicineDatabase[data] || 'Unknown Medicine';
    console.log('  Medicine Name:', medicineName);
    
    setScanned(true);
    setScanData({ type, data, medicineName });
  };

  const handleMarkConsumed = () => {
    if (!scanData) return;
    const item = {
      id: `${scanData.data}-${Date.now()}`,
      label: scanData.medicineName || 'Scanned item',
      code: scanData.data,
      type: scanData.type,
      medicineName: scanData.medicineName,
      consumedAt: new Date().toLocaleTimeString(),
    };
    onMarkConsumed(item);
    Alert.alert('Marked Consumed', `${scanData.medicineName}\nBarcode: ${scanData.data}`, [
      { text: 'Done', onPress: () => navigation.goBack() },
      { text: 'Scan Again', onPress: () => { setScanData(null); setScanned(false); } },
    ]);
  };

  return (
    <View style={styles.scanScreen}>
      <StatusBar style="light" />
      <View style={styles.scanTopBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.scanScreenTitle}>Scan Barcode</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.cameraWrapper}>
        <BarCodeScanner
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr, BarCodeScanner.Constants.BarCodeType.ean13]}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>
      </View>
      <View style={styles.scanBottomPanel}>
        {scanData ? (
          <>
            <View style={styles.scanResultBox}>
              <Text style={styles.scanResultLabel}>Medicine Name</Text>
              <Text style={styles.scanResultValue} numberOfLines={2}>{scanData.medicineName}</Text>
              <Text style={styles.scanResultType}>Barcode: {scanData.data}</Text>
              <Text style={styles.scanResultType}>Type: {scanData.type}</Text>
            </View>
            <TouchableOpacity onPress={handleMarkConsumed} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Mark as Consumed</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setScanned(false); setScanData(null); }} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Scan Again</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.scanHintBox}>
            <Text style={styles.scanHintText}>Point the camera at a barcode or QR code</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function App() {
  const [consumedItems, setConsumedItems] = useState([]);
  const addConsumedItem = (item) => setConsumedItems((prev) => [item, ...prev]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Dashboard">
            {(props) => <DashboardScreen {...props} consumedItems={consumedItems} />}
          </Stack.Screen>
          <Stack.Screen name="Scanner">
            {(props) => <ScannerScreen {...props} onMarkConsumed={addConsumedItem} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loginScreen: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', paddingHorizontal: 24 },
  loginCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 28, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 20, elevation: 5 },
  brandText: { fontSize: 15, fontWeight: '800', color: '#2563eb', letterSpacing: 0.5, marginBottom: 20 },
  cardTitle: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { height: 50, backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, color: '#0f172a', fontSize: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  error: { color: '#dc2626', fontSize: 13, marginBottom: 10 },
  hintBox: { marginTop: 14, backgroundColor: '#eff6ff', padding: 12, borderRadius: 12, alignItems: 'center' },
  hintText: { color: '#1d4ed8', fontSize: 12, fontWeight: '500' },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 6, shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#f1f5f9', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  secondaryButtonText: { color: '#374151', fontSize: 15, fontWeight: '600' },
  screenWrapper: { flex: 1, backgroundColor: '#f8fafc', paddingTop: ANDROID_TOP },
  screenContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  dashGreeting: { fontSize: 13, color: '#94a3b8', fontWeight: '500', marginBottom: 2 },
  dashName: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scanCard: { backgroundColor: '#1e3a8a', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#1e3a8a', shadowOpacity: 0.35, shadowRadius: 16, elevation: 6 },
  scanCardIconBox: { width: 56, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 14, paddingHorizontal: 6 },
  scanCardTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  scanCardSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  scanCardArrow: { color: 'rgba(255,255,255,0.4)', fontSize: 30, marginLeft: 8, lineHeight: 34 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 14 },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 42, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#9ca3af' },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  historyDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e', marginRight: 12, flexShrink: 0 },
  historyItemCode: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 3 },
  historyItemMeta: { fontSize: 12, color: '#9ca3af' },
  historyBadge: { backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, flexShrink: 0 },
  historyBadgeText: { color: '#16a34a', fontSize: 11, fontWeight: '700' },
  scanScreen: { flex: 1, backgroundColor: '#000', paddingTop: ANDROID_TOP },
  scanTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#000' },
  backButton: { width: 60 },
  backButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  scanScreenTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  cameraWrapper: { width: '100%', height: width, position: 'relative' },
  scanOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 220, height: 220, position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#2563eb', borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  scanBottomPanel: { flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 22 },
  scanHintBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanHintText: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22 },
  scanResultBox: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  scanResultLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  scanResultValue: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  scanResultType: { fontSize: 12, color: '#64748b' },
  permissionIcon: { fontSize: 52, marginBottom: 16, textAlign: 'center' },
  permissionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
  permissionSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
});