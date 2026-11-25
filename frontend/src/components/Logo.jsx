export default function Logo({ variant = 'dark' }) {
  const isLight = variant === 'light';
  const fillColor = isLight ? '#FFFFFF' : 'var(--color-dark-navy)';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        userSelect: 'none',
      }}
    >
      <svg
        width="38"
        height="24"
        viewBox="0 0 46 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M16.5 11.8C25.5 8.8 35 5.8 44.5 2.8C41.2 12.2 34.2 19.6 24.2 24.2C26.8 20.8 27.4 18.2 26.3 16.1L1.2 26.6L25.4 14.8C23.4 13.1 20.4 12.1 16.5 11.8Z"
          fill={fillColor}
        />
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '20px',
          letterSpacing: '0.09em',
          color: fillColor,
          lineHeight: 1,
        }}
      >
        RERUN
      </span>
    </div>
  );
}