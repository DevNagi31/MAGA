import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Circle, Text as SvgText } from 'react-native-svg';
import { Colors, Spacing, Radius, CategoryColors, CATEGORIES } from '../../constants/theme';
import { useExpenseStore, useBudgetStore, useGroupStore } from '../../context/store';
import { getSpendingByCategory, getSpendingByBucket, getBudgetAllocations, generateInsights } from '../../utils/budgetCalculator';
import { formatCurrency, formatCurrencySigned, getCurrentMonth } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import ProgressBar from '../../components/ProgressBar';
import { useHaptic } from '../../hooks/useHaptic';

const { width } = Dimensions.get('window');
const CHART_SIZE = width * 0.5;
const STROKE_W = 36;
const RADIUS = (CHART_SIZE - STROKE_W) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DonutChart = ({ data, total }) => {
  const center = CHART_SIZE / 2;
  let offset = 0;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={CHART_SIZE} height={CHART_SIZE}>
        {/* Background */}
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          stroke={Colors.border}
          strokeWidth={STROKE_W}
        />
        <G rotation="-90" origin={`${center}, ${center}`}>
          {data.map((slice, i) => {
            if (slice.pct <= 0) return null;
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
                strokeWidth={STROKE_W}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset * CIRCUMFERENCE}
                strokeLinecap="butt"
              />
            );
            offset += slice.pct;
            return el;
          })}
        </G>
        <SvgText
          x={center}
          y={center - 8}
          textAnchor="middle"
          fill={Colors.textPrimary}
          fontSize="20"
          fontWeight="800"
        >
          {formatCurrency(total, true)}
        </SvgText>
        <SvgText
          x={center}
          y={center + 14}
          textAnchor="middle"
          fill={Colors.textTertiary}
          fontSize="11"
        >
          this month
        </SvgText>
      </Svg>
    </View>
  );
};

