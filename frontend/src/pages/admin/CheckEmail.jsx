import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../../components/Logo';
import '../../styles/admin-login.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function TshirtOutline({ size = 240, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M84 44C92 56 105 62 120 62C135 62 148 56 156 44L198 66L182 104L160 94V194C160 198.418 156.418 202 152 202H88C83.5817 202 80 198.418 80 194V94L58 104L42 66L84 44Z"
        stroke="rgba(255, 255, 255, 0.16)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CheckEmail() {
  const location = useLocation();
  const targetEmail = location.state?.email || 'admin@rerun.id';

  const [secondsLeft, setSecondsLeft] = useState(45);
  const [resending, setResending] = useState(false);
  const [resentNotice, setResentNotice] = useState('');

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formattedTimer = `00:${String(secondsLeft).padStart(2, '0')}`;

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    setResentNotice('');

    try {
      await fetch(`${API_BASE_URL}/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
    } catch {
      // Tetap lanjutkan simulasi saat backend offline
    } finally {
      setResending(false);
      setSecondsLeft(45);
      setResentNotice(`A new reset link has been sent to ${targetEmail}.`);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Panel Kiri: Brand Showcase */}
      <div className="admin-login-left">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Logo variant="light" />
        </div>

        {/* Ilustrasi Lingkaran & Tiga Siluet Kaos */}
        <div className="admin-login-illustration" aria-hidden="true">
          <TshirtOutline size={104} className="admin-shirt-top-right" />
          <TshirtOutline size={236} />
          <TshirtOutline size={92} className="admin-shirt-bottom-left" />
        </div>

        <div className="admin-login-brand-copy">
          <h2>Almost there.</h2>
          <p>Check your inbox for the reset link.</p>
        </div>
      </div>

      {/* Panel Kanan: Konfirmasi Email Terkirim */}
      <div className="admin-login-right">
        <div className="admin-login-card">
          <Logo variant="dark" />

          <div>
            <Link to="/admin/login" className="admin-back-link">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M10 12.5L5.5 8L10 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Back to admin login</span>
            </Link>
          </div>

          {/* Ikon Amplop Melingkar Hijau */}
          <div className="admin-icon-badge success" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7L12 13L21 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="admin-login-header compact-top">
            <h1>Check your email</h1>
            <p>
              We&apos;ve sent a password reset link to{' '}
              <strong style={{ color: 'var(--color-text-dark)', fontWeight: 600 }}>{targetEmail}</strong>.
              <br />
              The link is valid for 30 minutes.
            </p>
          </div>

          {resentNotice && (
            <div className="admin-login-success" role="status">
              <span>{resentNotice}</span>
            </div>
          )}

          <a href="mailto:" className="admin-submit-btn">
            Open Email App
          </a>

          <Link to="/admin/login" className="admin-btn-outline">
            Back to Login
          </Link>

          <div className="admin-resend-box">
            <div>Didn&apos;t get the email? Check your spam folder or</div>
            <div>
              <button
                type="button"
                className="admin-resend-btn"
                disabled={secondsLeft > 0 || resending}
                onClick={handleResend}
              >
                {resending ? 'Sending...' : 'Resend link'}
              </button>
              {secondsLeft > 0 && <span> &middot; available in {formattedTimer}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}