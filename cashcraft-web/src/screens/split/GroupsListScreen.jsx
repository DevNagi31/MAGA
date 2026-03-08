import { Plus, Users, ChevronRight, DollarSign } from 'lucide-react';
import { Colors } from '../../constants/theme';
import { useGroupStore } from '../../store';
import { formatCurrency } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import MemberAvatar from '../../components/MemberAvatar';

export default function GroupsListScreen({ navigate }) {
  const groups = useGroupStore((s) => s.groups);

  return (
    <div className="screen" style={{ background: Colors.bg }}>
      <div style={{ padding: '20px 16px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: '700', color: Colors.textPrimary }}>Groups</h1>
          <button
            onClick={() => navigate('createGroup')}
            style={{
              width: 40, height: 40, borderRadius: 20,
              background: 'linear-gradient(135deg, #34D399, #10B981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(52,211,153,0.3)',
            }}
          >
            <Plus size={18} color="#050505" />
          </button>
        </div>

        {groups.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: Colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${Colors.border}` }}>
              <Users size={32} color={Colors.textTertiary} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary }}>No groups yet</h2>
            <p style={{ fontSize: 15, color: Colors.textSecondary }}>Create a group to start splitting bills</p>
            <button
              onClick={() => navigate('createGroup')}
              style={{
                padding: '12px 24px', borderRadius: 12, marginTop: 8,
                background: Colors.accentDim, border: `1px solid ${Colors.accent}40`,
                color: Colors.accent, fontSize: 15, fontWeight: '600', cursor: 'pointer',
              }}
            >
              Create Group
            </button>
          </div>
        ) : (
          groups.map((group) => {
            const unsettled = group.bills.filter((b) => !b.settled);
            const total = unsettled.reduce((s, b) => s + b.amount, 0);
            return (
              <GlassCard
                key={group.id}
                style={{ marginBottom: 12 }}
                onClick={() => navigate('groupDetail', { groupId: group.id })}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex' }}>
                    {group.members.slice(0, 3).map((m, i) => (
                      <div key={m.id} style={{ marginLeft: i > 0 ? -10 : 0 }}>
                        <MemberAvatar name={m.name} color={m.color} size={34} />
                      </div>
                    ))}
                    {group.members.length > 3 && (
                      <div style={{
                        width: 34, height: 34, borderRadius: 17, marginLeft: -10,
                        background: Colors.cardElevated, border: `1px solid ${Colors.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary }}>+{group.members.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} color={Colors.textTertiary} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 }}>{group.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: Colors.textSecondary }}>{group.members.length} members</span>
                  <div style={{ width: 3, height: 3, borderRadius: 1.5, background: Colors.textTertiary }} />
                  <span style={{ fontSize: 13, color: Colors.textSecondary }}>{unsettled.length} unsettled {unsettled.length === 1 ? 'bill' : 'bills'}</span>
                </div>
                {total > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <DollarSign size={12} color={Colors.textTertiary} />
                    <span style={{ fontSize: 13, color: Colors.textTertiary }}>{formatCurrency(total)} total</span>
                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
