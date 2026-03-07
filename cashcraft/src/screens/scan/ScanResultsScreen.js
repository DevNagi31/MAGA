import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useOCRStore, useExpenseStore, useGroupStore } from '../../context/store';
import { formatCurrency } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import PremiumButton from '../../components/PremiumButton';
import { useHaptic } from '../../hooks/useHaptic';

export default function ScanResultsScreen({ navigation }) {
  const { scannedItems, scanTotal, clearScan } = useOCRStore();
  const addExpense = useExpenseStore((s) => s.addExpense);
  const groups = useGroupStore((s) => s.groups);
  const { success, light } = useHaptic();

  const [items, setItems] = useState(scannedItems);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const total = items.reduce((s, i) => s + i.amount, 0);

  const startEdit = (item) => {
    light();
    setEditingId(item.id);
    setEditName(item.name);
    setEditAmount(item.amount.toString());
  };

  const saveEdit = () => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === editingId
          ? { ...i, name: editName, amount: parseFloat(editAmount) || i.amount }
          : i
      )
    );
    setEditingId(null);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddPersonal = () => {
    success();
    addExpense({
      amount: total,
      category: 'food',
      description: `Receipt - ${items.length} items`,
      date: new Date().toISOString(),
    });
    clearScan();
    navigation.navigate('ScanMain');
    Alert.alert('Added!', `$${total.toFixed(2)} added as a personal expense.`);
  };

  const handleSplitWithGroup = () => {
    if (groups.length === 0) {
      Alert.alert('No Groups', 'Create a group first to split this bill.');
      return;
    }
    // Navigate to groups with prefilled data
    navigation.navigate('Split', {
      screen: 'GroupsList',
    });
    clearScan();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Summary */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Receipt Total</Text>
            <Text style={styles.summaryTotal}>{formatCurrency(total)}</Text>
            <Text style={styles.summaryCount}>{items.length} items detected</Text>
          </View>
        </Animated.View>

        {/* Items */}
        <Text style={styles.sectionLabel}>Line Items</Text>
        <Text style={styles.sectionHint}>Tap an item to edit, press X to remove</Text>

        {items.map((item, i) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(80 + i * 40).springify()}>
            {editingId === item.id ? (
              <GlassCard style={styles.editCard} padding={Spacing.base}>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Item name"
                  placeholderTextColor={Colors.textTertiary}
                />
                <View style={styles.editAmountRow}>
                  <Text style={styles.editDollar}>$</Text>
                  <TextInput
                    style={styles.editAmountInput}
                    value={editAmount}
                    onChangeText={setEditAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={Colors.textTertiary}
                  />
                  <Pressable style={styles.saveBtn} onPress={saveEdit}>
                    <Feather name="check" size={16} color="#050505" />
                  </Pressable>
                </View>
              </GlassCard>
            ) : (
              <Pressable style={styles.itemRow} onPress={() => startEdit(item)}>
                <View style={styles.itemDot} />
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                <Pressable onPress={() => removeItem(item.id)} style={styles.removeBtn} hitSlop={8}>
                  <Feather name="x" size={14} color={Colors.textTertiary} />
                </Pressable>
              </Pressable>
            )}
          </Animated.View>
        ))}

        {/* Total line */}
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
        </View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.actions}>
          <PremiumButton
            label="Add as Personal Expense"
            onPress={handleAddPersonal}
          />
          <PremiumButton
            label="Split with Group"
            variant="secondary"
            onPress={handleSplitWithGroup}
          />
          <PremiumButton
            label="Discard"
            variant="ghost"
            onPress={() => { clearScan(); navigation.goBack(); }}
          />
        </Animated.View>

        <View style={{ height: 40 }} />
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
    padding: Spacing.base,
    gap: Spacing.md,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: Colors.accentDim,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: `${Colors.accent}30`,
    padding: Spacing.xl,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryTotal: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: -1.5,
  },
  summaryCount: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: -Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  removeBtn: {
    padding: 4,
  },
  editCard: {
    gap: Spacing.sm,
  },
  editInput: {
    fontSize: 15,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs,
  },
  editAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  editDollar: {
    fontSize: 18,
    color: Colors.accent,
  },
  editAmountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  saveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
