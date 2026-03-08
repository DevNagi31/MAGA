import { useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated as RNAnimated,
  Share,
  Linking,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Spacing, Radius } from '../../constants/theme';
import { useGroupStore } from '../../context/store';
import { simplifyDebts } from '../../utils/debtSimplifier';
import { formatCurrency } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import MemberAvatar from '../../components/MemberAvatar';
import PremiumButton from '../../components/PremiumButton';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

const Particle = ({ delay }) => {
  const translateY = useRef(new RNAnimated.Value(0)).current;
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const opacity = useRef(new RNAnimated.Value(1)).current;
  const colors = ['#34D399', '#60A5FA', '#F97316', '#FBBF24', '#A78BFA'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const startX = Math.random() * 300 - 150;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(translateY, { toValue: 400, duration: 1500, delay, useNativeDriver: true }),
      RNAnimated.timing(translateX, { toValue: startX, duration: 1500, delay, useNativeDriver: true }),
      RNAnimated.timing(opacity, { toValue: 0, duration: 1500, delay: delay + 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <RNAnimated.View
      style={{
        position: 'absolute', top: 0, left: '50%',
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: color,
        transform: [{ translateY }, { translateX }],
        opacity,
      }}
    />
  );
};

export default function SettleUpScreen({ navigation, route }) {
  const Colors = useColors();
  const { groupId } = route.params;
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));
  const settleAllDebts = useGroupStore((s) => s.settleAllDebts);
  const { success, light } = useHaptic();

  const [settled, setSettled] = useState(false);
  const [particles, setParticles] = useState([]);
  // Track payment method per debt: { [index]: 'cash' | 'zelle' }
  const [payMethods, setPayMethods] = useState({});

  const debts = useMemo(() => {
    if (!group) return [];
    return simplifyDebts(group.members, group.bills.filter((b) => !b.settled));
  }, [group]);

  const getMember = (name) => group?.members.find((m) => m.name === name);

  const setMethod = (i, method) => {
    light();
    setPayMethods((prev) => ({ ...prev, [i]: prev[i] === method ? null : method }));
  };

  const copyToClipboard = async (text) => {
    await Share.share({ message: text });
  };

  const openZelle = () => {
    Linking.openURL('zelle://').catch(() => {
      Linking.openURL('https://www.zellepay.com').catch(() =>
        Alert.alert('Zelle not installed', 'Download the Zelle app or use your bank app to send via Zelle.')
      );
    });
  };

  const handleSettleAll = () => {
    success();
    settleAllDebts(groupId);
    setSettled(true);
    setParticles(Array.from({ length: 24 }, (_, i) => ({ id: i, delay: i * 60 })));
    setTimeout(() => navigation.goBack(), 2500);
  };

  if (!group) return null;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg, overflow: 'hidden' },
    scroll: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 60 },

    headingRow: { gap: 4 },
    heading: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
    subheading: { fontSize: 14, color: Colors.textSecondary },

    debtCard: { gap: Spacing.md },
    debtRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    debtMember: { alignItems: 'center', gap: Spacing.sm, flex: 1 },
    debtMemberName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
    debtCenter: { alignItems: 'center', gap: 4, flex: 1 },
    debtAmount: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },

    // Method toggle
    methodToggle: {
      flexDirection: 'row',
      backgroundColor: Colors.bg,
      borderRadius: Radius.md,
      padding: 3,
      borderWidth: 1,
      borderColor: Colors.border,
      gap: 3,
    },
    methodBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.sm,
    },
    methodBtnActive: { backgroundColor: Colors.accentDim },
    methodBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textTertiary },
    methodBtnTextActive: { color: Colors.accent },

    // Cash panel
    payPanel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: Colors.cardElevated,
      borderRadius: Radius.md,
      padding: Spacing.md,
    },
    payPanelText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

    // Zelle panel
    zellePanel: { gap: Spacing.md },
    zellePanelLabel: { fontSize: 12, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
    zelleIdCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.cardElevated,
      borderRadius: Radius.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    zelleIdLeft: { flex: 1, gap: 3 },
    zelleIdType: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.4 },
    zelleIdValue: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
    copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.accentDim, borderRadius: Radius.md, borderWidth: 1, borderColor: `${Colors.accent}30` },
    copyBtnText: { fontSize: 13, fontWeight: '600', color: Colors.accent },

    zelleAmountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 },
    zelleAmountLabel: { fontSize: 13, color: Colors.textSecondary },
    zelleAmountValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },

    openZelleBtn: { borderRadius: Radius.md, overflow: 'hidden' },
    openZelleGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
    openZelleBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

    noZelleWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.cardElevated, borderRadius: Radius.md, padding: Spacing.md },
    noZelleText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

    actions: { gap: Spacing.sm, marginTop: Spacing.md },
    successState: { alignItems: 'center', paddingTop: 80, gap: Spacing.xl },
    successCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 },
    successTitle: { fontSize: 34, fontWeight: '700', color: Colors.textPrimary },
    successSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.xl },
    allGoodCard: { alignItems: 'center', gap: Spacing.md, paddingTop: 60 },
    allGoodText: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
    allGoodSubtext: { fontSize: 14, color: Colors.textSecondary },
  });

  return (
    <View style={styles.container}>
      {particles.map((p) => <Particle key={p.id} delay={p.delay} />)}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {settled ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.successState}>
            <LinearGradient colors={['#34D399', '#10B981']} style={styles.successCircle}>
              <Feather name="check" size={40} color="#050505" />
            </LinearGradient>
            <Text style={styles.successTitle}>All Settled!</Text>
            <Text style={styles.successSubtitle}>
              All debts in {group.name} have been marked as settled.
            </Text>
          </Animated.View>
        ) : (
          <>
            <View style={styles.headingRow}>
              <Text style={styles.heading}>Settle Up</Text>
              <Text style={styles.subheading}>
                {debts.length === 0
                  ? 'Everyone is even!'
                  : `${debts.length} payment${debts.length > 1 ? 's' : ''} needed`}
              </Text>
            </View>

            {debts.map((debt, i) => {
              const recipient = getMember(debt.toName);
              const zelleId = recipient?.zelleId;
              const method = payMethods[i];

              return (
                <Animated.View key={i} entering={FadeInDown.delay(i * 80).springify()}>
                  <GlassCard style={styles.debtCard} padding={Spacing.lg}>
                    {/* Who owes whom */}
                    <View style={styles.debtRow}>
                      <View style={styles.debtMember}>
                        <MemberAvatar name={debt.fromName} color="#EF4444" size={44} />
                        <Text style={styles.debtMemberName}>{debt.fromName}</Text>
                      </View>
                      <View style={styles.debtCenter}>
                        <Text style={styles.debtAmount}>{formatCurrency(debt.amount)}</Text>
                        <Feather name="arrow-right" size={18} color={Colors.textTertiary} />
                      </View>
                      <View style={styles.debtMember}>
                        <MemberAvatar name={debt.toName} color="#34D399" size={44} />
                        <Text style={styles.debtMemberName}>{debt.toName}</Text>
                      </View>
                    </View>

                    {/* Pay method toggle */}
                    <View style={styles.methodToggle}>
                      <Pressable
                        style={[styles.methodBtn, method === 'cash' && styles.methodBtnActive]}
                        onPress={() => setMethod(i, 'cash')}
                      >
                        <Feather
                          name="dollar-sign"
                          size={14}
                          color={method === 'cash' ? Colors.accent : Colors.textTertiary}
                        />
                        <Text style={[styles.methodBtnText, method === 'cash' && styles.methodBtnTextActive]}>
                          Cash
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.methodBtn, method === 'zelle' && styles.methodBtnActive]}
                        onPress={() => setMethod(i, 'zelle')}
                      >
                        <Feather
                          name="zap"
                          size={14}
                          color={method === 'zelle' ? Colors.accent : Colors.textTertiary}
                        />
                        <Text style={[styles.methodBtnText, method === 'zelle' && styles.methodBtnTextActive]}>
                          Zelle
                        </Text>
                      </Pressable>
                    </View>

                    {/* Cash instruction */}
                    {method === 'cash' && (
                      <Animated.View entering={FadeInDown.springify()} style={styles.payPanel}>
                        <Feather name="check-circle" size={16} color={Colors.textTertiary} />
                        <Text style={styles.payPanelText}>
                          Pay {debt.toName} {formatCurrency(debt.amount)} in cash and mark as settled below.
                        </Text>
                      </Animated.View>
                    )}

                    {/* Zelle panel */}
                    {method === 'zelle' && (
                      <Animated.View entering={FadeInDown.springify()} style={styles.zellePanel}>
                        {zelleId ? (
                          <>
                            <Text style={styles.zellePanelLabel}>Send to {debt.toName} via Zelle</Text>

                            {/* Zelle ID card */}
                            <View style={styles.zelleIdCard}>
                              <View style={styles.zelleIdLeft}>
                                <Text style={styles.zelleIdType}>
                                  {zelleId.includes('@') ? 'Email' : 'Phone'}
                                </Text>
                                <Text style={styles.zelleIdValue}>{zelleId}</Text>
                              </View>
                              <Pressable
                                style={({ pressed }) => [styles.copyBtn, { opacity: pressed ? 0.6 : 1 }]}
                                onPress={() => copyToClipboard(zelleId)}
                              >
                                <Feather name="copy" size={14} color={Colors.accent} />
                                <Text style={styles.copyBtnText}>Copy</Text>
                              </Pressable>
                            </View>

                            <View style={styles.zelleAmountRow}>
                              <Text style={styles.zelleAmountLabel}>Amount to send</Text>
                              <Text style={styles.zelleAmountValue}>{formatCurrency(debt.amount)}</Text>
                            </View>

                            <Pressable
                              style={({ pressed }) => [styles.openZelleBtn, { opacity: pressed ? 0.8 : 1 }]}
                              onPress={openZelle}
                            >
                              <LinearGradient
                                colors={['#6B21A8', '#7C3AED']}
                                style={styles.openZelleGradient}
                              >
                                <Feather name="zap" size={16} color="#fff" />
                                <Text style={styles.openZelleBtnText}>Open Zelle App</Text>
                              </LinearGradient>
                            </Pressable>
                          </>
                        ) : (
                          <View style={styles.noZelleWrap}>
                            <Feather name="alert-circle" size={16} color={Colors.textTertiary} />
                            <Text style={styles.noZelleText}>
                              {debt.toName} hasn't added a Zelle ID. Ask them to update their info.
                            </Text>
                          </View>
                        )}
                      </Animated.View>
                    )}
                  </GlassCard>
                </Animated.View>
              );
            })}

            {debts.length > 0 && (
              <View style={styles.actions}>
                <PremiumButton label="Mark All Settled" onPress={handleSettleAll} />
                <PremiumButton label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
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
