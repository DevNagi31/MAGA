import { DollarSign, Trash2, Zap } from 'lucide-react';
import { Colors, BUDGET_RULES } from '../../constants/theme';
import { useAppStore, useBudgetStore, useExpenseStore, useGroupStore } from '../../store';
import GlassCard from '../../components/GlassCard';

export default function SettingsScreen() {
  const { salary, budgetRule, setBudgetRule } = useBudgetStore();
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  const handleClearData = () => {
    if (!window.confirm('This will permanently delete all expenses, groups, and settings. This cannot be undone.')) return;
    useExpenseStore.setState({ expenses: [] });
    useGroupStore.setState({ groups: [] });
    useAppStore.setState({ isOnboarded: false });
  };

  const rows = [
    { icon: <DollarSign size={16} color={Colors.accent} />, label: "This Month's Income", value: `$${salary.toLocaleString()}` },
  ];

  return (
    <div className="screen" style={{ background: Colors.bg }}>
      <div style={{ padding: '20px 16px 100px' }}>
        <h1 style={{ fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginBottom: 28 }}>Settings</h1>

        {/* Budget */}
        <p style={{ fontSize: 12, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Budget</p>
        <GlassCard style={{ marginBottom: 24 }} padding={0}>
          {/* Income row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: Colors.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} color={Colors.accent} />
            </div>
            <span style={{ flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary }}>Monthly Income</span>
            <span style={{ fontSize: 15, color: Colors.textSecondary }}>${salary.toLocaleString()}</span>
          </div>

          <div style={{ height: 1, background: Colors.border, marginHorizontal: 16 }} />

          {/* Budget rule */}
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 15, fontWeight: '500', color: Colors.textPrimary, marginBottom: 12 }}>Budget Rule</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {BUDGET_RULES.map((rule) => (
                <button
                  key={rule.id}
                  onClick={() => setBudgetRule(rule)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 10, textAlign: 'center',
                    background: budgetRule?.id === rule.id ? Colors.accentDim : Colors.cardElevated,
                    border: `1px solid ${budgetRule?.id === rule.id ? Colors.accent : Colors.border}`,
                    color: budgetRule?.id === rule.id ? Colors.accent : Colors.textSecondary,
                    fontSize: 13, fontWeight: '600', cursor: 'pointer',
                  }}
                >
                  {rule.label}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Data */}
        <p style={{ fontSize: 12, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Data</p>
        <GlassCard style={{ marginBottom: 24 }} padding={0}>
          <button
            onClick={handleClearData}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={16} color={Colors.danger} />
            </div>
            <span style={{ flex: 1, fontSize: 15, fontWeight: '500', color: Colors.danger }}>Clear All Data</span>
          </button>
        </GlassCard>

        {/* About */}
        <p style={{ fontSize: 12, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>About</p>
        <GlassCard padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: Colors.accentDim,
              border: `1px solid ${Colors.accent}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DollarSign size={20} color={Colors.accent} />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>CashCraft</p>
              <p style={{ fontSize: 13, color: Colors.textSecondary }}>Version 1.0.0 Web</p>
            </div>
          </div>
          <p style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 1.6, marginBottom: 14 }}>
            Personal finance manager & bill splitter. Built with React + Vite.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
          }}>
            <Zap size={12} color={Colors.warning} />
            <span style={{ fontSize: 12, fontWeight: '600', color: Colors.warning }}>Built for HackBU 2026</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
