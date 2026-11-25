import { useEffect, useState } from 'react';
import { fetchProducts } from '../../services/api';
import ProductCard from '../../components/ProductCard';

export default function Shop({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchProducts().then((res) => setProducts(res.data || []));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All' || p.category === category)
  );

  return (
    <section className="container" style={{ padding: '48px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--color-primary-navy)' }}>Shop Catalog</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Menampilkan {filtered.length} produk</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid var(--color-border-gray)', borderRadius: '8px' }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid var(--color-border-gray)', borderRadius: '8px' }}
          >
            <option value="All">All Categories</option>
            <option value="Tops">Tops</option>
            <option value="Outerwear">Outerwear</option>
            <option value="Pants">Pants</option>
          </select>
        </div>
      </div>

      <div className="product-grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}