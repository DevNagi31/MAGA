import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SectionList,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius, CATEGORIES } from '../../constants/theme';
import { useExpenseStore } from '../../context/store';
import { groupExpensesByDate, formatCurrency } from '../../utils/formatters';
import CategoryChip from '../../components/CategoryChip';
import ExpenseItem from '../../components/ExpenseItem';
import GlassCard from '../../components/GlassCard';
import Feather from 'react-native-vector-icons/Feather';

const ALL_CAT = { id: 'all', label: 'All', icon: 'grid', color: '#8E8E93' };

export default function ExpenseHistoryScreen() {
  const expenses = useExpenseStore((s) => s.expenses);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activeCategory === 'all') return sorted;
    return sorted.filter((e) => e.category === activeCategory);
  }, [expenses, activeCategory]);

  const grouped = groupExpensesByDate(filtered);
  const sections = Object.entries(grouped).map(([title, data]) => ({ title, data }));

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <CategoryChip
            category={ALL_CAT}
            selected={activeCategory === 'all'}
            onPress={() => setActiveCategory('all')}
          />
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              selected={activeCategory === cat.id}
              onPress={() => setActiveCategory(cat.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'}
          </Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalFiltered)}</Text>
        </View>
      </View>

      {sections.length === 0 ? (
        <Animated.View entering={FadeInDown.springify()} style={styles.empty}>
          <Feather name="inbox" size={32} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No expenses found</Text>
        </Animated.View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section }) => (
            <Text style={styles.dateHeader}>{section.title}</Text>
          )}
          renderItem={({ item, index }) => (
            <ExpenseItem
              expense={item}
              index={index}
              onDelete={deleteExpense}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  filterScroll: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  dateHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
