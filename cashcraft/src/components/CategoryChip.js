import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Radius, Spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CategoryChip = ({ category, selected, onPress }) => {
  const Colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const styles = StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      borderWidth: 1,
      marginRight: Spacing.sm,
    },
    label: {
      fontSize: 13,
      fontWeight: '500',
    },
  });

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.chip,
        selected
          ? { backgroundColor: `${category.color}22`, borderColor: category.color }
          : { backgroundColor: Colors.glass, borderColor: Colors.glassBorder },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Feather
        name={category.icon}
        size={14}
        color={selected ? category.color : Colors.textSecondary}
      />
      <Text
        style={[
          styles.label,
          { color: selected ? category.color : Colors.textSecondary },
        ]}
      >
        {category.label}
      </Text>
    </AnimatedPressable>
  );
};

export default CategoryChip;
