import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import '../../styles/admin-login.css';

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

export default function PasswordUpdated() {
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
          <h2>You&apos;re all set.</h2>
          <p>Log in and get back to managing your store.</p>
        </div>
      </div>

      {/* Panel Kanan: Konfirmasi Password Berhasil Diperbarui */}
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

          {/* Ikon Centang Hijau Solid */}
          <div
            className="admin-icon-badge"
            aria-hidden="true"
            style={{
              backgroundColor: 'var(--color-success)',
              color: 'var(--color-white)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 13L9.5 17.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="admin-login-header compact-top">
            <h1>Password updated!</h1>
            <p>Your password has been changed. You can now log in with your new password.</p>
          </div>

          <Link to="/admin/login" className="admin-submit-btn">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}