import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../../constants/theme';
import { useAppStore, useBudgetStore } from '../../context/store';
import PremiumButton from '../../components/PremiumButton';
import OnboardingDots from '../../components/OnboardingDots';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

const SummaryRow = ({ label, amount, color, icon, styles }) => (
  <View style={styles.summaryRow}>
    <View style={[styles.summaryIcon, { backgroundColor: `${color}20` }]}>
      <Feather name={icon} size={16} color={color} />
    </View>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={[styles.summaryAmount, { color }]}>${amount?.toFixed(0)}/mo</Text>
  </View>
);

export default function ConfirmScreen({ navigation }) {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const { salary, budgetRule, getBudgetAllocations } = useBudgetStore();
  const { success } = useHaptic();
  const allocs = getBudgetAllocations();

  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(30);

  useEffect(() => {
    success();
    checkScale.value = withSpring(1, { damping: 8, stiffness: 120 });
    checkOpacity.value = withTiming(1, { duration: 400 });
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    contentY.value = withDelay(400, withSpring(0, { damping: 15 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const handleStart = () => {
    success();
    setOnboarded(true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.bg,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
    },
    glow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 300,
    },
    checkContainer: {
      marginTop: Spacing.xxl,
      marginBottom: Spacing.xxxl,
    },
    checkCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: Colors.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 12,
    },
    content: {
      width: '100%',
      alignItems: 'center',
      gap: Spacing.lg,
    },
    title: {
      fontSize: 34,
      fontWeight: '700',
      color: Colors.textPrimary,
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      color: Colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    summary: {
      width: '100%',
      gap: Spacing.sm,
      marginTop: Spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      backgroundColor: Colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: Spacing.base,
    },
    summaryIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    summaryLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: Colors.textPrimary,
    },
    summaryAmount: {
      fontSize: 15,
      fontWeight: '700',
    },
    footer: {
      marginTop: 'auto',
      width: '100%',
      paddingTop: Spacing.xl,
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['rgba(52, 211, 153, 0.08)', 'transparent']}
        style={styles.glow}
      />

      <Animated.View style={[styles.checkContainer, checkStyle]}>
        <LinearGradient
          colors={['#34D399', '#10B981']}
          style={styles.checkCircle}
        >
          <Feather name="check" size={40} color="#050505" />
        </LinearGradient>
      </Animated.View>

      <OnboardingDots total={3} current={2} style={{ marginBottom: 24 }} />

      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>
          Based on your ${salary?.toLocaleString()} monthly income and the{' '}
          {budgetRule?.label} rule:
        </Text>

        <View style={styles.summary}>
          <SummaryRow label="Essentials (Needs)" amount={allocs.needs} color="#60A5FA" icon="home" styles={styles} />
          <SummaryRow label="Lifestyle (Wants)" amount={allocs.wants} color="#A78BFA" icon="heart" styles={styles} />
          <SummaryRow label="Savings Target" amount={allocs.savings} color="#34D399" icon="trending-up" styles={styles} />
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <PremiumButton label="Start tracking" onPress={handleStart} />
      </View>
    </View>
  );
}
