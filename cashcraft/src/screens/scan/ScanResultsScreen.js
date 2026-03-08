import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Spacing, Radius } from '../../constants/theme';
import { useOCRStore, useExpenseStore, useGroupStore } from '../../context/store';
import { formatCurrency } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import PremiumButton from '../../components/PremiumButton';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

export default function ScanResultsScreen({ navigation }) {
  const Colors = useColors();
  const { scannedItems, clearScan } = useOCRStore();
  const addExpense = useExpenseStore((s) => s.addExpense);
  const groups = useGroupStore((s) => s.groups);
  const { success, light } = useHaptic();

  const [items, setItems] = useState(scannedItems);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // Group picker state
  const [showGroupPicker, setShowGroupPicker] = useState(false);

  // Quick Split state (1-on-1, no group needed)
  const [showQuickSplit, setShowQuickSplit] = useState(false);
  const [quickSplitName, setQuickSplitName] = useState('');

  const total = items.reduce((s, i) => s + i.amount, 0);
  const halfTotal = (total / 2).toFixed(2);

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
    Alert.alert('Added!', `${formatCurrency(total)} added as a personal expense.`);
  };

  const handleSplitWithGroup = () => {
    if (groups.length === 0) {
      Alert.alert(
        'No Groups',
        'Create a group first, or use Quick Split for a 1-on-1 split.',
        [
          { text: 'Quick Split', onPress: () => setShowQuickSplit(true) },
          { text: 'OK' },
        ]
      );
      return;
    }
    setShowGroupPicker(true);
  };

  const handleGroupSelect = (group) => {
    setShowGroupPicker(false);
    // Pass prefilledItems to AddBill so amount is prefilled
    navigation.navigate('Split', {
      screen: 'AddBill',
      params: {
        groupId: group.id,
        prefilledItems: items,
      },
    });
    clearScan();
  };

  const handleQuickSplitConfirm = () => {
    if (!quickSplitName.trim()) {
      Alert.alert('Enter a name', 'Who are you splitting with?');
      return;
    }
    success();
    // Add your half as a personal expense
    addExpense({
      amount: parseFloat(halfTotal),
      category: 'food',
      description: `Split with ${quickSplitName.trim()} - Receipt`,
      date: new Date().toISOString(),
    });
    clearScan();
    setShowQuickSplit(false);
    navigation.navigate('ScanMain');
    Alert.alert(
      'Split done!',
      `Your share: ${formatCurrency(parseFloat(halfTotal))}\n${quickSplitName.trim()} owes: ${formatCurrency(parseFloat(halfTotal))}`
    );
  };

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
    // Group picker
    groupPickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.base,
      backgroundColor: Colors.card,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    groupPickerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.accentDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupPickerName: {
      fontSize: 15,
      fontWeight: '600',
      color: Colors.textPrimary,
    },
    groupPickerSub: {
      fontSize: 12,
      color: Colors.textTertiary,
      marginTop: 2,
    },
    cancelLink: {
      alignItems: 'center',
      paddingVertical: Spacing.sm,
    },
    cancelLinkText: {
      fontSize: 14,
      color: Colors.textTertiary,
    },
    actions: {
      gap: Spacing.sm,
      marginTop: Spacing.md,
    },
    // Quick Split Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: Colors.card,
      borderTopLeftRadius: Radius.xl,
      borderTopRightRadius: Radius.xl,
      padding: Spacing.xl,
      gap: Spacing.lg,
      borderTopWidth: 1,
      borderColor: Colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: Colors.textPrimary,
    },
    modalSubtitle: {
      fontSize: 13,
      color: Colors.textTertiary,
      marginTop: -Spacing.md,
    },
    splitPreview: {
      flexDirection: 'row',
      backgroundColor: Colors.accentDim,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: `${Colors.accent}30`,
      overflow: 'hidden',
    },
    splitPreviewHalf: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.lg,
      gap: Spacing.xs,
    },
    splitPreviewDivider: {
      width: 1,
      backgroundColor: `${Colors.accent}30`,
    },
    splitPreviewLabel: {
      fontSize: 12,
      color: Colors.textTertiary,
      fontWeight: '500',
    },
    splitPreviewAmount: {
      fontSize: 22,
      fontWeight: '800',
      color: Colors.accent,
    },
    modalLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    modalInput: {
      backgroundColor: Colors.bg,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: Colors.border,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
      fontSize: 16,
      color: Colors.textPrimary,
    },
    modalActions: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    modalCancel: {
      flex: 1,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    modalCancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: Colors.textSecondary,
    },
    modalConfirm: {
      flex: 1,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      borderRadius: Radius.md,
      backgroundColor: Colors.accent,
    },
    modalConfirmText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#050505',
    },
  });

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

        {/* Group picker (inline, shown when user taps Split with Group) */}
        {showGroupPicker && (
          <Animated.View entering={FadeInDown.springify()}>
            <Text style={styles.sectionLabel}>Pick a group</Text>
            {groups.map((group) => (
              <Pressable
                key={group.id}
                style={styles.groupPickerRow}
                onPress={() => handleGroupSelect(group)}
              >
                <View style={styles.groupPickerIcon}>
                  <Feather name="users" size={16} color={Colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupPickerName}>{group.name}</Text>
                  <Text style={styles.groupPickerSub}>
                    {group.members.length} members
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
              </Pressable>
            ))}
            <Pressable onPress={() => setShowGroupPicker(false)} style={styles.cancelLink}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Actions */}
        {!showGroupPicker && (
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
              label="Quick Split (1-on-1)"
              variant="secondary"
              onPress={() => setShowQuickSplit(true)}
            />
            <PremiumButton
              label="Discard"
              variant="ghost"
              onPress={() => { clearScan(); navigation.goBack(); }}
            />
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Quick Split Modal */}
      <Modal
        visible={showQuickSplit}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickSplit(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quick Split</Text>
            <Text style={styles.modalSubtitle}>Split equally with one person</Text>

            <View style={styles.splitPreview}>
              <View style={styles.splitPreviewHalf}>
                <Text style={styles.splitPreviewLabel}>You pay</Text>
                <Text style={styles.splitPreviewAmount}>{formatCurrency(parseFloat(halfTotal))}</Text>
              </View>
              <View style={styles.splitPreviewDivider} />
              <View style={styles.splitPreviewHalf}>
                <Text style={styles.splitPreviewLabel}>They pay</Text>
                <Text style={styles.splitPreviewAmount}>{formatCurrency(parseFloat(halfTotal))}</Text>
              </View>
            </View>

            <Text style={styles.modalLabel}>Who are you splitting with?</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Name"
              placeholderTextColor={Colors.textTertiary}
              value={quickSplitName}
              onChangeText={setQuickSplitName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setShowQuickSplit(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirm} onPress={handleQuickSplitConfirm}>
                <Text style={styles.modalConfirmText}>Split</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
