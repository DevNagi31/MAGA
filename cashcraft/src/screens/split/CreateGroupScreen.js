import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useGroupStore } from '../../context/store';
import MemberAvatar from '../../components/MemberAvatar';
import PremiumButton from '../../components/PremiumButton';
import { useHaptic } from '../../hooks/useHaptic';

const MEMBER_COLORS = [
  '#34D399', '#60A5FA', '#F97316', '#A78BFA',
  '#F472B6', '#FBBF24', '#6EE7B7', '#EF4444',
];

export default function CreateGroupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const addGroup = useGroupStore((s) => s.addGroup);
  const { success, light } = useHaptic();

  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([
    { id: `m-${Date.now()}`, name: '', color: MEMBER_COLORS[0] },
  ]);
  const [newMemberName, setNewMemberName] = useState('');

  const addMember = () => {
    if (!newMemberName.trim()) return;
    light();
    setMembers((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: newMemberName.trim(),
        color: MEMBER_COLORS[prev.length % MEMBER_COLORS.length],
      },
    ]);
    setNewMemberName('');
  };

  const removeMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCreate = () => {
    const validMembers = members.filter((m) => m.name.trim());
    if (!groupName.trim() || validMembers.length < 2) return;
    success();
    addGroup({ name: groupName.trim(), members: validMembers });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Group Name */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. NYC Trip, Apartment, Wedding..."
            placeholderTextColor={Colors.textTertiary}
            value={groupName}
            onChangeText={setGroupName}
            maxLength={40}
            autoFocus
          />
        </Animated.View>

        {/* Members */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.label}>Members</Text>
          <Text style={styles.sublabel}>Add at least 2 people</Text>

          {members.filter((m) => m.name.trim()).map((member, i) => (
            <View key={member.id} style={styles.memberRow}>
              <MemberAvatar name={member.name} color={member.color} size={38} />
              <Text style={styles.memberName}>{member.name}</Text>
              <Pressable onPress={() => removeMember(member.id)} style={styles.removeBtn}>
                <Feather name="x" size={16} color={Colors.textTertiary} />
              </Pressable>
            </View>
          ))}

          <View style={styles.addMemberRow}>
            <TextInput
              style={styles.memberInput}
              placeholder="Add member name..."
              placeholderTextColor={Colors.textTertiary}
              value={newMemberName}
              onChangeText={setNewMemberName}
              onSubmitEditing={addMember}
              returnKeyType="done"
              maxLength={30}
            />
            <Pressable
              style={[styles.addBtn, !newMemberName.trim() && styles.addBtnDisabled]}
              onPress={addMember}
              disabled={!newMemberName.trim()}
            >
              <Feather name="plus" size={18} color={newMemberName.trim() ? Colors.accent : Colors.textTertiary} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: Spacing.lg }}>
          <PremiumButton
            label="Create Group"
            onPress={handleCreate}
            disabled={!groupName.trim() || members.filter((m) => m.name.trim()).length < 2}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.base,
    gap: Spacing.xl,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  sublabel: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
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
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  memberInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: `${Colors.accent}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
});
