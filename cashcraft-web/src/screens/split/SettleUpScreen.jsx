import { useState, useMemo } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Colors } from '../../constants/theme';
import { useGroupStore } from '../../store';
import { simplifyDebts } from '../../utils/debtSimplifier';
import { formatCurrency } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import MemberAvatar from '../../components/MemberAvatar';
import PremiumButton from '../../components/PremiumButton';
import ScreenHeader from '../../components/ScreenHeader';

export default function SettleUpScreen({ navigate, params }) {
  const { groupId } = params;
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));
  const settleAllDebts = useGroupStore((s) => s.settleAllDebts);
  const [settled, setSettled] = useState(false);

  const debts = useMemo(() => {
    if (!group) return [];
    return simplifyDebts(group.members, group.bills.filter((b) => !b.settled));
  }, [group]);

  const handleSettleAll = () => {
    settleAllDebts(groupId);
    setSettled(true);
    setTimeout(() => navigate('back'), 2000);
  };

  if (!group) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg }}>
      <ScreenHeader title="Settle Up" onBack={() => navigate('back')} />
      <div className="screen" style={{ flex: 1 }}>
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 60 }}>
          {settled ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 20 }}>
              <div style={{
                width: 100, height: 100, borderRadius: 50,
                background: 'linear-gradient(135deg, #34D399, #10B981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(52,211,153,0.4)',
                animation: 'scale-in 0.3s ease',
              }}>
                <Check size={40} color="#050505" />
              </div>
              <h2 style={{ fontSize: 34, fontWeight: '700', color: Colors.textPrimary }}>All Settled!</h2>
              <p style={{ fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 1.5 }}>
                All debts in {group.name} have been marked as settled.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 }}>Simplified Debts</h2>
              <p style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 8 }}>
                {debts.length === 0
                  ? 'Everyone is settled up!'
                  : `${debts.length} transaction${debts.length > 1 ? 's' : ''} needed to settle all debts`}
              </p>

              {debts.map((debt, i) => (
                <GlassCard key={i} style={{ marginBottom: 8 }} padding={20}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                      <MemberAvatar name={debt.fromName} color="#EF4444" size={44} />
                      <span style={{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary }}>{debt.fromName}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                      <span style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary }}>{formatCurrency(debt.amount)}</span>
                      <ArrowRight size={20} color={Colors.textTertiary} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                      <MemberAvatar name={debt.toName} color="#34D399" size={44} />
                      <span style={{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary }}>{debt.toName}</span>
                    </div>
                  </div>
                </GlassCard>
              ))}

              {debts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  <PremiumButton label="Mark All Settled" onPress={handleSettleAll} />
                  <PremiumButton label="Cancel" variant="ghost" onPress={() => navigate('back')} />
                </div>
              )}

              {debts.length === 0 && (
                <div style={{ textAlign: 'center', paddingTop: 40 }}>
                  <p style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}>Nothing to settle</p>
                  <p style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8 }}>This group is all balanced out</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
