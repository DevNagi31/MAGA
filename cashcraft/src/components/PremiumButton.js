import React from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PremiumButton = ({
  label,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = true,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const containerStyle = [
    styles.base,
    fullWidth && styles.fullWidth,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    variant === 'danger' && styles.danger,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.label,
    variant === 'secondary' && { color: Colors.accent },
    variant === 'ghost' && { color: Colors.textSecondary },
    variant === 'danger' && { color: Colors.danger },
  ];

  const content = (
    <>
      {icon && !loading ? icon : null}
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#050505' : Colors.accent}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        style={[animatedStyle, fullWidth && styles.fullWidth, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={disabled || loading ? ['#1A1A1A', '#1A1A1A'] : ['#34D399', '#10B981']}
          style={[styles.base, styles.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {icon && !loading ? icon : null}
          {loading ? (
            <ActivityIndicator color="#050505" size="small" />
          ) : (
            <Text style={[styles.label, { color: '#050505', fontWeight: '700' }]}>{label}</Text>
          )}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={[animatedStyle, containerStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      {content}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    minHeight: 52,
  },
  gradient: {
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  secondary: {
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: `${Colors.accent}40`,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default PremiumButton;
