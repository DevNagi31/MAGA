import Icon from './Icon';
import { Colors } from '../constants/theme';

export default function CategoryChip({ category, selected, onPress }) {
  return (
    <button
      onClick={onPress}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 12,
        paddingRight: 14,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 999,
        marginRight: 8,
        border: `1px solid ${selected ? category.color : Colors.border}`,
        background: selected ? `${category.color}20` : Colors.card,
        cursor: 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      <Icon name={category.icon} size={13} color={selected ? category.color : Colors.textTertiary} />
      <span style={{
        fontSize: 13,
        fontWeight: '600',
        color: selected ? category.color : Colors.textSecondary,
        whiteSpace: 'nowrap',
      }}>
        {category.label}
      </span>
    </button>
  );
}
