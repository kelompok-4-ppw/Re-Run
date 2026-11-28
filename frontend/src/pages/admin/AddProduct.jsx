import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/admin-product-form.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const CATEGORIES = ['Essentials', 'Performance', 'Race Day', 'Trail'];

function getStockStatus(qty) {
  if (qty <= 0) return { label: 'Out of Stock', className: 'status-out-of-stock' };
  if (qty <= 4) return { label: 'Low Stock', className: 'status-low-stock' };
  return { label: 'In Stock', className: 'status-in-stock' };
}

function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateSku(category) {
  const prefixMap = {
    Essentials: 'SS',
    Performance: 'LS',
    'Race Day': 'SG',
    Trail: 'RE',
  };
  const code = prefixMap[category] || 'SS';
  const rand = String(Math.floor(25 + Math.random() * 74)).padStart(3, '0');
  return `SKU RR-${code}-${rand}`;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [variants, setVariants] = useState({
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePriceChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setPrice(digitsOnly);
    if (errorMsg) setErrorMsg('');
  };

  const formattedPrice = price ? Number(price).toLocaleString('id-ID') : '';

  const updateVariantStock = (size, nextVal) => {
    const sanitized = Math.max(0, Math.min(9999, Number.isNaN(nextVal) ? 0 : nextVal));
    setVariants((prev) => ({ ...prev, [size]: sanitized }));
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    setErrorMsg('');

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload a PNG or JPG image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds the 5 MB limit.');
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelected(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter the product name.');
      return;
    }
    if (!category) {
      setErrorMsg('Please select a product category.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMsg('Please enter a valid product price.');
      return;
    }

    const totalStock = Object.values(variants).reduce((sum, qty) => sum + qty, 0);
    const overallStatus = getStockStatus(totalStock).label;

    setSaving(true);
    try {
      const token = localStorage.getItem('rerun_admin_token');
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('price', price);
      formData.append('variants', JSON.stringify(variants));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (res.ok) {
        navigate('/admin/products');
        return;
      }

      throw new Error('Fallback to local storage');
    } catch {
      const existingSaved = JSON.parse(localStorage.getItem('rerun_admin_custom_products') || '[]');
      const newProduct = {
        id: Date.now(),
        name: name.trim(),
        description: description.trim(),
        sku: generateSku(category),
        category,
        price: Number(price),
        stock: totalStock,
        variants,
        status: overallStatus,
      };
      localStorage.setItem('rerun_admin_custom_products', JSON.stringify([newProduct, ...existingSaved]));
      navigate('/admin/products');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb & Judul Halaman */}
      <nav className="add-prod-breadcrumb" aria-label="Breadcrumb">
        <Link to="/admin/products">Products</Link>
        <span className="add-prod-breadcrumb-sep" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3.5L10.5 8L6 12.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="add-prod-breadcrumb-current">Add Product</span>
      </nav>

      <h2 className="add-prod-heading">Add New Product</h2>

      {errorMsg && (
        <div className="add-prod-alert" role="alert">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="10" cy="10" r="8.25" stroke="#B91C1C" strokeWidth="1.5" />
            <path d="M10 6.2V10.5" stroke="#B91C1C" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="10" cy="13.5" r="0.9" fill="#B91C1C" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-prod-grid" noValidate>
        {/* Kolom Kiri: Product Information & Product Variant */}
        <div className="add-prod-col">
          {/* Card 1: Product Information */}
          <section className="form-card">
            <h3 className="form-card-title">Product Information</h3>

            <div className="form-group">
              <label htmlFor="product-name" className="form-label">
                Product Name
              </label>
              <input
                id="product-name"
                type="text"
                className="form-control"
                placeholder="e.g. AeroFit Running Tee"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-description" className="form-label">
                Description
              </label>
              <textarea
                id="product-description"
                className="form-textarea"
                placeholder="Describe the fabric, fit, and condition of this piece..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="product-category" className="form-label">
                  Category
                </label>
                <div className="form-select-wrap">
                  <select
                    id="product-category"
                    className={`form-control form-select ${!category ? 'placeholder-active' : ''}`}
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} style={{ color: 'var(--color-text-dark)' }}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className="form-select-arrow" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="product-price" className="form-label">
                  Price
                </label>
                <div className="price-input-wrap">
                  <span className="price-prefix">Rp</span>
                  <input
                    id="product-price"
                    type="text"
                    inputMode="numeric"
                    className="form-control price-input"
                    placeholder="0"
                    value={formattedPrice}
                    onChange={handlePriceChange}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Product Variant */}
          <section className="form-card">
            <h3 className="form-card-title no-margin">Product Variant</h3>
            <p className="form-card-subtitle">Set available sizes and the stock for each size.</p>

            <div className="variant-table-box">
              <table className="variant-table">
                <thead>
                  <tr>
                    <th style={{ width: '110px' }}>Size</th>
                    <th>Stock</th>
                    <th style={{ width: '160px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((size) => {
                    const qty = variants[size];
                    const statusObj = getStockStatus(qty);
                    return (
                      <tr key={size}>
                        <td>
                          <span className="size-badge">{size}</span>
                        </td>
                        <td>
                          <div className="stock-stepper">
                            <div className="stock-stepper-controls">
                              <button
                                type="button"
                                className="stepper-btn"
                                aria-label={`Decrease ${size} stock`}
                                disabled={qty <= 0}
                                onClick={() => updateVariantStock(size, qty - 1)}
                              >
                                &minus;
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                className="stepper-value-input"
                                aria-label={`${size} stock quantity`}
                                value={qty}
                                onChange={(e) => {
                                  const num = parseInt(e.target.value.replace(/\D/g, ''), 10);
                                  updateVariantStock(size, Number.isNaN(num) ? 0 : num);
                                }}
                              />
                              <button
                                type="button"
                                className="stepper-btn"
                                aria-label={`Increase ${size} stock`}
                                onClick={() => updateVariantStock(size, qty + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${statusObj.className}`}>
                            <span className="status-dot" />
                            {statusObj.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Kolom Kanan: Product Image & Tombol Aksi */}
        <div className="add-prod-col">
          {/* Card 3: Product Image */}
          <section className="form-card">
            <h3 className="form-card-title">Product Image</h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelected(e.target.files?.[0])}
            />

            <div
              className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="upload-icon-circle" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                </svg>
              </div>
              <div className="upload-title">Upload Image</div>
              <p className="upload-hint">
                Drag &amp; drop or click to browse. PNG or JPG, max 5 MB.
              </p>
            </div>

            {imageFile && (
              <div className="uploaded-file-card">
                <div className="uploaded-file-left">
                  <div className="uploaded-file-thumb">
                    {imagePreviewUrl ? (
                      <img src={imagePreviewUrl} alt={imageFile.name} />
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path
                          d="M8.5 4.5C9.3 5.7 10.6 6.3 12 6.3C13.4 6.3 14.7 5.7 15.5 4.5L20 6.8L18.3 10.8L16 9.8V19.2C16 19.64 15.64 20 15.2 20H8.8C8.36 20 8 19.64 8 19.2V9.8L5.7 10.8L4 6.8L8.5 4.5Z"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="uploaded-file-meta">
                    <div className="uploaded-file-name">{imageFile.name}</div>
                    <div className="uploaded-file-sub">
                      {formatFileSize(imageFile.size)} &middot;{' '}
                      <button
                        type="button"
                        className="uploaded-preview-btn"
                        onClick={() => setShowImageModal(true)}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="uploaded-remove-btn"
                  title="Remove image"
                  aria-label="Remove uploaded image"
                  onClick={handleRemoveImage}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            )}
          </section>

          {/* Card 4: Tombol Save Product & Cancel */}
          <div className="form-actions-card">
            <button type="submit" className="btn-save-product" disabled={saving}>
              {saving ? 'Saving...' : 'Save Product'}
            </button>
            <Link to="/admin/products" className="btn-cancel-product">
              Cancel
            </Link>
          </div>
        </div>
      </form>

      {/* Modal Pratinjau Gambar Produk */}
      {showImageModal && imagePreviewUrl && (
        <div className="prod-modal-backdrop" onClick={() => setShowImageModal(false)}>
          <div className="prod-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="prod-modal-title" style={{ marginBottom: '12px' }}>
              {imageFile?.name}
            </h3>
            <img
              src={imagePreviewUrl}
              alt="Uploaded product preview"
              style={{
                width: '100%',
                maxHeight: '360px',
                objectFit: 'contain',
                borderRadius: '10px',
                backgroundColor: '#F4F6F9',
                marginBottom: '16px',
              }}
            />
            <div className="prod-modal-actions">
              <button type="button" className="prod-modal-cancel" onClick={() => setShowImageModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}