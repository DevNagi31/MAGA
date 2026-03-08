import { useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { Colors, MEMBER_COLORS } from '../../constants/theme';
import { useGroupStore } from '../../store';
import MemberAvatar from '../../components/MemberAvatar';
import PremiumButton from '../../components/PremiumButton';
import ScreenHeader from '../../components/ScreenHeader';

export default function CreateGroupScreen({ navigate }) {
  const addGroup = useGroupStore((s) => s.addGroup);
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([]);
  const [newName, setNewName] = useState('');
  const [newZelle, setNewZelle] = useState('');
  const [showZelle, setShowZelle] = useState(false);
  const [memberError, setMemberError] = useState('');

  const addMember = () => {
    if (!newName.trim()) return;
    if (members.some((m) => m.name.toLowerCase() === newName.trim().toLowerCase())) {
      setMemberError(`"${newName.trim()}" is already in the group`);
      return;
    }
    setMemberError('');
    setMembers((prev) => [...prev, {
      id: `m-${Date.now()}`,
      name: newName.trim(),
      zelleId: newZelle.trim(),
      color: MEMBER_COLORS[prev.length % MEMBER_COLORS.length],
    }]);
    setNewName('');
    setNewZelle('');
    setShowZelle(false);
  };

  const handleCreate = () => {
    if (!groupName.trim() || members.length < 2) return;
    addGroup({ name: groupName.trim(), members });
    navigate('back');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg }}>
      <ScreenHeader title="Create Group" onBack={() => navigate('back')} />
      <div className="screen" style={{ flex: 1 }}>
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Group Name */}
          <div>
            <p style={{ fontSize: 12, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Group Name</p>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. NYC Trip, Apartment, Wedding..."
              autoFocus
              maxLength={40}
              style={{
                width: '100%', padding: '14px 16px',
                fontSize: 16, color: Colors.textPrimary,
                background: Colors.card, borderRadius: 12,
                border: `1px solid ${Colors.border}`,
              }}
            />
          </div>

          {/* Members */}
          <div>
            <p style={{ fontSize: 12, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Members</p>
            <p style={{ fontSize: 13, color: Colors.textTertiary, marginBottom: 14 }}>Add at least 2 people</p>

            {members.map((m) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                paddingBottom: 12, marginBottom: 12,
                borderBottom: `1px solid ${Colors.border}`,
              }}>
                <MemberAvatar name={m.name} color={m.color} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: '500', color: Colors.textPrimary }}>{m.name}</div>
                  {m.zelleId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Zap size={10} color={Colors.accent} />
                      <span style={{ fontSize: 12, color: Colors.accent, fontWeight: '500' }}>{m.zelleId}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: Colors.textTertiary }}>No Zelle ID</span>
                  )}
                </div>
                <button onClick={() => setMembers((p) => p.filter((x) => x.id !== m.id))} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={16} color={Colors.textTertiary} />
                </button>
              </div>
            ))}

            {memberError && <p style={{ fontSize: 13, color: Colors.danger, marginBottom: 8 }}>{memberError}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setMemberError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && addMember()}
                  placeholder="Name"
                  maxLength={30}
                  style={{
                    flex: 1, padding: '12px 14px',
                    fontSize: 15, color: Colors.textPrimary,
                    background: Colors.card, borderRadius: 12,
                    border: `1px solid ${memberError ? Colors.danger : Colors.border}`,
                  }}
                />
                <button
                  onClick={addMember}
                  disabled={!newName.trim()}
                  style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: newName.trim() ? Colors.accentDim : Colors.card,
                    border: `1px solid ${newName.trim() ? Colors.accent + '60' : Colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: newName.trim() ? 'pointer' : 'default',
                  }}
                >
                  <Plus size={18} color={newName.trim() ? Colors.accent : Colors.textTertiary} />
                </button>
              </div>

              {showZelle ? (
                <input
                  type="text"
                  value={newZelle}
                  onChange={(e) => setNewZelle(e.target.value)}
                  placeholder="Zelle phone or email (optional)"
                  style={{
                    width: '100%', padding: '12px 14px',
                    fontSize: 15, color: Colors.textPrimary,
                    background: Colors.card, borderRadius: 12,
                    border: `1px solid ${Colors.border}`,
                  }}
                />
              ) : (
                <button
                  onClick={() => setShowZelle(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Zap size={12} color={Colors.textTertiary} />
                  <span style={{ fontSize: 13, color: Colors.textTertiary }}>Add Zelle ID (optional)</span>
                </button>
              )}
            </div>
          </div>

          <PremiumButton
            label="Create Group"
            onPress={handleCreate}
            disabled={!groupName.trim() || members.length < 2}
          />
        </div>
      </div>
    </div>
  );
}
