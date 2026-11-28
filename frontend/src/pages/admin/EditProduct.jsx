import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../../styles/admin-product-form.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const CATEGORIES = ['Essentials', 'Performance', 'Race Day', 'Trail'];

const SEED_PRODUCTS_DETAIL = {
  1: {
    id: 1,
    name: 'AeroFit Running Tee',
    sku: 'SKU RR-SS-001',
    description:
      'A lightweight running tee in breathable, quick-dry fabric with flatlock seams and mesh panels.',
    category: 'Essentials',
    price: 249000,
    variants: { XS: 0, S: 6, M: 3, L: 5, XL: 4 },
  },
  2: {
    id: 2,
    name: 'CoolDry Run Tee',
    sku: 'SKU RR-LS-014',
    description:
      'Moisture-wicking long-sleeve running top engineered for cool morning tempo sessions.',
    category: 'Performance',
    price: 389000,
    variants: { XS: 0, S: 1, M: 1, L: 1, XL: 0 },
  },
  3: {
    id: 3,
    name: 'Pace Lite Tee',
    sku: 'SKU RR-SG-007',
    description:
      'Ultralight singlet cut with bonded hems to minimize chafing on race day.',
    category: 'Race Day',
    price: 279000,
    variants: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
  },
  4: {
    id: 4,
    name: 'Race Day Tee',
    sku: 'SKU RR-RE-022',
    description:
      'Durable trail-ready tee with abrasion-resistant shoulder panels and recycled polyester knit.',
    category: 'Trail',
    price: 159000,
    variants: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
  },
  5: {
    id: 5,
    name: 'Lightweight Run Tee',
    sku: 'SKU RR-SS-009',
    description:
      'Everyday training t-shirt with four-way stretch and reflective back tab.',
    category: 'Essentials',
    price: 219000,
    variants: { XS: 0, S: 2, M: 0, L: 0, XL: 0 },
  },
  6: {
    id: 6,
    name: 'Seamless Run Tee',
    sku: 'SKU RR-SS-012',
    description:
      'Circular-knit seamless construction with body-mapped ventilation zones.',
    category: 'Essentials',
    price: 199000,
    variants: { XS: 2, S: 3, M: 4, L: 2, XL: 1 },
  },
  7: {
    id: 7,
    name: 'Boxy Run Tee',
    sku: 'SKU RR-LS-020',
    description:
      'Relaxed boxy silhouette crafted from soft-touch performance cotton blend.',
    category: 'Performance',
    price: 459000,
    variants: { XS: 1, S: 2, M: 3, L: 2, XL: 1 },
  },
  8: {
    id: 8,
    name: 'City Run Tee',
    sku: 'SKU RR-SG-011',
    description:
      'All-around road running tee with 360-degree low-light reflectivity.',
    category: 'Race Day',
    price: 329000,
    variants: { XS: 2, S: 4, M: 4, L: 3, XL: 1 },
  },
};

function getStockStatus(qty) {
  if (qty <= 0) return { label: 'Out of Stock', className: 'status-out-of-stock' };
  if (qty <= 3) return { label: 'Low Stock', className: 'status-low-stock' };
  return { label: 'In Stock', className: 'status-in-stock' };
}

