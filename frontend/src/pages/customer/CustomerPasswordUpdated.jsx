import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import '../../styles/customer-auth.css';

function TshirtOutline({ size = 165, strokeWidth = 1.15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path
        d="M8.5 4.5C9.3 5.7 10.6 6.3 12 6.3C13.4 6.3 14.7 5.7 15.5 4.5L20 6.8L18.3 10.8L16 9.8V19.2C16 19.64 15.64 20 15.2 20H8.8C8.36 20 8 19.64 8 19.2V9.8L5.7 10.8L4 6.8L8.5 4.5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 13L9.5 17.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CustomerPasswordUpdated() {
  const navigate = useNavigate();

  return (
    <div className="cauth-shell login-layout">
      {/* Kolom Kiri: Konfirmasi Password Updated */}
      <main className="cauth-right">
        <div className="cauth-right-topbar">
          <Link to="/" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <Logo variant="dark" />
          </Link>

          <Link to="/login" className="cauth-back-link">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 12.5L5.5 8L10 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back to login</span>
          </Link>
        </div>

        <div className="cauth-form-wrap">
          <div className="cauth-icon-badge solid-success" aria-hidden="true">
            <CheckIcon />
          </div>

          <h1 className="cauth-heading">Password updated!</h1>
          <p className="cauth-subheading" style={{ lineHeight: 1.55, marginBottom: '26px' }}>
            Your password has been changed. You can now log in with your new password.
          </p>

          <button
            type="button"
            className="cauth-submit-btn"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>

        <p className="cauth-footer-copy">&copy; 2026 Re-Run. All rights reserved.</p>
      </main>

      {/* Kolom Kanan: Panel Visual Biru */}
      <aside className="cauth-left">
        <Link to="/" className="cauth-left-logo">
          <Logo variant="light" />
        </Link>

        <div className="cauth-illustration-stage" aria-hidden="true">
          <span className="cauth-mini-tee top-right">
            <TshirtOutline size={74} strokeWidth={1.2} />
          </span>

          <div className="cauth-glow-circle">
            <TshirtOutline size={185} strokeWidth={1.1} />
          </div>

          <span className="cauth-mini-tee bottom-left">
            <TshirtOutline size={74} strokeWidth={1.2} />
          </span>
        </div>

        <div className="cauth-left-copy">
          <h2 className="cauth-left-title">You&apos;re all set.</h2>
          <p className="cauth-left-sub">
            Log in and pick up where you left off.
          </p>
        </div>
      </aside>
    </div>
  );
}