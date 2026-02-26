import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { parsePayLink } from '@/lib/url/pay-link';

export function QRScannerContainer() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    setError(null);

    const parsed = parsePayLink(data);

    if (parsed) {
      router.replace({
        pathname: '/(app)/pay',
        params: {
          store: parsed.store,
          amount: parsed.amount,
          source: 'qr',
        },
      });
    } else {
      setError('Invalid QR code. Please scan a valid CocoPay payment QR.');
      setTimeout(() => {
        setScanned(false);
        setError(null);
      }, 2000);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Spinner size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text variant="title" className="mb-4 text-center">
            Camera Permission Required
          </Text>
          <Text variant="caption" className="mb-6 text-center">
            CocoPay needs camera access to scan QR codes for payments.
          </Text>
          {permission.canAskAgain ? (
            <Button onPress={requestPermission} size="lg" className="w-full">
              <Text>Grant Permission</Text>
            </Button>
          ) : (
            <Text variant="small" className="text-center text-muted-foreground">
              Please enable camera access in your device settings.
            </Text>
          )}
          <Button variant="ghost" onPress={handleClose} className="mt-4 w-full">
            <Text>Cancel</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text className="mb-4 text-center text-white">
            Point your camera at a CocoPay QR code
          </Text>
          {error && <Text className="mb-4 text-center text-destructive">{error}</Text>}
          <Button variant="secondary" onPress={handleClose} size="lg" className="w-48">
            <Text>Cancel</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

const SCAN_AREA_SIZE = 250;
const CORNER_SIZE = 30;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topOverlay: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideOverlay: {
    flex: 1,
    height: SCAN_AREA_SIZE,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
  },
  bottomOverlay: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 32,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#BAFF29',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
});
