import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius } from '../../constants/theme';
import { useGroupStore } from '../../context/store';
import { getMemberBalance } from '../../utils/debtSimplifier';
import { formatCurrency } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import MemberAvatar from '../../components/MemberAvatar';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

export default function GroupsListScreen({ navigation }) {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const groups = useGroupStore((s) => s.groups);
  const { light } = useHaptic();

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
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
    createBtn: {
      borderRadius: Radius.full,
      overflow: 'hidden',
    },
    createGradient: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupCard: {
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    groupAvatars: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarWrap: {
      borderRadius: Radius.full,
    },
    moreAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: Colors.cardElevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
    },
    moreText: {
      fontSize: 11,
      fontWeight: '700',
      color: Colors.textSecondary,
    },
    groupName: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
    groupMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    groupMembers: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: Colors.textTertiary,
    },
    groupBills: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    totalText: {
      fontSize: 13,
      color: Colors.textTertiary,
    },
    emptyState: {
      alignItems: 'center',
      paddingTop: 80,
      gap: Spacing.md,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 24,
      backgroundColor: Colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 15,
      color: Colors.textSecondary,
      textAlign: 'center',
    },
    emptyButton: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      backgroundColor: Colors.accentDim,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: `${Colors.accent}40`,
      marginTop: Spacing.sm,
    },
    emptyButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: Colors.accent,
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Groups</Text>
          <Pressable
            style={({ pressed }) => [
              styles.createBtn,
              { opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={() => { light(); navigation.navigate('CreateGroup'); }}
          >
            <LinearGradient
              colors={['#34D399', '#10B981']}
              style={styles.createGradient}
            >
              <Feather name="plus" size={18} color="#050505" />
            </LinearGradient>
          </Pressable>
        </View>

        {groups.length === 0 ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="users" size={32} color={Colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptySubtitle}>Create a group to start splitting bills</Text>
            <Pressable
              style={({ pressed }) => [
                styles.emptyButton,
                { opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <Text style={styles.emptyButtonText}>Create Group</Text>
            </Pressable>
          </Animated.View>
        ) : (
          groups.map((group, i) => {
            const activeMembers = group.members;
            const unsettledBills = group.bills.filter((b) => !b.settled);
            const totalAmount = unsettledBills.reduce((s, b) => s + b.amount, 0);

            return (
              <Animated.View
                key={group.id}
                entering={FadeInDown.delay(i * 80).springify()}
              >
                <GlassCard
                  style={styles.groupCard}
                  onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                >
                  <View style={styles.groupHeader}>
                    <View style={styles.groupAvatars}>
                      {activeMembers.slice(0, 3).map((m, mi) => (
                        <View
                          key={m.id}
                          style={[styles.avatarWrap, { marginLeft: mi > 0 ? -10 : 0 }]}
                        >
                          <MemberAvatar name={m.name} color={m.color} size={34} />
                        </View>
                      ))}
                      {activeMembers.length > 3 && (
                        <View style={[styles.avatarWrap, styles.moreAvatar, { marginLeft: -10 }]}>
                          <Text style={styles.moreText}>+{activeMembers.length - 3}</Text>
                        </View>
                      )}
                    </View>
                    <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
                  </View>

                  <Text style={styles.groupName}>{group.name}</Text>
                  <View style={styles.groupMeta}>
                    <Text style={styles.groupMembers}>
                      {activeMembers.length} members
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.groupBills}>
                      {unsettledBills.length} unsettled {unsettledBills.length === 1 ? 'bill' : 'bills'}
                    </Text>
                  </View>

                  {totalAmount > 0 && (
                    <View style={styles.totalRow}>
                      <Feather name="dollar-sign" size={12} color={Colors.textTertiary} />
                      <Text style={styles.totalText}>{formatCurrency(totalAmount)} total</Text>
                    </View>
                  )}
                </GlassCard>
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
