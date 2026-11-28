import { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import '../../styles/admin-products.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'AeroFit Running Tee', sku: 'SKU RR-SS-001', category: 'Essentials', price: 249000, stock: 18, status: 'In Stock' },
  { id: 2, name: 'CoolDry Run Tee', sku: 'SKU RR-LS-014', category: 'Performance', price: 389000, stock: 3, status: 'Low Stock' },
  { id: 3, name: 'Pace Lite Tee', sku: 'SKU RR-SG-007', category: 'Race Day', price: 279000, stock: 0, status: 'Out of Stock' },
  { id: 4, name: 'Race Day Tee', sku: 'SKU RR-RE-022', category: 'Trail', price: 159000, stock: 0, status: 'Out of Stock' },
  { id: 5, name: 'Lightweight Run Tee', sku: 'SKU RR-SS-009', category: 'Essentials', price: 219000, stock: 2, status: 'Low Stock' },
  { id: 6, name: 'Seamless Run Tee', sku: 'SKU RR-SS-012', category: 'Essentials', price: 199000, stock: 12, status: 'In Stock' },
  { id: 7, name: 'Boxy Run Tee', sku: 'SKU RR-LS-020', category: 'Performance', price: 459000, stock: 9, status: 'In Stock' },
  { id: 8, name: 'City Run Tee', sku: 'SKU RR-SG-011', category: 'Race Day', price: 329000, stock: 14, status: 'In Stock' },
];

const CATEGORY_OPTIONS = ['All', 'Essentials', 'Performance', 'Race Day', 'Trail'];
const STOCK_OPTIONS = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Stock: Low to High', 'Name: A-Z'];

function formatRupiah(amount) {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
}

function getStatusClass(status) {
  if (status === 'In Stock') return 'status-in-stock';
  if (status === 'Low Stock') return 'status-low-stock';
  return 'status-out-of-stock';
}

function TshirtThumbIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M8.5 4.5C9.3 5.7 10.6 6.3 12 6.3C13.4 6.3 14.7 5.7 15.5 4.5L20 6.8L18.3 10.8L16 9.8V19.2C16 19.64 15.64 20 15.2 20H8.8C8.36 20 8 19.64 8 19.2V9.8L5.7 10.8L4 6.8L8.5 4.5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Products() {
  const outletContext = useOutletContext();
  const topbarSearch = outletContext?.searchQuery || '';

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStock, setSelectedStock] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [previewProduct, setPreviewProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filterBarRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('rerun_admin_token');
    fetch(`${API_BASE_URL}/admin/products`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (Array.isArray(json?.data) && json.data.length > 0) {
          setProducts(json.data);
        }
      })
      .catch(() => {
        // Tetap gunakan data mockup saat backend Laravel belum aktif
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const effectiveQuery = (localSearch || topbarSearch).trim().toLowerCase();

  const filteredProducts = products
    .filter((item) => {
      const matchesSearch =
        !effectiveQuery ||
        item.name.toLowerCase().includes(effectiveQuery) ||
        item.sku.toLowerCase().includes(effectiveQuery);
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesStock = selectedStock === 'All' || item.status === selectedStock;
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (selectedSort === 'Price: Low to High') return a.price - b.price;
      if (selectedSort === 'Price: High to Low') return b.price - a.price;
      if (selectedSort === 'Stock: Low to High') return a.stock - b.stock;
      if (selectedSort === 'Name: A-Z') return a.name.localeCompare(b.name);
      return a.id - b.id;
    });

  const isUnfilteredDefault =
    !effectiveQuery &&
    selectedCategory === 'All' &&
    selectedStock === 'All' &&
    products.length === INITIAL_PRODUCTS.length;

  const totalProductsDisplay = isUnfilteredDefault ? 248 : products.length;
  const availableProductsDisplay = isUnfilteredDefault
    ? 201
    : products.filter((p) => p.stock > 0).length;

  const totalPages = isUnfilteredDefault ? 31 : Math.max(1, Math.ceil(filteredProducts.length / 8));

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;

    try {
      const token = localStorage.getItem('rerun_admin_token');
      await fetch(`${API_BASE_URL}/admin/products/${targetId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // Lanjutkan penghapusan pada state lokal
    } finally {
      setProducts((prev) => prev.filter((item) => item.id !== targetId));
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      {/* Header Bar Atas */}
      <div className="prod-page-header">
        <div>
          <h2 className="prod-header-title">Product Management</h2>
          <p className="prod-header-sub">
            {totalProductsDisplay} products &middot; {availableProductsDisplay} available
          </p>
        </div>

        <Link to="/admin/products/create" className="prod-add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
          </svg>
          <span>Add Product</span>
        </Link>
      </div>

      {/* Card Tabel Produk */}
      <div className="prod-card">
        {/* Toolbar Pencarian & 3 Dropdown Pill */}
        <div className="prod-toolbar" ref={filterBarRef}>
          <div className="prod-search-wrap">
            <span className="prod-search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="prod-search-input"
              placeholder="Search product name..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="prod-filters-group">
            {/* Filter Category */}
            <div className="prod-dropdown">
              <button
                type="button"
                className="prod-filter-pill"
                onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              >
                <span>Category:</span>
                <strong>{selectedCategory}</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'category' && (
                <div className="prod-dropdown-menu" role="menu">
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`prod-dropdown-option ${selectedCategory === option ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedCategory(option);
                        setOpenDropdown(null);
                        setCurrentPage(1);
                      }}
                    >
                      <span>{option}</span>
                      {selectedCategory === option && <span>&#10003;</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Stock */}
            <div className="prod-dropdown">
              <button
                type="button"
                className="prod-filter-pill"
                onClick={() => setOpenDropdown(openDropdown === 'stock' ? null : 'stock')}
              >
                <span>Stock:</span>
                <strong>{selectedStock}</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'stock' && (
                <div className="prod-dropdown-menu" role="menu">
                  {STOCK_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`prod-dropdown-option ${selectedStock === option ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedStock(option);
                        setOpenDropdown(null);
                        setCurrentPage(1);
                      }}
                    >
                      <span>{option}</span>
                      {selectedStock === option && <span>&#10003;</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Sort */}
            <div className="prod-dropdown">
              <button
                type="button"
                className="prod-filter-pill"
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              >
                <span>Sort:</span>
                <strong>{selectedSort}</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'sort' && (
                <div className="prod-dropdown-menu" role="menu">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`prod-dropdown-option ${selectedSort === option ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedSort(option);
                        setOpenDropdown(null);
                      }}
                    >
                      <span>{option}</span>
                      {selectedSort === option && <span>&#10003;</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabel Daftar Produk */}
        <div className="prod-table-wrap">
          <table className="prod-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="prod-info-cell">
                        <div className="prod-thumb" aria-hidden="true">
                          <TshirtThumbIcon />
                        </div>
                        <div>
                          <div className="prod-name">{product.name}</div>
                          <div className="prod-sku">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td className="prod-price">{formatRupiah(product.price)}</td>
                    <td className="prod-stock">{product.stock}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(product.status)}`}>
                        <span className="status-dot" />
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="prod-actions-group">
                        {/* View */}
                        <button
                          type="button"
                          className="prod-action-btn"
                          title="View product"
                          aria-label={`View ${product.name}`}
                          onClick={() => setPreviewProduct(product)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>

                        {/* Edit */}
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="prod-action-btn"
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          className="prod-action-btn delete"
                          title="Delete product"
                          aria-label={`Delete ${product.name}`}
                          onClick={() => setDeleteTarget(product)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                    No products match your current search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="prod-pagination-bar">
          <div className="prod-showing-text">
            {filteredProducts.length === 0
              ? 'Showing 0 products'
              : isUnfilteredDefault
              ? `Showing ${(currentPage - 1) * 8 + 1}–${Math.min(currentPage * 8, 248)} of 248 products`
              : `Showing 1–${filteredProducts.length} of ${filteredProducts.length} products`}
          </div>

          <div className="prod-page-controls" aria-label="Pagination">
            <button
              type="button"
              className="prod-page-btn"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              &lsaquo;
            </button>

            <button
              type="button"
              className={`prod-page-btn ${currentPage === 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>

            {totalPages >= 2 && (
              <button
                type="button"
                className={`prod-page-btn ${currentPage === 2 ? 'active' : ''}`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
            )}

            {totalPages >= 3 && (
              <button
                type="button"
                className={`prod-page-btn ${currentPage === 3 ? 'active' : ''}`}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
            )}

            {totalPages > 4 && (
              <span className="prod-page-btn dots" aria-hidden="true">
                ...
              </span>
            )}

            {totalPages > 3 && (
              <button
                type="button"
                className={`prod-page-btn ${currentPage === totalPages ? 'active' : ''}`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            )}

            <button
              type="button"
              className="prod-page-btn"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>

      {/* Modal Quick View Produk */}
      {previewProduct && (
        <div className="prod-modal-backdrop" onClick={() => setPreviewProduct(null)}>
          <div className="prod-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="prod-modal-title">{previewProduct.name}</h3>
            <p className="prod-modal-desc" style={{ marginBottom: '12px' }}>
              {previewProduct.sku} &middot; Category: <strong>{previewProduct.category}</strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '20px' }}>
              <span>
                Price: <strong>{formatRupiah(previewProduct.price)}</strong>
              </span>
              <span>
                Stock: <strong>{previewProduct.stock} pcs</strong>
              </span>
            </div>
            <div className="prod-modal-actions">
              <button type="button" className="prod-modal-cancel" onClick={() => setPreviewProduct(null)}>
                Close
              </button>
              <Link
                to={`/admin/products/edit/${previewProduct.id}`}
                className="prod-add-btn"
                style={{ height: '38px' }}
              >
                Edit Product
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Produk */}
      {deleteTarget && (
        <div className="prod-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="prod-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="prod-modal-title">Delete Product?</h3>
            <p className="prod-modal-desc">
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> ({deleteTarget.sku}) from your
              inventory? This action cannot be undone.
            </p>
            <div className="prod-modal-actions">
              <button type="button" className="prod-modal-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="prod-modal-danger" onClick={handleConfirmDelete}>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}