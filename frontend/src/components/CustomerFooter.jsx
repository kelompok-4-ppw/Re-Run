import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function CustomerFooter({ isGuest = false }) {
  const [email, setEmail] = useState('');
  const [subscribedMsg, setSubscribedMsg] = useState('');

  const targetShopPath = isGuest ? '/login' : '/shop';

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setSubscribedMsg('Please enter a valid email address.');
      return;
    }
    setSubscribedMsg('Thank you for subscribing to the Re-Run list!');
    setEmail('');
  };

  return (
    <footer className="cust-footer">
      <div className="cust-container">
        {/* Newsletter Card */}
        <div className="footer-newsletter-card">
          <div>
            <h3 className="footer-nl-title">Join the Re-Run list</h3>
            <p className="footer-nl-sub">
              Get early access to new drops, restocks, and community run invites.
            </p>
          </div>

          <div>
            <form className="footer-nl-form" onSubmit={handleSubscribe} noValidate>
              <div className="footer-nl-input-wrap">
                <span className="footer-nl-icon" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  className="footer-nl-input"
                  placeholder="Enter your email"
                  aria-label="Email address for newsletter"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (subscribedMsg) setSubscribedMsg('');
                  }}
                />
              </div>
              <button type="submit" className="footer-nl-btn">
                Subscribe
              </button>
            </form>
            {subscribedMsg && <p className="footer-nl-feedback">{subscribedMsg}</p>}
          </div>
        </div>

        {/* 5 Kolom Footer */}
        <div className="footer-main-grid">
          <div>
            <Logo variant="light" />
            <p className="footer-brand-desc">
              Performance running tees crafted for comfort, breathability, and every kilometer ahead.
            </p>
            <div className="footer-socials">
              <a href="#instagram" className="footer-social-btn" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#twitter" className="footer-social-btn" aria-label="X / Twitter" onClick={(e) => e.preventDefault()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </a>
              <a href="#youtube" className="footer-social-btn" aria-label="YouTube" onClick={(e) => e.preventDefault()}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <rect x="2" y="5" width="20" height="14" rx="4" />
                  <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">Shop</h4>
            <ul className="footer-links-list">
              <li><Link to={targetShopPath}>All Tees</Link></li>
              <li><Link to={targetShopPath}>Essentials</Link></li>
              <li><Link to={targetShopPath}>Performance</Link></li>
              <li><Link to={targetShopPath}>Race Day</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links-list">
              <li><a href="#about">About Re-Run</a></li>
              <li><a href="#about">Our Story</a></li>
              <li><a href="#features">Sustainability</a></li>
              <li><a href="#how-it-works">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Support</h4>
            <ul className="footer-links-list">
              <li><a href="#faq">Size Guide</a></li>
              <li><a href="#faq">Shipping &amp; Returns</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><Link to="/login">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Contact</h4>
            <ul className="footer-links-list">
              <li className="footer-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" style={{ marginTop: '2px', flexShrink: 0 }}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>hello@rerun.id</span>
              </li>
              <li className="footer-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" style={{ marginTop: '2px', flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+62 21 5550 1928</span>
              </li>
              <li className="footer-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" style={{ marginTop: '2px', flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Jakarta Selatan, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="footer-bottom-bar">
          <span>&copy; 2026 RERUN. All rights reserved.</span>
          <div className="footer-legal-links">
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a href="#cookies" onClick={(e) => e.preventDefault()}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}