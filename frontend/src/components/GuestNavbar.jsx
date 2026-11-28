import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
];

export default function GuestNavbar() {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <>
      <div className="cust-announcement-bar">
        <span>Free shipping on orders over Rp 300.000</span>
        <span>&bull;</span>
        <span>New season running tees available</span>
      </div>

      <header className="cust-navbar">
        <div className="cust-navbar-inner">
          <Link to="/" className="cust-nav-brand" onClick={() => setActiveNav('home')}>
            <Logo variant="dark" />
          </Link>

          <nav className="cust-nav-links" aria-label="Guest Navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`cust-nav-link ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="cust-nav-actions">
            <Link to="/login" className="cust-btn-login-pill">
              Login
            </Link>
            <Link to="/register" className="cust-btn-register-pill">
              Register
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}