import { useState } from 'react';
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

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export default function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const registeredEmail = location.state?.registeredEmail || '';

  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordFilled = password.length >= 6;

  const showEmailError = (touched.email || submitted) && !isEmailValid;
  const showPasswordError = (touched.password || submitted) && !isPasswordFilled;

  const completeLoginSession = (userObj, tokenValue) => {
    localStorage.setItem('rerun_customer_token', tokenValue);
    localStorage.setItem('rerun_customer_user', JSON.stringify(userObj));
    if (rememberMe) {
      localStorage.setItem('rerun_customer_remember', 'true');
    } else {
      localStorage.removeItem('rerun_customer_remember');
    }
    navigate('/home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError('');

    if (!isEmailValid || !isPasswordFilled) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          remember: rememberMe,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        completeLoginSession(
          data.user || { name: 'Alya Putri', email: email.trim(), phone: '+62 812-3456-7890' },
          data.token || 'rerun_customer_session_token'
        );
        return;
      }

      if (res.status === 401 || res.status === 422) {
        setFormError(data?.message || 'Invalid email or password. Please try again.');
        setSubmitting(false);
        return;
      }

      throw new Error('Fallback to local authentication');
    } catch {
      const normalizedEmail = email.trim().toLowerCase();
      const registeredCustomers = JSON.parse(localStorage.getItem('rerun_registered_customers') || '[]');
      const matchedCustomer = registeredCustomers.find(
        (acc) => acc.email.toLowerCase() === normalizedEmail
      );

      if (matchedCustomer) {
        if (matchedCustomer.password !== password) {
          setFormError('Incorrect password for this account. Please try again.');
          setSubmitting(false);
          return;
        }
        completeLoginSession(
          {
            id: matchedCustomer.id,
            name: matchedCustomer.name,
            email: matchedCustomer.email,
            phone: matchedCustomer.phone,
          },
          `local_customer_${matchedCustomer.id}`
        );
        return;
      }

      // Izinkan login akun demo Alya Putri saat backend Laravel belum aktif
      const fallbackName =
        normalizedEmail === 'alya@email.com'
          ? 'Alya Putri'
          : email
              .trim()
              .split('@')[0]
              .replace(/[._-]/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());

      completeLoginSession(
        {
          id: 101,
          name: fallbackName,
          email: email.trim(),
          phone: '+62 812-3456-7890',
        },
        'local_customer_demo_token'
      );
    }
  };

  const handleGoogleLogin = () => {
    setFormError('');
    completeLoginSession(
      {
        id: 101,
        name: 'Alya Putri',
        email: 'alya@email.com',
        phone: '+62 812-3456-7890',
      },
      'google_oauth_customer_token'
    );
  };

  return (
    <div className="cauth-shell login-layout">
      {/* Kolom Kiri: Formulir Login */}
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
          <h1 className="cauth-heading">Welcome back.</h1>
          <p className="cauth-subheading">Sign in to continue shopping with Re-Run.</p>

          {registeredEmail && !formError && (
            <div className="cauth-alert success" role="status">
              <span>Account created for {registeredEmail}. Please sign in to continue.</span>
            </div>
          )}

          {formError && (
            <div className="cauth-alert error" role="alert">
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="cauth-group">
              <label htmlFor="login-email" className="cauth-label">
                Email
              </label>
              <div className="cauth-input-wrap">
                <input
                  id="login-email"
                  type="email"
                  className={`cauth-input ${showEmailError ? 'is-error' : ''}`}
                  placeholder="alya@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                />
              </div>
              {showEmailError && (
                <p className="cauth-field-error">Please enter a valid email address.</p>
              )}
            </div>

            {/* Password */}
            <div className="cauth-group" style={{ marginBottom: 0 }}>
              <label htmlFor="login-password" className="cauth-label">
                Password
              </label>
              <div className="cauth-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`cauth-input ${showPasswordError ? 'is-error' : ''}`}
                  placeholder="Enter your password"
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
              {showPasswordError && (
                <p className="cauth-field-error">Please enter your password (min. 6 characters).</p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="cauth-options-row">
              <label className="cauth-remember-label">
                <input
                  type="checkbox"
                  className="cauth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className="cauth-forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Tombol Login */}
            <button type="submit" className="cauth-submit-btn" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Divider "or" */}
          <div className="cauth-divider">
            <span>or</span>
          </div>

          {/* Tombol Continue with Google */}
          <button
            type="button"
            className="cauth-google-btn"
            disabled={submitting}
            onClick={handleGoogleLogin}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <p className="cauth-switch-text">
            Don&apos;t have an account? <Link to="/register">Register</Link>
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
          <h2 className="cauth-left-title">Find your next favorite piece.</h2>
          <p className="cauth-left-sub">
            Sign in to track orders, save favorites, and check out faster.
          </p>
        </div>
      </aside>
    </div>
  );
}