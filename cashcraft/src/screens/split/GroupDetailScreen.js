import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius } from '../../constants/theme';
import { useGroupStore } from '../../context/store';
import { simplifyDebts, getMemberBalance } from '../../utils/debtSimplifier';
import { formatCurrency, formatDate } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import MemberAvatar from '../../components/MemberAvatar';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

export default function GroupDetailScreen({ navigation, route }) {
  const Colors = useColors();
  const { groupId } = route.params;
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));
  const { light } = useHaptic();

  const debts = useMemo(() => {
    if (!group) return [];
    return simplifyDebts(group.members, group.bills.filter((b) => !b.settled));
  }, [group]);

  if (!group) return null;

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: group.name });
  }, [group.name]);

  const unsettledBills = group.bills.filter((b) => !b.settled);
  const settledBills = group.bills.filter((b) => b.settled);

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
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: Colors.textTertiary,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: Spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    membersRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    memberCard: {
      alignItems: 'center',
      gap: Spacing.xs,
      minWidth: 64,
    },
    memberName: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.textPrimary,
      textAlign: 'center',
    },
    memberBalance: {
      fontSize: 11,
      fontWeight: '700',
    },
    settleBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      backgroundColor: Colors.accentDim,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: `${Colors.accent}40`,
    },
    settleBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: Colors.accent,
    },
    debtCard: {
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    debtRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    debtArrow: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    debtAmount: {
      fontSize: 15,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
    debtLabel: {
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: 'center',
    },
    addBillBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      backgroundColor: Colors.accentDim,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: `${Colors.accent}40`,
    },
    addBillText: {
      fontSize: 13,
      fontWeight: '600',
      color: Colors.accent,
    },
    billCard: {
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    billHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    billDescription: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.textPrimary,
    },
    billDate: {
      fontSize: 12,
      color: Colors.textTertiary,
      marginTop: 2,
    },
    billAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
    billPayer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    billPayerText: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    allSettledCard: {
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.xl,
    },
    allSettledText: {
      fontSize: 15,
      fontWeight: '600',
      color: Colors.accent,
    },
    settledLabel: {
      fontSize: 13,
      color: Colors.textTertiary,
      textAlign: 'center',
      marginTop: Spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Members */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <Text style={styles.sectionLabel}>Members</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.membersRow}>
              {group.members.map((member) => {
                const balance = getMemberBalance(member.id, group.members, group.bills.filter(b => !b.settled));
                return (
                  <View key={member.id} style={styles.memberCard}>
                    <MemberAvatar name={member.name} color={member.color} size={44} />
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={[
                      styles.memberBalance,
                      { color: balance > 0 ? Colors.success : balance < 0 ? Colors.danger : Colors.textTertiary }
                    ]}>
                      {balance > 0 ? `+${formatCurrency(balance)}` :
                       balance < 0 ? `-${formatCurrency(Math.abs(balance))}` : 'Settled'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Simplified Debts */}
        {debts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Who owes whom</Text>
              <Pressable
                onPress={() => { light(); navigation.navigate('SettleUp', { groupId }); }}
                style={styles.settleBtn}
              >
                <Text style={styles.settleBtnText}>Settle Up</Text>
              </Pressable>
            </View>
            {debts.map((debt, i) => (
              <GlassCard key={i} style={styles.debtCard} padding={Spacing.base}>
                <View style={styles.debtRow}>
                  <MemberAvatar name={debt.fromName} color="#EF4444" size={32} />
                  <View style={styles.debtArrow}>
                    <Feather name="arrow-right" size={16} color={Colors.textTertiary} />
                    <Text style={styles.debtAmount}>{formatCurrency(debt.amount)}</Text>
                  </View>
                  <MemberAvatar name={debt.toName} color="#34D399" size={32} />
                </View>
                <Text style={styles.debtLabel}>
                  {debt.fromName} owes {debt.toName}
                </Text>
              </GlassCard>
            ))}
          </Animated.View>
        )}

        {/* Unsettled Bills */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Bills ({unsettledBills.length})</Text>
            <Pressable
              onPress={() => { light(); navigation.navigate('AddBill', { groupId }); }}
              style={styles.addBillBtn}
            >
              <Feather name="plus" size={16} color={Colors.accent} />
              <Text style={styles.addBillText}>Add Bill</Text>
            </Pressable>
          </View>

          {unsettledBills.length === 0 && (
            <GlassCard style={styles.allSettledCard}>
              <Feather name="check-circle" size={24} color={Colors.accent} />
              <Text style={styles.allSettledText}>All bills settled!</Text>
            </GlassCard>
          )}

          {unsettledBills.map((bill, i) => {
            const payer = group.members.find((m) => m.id === bill.paidBy);
            return (
              <GlassCard key={bill.id} style={styles.billCard} padding={Spacing.base}>
                <View style={styles.billHeader}>
                  <View>
                    <Text style={styles.billDescription}>{bill.description}</Text>
                    <Text style={styles.billDate}>{formatDate(bill.date)}</Text>
                  </View>
                  <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
                </View>
                <View style={styles.billPayer}>
                  <MemberAvatar name={payer?.name || '?'} color={payer?.color || '#8E8E93'} size={22} />
                  <Text style={styles.billPayerText}>Paid by {payer?.name}</Text>
                </View>
              </GlassCard>
            );
          })}

          {settledBills.length > 0 && (
            <Text style={styles.settledLabel}>{settledBills.length} settled bill{settledBills.length > 1 ? 's' : ''}</Text>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
