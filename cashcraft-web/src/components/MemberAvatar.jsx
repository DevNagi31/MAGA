export default function MemberAvatar({ name, color, size = 36 }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `${color}22`,
      border: `1.5px solid ${color}55`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: size * 0.38,
        fontWeight: '700',
        color,
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {initials}
      </span>
    </div>
  );
}
