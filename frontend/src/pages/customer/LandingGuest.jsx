import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuestNavbar from '../../components/GuestNavbar';
import CustomerFooter from '../../components/CustomerFooter';
import Logo from '../../components/Logo';
import '../../styles/customer-landing.css';

const FEATURES = [
  {
    title: 'Browse the collection',
    desc: 'Filter by fit, fabric, and category to find your ideal running tee.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    title: 'Save your favorites',
    desc: 'Bookmark the tees you love to revisit and compare anytime.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    title: 'Easy cart & checkout',
    desc: 'Select sizes, review totals, and place orders in just a few steps.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    title: 'Secure payment',
    desc: 'Pay safely via QRIS or Virtual Account with instant confirmation.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Track your orders',
    desc: 'Follow every status update from Pending to Completed in real time.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Manage your account',
    desc: 'Save your shipping address and view past order history anytime.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Create an account',
    desc: 'Register in seconds to unlock shopping, wishlist, and order tracking.',
  },
  {
    step: 2,
    title: 'Pick your tee',
    desc: 'Choose your preferred style and size from our curated running catalog.',
  },
  {
    step: 3,
    title: 'Pay securely',
    desc: 'Complete your payment via QRIS or bank transfer in moments.',
  },
  {
    step: 4,
    title: 'Track your order',
    desc: 'Monitor status updates until your gear arrives at your door.',
  },
];

const POPULAR_TEES = [
  { id: 1, name: 'AeroFit Running Tee', price: 249000, category: 'Essentials', badge: 'NEW', badgeClass: 'new' },
  { id: 2, name: 'CoolDry Run Tee', price: 389000, category: 'Performance', badge: 'BESTSELLER', badgeClass: 'bestseller' },
  { id: 3, name: 'Pace Lite Tee', price: 279000, category: 'Race Day', badge: 'LIMITED', badgeClass: 'limited' },
  { id: 4, name: 'Race Day Tee', price: 159000, category: 'Trail', badge: null, badgeClass: '' },
];

const FAQ_ITEMS = [
  {
    question: 'How do I place an order?',
    answer:
      'Create a free RERUN account or log in, browse our running tees, choose your size, add items to your cart, and complete payment via QRIS or Virtual Account.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept instant QRIS payments (supporting all major e-wallets and mobile banking apps) as well as Virtual Account bank transfers.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Orders placed before 15:00 WIB are dispatched the same business day. Jabodetabek deliveries typically arrive in 1–2 days, and 2–4 days for other cities.',
  },
  {
    question: 'How do I choose my size?',
    answer:
      'Our tees follow a true-to-size athletic cut across XS to XL. Size up if you prefer a looser training drape, or stick to your regular size for a streamlined race fit.',
  },
];

