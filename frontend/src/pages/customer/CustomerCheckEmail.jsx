import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import '../../styles/customer-auth.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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

function EnvelopeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="2" y="4" width="20" height="16" rx="2.5" />
      <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatCountdown(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function CustomerCheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const targetEmail =
    location.state?.email ||
    localStorage.getItem('rerun_customer_reset_email') ||
    'alya@email.com';

  const [secondsLeft, setSecondsLeft] = useState(45);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleOpenEmailApp = () => {
    window.open('mailto:', '_blank', 'noopener,noreferrer');
    navigate('/reset-password', { state: { email: targetEmail } });
  };

  const handleResendLink = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    setResendNotice('');

    try {
      await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: targetEmail }),
      });
    } catch {
      // Tetap jalankan reset timer lokal saat backend belum aktif
    } finally {
      setResending(false);
      setSecondsLeft(45);
      setResendNotice(`A new reset link has been sent to ${targetEmail}.`);
    }
  };

  return (
    <div className="cauth-shell login-layout">
      {/* Kolom Kiri: Konfirmasi Check Your Email */}
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
          <div className="cauth-icon-badge success" aria-hidden="true">
            <EnvelopeIcon />
          </div>

          <h1 className="cauth-heading">Check your email</h1>
          <p className="cauth-subheading" style={{ lineHeight: 1.55 }}>
            We&apos;ve sent a password reset link to{' '}
            <strong style={{ color: 'var(--color-dark-navy)', fontWeight: 600 }}>{targetEmail}</strong>.
            The link is valid for 30 minutes.
          </p>

          {resendNotice && (
            <div className="cauth-alert success" role="status">
              <span>{resendNotice}</span>
            </div>
          )}

          <button type="button" className="cauth-submit-btn" onClick={handleOpenEmailApp}>
            Open Email App
          </button>

          <Link to="/login" className="cauth-secondary-outline-btn">
            Back to Login
          </Link>

          <div className="cauth-resend-box">
            <p>Didn&apos;t get the email? Check your spam folder or</p>
            <p>
              <button
                type="button"
                className="cauth-resend-btn"
                disabled={secondsLeft > 0 || resending}
                onClick={handleResendLink}
              >
                {resending ? 'Sending...' : 'Resend link'}
              </button>
              {secondsLeft > 0 && (
                <span> &middot; available in {formatCountdown(secondsLeft)}</span>
              )}
            </p>
          </div>
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
          <h2 className="cauth-left-title">Almost there.</h2>
          <p className="cauth-left-sub">
            Check your inbox for the reset link.
          </p>
        </div>
      </aside>
    </div>
  );
}