import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { Colors, CategoryColors, CategoryIcons, Spacing, Radius } from '../constants/theme';
import { formatCurrency, formatTime } from '../utils/formatters';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ExpenseItem = ({ expense, onDelete, index = 0 }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const color = CategoryColors[expense.category] || CategoryColors.other;
  const icon = CategoryIcons[expense.category] || 'more-horizontal';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handleDelete = () => {
    opacity.value = withTiming(0, { duration: 250 });
    scale.value = withTiming(0.9, { duration: 250 });
    setTimeout(() => onDelete && onDelete(expense.id), 250);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <AnimatedPressable
        style={[styles.container, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleDelete}
        delayLongPress={500}
      >
        <View style={[styles.leftBorder, { backgroundColor: color }]} />
        <View style={[styles.iconWrap, { backgroundColor: `${color}20` }]}>
          <Feather name={icon} size={16} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description || 'Expense'}
          </Text>
          <Text style={styles.time}>
            {formatTime(expense.date)}
          </Text>
        </View>
        <Text style={styles.amount}>-{formatCurrency(expense.amount)}</Text>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  leftBorder: {
    width: 3,
    alignSelf: 'stretch',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
    marginVertical: Spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: Spacing.base,
  },
});

export default ExpenseItem;
