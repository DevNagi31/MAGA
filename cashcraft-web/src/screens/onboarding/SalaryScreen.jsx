import { useState } from 'react';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { Colors } from '../../constants/theme';
import { useBudgetStore } from '../../store';

const PRESETS = [2500, 3500, 4500, 6000, 8000];

export default function SalaryScreen({ onNext, onBack }) {
  const setSalary = useBudgetStore((s) => s.setSalary);
  const [value, setValue] = useState('4500');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
    const num = parseFloat(e.target.value);
    if (e.target.value && num <= 0) setError('Income must be greater than $0');
    else if (e.target.value && num > 999999) setError('Income cannot exceed $999,999');
    else setError('');
  };

  const handleNext = () => {
    const num = parseFloat(value);
    if (!num || num <= 0) { setError('Please enter a valid income amount'); return; }
    if (num > 999999) { setError('Income cannot exceed $999,999'); return; }
    setSalary(num);
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg }}>
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: Colors.accent, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: '600' }}>
          <ChevronLeft size={18} /> Back
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px 24px', gap: 28 }}>
        <div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: Colors.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <TrendingUp size={22} color={Colors.accent} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>Monthly Income</h2>
          <p style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 6 }}>What's your average take-home pay?</p>
        </div>

        {/* Input */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 28, fontWeight: '700', color: Colors.accent }}>$</span>
          <input
            type="number"
            value={value}
            onChange={handleChange}
            min="1"
            max="999999"
            style={{
              width: '100%', padding: '18px 16px 18px 44px',
              fontSize: 28, fontWeight: '700', color: Colors.textPrimary,
              background: Colors.card, borderRadius: 14,
              border: `1px solid ${error ? Colors.danger : Colors.border}`,
            }}
            placeholder="0"
          />
          {error && <p style={{ fontSize: 13, color: Colors.danger, marginTop: 8 }}>{error}</p>}
        </div>

        {/* Presets */}
        <div>
          <p style={{ fontSize: 12, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Quick select</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setValue(p.toString())}
                style={{
                  padding: '8px 16px', borderRadius: 10,
                  background: value === p.toString() ? Colors.accentDim : Colors.card,
                  border: `1px solid ${value === p.toString() ? Colors.accent : Colors.border}`,
                  color: value === p.toString() ? Colors.accent : Colors.textSecondary,
                  fontSize: 14, fontWeight: '600', cursor: 'pointer',
                }}
              >
                ${p.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <button
          onClick={handleNext}
          disabled={!value || parseFloat(value) <= 0}
          style={{
            padding: '16px 20px', borderRadius: 16, width: '100%',
            background: !value || parseFloat(value) <= 0 ? Colors.border : 'linear-gradient(135deg, #34D399, #10B981)',
            color: !value || parseFloat(value) <= 0 ? Colors.textTertiary : '#050505',
            fontSize: 16, fontWeight: '700', border: 'none', cursor: 'pointer',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
