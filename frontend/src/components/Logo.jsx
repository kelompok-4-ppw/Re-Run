export default function Logo({ variant = 'dark' }) {
  const isLight = variant === 'light';
  const textColor = isLight ? '#FFFFFF' : 'var(--color-dark-navy)';
  const iconColor = isLight ? '#FFFFFF' : 'var(--color-primary-navy)';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
      <svg width="26" height="20" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 16.5L26 3L16.5 19.5L13.5 13L2 16.5Z" fill={iconColor} />
        <path
          d="M13.5 13L26 3L10.5 11.5L13.5 13Z"
          fill={isLight ? 'rgba(255,255,255,0.65)' : 'var(--color-royal-blue)'}
        />
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '19px',
          letterSpacing: '0.06em',
          color: textColor,
          lineHeight: 1,
        }}
      >
        RERUN
      </span>
    </div>
  );
}