function TshirtOutline({ size = 84 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
      <path
        d="M8.5 4.5C9.3 5.7 10.6 6.3 12 6.3C13.4 6.3 14.7 5.7 15.5 4.5L20 6.8L18.3 10.8L16 9.8V19.2C16 19.64 15.64 20 15.2 20H8.8C8.36 20 8 19.64 8 19.2V9.8L5.7 10.8L4 6.8L8.5 4.5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const numericId = Number(id) || 1;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Essentials');
  const [price, setPrice] = useState('');
  const [variants, setVariants] = useState({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });

  // 3 slot gambar galeri (default terisi placeholder desain, slot ke-2 aktif sesuai mockup)
  const [gallerySlots, setGallerySlots] = useState([
    { id: 0, type: 'placeholder', url: null, file: null },
    { id: 1, type: 'placeholder', url: null, file: null },
    { id: 2, type: 'placeholder', url: null, file: null },
  ]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(1);

  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadInitialProduct = () => {
      const overrides = JSON.parse(localStorage.getItem('rerun_admin_product_overrides') || '{}');
      const customProducts = JSON.parse(localStorage.getItem('rerun_admin_custom_products') || '[]');

      const foundCustom = customProducts.find((item) => String(item.id) === String(id));
      const baseProduct = overrides[id] || foundCustom || SEED_PRODUCTS_DETAIL[numericId] || SEED_PRODUCTS_DETAIL[1];

      setName(baseProduct.name || '');
      setDescription(
        baseProduct.description ||
          'A lightweight running tee in breathable, quick-dry fabric with flatlock seams and mesh panels.'
      );
      setCategory(baseProduct.category || 'Essentials');
      setPrice(String(baseProduct.price || 249000));
      setVariants(
        baseProduct.variants || {
          XS: 0,
          S: Math.max(0, Math.floor((baseProduct.stock || 0) / 2)),
          M: Math.ceil((baseProduct.stock || 0) / 2),
          L: 0,
          XL: 0,
        }
      );
    };

    loadInitialProduct();

    const token = localStorage.getItem('rerun_admin_token');
    fetch(`${API_BASE_URL}/admin/products/${id}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const prod = json?.data || json;
        if (prod?.name) {
          setName(prod.name);
          if (prod.description) setDescription(prod.description);
          if (prod.category) setCategory(prod.category);
          if (prod.price) setPrice(String(prod.price));
          if (prod.variants) setVariants(prod.variants);
        }
      })
      .catch(() => {
        // Tetap gunakan data lokal saat backend belum aktif
      });
  }, [id, numericId]);

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

  const activeSlot = gallerySlots[activeSlotIndex];

  const handleRemoveActiveImage = () => {
    setGallerySlots((prev) => {
      const updated = prev.map((slot, idx) =>
        idx === activeSlotIndex ? { ...slot, type: 'empty', url: null, file: null } : slot
      );
      const nextFilledIndex = updated.findIndex((s) => s.type !== 'empty');
      if (nextFilledIndex !== -1) {
        setActiveSlotIndex(nextFilledIndex);
      }
      return updated;
    });
  };

  const handleUploadToSlot = (file) => {
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

    const previewUrl = URL.createObjectURL(file);
    setGallerySlots((prev) =>
      prev.map((slot, idx) =>
        idx === activeSlotIndex ? { ...slot, type: 'uploaded', url: previewUrl, file } : slot
      )
    );
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
      formData.append('_method', 'PUT');
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('price', price);
      formData.append('variants', JSON.stringify(variants));

      gallerySlots.forEach((slot, idx) => {
        if (slot.file) {
          formData.append(`images[${idx}]`, slot.file);
        }
      });

      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
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
      const baseSeed = SEED_PRODUCTS_DETAIL[numericId] || { id: numericId, sku: 'SKU RR-SS-001' };
      const updatedRecord = {
        ...baseSeed,
        id: numericId,
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        stock: totalStock,
        variants,
        status: overallStatus,
      };

      const overrides = JSON.parse(localStorage.getItem('rerun_admin_product_overrides') || '{}');
      overrides[String(id)] = updatedRecord;
      localStorage.setItem('rerun_admin_product_overrides', JSON.stringify(overrides));

      const customProducts = JSON.parse(localStorage.getItem('rerun_admin_custom_products') || '[]');
      if (customProducts.some((item) => String(item.id) === String(id))) {
        const updatedCustom = customProducts.map((item) =>
          String(item.id) === String(id) ? { ...item, ...updatedRecord } : item
        );
        localStorage.setItem('rerun_admin_custom_products', JSON.stringify(updatedCustom));
      }

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
        <span className="add-prod-breadcrumb-current">Edit Product</span>
      </nav>

      <h2 className="add-prod-heading">Edit Product</h2>

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
              <label htmlFor="edit-product-name" className="form-label">
                Product Name
              </label>
              <input
                id="edit-product-name"
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
              <label htmlFor="edit-product-description" className="form-label">
                Description
              </label>
              <textarea
                id="edit-product-description"
                className="form-textarea"
                placeholder="Describe the fabric, fit, and condition of this piece..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="edit-product-category" className="form-label">
                  Category
                </label>
                <div className="form-select-wrap">
                  <select
                    id="edit-product-category"
                    className="form-control form-select"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
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
                <label htmlFor="edit-product-price" className="form-label">
                  Price
                </label>
                <div className="price-input-wrap">
                  <span className="price-prefix">Rp</span>
                  <input
                    id="edit-product-price"
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
                    const qty = variants[size] ?? 0;
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

        {/* Kolom Kanan: Product Image Gallery & Tombol Save Changes */}
        <div className="add-prod-col">
          {/* Card 3: Product Image */}
          <section className="form-card">
            <h3 className="form-card-title">Product Image</h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              style={{ display: 'none' }}
              onChange={(e) => handleUploadToSlot(e.target.files?.[0])}
            />

            {activeSlot && activeSlot.type !== 'empty' ? (
              <div className="edit-main-image-box">
                <button
                  type="button"
                  className="edit-remove-img-btn"
                  onClick={handleRemoveActiveImage}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M4 4L12 12M12 4L4 12" strokeLinecap="round" />
                  </svg>
                  <span>Remove Image</span>
                </button>

                {activeSlot.url ? (
                  <img src={activeSlot.url} alt={`${name} preview`} />
                ) : (
                  <TshirtOutline size={92} />
                )}
              </div>
            ) : (
              <div
                className="upload-dropzone"
                style={{ padding: '44px 20px' }}
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <div className="upload-icon-circle" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="upload-title">Upload Image</div>
                <p className="upload-hint">Click to add image to slot {activeSlotIndex + 1}. PNG or JPG, max 5 MB.</p>
              </div>
            )}

            {/* 3 Thumbnail Preview */}
            <div className="edit-thumb-grid">
              {gallerySlots.map((slot, idx) => {
                const isActive = idx === activeSlotIndex;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    aria-label={`Product image slot ${idx + 1}`}
                    className={`edit-thumb-btn ${isActive ? 'active' : ''} ${
                      slot.type === 'empty' ? 'empty' : ''
                    }`}
                    onClick={() => {
                      setActiveSlotIndex(idx);
                      if (slot.type === 'empty') {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    {slot.type === 'empty' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                        <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                      </svg>
                    ) : slot.url ? (
                      <img src={slot.url} alt={`Thumbnail ${idx + 1}`} />
                    ) : (
                      <TshirtOutline size={30} />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Card 4: Tombol Save Changes & Cancel */}
          <div className="form-actions-card">
            <button type="submit" className="btn-save-product" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/admin/products" className="btn-cancel-product">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}