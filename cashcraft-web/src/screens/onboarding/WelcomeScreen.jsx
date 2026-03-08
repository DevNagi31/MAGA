import { DollarSign, Zap, Users, BarChart2 } from 'lucide-react';
import { Colors } from '../../constants/theme';

const features = [
  { icon: DollarSign, label: 'Track spending', sub: 'Log expenses by category' },
  { icon: Users, label: 'Split bills', sub: 'Settle up with groups' },
  { icon: BarChart2, label: 'Analytics', sub: 'Budget insights & trends' },
  { icon: Zap, label: 'Scan receipts', sub: 'OCR-powered parsing' },
];

export default function WelcomeScreen({ onNext }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg, padding: 24 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'linear-gradient(135deg, #34D399, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(52,211,153,0.3)',
          }}>
            <DollarSign size={40} color="#050505" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 34, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 }}>CashCraft</h1>
            <p style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 6 }}>Your personal finance companion</p>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {features.map(({ icon: IconComp, label, sub }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px',
              background: Colors.card, borderRadius: 14,
              border: `1px solid ${Colors.border}`,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: Colors.accentDim,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconComp size={18} color={Colors.accent} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{label}</div>
                <div style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        style={{
          width: '100%', padding: '16px 20px', borderRadius: 16,
          background: 'linear-gradient(135deg, #34D399, #10B981)',
          color: '#050505', fontSize: 17, fontWeight: '700',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(52,211,153,0.3)',
          transition: 'transform 0.1s, opacity 0.1s',
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        Get Started
      </button>
      <p style={{ textAlign: 'center', fontSize: 12, color: Colors.textTertiary, marginTop: 12 }}>
        Built for HackBU 2026
      </p>
    </div>
  );
}
