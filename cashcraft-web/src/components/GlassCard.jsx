import { Colors } from '../constants/theme';

export default function GlassCard({ children, style, onClick, padding = 16 }) {
  const base = {
    borderRadius: 16,
    border: `1px solid ${Colors.glassBorder}`,
    background: Colors.glass,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding,
    transition: 'opacity 0.15s, transform 0.15s',
  };

  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{
          ...base,
          ...style,
          display: 'block',
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
        }}
        onMouseDown={(e) => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.transform = 'scale(0.98)'; }}
        onMouseUp={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
        onTouchStart={(e) => { e.currentTarget.style.opacity = '0.75'; }}
        onTouchEnd={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        {children}
      </button>
    );
  }

  return (
    <div style={{ ...base, ...style }}>
      {children}
    </div>
  );
}
