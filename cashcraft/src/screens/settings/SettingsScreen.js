import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius, BUDGET_RULES } from '../../constants/theme';
import { useBudgetStore, useExpenseStore, useGroupStore, useAppStore } from '../../context/store';
import GlassCard from '../../components/GlassCard';
import PremiumButton from '../../components/PremiumButton';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

export default function SettingsScreen() {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const { warning } = useHaptic();
  const { salary, setSalary, budgetRule, setBudgetRule } = useBudgetStore();
  const { themeMode, setThemeMode } = useAppStore();
  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(salary?.toString() || '');

  const isDark = themeMode === 'dark';

  const handleSaveSalary = () => {
    const val = parseFloat(salaryInput);
    if (val > 0) setSalary(val);
    setEditingSalary(false);
  };

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
            useBudgetStore.setState({ salary: 0 });
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
    editSalaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.base,
      gap: Spacing.sm,
    },
    dollarSign: {
      fontSize: 20,
      color: Colors.accent,
      fontWeight: '600',
    },
    salaryInput: {
      flex: 1,
      fontSize: 20,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
    saveSalaryBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
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
    <Pressable style={styles.settingRow} onPress={onPress}>
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
            {editingSalary ? (
              <View style={styles.editSalaryRow}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.salaryInput}
                  value={salaryInput}
                  onChangeText={setSalaryInput}
                  keyboardType="decimal-pad"
                  autoFocus
                  selectTextOnFocus
                />
                <Pressable style={styles.saveSalaryBtn} onPress={handleSaveSalary}>
                  <Feather name="check" size={18} color="#050505" />
                </Pressable>
              </View>
            ) : (
              <SettingRow
                icon="dollar-sign"
                label="Monthly Income"
                value={`$${salary?.toLocaleString()}`}
                onPress={() => { setEditingSalary(true); setSalaryInput(salary?.toString()); }}
              />
            )}

            <View style={styles.separator} />

            <View style={styles.ruleSection}>
              <Text style={styles.ruleLabel}>Budget Rule</Text>
              <View style={styles.rulesRow}>
                {BUDGET_RULES.filter((r) => r.id !== 'custom').map((rule) => (
                  <Pressable
                    key={rule.id}
                    style={[
                      styles.ruleChip,
                      budgetRule.id === rule.id && styles.ruleChipActive,
                    ]}
                    onPress={() => setBudgetRule(rule)}
                  >
                    <Text style={[
                      styles.ruleChipText,
                      budgetRule.id === rule.id && { color: Colors.accent },
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
