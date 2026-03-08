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
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius } from '../../constants/theme';
import { useGroupStore } from '../../context/store';
import MemberAvatar from '../../components/MemberAvatar';
import PremiumButton from '../../components/PremiumButton';
import { useHaptic } from '../../hooks/useHaptic';
import { useColors } from '../../hooks/useColors';

const MEMBER_COLORS = [
  '#34D399', '#60A5FA', '#F97316', '#A78BFA',
  '#F472B6', '#FBBF24', '#6EE7B7', '#EF4444',
];

export default function CreateGroupScreen({ navigation }) {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const addGroup = useGroupStore((s) => s.addGroup);
  const { success, light } = useHaptic();

  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberZelle, setNewMemberZelle] = useState('');
  const [showZelleInput, setShowZelleInput] = useState(false);

  const addMember = () => {
    if (!newMemberName.trim()) return;
    light();
    setMembers((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: newMemberName.trim(),
        zelleId: newMemberZelle.trim(),
        color: MEMBER_COLORS[prev.length % MEMBER_COLORS.length],
      },
    ]);
    setNewMemberName('');
    setNewMemberZelle('');
    setShowZelleInput(false);
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
    memberInfo: {
      flex: 1,
      gap: 3,
    },
    memberName: {
      fontSize: 15,
      fontWeight: '500',
      color: Colors.textPrimary,
    },
    zelleTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    zelleTagText: {
      fontSize: 12,
      color: Colors.accent,
      fontWeight: '500',
    },
    noZelle: {
      fontSize: 12,
      color: Colors.textTertiary,
    },
    removeBtn: {
      padding: Spacing.xs,
    },
    addMemberWrap: {
      marginTop: Spacing.md,
      gap: Spacing.sm,
    },
    addMemberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
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
    zelleInput: {
      flex: undefined,
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
    addZelleLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: Spacing.xs,
    },
    addZelleLinkText: {
      fontSize: 13,
      color: Colors.textTertiary,
    },
  });

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

          {members.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <MemberAvatar name={member.name} color={member.color} size={38} />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                {member.zelleId ? (
                  <View style={styles.zelleTag}>
                    <Feather name="zap" size={10} color={Colors.accent} />
                    <Text style={styles.zelleTagText}>{member.zelleId}</Text>
                  </View>
                ) : (
                  <Text style={styles.noZelle}>No Zelle ID</Text>
                )}
              </View>
              <Pressable onPress={() => removeMember(member.id)} style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.6 }]}>
                <Feather name="x" size={16} color={Colors.textTertiary} />
              </Pressable>
            </View>
          ))}

          {/* Add member inputs */}
          <View style={styles.addMemberWrap}>
            <View style={styles.addMemberRow}>
              <TextInput
                style={styles.memberInput}
                placeholder="Name"
                placeholderTextColor={Colors.textTertiary}
                value={newMemberName}
                onChangeText={setNewMemberName}
                onSubmitEditing={showZelleInput ? undefined : addMember}
                returnKeyType={showZelleInput ? 'next' : 'done'}
                maxLength={30}
              />
              <Pressable
                style={({ pressed }) => [styles.addBtn, !newMemberName.trim() && styles.addBtnDisabled, pressed && !(!newMemberName.trim()) && { opacity: 0.7 }]}
                onPress={addMember}
                disabled={!newMemberName.trim()}
              >
                <Feather name="plus" size={18} color={newMemberName.trim() ? Colors.accent : Colors.textTertiary} />
              </Pressable>
            </View>

            {showZelleInput ? (
              <TextInput
                style={[styles.memberInput, styles.zelleInput]}
                placeholder="Zelle phone or email (optional)"
                placeholderTextColor={Colors.textTertiary}
                value={newMemberZelle}
                onChangeText={setNewMemberZelle}
                onSubmitEditing={addMember}
                returnKeyType="done"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Pressable
                style={({ pressed }) => [styles.addZelleLink, pressed && { opacity: 0.6 }]}
                onPress={() => setShowZelleInput(true)}
              >
                <Feather name="zap" size={12} color={Colors.textTertiary} />
                <Text style={styles.addZelleLinkText}>Add Zelle ID (optional)</Text>
              </Pressable>
            )}
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
