import { Colors } from '../constants/theme';

export default function PremiumButton({ label, onPress, disabled = false, variant = 'primary', icon }) {
  const styles = {
    primary: {
      background: disabled ? Colors.border : 'linear-gradient(135deg, #34D399, #10B981)',
      color: disabled ? Colors.textTertiary : '#050505',
      border: 'none',
    },
    secondary: {
      background: Colors.accentDim,
      color: Colors.accent,
      border: `1px solid ${Colors.accent}40`,
    },
    ghost: {
      background: 'transparent',
      color: Colors.textSecondary,
      border: `1px solid ${Colors.border}`,
    },
    danger: {
      background: 'rgba(239,68,68,0.12)',
      color: Colors.danger,
      border: `1px solid rgba(239,68,68,0.2)`,
    },
  };

  const s = styles[variant] || styles.primary;

  return (
    <button
      onClick={disabled ? undefined : onPress}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '14px 20px',
        borderRadius: 14,
        fontSize: 16,
        fontWeight: '700',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'opacity 0.15s, transform 0.1s',
        opacity: disabled ? 0.5 : 1,
        ...s,
      }}
      onMouseDown={(e) => { if (!disabled) { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.opacity = '0.85'; } }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
    >
      {icon && icon}
      {label}
    </button>
  );
}
