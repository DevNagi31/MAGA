import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Spacing, Radius } from '../../constants/theme';
import { useOCRStore } from '../../context/store';
import { getMockReceiptItems } from '../../utils/ocrParser';
import { runVisionOCR } from '../../utils/visionOCR';
import ScanOverlay from '../../components/ScanOverlay';
import PremiumButton from '../../components/PremiumButton';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

const { width, height } = Dimensions.get('window');

export default function ScanScreen({ navigation }) {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const { medium, success: hapticSuccess } = useHaptic();
  const { setScannedItems, setIsScanning, setScanProgress, clearScan } = useOCRStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const runOCR = async (base64Image) => {
    setIsProcessing(true);
    setIsScanning(true);
    medium();

    // Animate progress while waiting for API
    let tick = 0;
    const progressInterval = setInterval(() => {
      tick = Math.min(tick + 8, 90); // Go to 90% max, jump to 100 on complete
      setProgress(tick);
      setScanProgress(tick);
    }, 150);

    try {
      let items, total;

      if (base64Image) {
        // Real OCR via Google Vision
        const parsed = await runVisionOCR(base64Image);
        items = parsed.items;
        total = parsed.total ?? parsed.items.reduce((s, i) => s + i.amount, 0);
      } else {
        // Demo mode — mock data
        await new Promise((r) => setTimeout(r, 1200));
        ({ items, total } = getMockReceiptItems());
      }

      clearInterval(progressInterval);
      setProgress(100);
      setScanProgress(100);
      hapticSuccess();

      setScannedItems(items, total);
    } catch (err) {
      clearInterval(progressInterval);
      // Fall back to mock data with an error notice
      const { items, total } = getMockReceiptItems();
      setScannedItems(items, total);
      Alert.alert(
        'OCR failed',
        err.message || 'Could not read the receipt. Showing demo data instead.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsScanning(false);
      setIsProcessing(false);
      navigation.navigate('ScanResults');
    }
  };

  const handleCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      });
      if (!result.didCancel && !result.errorCode) {
        runOCR(result.assets[0].base64);
      } else if (result.errorCode === 'permission') {
        Alert.alert('Permission needed', 'Camera access is required to scan receipts.');
      }
    } catch (e) {
      Alert.alert(
        'Camera unavailable',
        'Camera is not available on the simulator. Use Gallery or Demo scan instead.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      });
      if (!result.didCancel && !result.errorCode) {
        runOCR(result.assets[0].base64);
      } else if (result.errorCode === 'permission') {
        Alert.alert('Permission needed', 'Photo library access is required to pick a receipt.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open photo library. Try the Demo scan instead.');
    }
  };

  const handleDemo = () => {
    runOCR(null);
  };

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Scan Frame Illustration */}
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

      {/* Actions */}
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
