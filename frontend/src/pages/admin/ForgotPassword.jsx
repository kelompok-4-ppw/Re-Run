import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@rerun.id');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid admin email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (res.ok) {
        navigate('/admin/check-email', { state: { email: trimmedEmail } });
        return;
      }

      if (res.status === 404 || res.status === 422) {
        setErrorMsg('Admin email address was not found.');
        return;
      }

      throw new Error('Fallback to local simulation');
    } catch {
      if (trimmedEmail === 'admin@rerun.id') {
        navigate('/admin/check-email', { state: { email: trimmedEmail } });
      } else {
        setErrorMsg('Admin email address was not found. Use admin@rerun.id for demo.');
      }
    } finally {
      setLoading(false);
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
          <h2>Secure access for your store.</h2>
          <p>Reset your admin password in a few quick steps.</p>
        </div>
      </div>

      {/* Panel Kanan: Form Forgot Password */}
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

          {/* Ikon Kunci Melingkar */}
          <div className="admin-icon-badge" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="7.5" cy="15.5" r="4" />
              <path d="M10.5 12.5L20 3" strokeLinecap="round" />
              <path d="M16.5 6.5L19.5 9.5" strokeLinecap="round" />
              <path d="M19 4L21.5 6.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="admin-login-header compact-top">
            <h1>Forgot password?</h1>
            <p>Enter your admin email and we&apos;ll send you a link to reset your password.</p>
          </div>

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
            <div className="admin-field" style={{ marginBottom: '22px' }}>
              <label htmlFor="forgot-admin-email">Admin Email</label>
              <div className="admin-input-wrap">
                <input
                  id="forgot-admin-email"
                  type="email"
                  className={`admin-input ${errorMsg ? 'has-error' : ''}`}
                  placeholder="admin@rerun.id"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}