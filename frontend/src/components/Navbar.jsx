import { Link } from 'react-router-dom';

export default function Navbar({ cartCount = 0 }) {
  return (
    <header style={{ borderBottom: '1px solid var(--color-border-gray)', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '72px' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
          RE-RUN
        </Link>
        <nav style={{ display: 'flex', gap: '28px', fontSize: '14px', fontWeight: 500 }}>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/admin/login">Admin</Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/login">Account</Link>
          <Link to="/cart" className="btn btn-outline" style={{ padding: '8px 14px' }}>
            Cart ({cartCount})
          </Link>
        </div>
      </div>
    </header>
  );
}