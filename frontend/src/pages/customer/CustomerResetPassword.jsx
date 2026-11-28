import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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

function PadlockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ visible }) {
  if (!visible) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckMarkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.1">
      <path d="M3 8.5L6.5 12L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossMarkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 4L12 12M12 4L4 12" strokeLinecap="round" />
    </svg>
  );
}

export default function CustomerResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const targetEmail =
    searchParams.get('email') ||
    location.state?.email ||
    localStorage.getItem('rerun_customer_reset_email') ||
    'alya@email.com';
  const resetToken = searchParams.get('token') || 'demo_reset_token';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Evaluasi kriteria kata sandi
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);

  const metCount = [hasMinLength, hasNumber, hasUppercase, hasSymbol].filter(Boolean).length;

  let strengthLabel = '';
  let strengthLevel = '';
  if (newPassword.length > 0) {
    if (metCount <= 1) {
      strengthLabel = 'Weak password';
      strengthLevel = 'weak';
    } else if (metCount === 2) {
      strengthLabel = 'Fair password';
      strengthLevel = 'fair';
    } else {
      strengthLabel = 'Strong password';
      strengthLevel = 'strong';
    }
  }

  const isPasswordAcceptable = hasMinLength && hasNumber && hasUppercase;
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === newPassword;

  const showNewPwdError = (touched.newPassword || submitted) && !isPasswordAcceptable;
  const showConfirmError =
    (touched.confirmPassword || submitted) && confirmPassword.length > 0 && !isConfirmValid;
  const showConfirmRequired = submitted && confirmPassword.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError('');

    if (!isPasswordAcceptable || !isConfirmValid) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          email: targetEmail,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        localStorage.removeItem('rerun_customer_reset_email');
        navigate('/password-updated', { state: { email: targetEmail } });
        return;
      }

      if (res.status === 422 || res.status === 400) {
        setFormError(data?.message || 'Unable to reset password. Please check your new password.');
        setSubmitting(false);
        return;
      }

      throw new Error('Fallback to local password update');
    } catch {
      const existingCustomers = JSON.parse(localStorage.getItem('rerun_registered_customers') || '[]');
      const idx = existingCustomers.findIndex(
        (acc) => acc.email.toLowerCase() === targetEmail.toLowerCase()
      );

      if (idx !== -1) {
        if (existingCustomers[idx].password === newPassword) {
          setFormError('Your new password must be different from your previous one.');
          setSubmitting(false);
          return;
        }
        existingCustomers[idx] = { ...existingCustomers[idx], password: newPassword };
        localStorage.setItem('rerun_registered_customers', JSON.stringify(existingCustomers));
      }

      localStorage.removeItem('rerun_customer_reset_email');
      setSubmitting(false);
      navigate('/password-updated', { state: { email: targetEmail } });
    }
  };

  const criteriaList = [
    { label: 'At least 8 characters', met: hasMinLength },
    { label: 'Contains a number', met: hasNumber },
    { label: 'Contains an uppercase letter', met: hasUppercase },
    { label: 'Contains a symbol', met: hasSymbol },
  ];

  return (
    <div className="cauth-shell login-layout">
      {/* Kolom Kiri: Formulir Create New Password */}
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
            <PadlockIcon />
          </div>

          <h1 className="cauth-heading cauth-heading-compact">Create new password</h1>
          <p className="cauth-subheading" style={{ lineHeight: 1.55 }}>
            Your new password must be different from your previous one.
          </p>

          {formError && (
            <div className="cauth-alert error" role="alert">
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <div className="cauth-group">
              <label htmlFor="reset-new-password" className="cauth-label">
                New Password
              </label>
              <div className="cauth-input-wrap">
                <input
                  id="reset-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  className={`cauth-input ${showNewPwdError ? 'is-error' : ''}`}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, newPassword: true }))}
                />
                <span className="cauth-input-icons">
                  <button
                    type="button"
                    className="cauth-eye-btn"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    <EyeIcon visible={showNewPassword} />
                  </button>
                </span>
              </div>

              <div className="cauth-strength-wrap">
                <div className="cauth-strength-bars" aria-hidden="true">
                  {[1, 2, 3, 4].map((segIdx) => (
                    <span
                      key={segIdx}
                      className={`cauth-strength-seg ${
                        metCount >= segIdx ? `active ${strengthLevel}` : ''
                      }`}
                    />
                  ))}
                </div>
                <p className="cauth-strength-text">
                  {strengthLabel || 'Use 8+ characters with numbers and uppercase letters'}
                </p>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="cauth-group" style={{ marginBottom: 0 }}>
              <label htmlFor="reset-confirm-password" className="cauth-label">
                Confirm New Password
              </label>
              <div className="cauth-input-wrap">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`cauth-input ${
                    showConfirmError || showConfirmRequired ? 'is-error' : ''
                  }`}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                />
                <span className="cauth-input-icons">
                  <button
                    type="button"
                    className="cauth-eye-btn"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </span>
              </div>
              {showConfirmError && <p className="cauth-field-error">Passwords do not match.</p>}
              {showConfirmRequired && (
                <p className="cauth-field-error">Please confirm your new password.</p>
              )}
            </div>

            {/* Daftar Kriteria Password */}
            <ul className="cauth-checklist" aria-label="Password requirements">
              {criteriaList.map((item) => (
                <li
                  key={item.label}
                  className={`cauth-check-item ${item.met ? 'met' : 'unmet'}`}
                >
                  <span className="cauth-check-icon" aria-hidden="true">
                    {item.met ? <CheckMarkIcon /> : <CrossMarkIcon />}
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            <button type="submit" className="cauth-submit-btn" disabled={submitting}>
              {submitting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
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
          <h2 className="cauth-left-title">A fresh start.</h2>
          <p className="cauth-left-sub">
            Choose a strong password to keep your account safe.
          </p>
        </div>
      </aside>
    </div>
  );
}