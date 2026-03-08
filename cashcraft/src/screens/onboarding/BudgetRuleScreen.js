import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path, Circle } from 'react-native-svg';
import Feather from '@react-native-vector-icons/feather';
import { Spacing, Radius, BUDGET_RULES } from '../../constants/theme';
import { useBudgetStore } from '../../context/store';
import PremiumButton from '../../components/PremiumButton';
import OnboardingDots from '../../components/OnboardingDots';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

const DONUT_SIZE = 160;
const STROKE = 28;
const RADIUS = (DONUT_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DonutChart = ({ needs, wants, savings }) => {
  const total = needs + wants + savings;
  if (!total) return null;

  const slices = [
    { pct: needs / 100, color: '#60A5FA', label: 'Needs' },
    { pct: wants / 100, color: '#A78BFA', label: 'Wants' },
    { pct: savings / 100, color: '#34D399', label: 'Savings' },
  ];

  let offset = 0;
  const center = DONUT_SIZE / 2;

  return (
    <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
      <G rotation="-90" origin={`${center}, ${center}`}>
        {slices.map((slice, i) => {
          const dash = slice.pct * CIRCUMFERENCE;
          const gap = (1 - slice.pct) * CIRCUMFERENCE;
          const el = (
            <Circle
              key={i}
              cx={center}
              cy={center}
              r={RADIUS}
              fill="none"
              stroke={slice.color}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * CIRCUMFERENCE}
              strokeLinecap="butt"
            />
          );
          offset += slice.pct;
          return el;
        })}
      </G>
    </Svg>
  );
};

export default function BudgetRuleScreen({ navigation }) {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const { setBudgetRule, salary } = useBudgetStore();
  const { light, medium } = useHaptic();
  const [selected, setSelected] = useState(BUDGET_RULES[0]);

  const handleSelect = (rule) => {
    light();
    setSelected(rule);
  };

  const handleContinue = () => {
    medium();
    setBudgetRule(selected);
    navigation.navigate('Confirm');
  };

  const rule = selected;
  const needsAmt = salary && rule.needs ? ((salary * rule.needs) / 100).toFixed(0) : '–';
  const wantsAmt = salary && rule.wants ? ((salary * rule.wants) / 100).toFixed(0) : '–';
  const savingsAmt = salary && rule.savings ? ((salary * rule.savings) / 100).toFixed(0) : '–';

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
      marginBottom: Spacing.xl,
    },
    donutSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xl,
      marginBottom: Spacing.xl,
    },
    legend: {
      flex: 1,
      gap: Spacing.sm,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    customPlaceholder: {
      flex: 1,
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: Spacing.xl,
    },
    customText: {
      fontSize: 15,
      color: Colors.textSecondary,
    },
    rulesScroll: {
      gap: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    ruleCard: {
      width: 130,
      padding: Spacing.base,
      borderRadius: Radius.lg,
      backgroundColor: Colors.card,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    ruleCardActive: {
      borderColor: Colors.accent,
      backgroundColor: Colors.accentDim,
    },
    ruleLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors.textPrimary,
      marginBottom: 4,
    },
    ruleDesc: {
      fontSize: 12,
      color: Colors.textSecondary,
    },
    checkIcon: {
      position: 'absolute',
      top: Spacing.sm,
      right: Spacing.sm,
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

      <Text style={styles.step}>Step 2 of 3</Text>
      <Text style={styles.title}>Pick a budget rule</Text>
      <Text style={styles.subtitle}>How do you want to split your income?</Text>

      <OnboardingDots total={3} current={1} style={{ marginBottom: 24 }} />

      <View style={styles.donutSection}>
        {rule.needs !== null ? (
          <>
            <DonutChart needs={rule.needs} wants={rule.wants} savings={rule.savings} />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#60A5FA' }]} />
                <Text style={styles.legendText}>Needs {rule.needs}% — ${needsAmt}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#A78BFA' }]} />
                <Text style={styles.legendText}>Wants {rule.wants}% — ${wantsAmt}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#34D399' }]} />
                <Text style={styles.legendText}>Savings {rule.savings}% — ${savingsAmt}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.customPlaceholder}>
            <Feather name="sliders" size={28} color={Colors.accent} />
            <Text style={styles.customText}>Set your own allocations</Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rulesScroll}
      >
        {BUDGET_RULES.map((r, i) => (
          <Animated.View key={r.id} entering={FadeInDown.delay(i * 80).springify()}>
            <Pressable
              style={({ pressed }) => [
                styles.ruleCard,
                selected.id === r.id && styles.ruleCardActive,
                { opacity: pressed ? 0.75 : 1 },
              ]}
              onPress={() => handleSelect(r)}
            >
              <Text style={[styles.ruleLabel, selected.id === r.id && { color: Colors.accent }]}>
                {r.label}
              </Text>
              <Text style={styles.ruleDesc}>{r.description}</Text>
              {selected.id === r.id && (
                <View style={styles.checkIcon}>
                  <Feather name="check" size={12} color={Colors.accent} />
                </View>
              )}
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PremiumButton label="Continue" onPress={handleContinue} />
      </View>
    </View>
  );
}
