import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Logo from '../../components/Logo';
import '../../styles/admin-login.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const DEMO_ADMIN_EMAILS = ['admin@rerun.id', 'bramkyru@gmail.com'];

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetSuccessMsg = location.state?.resetSuccess || '';

  const [email, setEmail] = useState('bramkyru@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('rerun_admin_token', data.token || 'admin-session-token');
        navigate('/admin');
        return;
      }

      if (res.status === 401 || res.status === 422) {
        setErrorMsg('Incorrect email or password. Please try again.');
        setLoading(false);
        return;
      }

      throw new Error('Fallback to local validation');
    } catch {
      const savedCustomPass = localStorage.getItem('rerun_admin_custom_password');
      const isValidPass = password === 'admin123' || (savedCustomPass && password === savedCustomPass);

      if (DEMO_ADMIN_EMAILS.includes(trimmedEmail) && isValidPass) {
        localStorage.setItem('rerun_admin_token', 'mock-admin-token');
        navigate('/admin');
      } else {
        setErrorMsg('Incorrect email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-left">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Logo variant="light" />
        </div>

        <div className="admin-login-illustration" aria-hidden="true">
          <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M84 44C92 56 105 62 120 62C135 62 148 56 156 44L198 66L182 104L160 94V194C160 198.418 156.418 202 152 202H88C83.5817 202 80 198.418 80 194V94L58 104L42 66L84 44Z"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="admin-login-brand-copy">
          <h2>Manage every piece, every order — in one place.</h2>
          <p>Re-Run Admin Panel &middot; Products &middot; Orders &middot; Inventory</p>
        </div>
      </div>

      <div className="admin-login-right">
        <div className="admin-login-card">
          <Logo variant="dark" />

          <div className="admin-login-header">
            <h1>Welcome Back.</h1>
            <p>Sign in to manage your Re-Run store.</p>
          </div>

          {resetSuccessMsg && !errorMsg && (
            <div className="admin-login-success" role="status">
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="admin-login-alert" role="alert">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="10" cy="10" r="8.25" stroke="#B91C1C" strokeWidth="1.5" />
                <path d="M10 6.2V10.5" stroke="#B91C1C" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="10" cy="13.5" r="0.9" fill="#B91C1C" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="admin-field">
              <label htmlFor="admin-email">Email</label>
              <div className="admin-input-wrap">
                <input
                  id="admin-email"
                  type="email"
                  className="admin-input"
                  placeholder="bramkyru@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-input-wrap">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`admin-input ${errorMsg ? 'has-error' : ''}`}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  style={{ paddingRight: '42px' }}
                  required
                />
                <button
                  type="button"
                  className="admin-eye-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="admin-options-row">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <span>Show password</span>
              </label>

              <Link to="/admin/forgot-password" className="admin-forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="admin-login-footer-note">
            Having trouble? Contact the store owner to reset your access.
          </p>
        </div>
      </div>
    </div>
  );
}