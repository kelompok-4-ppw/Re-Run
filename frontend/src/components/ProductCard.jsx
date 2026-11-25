import { Link } from 'react-router-dom';
import { formatRupiah } from '../services/api';

export default function ProductCard({ product, onAddToCart }) {
  const availSize = product.variants?.find((v) => v.stock > 0)?.size || 'M';
  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} alt={product.name} />
      </Link>
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{product.category} &middot; {product.condition}</div>
        <h3 style={{ fontSize: '16px', margin: '4px 0 8px' }}>
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div style={{ fontWeight: 700, color: 'var(--color-primary-navy)', marginBottom: '12px' }}>
          {formatRupiah(product.price)}
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onAddToCart(product, availSize)}>
          + Quick Add ({availSize})
        </button>
      </div>
    </div>
  );
}