const BudgetBar = ({ label, spent, budget, color }) => {
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const remaining = Math.max(0, budget - spent);
  return (
    <View style={styles.budgetBarRow}>
      <View style={styles.budgetBarHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <View style={[styles.colorDot, { backgroundColor: color }]} />
          <Text style={styles.budgetBarLabel}>{label}</Text>
        </View>
        <Text style={styles.budgetBarAmount}>
          {formatCurrency(spent)} / {formatCurrency(budget)}
        </Text>
      </View>
      <ProgressBar progress={pct} />
      <Text style={styles.budgetBarRemaining}>
        {formatCurrency(remaining)} remaining
      </Text>
    </View>
  );
};

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { light } = useHaptic();
  const [tab, setTab] = useState('personal'); // 'personal' | 'splits'

  const expenses = useExpenseStore((s) => s.expenses);
  const getMonthlyExpenses = useExpenseStore((s) => s.getMonthlyExpenses);
  const { salary, budgetRule, getBudgetAllocations } = useBudgetStore();
  const groups = useGroupStore((s) => s.groups);

  const monthly = getMonthlyExpenses();
  const allocs = getBudgetAllocations();
  const catSpending = getSpendingByCategory(monthly);
  const bucketSpending = getSpendingByBucket(monthly);
  const insights = generateInsights(monthly, salary, budgetRule);

  const totalSpent = monthly.reduce((s, e) => s + e.amount, 0);

  const donutData = CATEGORIES
    .filter((cat) => (catSpending[cat.id] || 0) > 0)
    .map((cat) => ({
      label: cat.label,
      color: cat.color,
      amount: catSpending[cat.id] || 0,
      pct: totalSpent > 0 ? (catSpending[cat.id] || 0) / totalSpent : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Split analytics
  const allBills = groups.flatMap((g) => g.bills.filter((b) => !b.settled));
  const totalSplit = allBills.reduce((s, b) => s + b.amount, 0);
  const mostActiveGroup = [...groups].sort(
    (a, b) => b.bills.filter((bl) => !bl.settled).length - a.bills.filter((bl) => !bl.settled).length
  )[0];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>{getCurrentMonth()}</Text>
        </View>

        {/* Tab Toggle */}
        <View style={styles.tabToggle}>
          {['personal', 'splits'].map((t) => (
            <Pressable
              key={t}
              style={[styles.tabButton, tab === t && styles.tabButtonActive]}
              onPress={() => { light(); setTab(t); }}
            >
              <Text style={[styles.tabButtonText, tab === t && styles.tabButtonTextActive]}>
                {t === 'personal' ? 'Personal' : 'Splits'}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'personal' ? (
          <>
            {/* Donut Chart */}
            {totalSpent > 0 ? (
              <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.chartSection}>
                <DonutChart data={donutData} total={totalSpent} />
                <View style={styles.legend}>
                  {donutData.slice(0, 5).map((item) => (
                    <View key={item.label} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={styles.legendLabel}>{item.label}</Text>
                      <Text style={styles.legendPct}>{Math.round(item.pct * 100)}%</Text>
                      <Text style={styles.legendAmount}>{formatCurrency(item.amount)}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : (
              <GlassCard style={styles.emptyChart}>
                <Feather name="pie-chart" size={32} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>No spending data yet</Text>
              </GlassCard>
            )}

            {/* Budget Health */}
            <Animated.View entering={FadeInDown.delay(120).springify()}>
              <Text style={styles.sectionTitle}>Budget Health</Text>
              <GlassCard style={styles.budgetCard}>
                <BudgetBar label="Needs" spent={bucketSpending.needs} budget={allocs.needs} color="#60A5FA" />
                <BudgetBar label="Wants" spent={bucketSpending.wants} budget={allocs.wants} color="#A78BFA" />
                <View style={styles.savingsRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <View style={[styles.colorDot, { backgroundColor: Colors.accent }]} />
                    <Text style={styles.budgetBarLabel}>Savings Target</Text>
                  </View>
                  <Text style={[styles.savingsAmount, { color: Colors.accent }]}>
                    {formatCurrency(allocs.savings)}/mo
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            {/* Insights */}
            {insights.length > 0 && (
              <Animated.View entering={FadeInDown.delay(180).springify()}>
                <Text style={styles.sectionTitle}>Insights</Text>
                {insights.map((insight, i) => {
                  const colors = {
                    warning: Colors.warning,
                    success: Colors.success,
                    danger: Colors.danger,
                    info: Colors.info,
                  };
                  const icons = {
                    warning: 'alert-circle',
                    success: 'trending-up',
                    danger: 'alert-triangle',
                    info: 'info',
                  };
                  const c = colors[insight.type];
                  return (
                    <View key={i} style={[styles.insightCard, { borderLeftColor: c }]}>
                      <Feather name={icons[insight.type]} size={14} color={c} />
                      <Text style={styles.insightText}>{insight.text}</Text>
                    </View>
                  );
                })}
              </Animated.View>
            )}

            {/* Category Breakdown */}
            <Animated.View entering={FadeInDown.delay(220).springify()}>
              <Text style={styles.sectionTitle}>By Category</Text>
              <GlassCard>
                {CATEGORIES.filter((cat) => catSpending[cat.id] > 0).map((cat, i, arr) => (
                  <View
                    key={cat.id}
                    style={[
                      styles.catRow,
                      i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.border },
                    ]}
                  >
                    <View style={[styles.catIcon, { backgroundColor: `${cat.color}20` }]}>
                      <Feather name={cat.icon} size={14} color={cat.color} />
                    </View>
                    <Text style={styles.catLabel}>{cat.label}</Text>
                    <View style={styles.catRight}>
                      <Text style={styles.catAmount}>{formatCurrency(catSpending[cat.id])}</Text>
                      <Text style={styles.catPct}>
                        {Math.round(((catSpending[cat.id] || 0) / totalSpent) * 100)}%
                      </Text>
                    </View>
                  </View>
                ))}
                {Object.keys(catSpending).length === 0 && (
                  <Text style={styles.emptyCat}>No expenses this month</Text>
                )}
              </GlassCard>
            </Animated.View>
          </>
        ) : (
          /* Split Analytics */
          <>
            <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.splitStats}>
              <GlassCard style={styles.splitStatCard} padding={Spacing.lg}>
                <Feather name="dollar-sign" size={20} color={Colors.accent} />
                <Text style={styles.splitStatAmount}>{formatCurrency(totalSplit)}</Text>
                <Text style={styles.splitStatLabel}>Total split</Text>
              </GlassCard>
              <GlassCard style={styles.splitStatCard} padding={Spacing.lg}>
                <Feather name="users" size={20} color="#60A5FA" />
                <Text style={styles.splitStatAmount}>{groups.length}</Text>
                <Text style={styles.splitStatLabel}>Active groups</Text>
              </GlassCard>
            </Animated.View>

            {mostActiveGroup && (
              <Animated.View entering={FadeInDown.delay(100).springify()}>
                <Text style={styles.sectionTitle}>Most Active</Text>
                <GlassCard style={styles.activeGroupCard} padding={Spacing.lg}>
                  <Feather name="star" size={16} color={Colors.warning} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activeGroupName}>{mostActiveGroup.name}</Text>
                    <Text style={styles.activeGroupMeta}>
                      {mostActiveGroup.members.length} members •{' '}
                      {mostActiveGroup.bills.filter((b) => !b.settled).length} unsettled bills
                    </Text>
                  </View>
                </GlassCard>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(160).springify()}>
              <Text style={styles.sectionTitle}>Groups Breakdown</Text>
              {groups.map((group) => {
                const unsettled = group.bills.filter((b) => !b.settled);
                const groupTotal = unsettled.reduce((s, b) => s + b.amount, 0);
                return (
                  <GlassCard key={group.id} style={styles.groupBreakdown} padding={Spacing.base}>
                    <View style={styles.groupBreakdownHeader}>
                      <Text style={styles.groupBreakdownName}>{group.name}</Text>
                      <Text style={styles.groupBreakdownAmount}>{formatCurrency(groupTotal)}</Text>
                    </View>
                    <Text style={styles.groupBreakdownMeta}>
                      {group.members.length} members • {unsettled.length} unsettled
                    </Text>
                  </GlassCard>
                );
              })}

              {groups.length === 0 && (
                <GlassCard style={styles.emptyChart}>
                  <Feather name="users" size={24} color={Colors.textTertiary} />
                  <Text style={styles.emptyText}>No groups yet</Text>
                </GlassCard>
              )}
            </Animated.View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
    gap: Spacing.lg,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  tabButtonActive: {
    backgroundColor: Colors.accentDim,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  tabButtonTextActive: {
    color: Colors.accent,
  },
  chartSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  legend: {
    flex: 1,
    gap: Spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  legendPct: {
    fontSize: 11,
    color: Colors.textTertiary,
    width: 28,
    textAlign: 'right',
  },
  legendAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    width: 52,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: -Spacing.xs,
  },
  budgetCard: {
    gap: Spacing.base,
  },
  budgetBarRow: {
    gap: Spacing.xs,
  },
  budgetBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  budgetBarLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  budgetBarAmount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  budgetBarRemaining: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 2,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  savingsAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  insightCard: {
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
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  catRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  catAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  catPct: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  emptyCat: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyChart: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  splitStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  splitStatCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  splitStatAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  splitStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activeGroupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  activeGroupName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activeGroupMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  groupBreakdown: {
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  groupBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupBreakdownName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  groupBreakdownAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  groupBreakdownMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
