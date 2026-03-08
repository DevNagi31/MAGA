import { useMemo } from 'react';
import { Plus, ArrowRight, CheckCircle } from 'lucide-react';
import { Colors } from '../../constants/theme';
import { useGroupStore } from '../../store';
import { simplifyDebts, getMemberBalance } from '../../utils/debtSimplifier';
import { formatCurrency, formatDate } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import MemberAvatar from '../../components/MemberAvatar';
import ScreenHeader from '../../components/ScreenHeader';

export default function GroupDetailScreen({ navigate, params }) {
  const { groupId } = params;
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));

  const debts = useMemo(() => {
    if (!group) return [];
    return simplifyDebts(group.members, group.bills.filter((b) => !b.settled));
  }, [group]);

  if (!group) return null;

  const unsettledBills = group.bills.filter((b) => !b.settled);
  const settledBills = group.bills.filter((b) => b.settled);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg }}>
      <ScreenHeader
        title={group.name}
        onBack={() => navigate('back')}
        right={
          <button
            onClick={() => navigate('addBill', { groupId })}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', borderRadius: 999,
              background: Colors.accentDim, border: `1px solid ${Colors.accent}40`,
              color: Colors.accent, fontSize: 13, fontWeight: '600', cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Add Bill
          </button>
        }
      />
      <div className="screen" style={{ flex: 1 }}>
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>
          {/* Members */}
          <div>
            <p style={{ fontSize: 12, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Members</p>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {group.members.map((m) => {
                const balance = getMemberBalance(m.id, group.members, group.bills.filter((b) => !b.settled));
                const balColor = balance > 0 ? Colors.success : balance < 0 ? Colors.danger : Colors.textTertiary;
                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 60 }}>
                    <MemberAvatar name={m.name} color={m.color} size={44} />
                    <span style={{ fontSize: 12, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' }}>{m.name}</span>
                    <span style={{ fontSize: 11, fontWeight: '700', color: balColor }}>
                      {balance > 0 ? `+${formatCurrency(balance)}` : balance < 0 ? `-${formatCurrency(Math.abs(balance))}` : 'Settled'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Who owes whom */}
          {debts.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Who owes whom</p>
                <button
                  onClick={() => navigate('settleUp', { groupId })}
                  style={{ padding: '6px 14px', borderRadius: 999, background: Colors.accentDim, border: `1px solid ${Colors.accent}40`, color: Colors.accent, fontSize: 13, fontWeight: '600', cursor: 'pointer' }}
                >
                  Settle Up
                </button>
              </div>
              {debts.map((debt, i) => (
                <GlassCard key={i} style={{ marginBottom: 8 }} padding={14}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <MemberAvatar name={debt.fromName} color="#EF4444" size={32} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <ArrowRight size={16} color={Colors.textTertiary} />
                      <span style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>{formatCurrency(debt.amount)}</span>
                    </div>
                    <MemberAvatar name={debt.toName} color="#34D399" size={32} />
                  </div>
                  <p style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center' }}>{debt.fromName} owes {debt.toName}</p>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Bills */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bills ({unsettledBills.length})</p>
            </div>

            {unsettledBills.length === 0 && (
              <GlassCard style={{ textAlign: 'center', padding: '28px 20px' }}>
                <CheckCircle size={24} color={Colors.accent} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 15, fontWeight: '600', color: Colors.accent }}>All bills settled!</p>
              </GlassCard>
            )}

            {unsettledBills.map((bill) => {
              const payer = group.members.find((m) => m.id === bill.paidBy);
              return (
                <GlassCard key={bill.id} style={{ marginBottom: 8 }} padding={14}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: '600', color: Colors.textPrimary }}>{bill.description}</p>
                      <p style={{ fontSize: 12, color: Colors.textTertiary, marginTop: 2 }}>{formatDate(bill.date)}</p>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>{formatCurrency(bill.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MemberAvatar name={payer?.name || '?'} color={payer?.color || '#8E8E93'} size={22} />
                    <span style={{ fontSize: 13, color: Colors.textSecondary }}>Paid by {payer?.name}</span>
                  </div>
                </GlassCard>
              );
            })}

            {settledBills.length > 0 && (
              <p style={{ fontSize: 13, color: Colors.textTertiary, textAlign: 'center', marginTop: 8 }}>
                {settledBills.length} settled bill{settledBills.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
