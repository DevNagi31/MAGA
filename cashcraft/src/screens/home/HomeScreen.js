import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated as RNAnimated,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, CategoryColors, CategoryIcons } from '../../constants/theme';
import { useExpenseStore, useBudgetStore } from '../../context/store';
import { getSpendingByBucket } from '../../utils/budgetCalculator';
import { generateInsights } from '../../utils/budgetCalculator';
import { getGreeting, formatCurrency, formatDate, getCurrentMonth } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import ProgressRing from '../../components/ProgressRing';
import ExpenseItem from '../../components/ExpenseItem';
import { useHaptic } from '../../hooks/useHaptic';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { medium } = useHaptic();
  const expenses = useExpenseStore((s) => s.expenses);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const getMonthlyExpenses = useExpenseStore((s) => s.getMonthlyExpenses);
  const { salary, getBudgetAllocations } = useBudgetStore();

  const monthly = getMonthlyExpenses();
  const allocs = getBudgetAllocations();
  const spending = getSpendingByBucket(monthly);
  const totalSpent = spending.needs + spending.wants;
  const remaining = Math.max(0, salary - totalSpent);
  const insights = generateInsights(monthly, salary, useBudgetStore.getState().budgetRule);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);

  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleFAB = () => {
    fabScale.value = withSpring(0.9, { damping: 10 }, () => {
      fabScale.value = withSpring(1, { damping: 15 });
    });
    medium();
    navigation.navigate('AddExpense');
  };

  const buckets = [
    {
      label: 'Needs',
      spent: spending.needs,
      budget: allocs.needs,
      color: '#60A5FA',
    },
    {
      label: 'Wants',
      spent: spending.wants,
      budget: allocs.wants,
      color: '#A78BFA',
    },
    {
      label: 'Savings',
      spent: 0,
      budget: allocs.savings,
      color: '#34D399',
      isSavings: true,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.month}>{getCurrentMonth()}</Text>
          </View>
          <Pressable
            style={styles.historyBtn}
            onPress={() => navigation.navigate('ExpenseHistory')}
          >
            <Feather name="list" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Hero Balance Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={['rgba(52, 211, 153, 0.08)', 'rgba(52, 211, 153, 0.02)']}
            style={styles.heroCard}
          >
            <Text style={styles.heroLabel}>Money left this month</Text>
            <Text style={styles.heroAmount}>${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Feather name="arrow-up-right" size={14} color={Colors.danger} />
                <Text style={styles.heroMetaText}>Spent {formatCurrency(totalSpent)}</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetaItem}>
                <Feather name="dollar-sign" size={14} color={Colors.accent} />
                <Text style={styles.heroMetaText}>Budget {formatCurrency(salary)}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Budget Buckets */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.bucketsRow}>
          {buckets.map((b, i) => {
            const pct = b.isSavings ? 0 : b.budget > 0 ? b.spent / b.budget : 0;
            const remaining = b.budget - b.spent;
            return (
              <GlassCard key={b.label} style={styles.bucketCard} padding={Spacing.md}>
                <ProgressRing size={52} strokeWidth={4} progress={pct} color={b.color}>
                  <Text style={[styles.pctText, { color: b.color }]}>
                    {b.isSavings ? '' : `${Math.round(pct * 100)}%`}
                  </Text>
                </ProgressRing>
                <Text style={styles.bucketLabel}>{b.label}</Text>
                <Text style={styles.bucketAmount}>
                  {b.isSavings
                    ? formatCurrency(b.budget)
                    : formatCurrency(Math.max(0, remaining))}
                </Text>
                <Text style={styles.bucketSub}>{b.isSavings ? 'target' : 'left'}</Text>
              </GlassCard>
            );
          })}
        </Animated.View>

        {/* Insights */}
        {insights.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            {insights.map((insight, i) => {
              const iconMap = {
                warning: { icon: 'alert-circle', color: Colors.warning },
                success: { icon: 'check-circle', color: Colors.success },
                danger: { icon: 'alert-triangle', color: Colors.danger },
                info: { icon: 'info', color: Colors.info },
              };
              const { icon, color } = iconMap[insight.type] || iconMap.info;
              return (
                <View key={i} style={[styles.insightRow, { borderLeftColor: color }]}>
                  <Feather name={icon} size={14} color={color} />
                  <Text style={styles.insightText}>{insight.text}</Text>
                </View>
              );
            })}
          </Animated.View>
        )}

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => navigation.navigate('ExpenseHistory')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          {recentExpenses.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Feather name="inbox" size={24} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No expenses yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first expense</Text>
            </GlassCard>
          ) : (
            recentExpenses.map((expense, i) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                index={i}
                onDelete={deleteExpense}
              />
            ))
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <AnimatedPressable
        style={[styles.fab, fabStyle]}
        onPress={handleFAB}
      >
        <LinearGradient
          colors={['#34D399', '#10B981']}
          style={styles.fabGradient}
        >
          <Feather name="plus" size={26} color="#050505" />
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  month: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.15)',
  },
  heroLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  heroAmount: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1.5,
    marginBottom: Spacing.base,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  heroDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
  },
  bucketsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  bucketCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bucketLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bucketAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bucketSub: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.xl,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