function TshirtOutline({ size = 140, strokeWidth = 1.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path
        d="M8.5 4.5C9.3 5.7 10.6 6.3 12 6.3C13.4 6.3 14.7 5.7 15.5 4.5L20 6.8L18.3 10.8L16 9.8V19.2C16 19.64 15.64 20 15.2 20H8.8C8.36 20 8 19.64 8 19.2V9.8L5.7 10.8L4 6.8L8.5 4.5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LandingGuest() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className="cust-page" id="home">
      <GuestNavbar />

      {/* Section 1: Hero Split */}
      <section className="hero-split">
        <div className="hero-left">
          <div className="hero-left-inner">
            <span className="hero-eyebrow">Running Apparel &middot; Made to Move</span>
            <h1 className="hero-title">Tees made for every kilometer.</h1>
            <p className="hero-desc">
              Engineered running tees in breathable, quick-dry fabrics built for daily miles, tempo sessions, and race day efforts.
            </p>

            <div className="hero-cta-row">
              <Link to="/register" className="hero-btn-primary">
                Create an Account
              </Link>
              <Link to="/login" className="hero-btn-secondary">
                Login
              </Link>
            </div>

            <div className="hero-trust-row">
              <span className="hero-trust-item">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--color-royal-blue)" strokeWidth="2">
                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Quick-dry fabrics</span>
              </span>
              <span className="hero-trust-item">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--color-royal-blue)" strokeWidth="2">
                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Flatlock anti-chafe seams</span>
              </span>
              <span className="hero-trust-item">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--color-royal-blue)" strokeWidth="2">
                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Fast nationwide delivery</span>
              </span>
            </div>
          </div>
        </div>

        <div className="hero-right-visual" aria-hidden="true">
          <span className="hero-floating-tee top-right">
            <TshirtOutline size={74} strokeWidth={1.3} />
          </span>
          <div className="hero-glow-ring">
            <TshirtOutline size={160} strokeWidth={1.15} />
          </div>
          <span className="hero-floating-tee bottom-left">
            <TshirtOutline size={64} strokeWidth={1.3} />
          </span>
        </div>
      </section>

      {/* Section 2: About Re-Run */}
      <section className="landing-section" id="about">
        <div className="cust-container">
          <div className="about-grid">
            <div className="about-brand-card" aria-hidden="true">
              <div className="about-brand-ring">
                <div className="about-logo-circle">
                  <Logo variant="dark" />
                </div>
              </div>
            </div>

            <div>
              <span className="section-eyebrow">About RERUN</span>
              <h2 className="section-heading">A store built for runners.</h2>
              <p className="about-paragraph">
                RERUN focuses exclusively on high-comfort running tees designed for humid tropical mornings, long weekend mileage, and fast road races.
              </p>
              <p className="about-paragraph">
                Every piece combines featherlight ventilation with clean athletic silhouettes—so you can focus on pace, not gear distractions.
              </p>

              <ul className="about-checklist">
                <li>
                  <span className="about-check-icon" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>Lightweight, sweat-wicking fabrics</span>
                </li>
                <li>
                  <span className="about-check-icon" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>Flatlock seams for zero-chafe comfort</span>
                </li>
                <li>
                  <span className="about-check-icon" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>Curated essentials &amp; race-day cuts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Everything You Need to Shop */}
      <section className="landing-section bg-muted" id="features">
        <div className="cust-container">
          <h2 className="section-heading center">Everything you need to shop</h2>
          <p className="section-sub center">
            Designed for a smooth, distraction-free shopping experience from browsing to doorstep delivery.
          </p>

          <div className="features-grid">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="feature-card">
                <div className="feature-icon-box" aria-hidden="true">
                  {feat.icon}
                </div>
                <h3 className="feature-card-title">{feat.title}</h3>
                <p className="feature-card-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section className="landing-section" id="how-it-works">
        <div className="cust-container">
          <h2 className="section-heading center">How it works</h2>
          <p className="section-sub center">
            From sign-up to your next run in four simple steps.
          </p>

          <div className="steps-grid">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="step-item">
                <span className="step-number-badge">{item.step}</span>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Popular Right Now */}
      <section className="landing-section bg-muted">
        <div className="cust-container">
          <div className="popular-header">
            <h2 className="section-heading" style={{ marginBottom: '6px' }}>
              Popular right now
            </h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>
              A preview of our best-selling running tees. Log in to shop the full collection.
            </p>
          </div>

          <div className="popular-grid">
            {POPULAR_TEES.map((tee) => (
              <div
                key={tee.id}
                className="guest-prod-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate('/login')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/login');
                  }
                }}
              >
                <div className="guest-prod-media">
                  {tee.badge && (
                    <span className={`guest-prod-badge ${tee.badgeClass}`}>{tee.badge}</span>
                  )}

                  <button
                    type="button"
                    className="guest-prod-wish-btn"
                    title="Log in to save to wishlist"
                    aria-label={`Save ${tee.name} to wishlist`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/login');
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  <TshirtOutline size={78} strokeWidth={1.35} />
                </div>

                <div className="guest-prod-name">{tee.name}</div>
                <div className="guest-prod-price">Rp {tee.price.toLocaleString('id-ID')}</div>
                <div className="guest-prod-cat">{tee.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Frequently Asked Questions */}
      <section className="landing-section" id="faq">
        <div className="cust-container">
          <h2 className="section-heading center">Frequently asked questions</h2>

          <div className="faq-list">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={faq.question} className="faq-item">
                  <button
                    type="button"
                    className="faq-question-btn"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  >
                    <span>{faq.question}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-text-secondary)"
                      strokeWidth="2"
                      style={{
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isOpen && <div className="faq-answer">{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 7: Bottom CTA Banner */}
      <section className="cta-banner">
        <h2 className="cta-banner-title">Ready to start your next run?</h2>
        <p className="cta-banner-sub">
          Join RERUN today and gear up with performance running tees.
        </p>
        <div className="cta-banner-actions">
          <Link to="/register" className="cta-btn-white">
            Create Account
          </Link>
          <Link to="/login" className="cta-btn-outline-light">
            Login
          </Link>
        </div>
      </section>

      {/* Section 8: Footer */}
      <CustomerFooter isGuest />
    </div>
  );
}