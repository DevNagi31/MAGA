import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors, Radius } from '../constants/theme';

const ProgressBar = ({
  progress = 0, // 0 to 1
  height = 6,
  backgroundColor = Colors.border,
  style,
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 1), {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animatedProgress.value,
      [0, 0.6, 0.85, 1],
      [Colors.success, Colors.success, Colors.warning, Colors.danger]
    );
    return {
      width: `${animatedProgress.value * 100}%`,
      backgroundColor: color,
    };
  });

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor, borderRadius: height / 2 },
        style,
      ]}
    >
      <Animated.View
        style={[styles.fill, { height, borderRadius: height / 2 }, animatedStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    minWidth: 4,
  },
});

export default ProgressBar;
