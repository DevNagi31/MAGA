import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Spacing, Radius } from '../../constants/theme';
import { useBudgetStore } from '../../context/store';
import AmountInput from '../../components/AmountInput';
import PremiumButton from '../../components/PremiumButton';
import OnboardingDots from '../../components/OnboardingDots';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

const PRESETS = [2000, 3000, 4500, 6000, 8000, 10000];

export default function SalaryScreen({ navigation }) {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const setSalary = useBudgetStore((s) => s.setSalary);
  const { light, medium } = useHaptic();
  const [amount, setAmount] = useState('');
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 500 });
    titleY.value = withSpring(0, { damping: 15 });
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const handleContinue = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    medium();
    setSalary(val);
    navigation.navigate('BudgetRule');
  };

  const handlePreset = (value) => {
    light();
    setAmount(value.toString());
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.bg,
      paddingHorizontal: Spacing.xl,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xl,
    },
    step: {
      fontSize: 13,
      color: Colors.accent,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: Spacing.sm,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: Colors.textPrimary,
      letterSpacing: -0.5,
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: 15,
      color: Colors.textSecondary,
      lineHeight: 22,
    },
    presets: {
      marginTop: Spacing.base,
    },
    presetLabel: {
      fontSize: 12,
      color: Colors.textTertiary,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: Spacing.md,
    },
    presetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    presetChip: {
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: Colors.glass,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    presetChipActive: {
      backgroundColor: Colors.accentDim,
      borderColor: Colors.accent,
    },
    presetText: {
      fontSize: 14,
      fontWeight: '500',
      color: Colors.textSecondary,
    },
    presetTextActive: {
      color: Colors.accent,
    },
    footer: {
      marginTop: 'auto',
      paddingTop: Spacing.xl,
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom }]}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={22} color={Colors.textSecondary} />
      </Pressable>

      <Animated.View style={titleStyle}>
        <Text style={styles.step}>Step 1 of 3</Text>
        <Text style={styles.title}>What's your monthly income?</Text>
        <Text style={styles.subtitle}>We'll use this to set up your budget buckets.</Text>
      </Animated.View>

      <OnboardingDots total={3} current={0} style={{ marginBottom: 24 }} />

      <AmountInput value={amount} onChange={setAmount} />

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.presets}>
        <Text style={styles.presetLabel}>Quick pick</Text>
        <View style={styles.presetGrid}>
          {PRESETS.map((preset) => (
            <Pressable
              key={preset}
              style={({ pressed }) => [
                styles.presetChip,
                amount === preset.toString() && styles.presetChipActive,
                { opacity: pressed ? 0.75 : 1 },
              ]}
              onPress={() => handlePreset(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  amount === preset.toString() && styles.presetTextActive,
                ]}
              >
                ${preset.toLocaleString()}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <PremiumButton
          label="Continue"
          onPress={handleContinue}
          disabled={!amount || parseFloat(amount) <= 0}
        />
      </View>
    </View>
  );
}
