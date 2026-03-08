import { ChevronLeft } from 'lucide-react';
import { Colors } from '../constants/theme';

export default function ScreenHeader({ title, onBack, right }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 16px 12px',
      borderBottom: `1px solid ${Colors.border}`,
      background: Colors.bg,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              background: Colors.card,
              border: `1px solid ${Colors.border}`,
              cursor: 'pointer',
              marginRight: 4,
            }}
          >
            <ChevronLeft size={18} color={Colors.textPrimary} />
          </button>
        )}
        <span style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>{title}</span>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
