import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

function evaluatePasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', level: '' };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8) score += 1;
  if (/[A-Za-z]/.test(pwd) && /\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd) || (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && pwd.length >= 8)) {
    score += 1;
  }

  if (score <= 1) return { score: 1, label: 'Weak', level: 'weak' };
  if (score === 2) return { score: 2, label: 'Fair', level: 'fair' };
  if (score === 3) return { score: 3, label: 'Good', level: 'good' };
  return { score: 4, label: 'Strong', level: 'strong' };
}

export default function CustomerRegister() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const phoneDigits = phone.replace(/\D/g, '');
  const isNameValid = fullName.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPhoneValid = phoneDigits.length >= 10;
  const isPasswordValid = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;

  const showNameError = (touched.fullName || submitted) && !isNameValid;
  const showEmailError = (touched.email || submitted) && !isEmailValid;
  const showPhoneError = (touched.phone || submitted) && !isPhoneValid;
  const showConfirmError = (touched.confirmPassword || submitted) && confirmPassword.length > 0 && !isConfirmValid;
  const showConfirmRequiredError = submitted && confirmPassword.length === 0;

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError('');

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isPasswordValid || !isConfirmValid) {
      return;
    }

    if (!agreedTerms) {
      setFormError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.token) {
          localStorage.setItem('rerun_customer_token', data.token);
        }
        localStorage.setItem(
          'rerun_customer_user',
          JSON.stringify(data.user || { name: fullName.trim(), email: email.trim(), phone: phone.trim() })
        );
        navigate('/login', { state: { registeredEmail: email.trim() } });
        return;
      }

      if (res.status === 422) {
        const firstServerError = data?.errors
          ? Object.values(data.errors).flat()[0]
          : data?.message;
        setFormError(firstServerError || 'Please review your registration details.');
        setSubmitting(false);
        return;
      }

      throw new Error('Fallback to local registration');
    } catch {
      const existingCustomers = JSON.parse(localStorage.getItem('rerun_registered_customers') || '[]');
      const duplicate = existingCustomers.some(
        (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (duplicate) {
        setFormError('An account with this email already exists. Please log in instead.');
        setSubmitting(false);
        return;
      }

      const newCustomer = {
        id: Date.now(),
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      };
      localStorage.setItem('rerun_registered_customers', JSON.stringify([...existingCustomers, newCustomer]));
      setSubmitting(false);
      navigate('/login', { state: { registeredEmail: email.trim() } });
    }
  };

  return (
    <div className="cauth-shell">
      {/* Kolom Kiri: Panel Visual Biru */}
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
          <h2 className="cauth-left-title">Wear it again. Wear it better.</h2>
          <p className="cauth-left-sub">
            Join Re-Run to discover curated, timeless pieces and enjoy member-only drops.
          </p>
        </div>
      </aside>

      {/* Kolom Kanan: Formulir Registrasi */}
      <main className="cauth-right">
        <div className="cauth-right-topbar">
          <Link to="/" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <Logo variant="dark" />
          </Link>

          <Link to="/" className="cauth-back-link">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 12.5L5.5 8L10 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back to shop</span>
          </Link>
        </div>

        <div className="cauth-form-wrap">
          <h1 className="cauth-heading">Create your account.</h1>
          <p className="cauth-subheading">It takes less than a minute to get started.</p>

          {formError && (
            <div className="cauth-alert error" role="alert">
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="cauth-group">
              <label htmlFor="reg-fullname" className="cauth-label">
                Full Name
              </label>
              <div className="cauth-input-wrap">
                <input
                  id="reg-fullname"
                  type="text"
                  className={`cauth-input ${
                    isNameValid ? 'is-valid' : showNameError ? 'is-error' : ''
                  }`}
                  placeholder="Alya Putri"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                />
                {isNameValid && (
                  <span className="cauth-input-icons">
                    <span className="cauth-status-icon valid" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.1">
                        <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                )}
              </div>
              {showNameError && (
                <p className="cauth-field-error">Please enter your full name (min. 2 characters).</p>
              )}
            </div>

            {/* Email */}
            <div className="cauth-group">
              <label htmlFor="reg-email" className="cauth-label">
                Email
              </label>
              <div className="cauth-input-wrap">
                <input
                  id="reg-email"
                  type="email"
                  className={`cauth-input ${
                    isEmailValid ? 'is-valid' : showEmailError ? 'is-error' : ''
                  }`}
                  placeholder="alya@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                />
                {isEmailValid && (
                  <span className="cauth-input-icons">
                    <span className="cauth-status-icon valid" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.1">
                        <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                )}
                {showEmailError && (
                  <span className="cauth-input-icons">
                    <span className="cauth-status-icon error" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="10" cy="10" r="8" />
                        <line x1="10" y1="6.3" x2="10" y2="10.6" strokeLinecap="round" />
                        <circle cx="10" cy="13.5" r="0.8" fill="currentColor" />
                      </svg>
                    </span>
                  </span>
                )}
              </div>
              {showEmailError && (
                <p className="cauth-field-error">Please enter a valid email address.</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="cauth-group">
              <label htmlFor="reg-phone" className="cauth-label">
                Phone Number
              </label>
              <div className="cauth-input-wrap">
                <input
                  id="reg-phone"
                  type="tel"
                  className={`cauth-input ${
                    isPhoneValid ? 'is-valid' : showPhoneError ? 'is-error' : ''
                  }`}
                  placeholder="0812-3456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                />
                {isPhoneValid && (
                  <span className="cauth-input-icons">
                    <span className="cauth-status-icon valid" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.1">
                        <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                )}
                {showPhoneError && (
                  <span className="cauth-input-icons">
                    <span className="cauth-status-icon error" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="10" cy="10" r="8" />
                        <line x1="10" y1="6.3" x2="10" y2="10.6" strokeLinecap="round" />
                        <circle cx="10" cy="13.5" r="0.8" fill="currentColor" />
                      </svg>
                    </span>
                  </span>
                )}
              </div>
              {showPhoneError && (
                <p className="cauth-field-error">Please enter a valid phone number (min. 10 digits).</p>
              )}
            </div>

            {/* Password */}
            <div className="cauth-group">
              <label htmlFor="reg-password" className="cauth-label">
                Password
              </label>
              <div className="cauth-input-wrap">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`cauth-input ${
                    (touched.password || submitted) && !isPasswordValid ? 'is-error' : ''
                  }`}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                />
                <span className="cauth-input-icons">
                  <button
                    type="button"
                    className="cauth-eye-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </span>
              </div>

              <div className="cauth-strength-wrap">
                <div className="cauth-strength-bars" aria-hidden="true">
                  {[1, 2, 3, 4].map((idx) => (
                    <span
                      key={idx}
                      className={`cauth-strength-seg ${
                        strength.score >= idx ? `active ${strength.level}` : ''
                      }`}
                    />
                  ))}
                </div>
                <p className="cauth-strength-text">
                  {strength.label && (
                    <>
                      <span className={`cauth-strength-label ${strength.level}`}>
                        {strength.label}
                      </span>{' '}
                      &middot;{' '}
                    </>
                  )}
                  use 8+ characters with a mix of letters and numbers
                </p>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="cauth-group">
              <label htmlFor="reg-confirm-password" className="cauth-label">
                Confirm Password
              </label>
              <div className="cauth-input-wrap">
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`cauth-input has-two-icons ${
                    isConfirmValid
                      ? 'is-valid'
                      : showConfirmError || showConfirmRequiredError
                      ? 'is-error'
                      : ''
                  }`}
                  placeholder="Re-enter your password"
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

                  {isConfirmValid && (
                    <span className="cauth-status-icon valid" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.1">
                        <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}

                  {(showConfirmError || showConfirmRequiredError) && (
                    <span className="cauth-status-icon error" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="10" cy="10" r="8" />
                        <line x1="10" y1="6.3" x2="10" y2="10.6" strokeLinecap="round" />
                        <circle cx="10" cy="13.5" r="0.8" fill="currentColor" />
                      </svg>
                    </span>
                  )}
                </span>
              </div>
              {showConfirmError && <p className="cauth-field-error">Passwords do not match.</p>}
              {showConfirmRequiredError && (
                <p className="cauth-field-error">Please confirm your password.</p>
              )}
            </div>

            {/* Terms & Privacy Checkbox */}
            <label className="cauth-terms-row">
              <input
                type="checkbox"
                className="cauth-checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {/* Tombol Create Account */}
            <button type="submit" className="cauth-submit-btn" disabled={submitting}>
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="cauth-switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <p className="cauth-footer-copy">&copy; 2026 Re-Run. All rights reserved.</p>
      </main>
    </div>
  );
}