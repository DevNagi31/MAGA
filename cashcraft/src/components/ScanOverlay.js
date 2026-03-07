import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');
const FRAME_SIZE = width * 0.78;
const CORNER = 24;

const ScanOverlay = ({ isScanning = false }) => {
  const scanY = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      scanY.value = withRepeat(
        withTiming(FRAME_SIZE - 4, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      scanY.value = 0;
    }
  }, [isScanning]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value }],
  }));

  return (
    <View style={styles.overlay}>
      {/* Dark mask */}
      <View style={styles.maskTop} />
      <View style={styles.middleRow}>
        <View style={styles.maskSide} />
        {/* Scan frame */}
        <View style={styles.frame}>
          {/* Corners */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Scan line */}
          {isScanning && (
            <Animated.View style={[styles.scanLineContainer, scanLineStyle]}>
              <LinearGradient
                colors={['transparent', Colors.accent, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scanLine}
              />
            </Animated.View>
          )}
        </View>
        <View style={styles.maskSide} />
      </View>
      <View style={styles.maskBottom} />
    </View>
  );
};

const MASK_COLOR = 'rgba(5, 5, 5, 0.75)';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  maskTop: {
    width: '100%',
    flex: 1,
    backgroundColor: MASK_COLOR,
  },
  middleRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  maskSide: {
    flex: 1,
    backgroundColor: MASK_COLOR,
  },
  maskBottom: {
    width: '100%',
    flex: 1,
    backgroundColor: MASK_COLOR,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: Colors.accent,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  scanLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
  },
  scanLine: {
    flex: 1,
    height: 2,
  },
});

export default ScanOverlay;
