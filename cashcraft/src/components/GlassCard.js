import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Radius, Spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GlassCard = ({
  children,
  style,
  onPress,
  padding = Spacing.base,
  borderColor,
  backgroundColor,
  elevated = false,
  disabled = false,
}) => {
  const Colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const resolvedBorderColor = borderColor !== undefined ? borderColor : Colors.glassBorder;
  const resolvedBackgroundColor = backgroundColor !== undefined ? backgroundColor : Colors.glass;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
      opacity.value = withSpring(0.8, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const cardStyle = [
    styles.card,
    {
      padding,
      backgroundColor: elevated ? Colors.cardElevated : resolvedBackgroundColor,
      borderColor: resolvedBorderColor,
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
