import { CheckCircle, DollarSign } from 'lucide-react';
import { Colors } from '../../constants/theme';
import { useBudgetStore, useAppStore } from '../../store';

export default function ConfirmScreen({ onBack }) {
  const { salary, budgetRule } = useBudgetStore();
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  const allocs = {
    needs: (salary * budgetRule.needs) / 100,
    wants: (salary * budgetRule.wants) / 100,
    savings: (salary * budgetRule.savings) / 100,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg, padding: 24 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #34D399, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(52,211,153,0.3)',
          }}>
            <CheckCircle size={36} color="#050505" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>You're all set!</h2>
          <p style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8 }}>Here's your budget plan</p>
        </div>

        <div style={{ background: Colors.card, borderRadius: 16, border: `1px solid ${Colors.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${Colors.border}` }}>
            <DollarSign size={18} color={Colors.accent} />
            <div>
              <div style={{ fontSize: 12, color: Colors.textTertiary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: 0.5 }}>Monthly Income</div>
              <div style={{ fontSize: 22, fontWeight: '800', color: Colors.accent }}>${salary.toLocaleString()}</div>
            </div>
          </div>
          {[
            { label: 'Needs', amount: allocs.needs, pct: budgetRule.needs, color: '#60A5FA' },
            { label: 'Wants', amount: allocs.wants, pct: budgetRule.wants, color: '#A78BFA' },
            { label: 'Savings', amount: allocs.savings, pct: budgetRule.savings, color: Colors.accent },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              padding: '14px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: i < arr.length - 1 ? `1px solid ${Colors.border}` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: row.color }} />
                <span style={{ fontSize: 15, fontWeight: '500', color: Colors.textPrimary }}>{row.label} ({row.pct}%)</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: '700', color: row.color }}>${row.amount.toFixed(0)}/mo</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => setOnboarded(true)}
          style={{
            padding: '16px 20px', borderRadius: 16, width: '100%',
            background: 'linear-gradient(135deg, #34D399, #10B981)',
            color: '#050505', fontSize: 16, fontWeight: '700', border: 'none', cursor: 'pointer',
          }}
        >
          Start Using CashCraft
        </button>
        <button
          onClick={onBack}
          style={{ padding: '12px 20px', borderRadius: 16, width: '100%', background: 'none', color: Colors.textTertiary, fontSize: 14, border: 'none', cursor: 'pointer' }}
        >
          Go back
        </button>
      </div>
    </div>
  );
}
