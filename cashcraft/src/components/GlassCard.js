import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GlassCard = ({
  children,
  style,
  onPress,
  padding = Spacing.base,
  borderColor = Colors.glassBorder,
  backgroundColor = Colors.glass,
  elevated = false,
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const cardStyle = [
    styles.card,
    {
      padding,
      backgroundColor: elevated ? Colors.cardElevated : backgroundColor,
      borderColor,
    },
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        style={[animatedStyle, cardStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default GlassCard;
