import React, { useState } from 'react';
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
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, CATEGORIES } from '../../constants/theme';
import { useExpenseStore } from '../../context/store';
import AmountInput from '../../components/AmountInput';
import CategoryChip from '../../components/CategoryChip';
import PremiumButton from '../../components/PremiumButton';
import { useHaptic } from '../../hooks/useHaptic';

export default function AddExpenseScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const addExpense = useExpenseStore((s) => s.addExpense);
  const { success, light } = useHaptic();

  const [amount, setAmount] = useState(route.params?.amount?.toString() || '');
  const [category, setCategory] = useState(route.params?.category || 'food');
  const [description, setDescription] = useState(route.params?.description || '');
  const [date] = useState(new Date().toISOString());

  const handleAdd = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0 || !description.trim()) return;
    success();
    addExpense({ amount: val, category, description: description.trim(), date });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount */}
        <AmountInput value={amount} onChange={setAmount} />

        {/* Category */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.sectionLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                selected={category === cat.id}
                onPress={() => { light(); setCategory(cat.id); }}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="What was this for?"
            placeholderTextColor={Colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            maxLength={80}
          />
        </Animated.View>

        {/* Date row */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.dateRow}>
          <Feather name="calendar" size={16} color={Colors.textSecondary} />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.addBtn}>
          <PremiumButton
            label="Add Expense"
            onPress={handleAdd}
            disabled={!amount || parseFloat(amount) <= 0 || !description.trim()}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  categoryScroll: {
    paddingBottom: Spacing.xs,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  addBtn: {
    marginTop: Spacing.sm,
  },
});
