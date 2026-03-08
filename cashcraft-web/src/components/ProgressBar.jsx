import { Colors } from '../constants/theme';

export default function ProgressBar({ progress, color }) {
  const pct = Math.min(Math.max(progress, 0), 1);
  const barColor = color || (pct > 0.85 ? Colors.danger : pct > 0.6 ? Colors.warning : Colors.success);

  return (
    <div style={{
      height: 6,
      background: Colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${pct * 100}%`,
        background: barColor,
        borderRadius: 3,
        transition: 'width 0.4s ease',
      }} />
    </div>
  );
}
