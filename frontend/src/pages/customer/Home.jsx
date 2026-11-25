import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../../services/api';
import ProductCard from '../../components/ProductCard';

export default function Home({ onAddToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then((res) => setProducts(res.data || []));
  }, []);

  return (
    <div>
      <section style={{ background: 'var(--color-light-gray)', padding: '72px 0', borderBottom: '1px solid var(--color-border-gray)' }}>
        <div className="container">
          <h1 style={{ fontSize: '44px', color: 'var(--color-primary-navy)', marginBottom: '12px' }}>
            Find Your Next Favorite Piece.
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '540px', marginBottom: '28px' }}>
            Discover timeless styles and explore pieces that deserve another story. Dibangun dengan arsitektur React.js dan REST API Laravel.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
            <Link to="/about" className="btn btn-outline">Explore Story</Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '64px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '26px', color: 'var(--color-primary-navy)' }}>Featured & New Arrivals</h2>
          <Link to="/shop" className="btn btn-outline">View All &rarr;</Link>
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>
    </div>
  );
}