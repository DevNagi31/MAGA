import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useGroupStore } from '../../context/store';
import AmountInput from '../../components/AmountInput';
import MemberAvatar from '../../components/MemberAvatar';
import PremiumButton from '../../components/PremiumButton';
import GlassCard from '../../components/GlassCard';
import { useHaptic } from '../../hooks/useHaptic';
import { formatCurrency } from '../../utils/formatters';

const SPLIT_METHODS = ['Equal', 'Custom', 'Percentage'];

export default function AddBillScreen({ navigation, route }) {
  const { groupId, prefilledItems } = route.params || {};
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));
  const addBillToGroup = useGroupStore((s) => s.addBillToGroup);
  const { success, light } = useHaptic();

  const [amount, setAmount] = useState(
    prefilledItems ? prefilledItems.reduce((s, i) => s + i.amount, 0).toFixed(2) : ''
  );
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState(group?.members[0]?.id || '');
  const [splitMethod, setSplitMethod] = useState('Equal');
  const [customAmounts, setCustomAmounts] = useState({});

  const splits = useMemo(() => {
    const val = parseFloat(amount) || 0;
    if (!group || val <= 0) return [];

    const members = group.members;

    if (splitMethod === 'Equal') {
      const each = parseFloat((val / members.length).toFixed(2));
      return members.map((m) => ({ memberId: m.id, amount: each }));
    }

    if (splitMethod === 'Custom') {
      return members.map((m) => ({
        memberId: m.id,
        amount: parseFloat(customAmounts[m.id] || '0'),
      }));
    }

    if (splitMethod === 'Percentage') {
      const equalPct = 100 / members.length;
      return members.map((m) => ({
        memberId: m.id,
        amount: parseFloat(((val * (parseFloat(customAmounts[m.id] || equalPct)) / 100).toFixed(2))),
      }));
    }

    return [];
  }, [amount, group, splitMethod, customAmounts]);

  const splitsTotal = splits.reduce((s, sp) => s + sp.amount, 0);
  const billAmount = parseFloat(amount) || 0;
  const isBalanced = Math.abs(splitsTotal - billAmount) < 0.02;

  const handleAdd = () => {
    if (!description.trim() || !billAmount || !paidBy || !isBalanced) return;
    success();
    addBillToGroup(groupId, {
      description: description.trim(),
      amount: billAmount,
      paidBy,
      splits,
    });
    navigation.goBack();
  };

  if (!group) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AmountInput value={amount} onChange={setAmount} />

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="What was this for?"
            placeholderTextColor={Colors.textTertiary}
            value={description}
            onChangeText={setDescription}
          />
        </Animated.View>

        {/* Paid by */}
        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Text style={styles.label}>Paid by</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paidByRow}>
            {group.members.map((member) => (
              <Pressable
                key={member.id}
                style={[styles.payerChip, paidBy === member.id && styles.payerChipActive]}
                onPress={() => { light(); setPaidBy(member.id); }}
              >
                <MemberAvatar name={member.name} color={member.color} size={28} />
                <Text style={[styles.payerName, paidBy === member.id && { color: Colors.accent }]}>
                  {member.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Split Method */}
        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <Text style={styles.label}>Split</Text>
          <View style={styles.methodRow}>
            {SPLIT_METHODS.map((m) => (
              <Pressable
                key={m}
                style={[styles.methodChip, splitMethod === m && styles.methodChipActive]}
                onPress={() => { light(); setSplitMethod(m); }}
              >
                <Text style={[styles.methodText, splitMethod === m && styles.methodTextActive]}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Split Breakdown */}
        {billAmount > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard>
              {group.members.map((member) => {
                const split = splits.find((s) => s.memberId === member.id);
                const memberAmount = split?.amount || 0;

                return (
                  <View key={member.id} style={styles.splitRow}>
                    <MemberAvatar name={member.name} color={member.color} size={30} />
                    <Text style={styles.splitName}>{member.name}</Text>
                    {splitMethod === 'Equal' ? (
                      <Text style={styles.splitAmount}>{formatCurrency(memberAmount)}</Text>
                    ) : (
                      <View style={styles.splitInput}>
                        <Text style={styles.splitInputPrefix}>
                          {splitMethod === 'Percentage' ? '%' : '$'}
                        </Text>
                        <TextInput
                          style={styles.splitInputField}
                          value={customAmounts[member.id] || ''}
                          onChangeText={(v) =>
                            setCustomAmounts((prev) => ({ ...prev, [member.id]: v }))
                          }
                          keyboardType="decimal-pad"
                          placeholder={splitMethod === 'Equal' ? (billAmount / group.members.length).toFixed(2) : '0'}
                          placeholderTextColor={Colors.textTertiary}
                        />
                      </View>
                    )}
                  </View>
                );
              })}

              {splitMethod !== 'Equal' && (
                <View style={[styles.balanceRow, { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm }]}>
                  <Text style={styles.balanceLabel}>Total split</Text>
                  <Text style={[styles.balanceAmount, { color: isBalanced ? Colors.success : Colors.danger }]}>
                    {formatCurrency(splitsTotal)} / {formatCurrency(billAmount)}
                  </Text>
                </View>
              )}
            </GlassCard>
          </Animated.View>
        )}

        <View style={{ marginTop: Spacing.xl }}>
          <PremiumButton
            label="Add Bill"
            onPress={handleAdd}
            disabled={!description.trim() || !billAmount || !isBalanced}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.base,
    gap: Spacing.lg,
    paddingBottom: 40,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  paidByRow: {
    gap: Spacing.sm,
  },
  payerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  payerChipActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  payerName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  methodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  methodChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  methodChipActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  methodTextActive: {
    color: Colors.accent,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  splitName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  splitAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  splitInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    minWidth: 80,
  },
  splitInputPrefix: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginRight: 2,
  },
  splitInputField: {
    fontSize: 14,
    color: Colors.textPrimary,
    minWidth: 50,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
