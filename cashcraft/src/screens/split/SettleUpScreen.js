import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated as RNAnimated,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useGroupStore } from '../../context/store';
import { simplifyDebts } from '../../utils/debtSimplifier';
import { formatCurrency } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import MemberAvatar from '../../components/MemberAvatar';
import PremiumButton from '../../components/PremiumButton';
import { useHaptic } from '../../hooks/useHaptic';

// Simple particle confetti
const Particle = ({ delay }) => {
  const translateY = useRef(new RNAnimated.Value(0)).current;
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const opacity = useRef(new RNAnimated.Value(1)).current;
  const colors = ['#34D399', '#60A5FA', '#F97316', '#FBBF24', '#A78BFA'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const startX = Math.random() * 300 - 150;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(translateY, {
        toValue: 400,
        duration: 1500,
        delay,
        useNativeDriver: true,
      }),
      RNAnimated.timing(translateX, {
        toValue: startX,
        duration: 1500,
        delay,
        useNativeDriver: true,
      }),
      RNAnimated.timing(opacity, {
        toValue: 0,
        duration: 1500,
        delay: delay + 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <RNAnimated.View
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        transform: [{ translateY }, { translateX }],
        opacity,
      }}
    />
  );
};

export default function SettleUpScreen({ navigation, route }) {
  const { groupId } = route.params;
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));
  const settleAllDebts = useGroupStore((s) => s.settleAllDebts);
  const { success } = useHaptic();
  const [settled, setSettled] = React.useState(false);
  const [particles, setParticles] = React.useState([]);

  const debts = useMemo(() => {
    if (!group) return [];
    return simplifyDebts(group.members, group.bills.filter((b) => !b.settled));
  }, [group]);

  const handleSettleAll = () => {
    success();
    settleAllDebts(groupId);
    setSettled(true);
    setParticles(Array.from({ length: 24 }, (_, i) => ({ id: i, delay: i * 60 })));
    setTimeout(() => navigation.goBack(), 2500);
  };

  if (!group) return null;

  return (
    <View style={styles.container}>
      {particles.map((p) => (
        <Particle key={p.id} delay={p.delay} />
      ))}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {settled ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.successState}>
            <LinearGradient
              colors={['#34D399', '#10B981']}
              style={styles.successCircle}
            >
              <Feather name="check" size={40} color="#050505" />
            </LinearGradient>
            <Text style={styles.successTitle}>All Settled!</Text>
            <Text style={styles.successSubtitle}>
              All debts in {group.name} have been marked as settled.
            </Text>
          </Animated.View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Simplified Debts</Text>
            <Text style={styles.subtitle}>
              {debts.length === 0
                ? 'Everyone is settled up!'
                : `${debts.length} transaction${debts.length > 1 ? 's' : ''} needed to settle all debts`}
            </Text>

            {debts.map((debt, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(i * 80).springify()}>
                <GlassCard style={styles.debtCard} padding={Spacing.lg}>
                  <View style={styles.debtRow}>
                    <View style={styles.debtMember}>
                      <MemberAvatar name={debt.fromName} color="#EF4444" size={44} />
                      <Text style={styles.debtMemberName}>{debt.fromName}</Text>
                    </View>

                    <View style={styles.debtCenter}>
                      <Text style={styles.debtAmountText}>{formatCurrency(debt.amount)}</Text>
                      <Feather name="arrow-right" size={20} color={Colors.textTertiary} />
                    </View>

                    <View style={styles.debtMember}>
                      <MemberAvatar name={debt.toName} color="#34D399" size={44} />
                      <Text style={styles.debtMemberName}>{debt.toName}</Text>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            ))}

            {debts.length > 0 && (
              <View style={styles.actions}>
                <PremiumButton
                  label="Mark All Settled"
                  onPress={handleSettleAll}
                />
                <PremiumButton
                  label="Cancel"
                  variant="ghost"
                  onPress={() => navigation.goBack()}
                />
              </View>
            )}

            {debts.length === 0 && (
              <View style={styles.allGoodCard}>
                <Feather name="check-circle" size={32} color={Colors.accent} />
                <Text style={styles.allGoodText}>Nothing to settle</Text>
                <Text style={styles.allGoodSubtext}>This group is all balanced out</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  scroll: {
    padding: Spacing.base,
    gap: Spacing.md,
    paddingBottom: 60,
  },
  sectionLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  debtCard: {
    marginBottom: Spacing.sm,
  },
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  debtMember: {
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  debtMemberName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  debtCenter: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  debtAmountText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  successState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.xl,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  successTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.xl,
  },
  allGoodCard: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: 60,
  },
  allGoodText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  allGoodSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
