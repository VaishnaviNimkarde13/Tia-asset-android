import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { StatusBar } from 'expo-status-bar';
import { medicineDatabase } from '../data/medicineDatabase';
import { styles } from '../constants/styles';

export function ScannerScreen({ navigation, onMarkConsumed }) {
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
