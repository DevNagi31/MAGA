import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius, CategoryColors, CategoryIcons, CATEGORIES } from '../../constants/theme';
import { useExpenseStore, useBudgetStore, useGroupStore } from '../../context/store';
import { getSpendingByBucket, generateInsights } from '../../utils/budgetCalculator';
import { getGreeting, formatCurrency, getCurrentMonth, getDaysRemainingInMonth } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import ExpenseItem from '../../components/ExpenseItem';
import MemberAvatar from '../../components/MemberAvatar';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen({ navigation }) {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const { medium, light } = useHaptic();
  const expenses = useExpenseStore((s) => s.expenses);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const getMonthlyExpenses = useExpenseStore((s) => s.getMonthlyExpenses);
  const { salary } = useBudgetStore();
  const groups = useGroupStore((s) => s.groups);

  const monthly = getMonthlyExpenses();
  const spending = getSpendingByBucket(monthly);
  const totalSpent = spending.needs + spending.wants;
  const diff = salary - totalSpent; // positive = saved, negative = overspent
  const spentPct = salary > 0 ? Math.min(totalSpent / salary, 1) : 0;
  const insights = generateInsights(monthly, salary, useBudgetStore.getState().budgetRule);

  const daysLeft = getDaysRemainingInMonth();
  const dailySafe = daysLeft > 0 ? Math.max(0, diff) / daysLeft : 0;

  // Top 3 categories
  const byCategory = {};
  monthly.forEach((e) => {
    if (!byCategory[e.category]) byCategory[e.category] = 0;
    byCategory[e.category] += e.amount;
  });
  const top3 = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);

  // FAB state
  const [fabOpen, setFabOpen] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const fabRotate = useSharedValue(0);
  const fabScale = useSharedValue(1);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      { rotate: `${fabRotate.value * 45}deg` },
    ],
  }));

  const toggleFAB = () => {
    medium();
    const opening = !fabOpen;
    setFabOpen(opening);
    fabRotate.value = withSpring(opening ? 1 : 0, { damping: 14 });
    fabScale.value = withSpring(0.9, { damping: 10 }, () => {
      fabScale.value = withSpring(1, { damping: 15 });
    });
  };

  const handlePersonalExpense = () => {
    setFabOpen(false);
    fabRotate.value = withSpring(0);
    navigation.navigate('AddExpense');
  };

  const handleGroupExpense = () => {
    light();
    setFabOpen(false);
    fabRotate.value = withSpring(0);
    if (groups.length === 0) {
      navigation.navigate('Split', { screen: 'CreateGroup' });
      return;
    }
    setShowGroupPicker(true);
  };

  const handleGroupSelect = (group) => {
    setShowGroupPicker(false);
    navigation.navigate('Split', {
      screen: 'AddBill',
      params: { groupId: group.id },
    });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base, gap: Spacing.md },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
    greeting: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
    month: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

    // Spendy-style hero card
    heroCard: {
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.card,
      gap: Spacing.md,
    },
    heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    heroLeft: { gap: 4 },
    heroLabel: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
    heroAmount: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
    heroDot: { width: 8, height: 8, borderRadius: 4, marginRight: 2 },
    heroIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },

    // Divider + diff
    heroDivider: { height: 1, backgroundColor: Colors.border },
    diffRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    diffLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
    diffAmount: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },

    // Progress
    progressTrack: { height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    progressLabel: { fontSize: 11, color: Colors.textTertiary },

    // Daily safe
    dailyRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: Colors.accentDim, borderRadius: Radius.md,
      paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
      borderWidth: 1, borderColor: `${Colors.accent}25`,
    },
    dailyLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
    dailySub: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
    dailyAmount: { fontSize: 20, fontWeight: '800', color: Colors.accent, letterSpacing: -0.5 },

    // Insights
    insightsWrap: { gap: Spacing.xs },
    insightRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: Colors.card, borderRadius: Radius.md,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
      borderLeftWidth: 2, borderWidth: 1, borderColor: Colors.border,
    },
    insightText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

    // Section
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
    seeAll: { fontSize: 13, color: Colors.accent, fontWeight: '500' },

    // Top 3
    top3Card: { marginBottom: Spacing.sm, gap: Spacing.xs },
    top3Title: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.xs },
    top3Row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
    top3RowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    top3Icon: { width: 28, height: 28, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
    top3Label: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
    top3Amount: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

    // Empty
    emptyCard: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl },
    emptyText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
    emptySubtext: { fontSize: 13, color: Colors.textTertiary },

    // FAB
    fabWrap: { position: 'absolute', bottom: 100, right: Spacing.xl, alignItems: 'flex-end', gap: Spacing.sm },
    fab: {
      shadowColor: Colors.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 10,
    },
    fabGradient: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },

    // FAB actions
    fabActions: { alignItems: 'flex-end', gap: Spacing.sm },
    fabAction: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: Colors.card, borderRadius: Radius.full,
      paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base,
      borderWidth: 1, borderColor: Colors.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    },
    fabActionText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

    // Group picker modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalCard: {
      backgroundColor: Colors.card,
      borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
      padding: Spacing.xl, gap: Spacing.md,
      borderTopWidth: 1, borderColor: Colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
    groupRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
      backgroundColor: Colors.cardElevated, borderRadius: Radius.md,
      borderWidth: 1, borderColor: Colors.border,
    },
    groupRowName: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
    groupRowMeta: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
    modalCancel: { alignItems: 'center', paddingVertical: Spacing.sm },
    modalCancelText: { fontSize: 14, color: Colors.textTertiary },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.month}>{getCurrentMonth()}</Text>
          </View>
        </Animated.View>

        {/* Spendy-style Income / Expense / Diff card */}
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <View style={styles.heroCard}>

            {/* Income row */}
            <View style={styles.heroRow}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroLabel}>Income</Text>
                <Text style={[styles.heroAmount, { color: Colors.success }]}>
                  {formatCurrency(salary)}
                </Text>
              </View>
              <View style={[styles.heroIconWrap, { backgroundColor: `${Colors.success}18` }]}>
                <Feather name="arrow-down-left" size={18} color={Colors.success} />
              </View>
            </View>

            {/* Expense row */}
            <View style={styles.heroRow}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroLabel}>Expenses</Text>
                <Text style={[styles.heroAmount, { color: Colors.danger }]}>
                  {formatCurrency(totalSpent)}
                </Text>
              </View>
              <View style={[styles.heroIconWrap, { backgroundColor: `${Colors.danger}18` }]}>
                <Feather name="arrow-up-right" size={18} color={Colors.danger} />
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View style={[
                styles.progressFill,
                {
                  width: `${Math.round(spentPct * 100)}%`,
                  backgroundColor: spentPct > 0.85 ? Colors.danger : spentPct > 0.6 ? Colors.warning : Colors.success,
                }
              ]} />
            </View>
            <Text style={styles.progressLabel}>
              {Math.round(spentPct * 100)}% of income spent
            </Text>

            {/* Divider + difference */}
            <View style={styles.heroDivider} />
            <View style={styles.diffRow}>
              <Text style={styles.diffLabel}>
                {diff >= 0 ? 'Saved this month' : 'Overspent by'}
              </Text>
              <Text style={[styles.diffAmount, { color: diff >= 0 ? Colors.success : Colors.danger }]}>
                {diff >= 0 ? '+' : '-'}{formatCurrency(Math.abs(diff))}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Daily safe spend */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.dailyRow}>
          <View>
            <Text style={styles.dailyLabel}>Safe to spend today</Text>
            <Text style={styles.dailySub}>{daysLeft} days left this month</Text>
          </View>
          <Text style={styles.dailyAmount}>{formatCurrency(dailySafe)}/day</Text>
        </Animated.View>

        {/* Insights */}
        {insights.length > 0 && (
          <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.insightsWrap}>
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
                  <Feather name={icon} size={13} color={color} />
                  <Text style={styles.insightText}>{insight.text}</Text>
                </View>
              );
            })}
          </Animated.View>
        )}

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              onPress={() => navigation.navigate('ExpenseHistory')}
            >
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          {/* Top 3 categories */}
          {top3.length > 0 && (
            <GlassCard style={styles.top3Card}>
              <Text style={styles.top3Title}>Top spending</Text>
              {top3.map(([cat, amount], i) => {
                const catDef = CATEGORIES.find((c) => c.id === cat);
                const color = CategoryColors[cat] || Colors.textTertiary;
                const icon = CategoryIcons[cat] || 'more-horizontal';
                return (
                  <View key={cat} style={[styles.top3Row, i < top3.length - 1 && styles.top3RowBorder]}>
                    <View style={[styles.top3Icon, { backgroundColor: `${color}18` }]}>
                      <Feather name={icon} size={13} color={color} />
                    </View>
                    <Text style={styles.top3Label}>{catDef?.label || cat}</Text>
                    <Text style={styles.top3Amount}>{formatCurrency(amount)}</Text>
                  </View>
                );
              })}
            </GlassCard>
          )}

          {recentExpenses.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Feather name="inbox" size={22} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No expenses yet</Text>
              <Text style={styles.emptySubtext}>Tap + to log your first expense</Text>
            </GlassCard>
          ) : (
            recentExpenses.map((expense, i) => (
              <ExpenseItem key={expense.id} expense={expense} index={i} onDelete={deleteExpense} />
            ))
          )}
        </Animated.View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* FAB with expandable actions */}
      <View style={styles.fabWrap}>
        {fabOpen && (
          <Animated.View entering={FadeInUp.springify()} style={styles.fabActions}>
            <Pressable
              style={({ pressed }) => [styles.fabAction, { opacity: pressed ? 0.8 : 1 }]}
              onPress={handleGroupExpense}
            >
              <Feather name="users" size={16} color={Colors.accent} />
              <Text style={styles.fabActionText}>Group Expense</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.fabAction, { opacity: pressed ? 0.8 : 1 }]}
              onPress={handlePersonalExpense}
            >
              <Feather name="user" size={16} color={Colors.accent} />
              <Text style={styles.fabActionText}>Personal Expense</Text>
            </Pressable>
          </Animated.View>
        )}

        <AnimatedPressable style={[styles.fab, fabStyle]} onPress={toggleFAB}>
          <LinearGradient colors={['#34D399', '#10B981']} style={styles.fabGradient}>
            <Feather name="plus" size={26} color="#050505" />
          </LinearGradient>
        </AnimatedPressable>
      </View>

      {/* Backdrop when FAB open */}
      {fabOpen && (
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={() => { setFabOpen(false); fabRotate.value = withSpring(0); }}
        />
      )}

      {/* Group picker modal for group expense */}
      <Modal visible={showGroupPicker} transparent animationType="slide" onRequestClose={() => setShowGroupPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add to which group?</Text>
            {groups.map((group) => (
              <Pressable
                key={group.id}
                style={({ pressed }) => [styles.groupRow, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => handleGroupSelect(group)}
              >
                <View style={{ flexDirection: 'row', gap: -8 }}>
                  {group.members.slice(0, 3).map((m, i) => (
                    <View key={m.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                      <MemberAvatar name={m.name} color={m.color} size={30} />
                    </View>
                  ))}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupRowName}>{group.name}</Text>
                  <Text style={styles.groupRowMeta}>{group.members.length} members</Text>
                </View>
                <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setShowGroupPicker(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
