import { useState } from 'react';
import Icon from './Icon';
import { Colors, CATEGORIES } from '../constants/theme';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function ExpenseItem({ expense, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  const cat = CATEGORIES.find((c) => c.id === expense.category);
  const color = cat?.color || Colors.textTertiary;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: Colors.card,
        borderRadius: 12,
        border: `1px solid ${Colors.border}`,
        marginBottom: 8,
        cursor: 'pointer',
      }}
      onClick={() => setShowDelete(!showDelete)}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name={cat?.icon || 'MoreHorizontal'} size={16} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {expense.description}
        </div>
        <div style={{ fontSize: 12, color: Colors.textTertiary, marginTop: 2 }}>
          {cat?.label} · {formatDate(expense.date)}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>
          {formatCurrency(expense.amount)}
        </div>
        {showDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
            style={{
              marginTop: 4,
              fontSize: 11,
              color: Colors.danger,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 6,
              padding: '2px 8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
