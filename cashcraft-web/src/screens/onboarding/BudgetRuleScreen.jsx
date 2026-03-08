import { ChevronLeft, PieChart } from 'lucide-react';
import { Colors, BUDGET_RULES } from '../../constants/theme';
import { useBudgetStore } from '../../store';

export default function BudgetRuleScreen({ onNext, onBack }) {
  const budgetRule = useBudgetStore((s) => s.budgetRule);
  const setBudgetRule = useBudgetStore((s) => s.setBudgetRule);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg }}>
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: Colors.accent, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: '600' }}>
          <ChevronLeft size={18} /> Back
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px 24px', gap: 24 }}>
        <div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: Colors.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <PieChart size={22} color={Colors.accent} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>Budget Rule</h2>
          <p style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 6 }}>How do you want to split your income?</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {BUDGET_RULES.map((rule) => {
            const active = budgetRule?.id === rule.id;
            return (
              <button
                key={rule.id}
                onClick={() => setBudgetRule(rule)}
                style={{
                  padding: '18px 20px', borderRadius: 16, textAlign: 'left',
                  background: active ? Colors.accentDim : Colors.card,
                  border: `1px solid ${active ? Colors.accent : Colors.border}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: '800', color: active ? Colors.accent : Colors.textPrimary }}>{rule.label}</div>
                    <div style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>{rule.description}</div>
                  </div>
                  {active && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: Colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="#050505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {[['Needs', rule.needs, '#60A5FA'], ['Wants', rule.wants, '#A78BFA'], ['Savings', rule.savings, Colors.accent]].map(([l, pct, c]) => (
                    <div key={l} style={{
                      flex: 1, padding: '8px 10px', borderRadius: 8,
                      background: `${c}15`,
                      border: `1px solid ${c}30`,
                    }}>
                      <div style={{ fontSize: 11, color: c, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 }}>{l}</div>
                      <div style={{ fontSize: 16, fontWeight: '800', color: c, marginTop: 2 }}>{pct}%</div>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />
        <button
          onClick={onNext}
          style={{
            padding: '16px 20px', borderRadius: 16, width: '100%',
            background: 'linear-gradient(135deg, #34D399, #10B981)',
            color: '#050505', fontSize: 16, fontWeight: '700', border: 'none', cursor: 'pointer',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
