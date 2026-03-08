import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius, BUDGET_RULES } from '../../constants/theme';
import { useBudgetStore, useExpenseStore, useGroupStore, useAppStore } from '../../context/store';
import GlassCard from '../../components/GlassCard';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

export default function SettingsScreen() {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const { warning } = useHaptic();
  const budgetRule = useBudgetStore((s) => s.budgetRule);
  const setBudgetRule = useBudgetStore((s) => s.setBudgetRule);
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const monthlyIncome = useBudgetStore((s) => s.salary);

  const isDark = themeMode === 'dark';

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all expenses, groups, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: () => {
            warning();
            useExpenseStore.setState({ expenses: [] });
            useGroupStore.setState({ groups: [] });
            useAppStore.setState({ isOnboarded: false });
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.bg,
    },
    scroll: {
      paddingHorizontal: Spacing.base,
      paddingTop: Spacing.base,
      gap: Spacing.xl,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: Colors.textPrimary,
      marginBottom: Spacing.sm,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: Colors.textTertiary,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: Spacing.sm,
    },
    settingsGroup: {
      gap: 0,
      padding: 0,
      overflow: 'hidden',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      padding: Spacing.base,
    },
    settingIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: Colors.accentDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: Colors.textPrimary,
    },
    settingValue: {
      fontSize: 15,
      color: Colors.textSecondary,
      marginRight: Spacing.xs,
    },
    separator: {
      height: 1,
      backgroundColor: Colors.border,
      marginHorizontal: Spacing.base,
    },
    ruleSection: {
      padding: Spacing.base,
      gap: Spacing.md,
    },
    ruleLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: Colors.textPrimary,
    },
    rulesRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    ruleChip: {
      flex: 1,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
      backgroundColor: Colors.cardElevated,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
    },
    ruleChipActive: {
      backgroundColor: Colors.accentDim,
      borderColor: Colors.accent,
    },
    ruleChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: Colors.textSecondary,
    },
    aboutCard: {
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    aboutHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    aboutIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: Colors.accentDim,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: `${Colors.accent}40`,
    },
    aboutAppName: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
    aboutVersion: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    aboutDesc: {
      fontSize: 14,
      color: Colors.textSecondary,
      lineHeight: 20,
    },
    hackathonBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: 'rgba(251, 191, 36, 0.2)',
    },
    hackathonText: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.warning,
    },
  });

  const SettingRow = ({ icon, label, value, onPress, danger = false }) => (
    <Pressable style={({ pressed }) => [styles.settingRow, onPress && pressed && { opacity: 0.7 }]} onPress={onPress}>
      <View style={[styles.settingIcon, danger && { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
        <Feather name={icon} size={16} color={danger ? Colors.danger : Colors.accent} />
      </View>
      <Text style={[styles.settingLabel, danger && { color: Colors.danger }]}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {onPress && <Feather name="chevron-right" size={16} color={Colors.textTertiary} />}
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(40).springify()}>
          <Text style={styles.sectionLabel}>Appearance</Text>
          <GlassCard style={styles.settingsGroup}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Feather name={isDark ? 'moon' : 'sun'} size={16} color={Colors.accent} />
              </View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
                trackColor={{ false: Colors.border, true: Colors.accentDim }}
                thumbColor={isDark ? Colors.accent : Colors.textTertiary}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Budget */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <Text style={styles.sectionLabel}>Budget</Text>
          <GlassCard style={styles.settingsGroup}>
            <SettingRow
              icon="trending-up"
              label="This Month's Income"
              value={`$${monthlyIncome.toLocaleString()}`}
            />

            <View style={styles.separator} />

            <View style={styles.ruleSection}>
              <Text style={styles.ruleLabel}>Budget Rule</Text>
              <View style={styles.rulesRow}>
                {BUDGET_RULES.filter((r) => r.id !== 'custom').map((rule) => (
                  <Pressable
                    key={rule.id}
                    style={({ pressed }) => [
                      styles.ruleChip,
                      budgetRule?.id === rule.id && styles.ruleChipActive,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => setBudgetRule(rule)}
                  >
                    <Text style={[
                      styles.ruleChipText,
                      budgetRule?.id === rule.id && { color: Colors.accent },
                    ]}>
                      {rule.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Data */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.sectionLabel}>Data</Text>
          <GlassCard style={styles.settingsGroup}>
            <SettingRow
              icon="trash-2"
              label="Clear All Data"
              onPress={handleClearData}
              danger
            />
          </GlassCard>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={styles.sectionLabel}>About</Text>
          <GlassCard style={styles.settingsGroup}>
            <View style={styles.aboutCard}>
              <View style={styles.aboutHeader}>
                <View style={styles.aboutIcon}>
                  <Feather name="dollar-sign" size={20} color={Colors.accent} />
                </View>
                <View>
                  <Text style={styles.aboutAppName}>CashCraft</Text>
                  <Text style={styles.aboutVersion}>Version 1.0.0</Text>
                </View>
              </View>
              <Text style={styles.aboutDesc}>
                Personal finance manager & bill splitter. Built from scratch with React Native + Expo.
              </Text>
              <View style={styles.hackathonBadge}>
                <Feather name="zap" size={12} color={Colors.warning} />
                <Text style={styles.hackathonText}>Built for HackBU 2026</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
