import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  PermissionsAndroid,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useOCRStore } from '../../context/store';
import { getMockReceiptItems, parseReceiptText } from '../../utils/ocrParser';
import ScanOverlay from '../../components/ScanOverlay';
import PremiumButton from '../../components/PremiumButton';
import { useHaptic } from '../../hooks/useHaptic';

const { width, height } = Dimensions.get('window');

export default function ScanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { medium, success: hapticSuccess } = useHaptic();
  const { setScannedItems, setIsScanning, setScanProgress, clearScan } = useOCRStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateOCR = async (imageUri) => {
    setIsProcessing(true);
    setIsScanning(true);
    medium();

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 80));
      setProgress(i);
      setScanProgress(i);
    }

    hapticSuccess();

    const { items, total } = getMockReceiptItems();
    setScannedItems(items, total);
    setIsScanning(false);
    setIsProcessing(false);

    navigation.navigate('ScanResults');
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'CashCraft needs access to your camera to scan receipts.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission needed', 'Camera access is required to scan receipts.');
      return;
    }
    launchCamera(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (!response.didCancel && !response.errorCode && response.assets?.[0]) {
          simulateOCR(response.assets[0].uri);
        }
      }
    );
  };

  const handleGallery = async () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (!response.didCancel && !response.errorCode && response.assets?.[0]) {
          simulateOCR(response.assets[0].uri);
        }
      }
    );
  };

  const handleDemo = () => {
    simulateOCR(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.scanArea}>
        <ScanOverlay isScanning={isProcessing} />

        {isProcessing ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Scanning receipt... {progress}%</Text>
          </View>
        ) : (
          <View style={styles.scanHint}>
            <Feather name="file-text" size={32} color={Colors.accent} style={{ opacity: 0.6 }} />
            <Text style={styles.scanHintText}>Position receipt within frame</Text>
          </View>
        )}
      </View>

      {!isProcessing && (
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.actions, { paddingBottom: insets.bottom + Spacing.xl }]}
        >
          <View style={styles.primaryActions}>
            <Pressable style={styles.actionBtn} onPress={handleCamera}>
              <LinearGradient
                colors={['#34D399', '#10B981']}
                style={styles.actionIcon}
              >
                <Feather name="camera" size={22} color="#050505" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Camera</Text>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={handleGallery}>
              <View style={styles.actionIconSecondary}>
                <Feather name="image" size={22} color={Colors.accent} />
              </View>
              <Text style={styles.actionLabel}>Gallery</Text>
            </Pressable>
          </View>

          <Pressable style={styles.demoBtn} onPress={handleDemo}>
            <Feather name="zap" size={14} color={Colors.accent} />
            <Text style={styles.demoBtnText}>Demo scan (mock data)</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
    position: 'relative',
  },
  scanHint: {
    alignItems: 'center',
    gap: Spacing.md,
    zIndex: 20,
  },
  scanHintText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  progressContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    width: '60%',
    zIndex: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actions: {
    backgroundColor: Colors.bg,
    padding: Spacing.xl,
    gap: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  primaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtn: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionIconSecondary: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: `${Colors.accent}40`,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  demoBtnText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500',
  },
});
