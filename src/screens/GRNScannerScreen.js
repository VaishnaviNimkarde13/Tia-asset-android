import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { StatusBar } from 'expo-status-bar';

export function GRNScannerScreen({ navigation }) {
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

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    
    console.log('📱 Barcode Scanned:');
    console.log('  Type:', type);
    console.log('  Data:', data);
    
    setScanned(true);
    setScanData({ type, data });
  };

  const handleUseBarcode = () => {
    if (!scanData) return;
    
    Alert.alert(
      'Barcode Scanned',
      `Barcode: ${scanData.data}\nType: ${scanData.type}\n\nProceed to create GRN?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {
          setScanned(false);
          setScanData(null);
        }},
        { 
          text: 'Create GRN', 
          onPress: () => navigation.replace('CreateGRN', { 
            scannedItem: { 
              barcode: scanData.data, 
              type: scanData.type 
            } 
          })
        },
      ]
    );
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanData(null);
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.center, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Requesting Permission…</Text>
        <Text style={styles.permissionSubtitle}>Please wait while we request camera access.</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={[styles.center, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionSubtitle}>Enable camera permissions in your device settings to scan barcodes for GRN.</Text>
        <TouchableOpacity style={[styles.primaryButton, { width: '100%' }]} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.scanScreen}>
      <StatusBar style="light" />
      <View style={styles.scanTopBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.scanScreenTitle}>Scan Barcode for GRN</Text>
        <View style={{ width: 60 }} />
      </View>
      
      <View style={styles.cameraWrapper}>
        <BarCodeScanner
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeTypes={[
            BarCodeScanner.Constants.BarCodeType.qr,
            BarCodeScanner.Constants.BarCodeType.ean13,
            BarCodeScanner.Constants.BarCodeType.ean8,
            BarCodeScanner.Constants.BarCodeType.code128,
            BarCodeScanner.Constants.BarCodeType.code39,
          ]}
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
              <Text style={styles.scanResultLabel}>Scanned Barcode</Text>
              <Text style={styles.scanResultValue} numberOfLines={2}>{scanData.data}</Text>
              <Text style={styles.scanResultType}>Type: {scanData.type}</Text>
            </View>
            <TouchableOpacity onPress={handleUseBarcode} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Create GRN</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleScanAgain} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Scan Again</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.scanHintBox}>
            <Text style={styles.scanHintText}>Point the camera at a barcode to create a GRN</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scanScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 8,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  scanTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a202c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#90cdf4',
    fontSize: 16,
    fontWeight: '600',
  },
  scanScreenTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanFrame: {
    width: 260,
    height: 180,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#68d391',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanBottomPanel: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scanResultBox: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  scanResultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  scanResultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  scanResultType: {
    fontSize: 13,
    color: '#a0aec0',
  },
  scanHintBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scanHintText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2b6cb0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2b6cb0',
    fontSize: 16,
    fontWeight: '600',
  },
});