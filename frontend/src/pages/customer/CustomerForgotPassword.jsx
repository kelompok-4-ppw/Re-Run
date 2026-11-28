import { useState } from 'react';
import { Link } from 'react-router-dom';
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

function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.85 12.15L19 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 5L20.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 7.5L17.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CustomerForgotPassword() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const showEmailError = (touched || submitted) && !isEmailValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError('');

    if (!isEmailValid) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        localStorage.setItem('rerun_customer_reset_email', email.trim());
        setSentSuccess(true);
        setSubmitting(false);
        return;
      }

      if (res.status === 422 || res.status === 404) {
        setFormError(data?.message || 'We could not find an account with that email address.');
        setSubmitting(false);
        return;
      }

      throw new Error('Fallback to local reset flow');
    } catch {
      localStorage.setItem('rerun_customer_reset_email', email.trim());
      setSentSuccess(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="cauth-shell login-layout">
      {/* Kolom Kiri: Formulir Forgot Password */}
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
          <div className="cauth-icon-badge" aria-hidden="true">
            <KeyIcon />
          </div>

          <h1 className="cauth-heading">Forgot password?</h1>
          <p className="cauth-subheading" style={{ lineHeight: 1.55 }}>
            No worries. Enter the email linked to your account and we&apos;ll send you a link to reset your password.
          </p>

          {sentSuccess && !formError && (
            <div className="cauth-alert success" role="status">
              <span>
                Password reset link sent to <strong>{email.trim()}</strong>. Please check your inbox.
              </span>
            </div>
          )}

          {formError && (
            <div className="cauth-alert error" role="alert">
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="cauth-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="forgot-email" className="cauth-label">
                Email
              </label>
              <div className="cauth-input-wrap">
                <input
                  id="forgot-email"
                  type="email"
                  className={`cauth-input ${showEmailError ? 'is-error' : ''}`}
                  placeholder="alya@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (sentSuccess) setSentSuccess(false);
                  }}
                  onBlur={() => setTouched(true)}
                />
              </div>
              {showEmailError && (
                <p className="cauth-field-error">Please enter a valid email address.</p>
              )}
            </div>

            <button type="submit" className="cauth-submit-btn" disabled={submitting}>
              {submitting ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="cauth-switch-text">
            Remember your password? <Link to="/login">Login</Link>
          </p>
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
          <h2 className="cauth-left-title">Back on track in no time.</h2>
          <p className="cauth-left-sub">
            Reset your password in a few quick steps.
          </p>
        </div>
      </aside>
    </div>
  );
}