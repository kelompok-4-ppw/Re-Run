import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../../styles/admin-inventory.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const INITIAL_VARIANTS = [
  { id: 1, name: 'AeroFit Running Tee', sku: 'SKU RR-SS-001', category: 'Essentials', size: 'M', stock: 8 },
  { id: 2, name: 'AeroFit Running Tee', sku: 'SKU RR-SS-001', category: 'Essentials', size: 'L', stock: 5 },
  { id: 3, name: 'CoolDry Run Tee', sku: 'SKU RR-LS-014', category: 'Performance', size: 'L', stock: 3 },
  { id: 4, name: 'Pace Lite Tee', sku: 'SKU RR-SG-007', category: 'Race Day', size: 'M', stock: 0 },
  { id: 5, name: 'Race Day Tee', sku: 'SKU RR-RE-022', category: 'Trail', size: 'XL', stock: 0 },
  { id: 6, name: 'Lightweight Run Tee', sku: 'SKU RR-SS-009', category: 'Essentials', size: 'S', stock: 2 },
  { id: 7, name: 'Seamless Run Tee', sku: 'SKU RR-SS-012', category: 'Essentials', size: 'M', stock: 12 },
  { id: 8, name: 'Boxy Run Tee', sku: 'SKU RR-LS-020', category: 'Performance', size: 'M', stock: 9 },
];

const CATEGORY_OPTIONS = ['All', 'Essentials', 'Performance', 'Race Day', 'Trail'];
const STATUS_OPTIONS = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

function getVariantStatus(stock) {
  if (stock <= 0) return { label: 'Out of Stock', className: 'status-out-of-stock' };
  if (stock < 5) return { label: 'Low Stock', className: 'status-low-stock' };
  return { label: 'In Stock', className: 'status-in-stock' };
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

function LayersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2" strokeLinejoin="round" />
      <polyline points="2 17 12 22 22 17" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 12 12 17 22 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.8" fill="currentColor" />
    </svg>
  );
}

export default function Inventory() {
  const outletContext = useOutletContext();
  const topbarSearch = outletContext?.searchQuery || '';

  const [variants, setVariants] = useState(INITIAL_VARIANTS);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Baris pertama aktif dalam mode edit inline sesuai mockup
  const [editingRowId, setEditingRowId] = useState(1);
  const [draftStock, setDraftStock] = useState(8);

  // Modal Quick Update Stock dari tombol header kanan atas
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [modalVariantId, setModalVariantId] = useState(1);
  const [modalStockValue, setModalStockValue] = useState(8);

  const filterBarRef = useRef(null);

  useEffect(() => {
    const savedOverrides = JSON.parse(localStorage.getItem('rerun_admin_inventory_overrides') || '{}');
    if (Object.keys(savedOverrides).length > 0) {
      const merged = INITIAL_VARIANTS.map((item) =>
        savedOverrides[String(item.id)] !== undefined
          ? { ...item, stock: Number(savedOverrides[String(item.id)]) }
          : item
      );
      setVariants(merged);
      const firstRow = merged.find((v) => v.id === 1);
      if (firstRow) setDraftStock(firstRow.stock);
    }

    const token = localStorage.getItem('rerun_admin_token');
    fetch(`${API_BASE_URL}/admin/inventory`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (Array.isArray(json?.data) && json.data.length > 0) {
          setVariants(json.data);
        }
      })
      .catch(() => {
        // Gunakan data lokal saat backend Laravel belum aktif
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

  const persistStockChange = async (variantId, nextQuantity) => {
    const sanitized = Math.max(0, Math.min(9999, Number.isNaN(nextQuantity) ? 0 : nextQuantity));

    setVariants((prev) =>
      prev.map((item) => (item.id === variantId ? { ...item, stock: sanitized } : item))
    );

    const savedOverrides = JSON.parse(localStorage.getItem('rerun_admin_inventory_overrides') || '{}');
    savedOverrides[String(variantId)] = sanitized;
    localStorage.setItem('rerun_admin_inventory_overrides', JSON.stringify(savedOverrides));

    try {
      const token = localStorage.getItem('rerun_admin_token');
      await fetch(`${API_BASE_URL}/admin/inventory/${variantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stock: sanitized }),
      });
    } catch {
      // Tetap tersimpan pada state & storage lokal
    }
  };

  const handleStartEditRow = (row) => {
    setEditingRowId(row.id);
    setDraftStock(row.stock);
  };

  const handleSaveRow = async (rowId) => {
    await persistStockChange(rowId, draftStock);
    setEditingRowId(null);
  };

  const handleOpenBulkModal = () => {
    const defaultItem = variants[0];
    if (defaultItem) {
      setModalVariantId(defaultItem.id);
      setModalStockValue(defaultItem.stock);
    }
    setBulkModalOpen(true);
  };

  const handleConfirmBulkModal = async (e) => {
    e.preventDefault();
    await persistStockChange(Number(modalVariantId), Number(modalStockValue));
    if (editingRowId === Number(modalVariantId)) {
      setDraftStock(Number(modalStockValue));
    }
    setBulkModalOpen(false);
  };

  const effectiveQuery = (localSearch || topbarSearch).trim().toLowerCase();

  const filteredVariants = variants.filter((item) => {
    const statusLabel = getVariantStatus(item.stock).label;
    const matchesSearch =
      !effectiveQuery ||
      item.name.toLowerCase().includes(effectiveQuery) ||
      item.sku.toLowerCase().includes(effectiveQuery) ||
      item.size.toLowerCase() === effectiveQuery;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || statusLabel === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Hitung selisih KPI terhadap data awal agar sinkron dengan angka mockup (1.842 pcs, 14 items, 9 items)
  const initialTotalStock = INITIAL_VARIANTS.reduce((sum, v) => sum + v.stock, 0);
  const currentTotalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const totalStockDisplay = (1842 + (currentTotalStock - initialTotalStock)).toLocaleString('id-ID');

  const initialLowCount = INITIAL_VARIANTS.filter((v) => v.stock > 0 && v.stock < 5).length;
  const currentLowCount = variants.filter((v) => v.stock > 0 && v.stock < 5).length;
  const lowStockDisplay = Math.max(0, 14 + (currentLowCount - initialLowCount));

  const initialOutCount = INITIAL_VARIANTS.filter((v) => v.stock <= 0).length;
  const currentOutCount = variants.filter((v) => v.stock <= 0).length;
  const outOfStockDisplay = Math.max(0, 9 + (currentOutCount - initialOutCount));

  const isDefaultUnfiltered =
    !effectiveQuery && selectedCategory === 'All' && selectedStatus === 'All';

  const totalPages = isDefaultUnfiltered ? 77 : Math.max(1, Math.ceil(filteredVariants.length / 8));

  return (
    <div>
      {/* Header Bar Atas */}
      <div className="inv-page-header">
        <div>
          <h2 className="inv-header-title">Inventory Management</h2>
          <p className="inv-header-sub">Monitor stock levels and update quantities by size.</p>
        </div>

        <button type="button" className="inv-primary-btn" onClick={handleOpenBulkModal}>
          <LayersIcon />
          <span>Update Stock</span>
        </button>
      </div>

      {/* 3 Kartu KPI */}
      <div className="inv-kpi-grid">
        <div className="inv-kpi-card">
          <div className="inv-kpi-top">
            <span className="inv-kpi-label">Total Stock</span>
            <span className="inv-kpi-icon blue" aria-hidden="true">
              <LayersIcon />
            </span>
          </div>
          <div className="inv-kpi-value">{totalStockDisplay} pcs</div>
          <div className="inv-kpi-sub">across 248 products</div>
        </div>

        <div className="inv-kpi-card">
          <div className="inv-kpi-top">
            <span className="inv-kpi-label">Low Stock</span>
            <span className="inv-kpi-icon amber" aria-hidden="true">
              <AlertCircleIcon />
            </span>
          </div>
          <div className="inv-kpi-value">{lowStockDisplay} items</div>
          <div className="inv-kpi-sub">&le; 5 pcs remaining</div>
        </div>

        <div className="inv-kpi-card">
          <div className="inv-kpi-top">
            <span className="inv-kpi-label">Out of Stock</span>
            <span className="inv-kpi-icon red" aria-hidden="true">
              <AlertCircleIcon />
            </span>
          </div>
          <div className="inv-kpi-value">{outOfStockDisplay} items</div>
          <div className="inv-kpi-sub">need restock</div>
        </div>
      </div>

      {/* Card Tabel Inventory */}
      <div className="inv-card">
        {/* Toolbar Pencarian & 2 Dropdown Pill */}
        <div className="inv-toolbar" ref={filterBarRef}>
          <div className="inv-search-wrap">
            <span className="inv-search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="inv-search-input"
              placeholder="Search product or size..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="inv-filters-group">
            {/* Filter Category */}
            <div className="inv-dropdown">
              <button
                type="button"
                className="inv-filter-pill"
                onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              >
                <span>Category:</span>
                <strong>{selectedCategory}</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'category' && (
                <div className="inv-dropdown-menu" role="menu">
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`inv-dropdown-option ${selectedCategory === option ? 'selected' : ''}`}
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

            {/* Filter Status */}
            <div className="inv-dropdown">
              <button
                type="button"
                className="inv-filter-pill"
                onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              >
                <span>Status:</span>
                <strong>{selectedStatus}</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'status' && (
                <div className="inv-dropdown-menu" role="menu">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`inv-dropdown-option ${selectedStatus === option ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedStatus(option);
                        setOpenDropdown(null);
                        setCurrentPage(1);
                      }}
                    >
                      <span>{option}</span>
                      {selectedStatus === option && <span>&#10003;</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabel Varian Stok */}
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Size</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.length > 0 ? (
                filteredVariants.map((row) => {
                  const isEditing = editingRowId === row.id;
                  const activeQty = isEditing ? draftStock : row.stock;
                  const statusInfo = getVariantStatus(activeQty);

                  return (
                    <tr key={row.id} className={isEditing ? 'inv-row-editing' : ''}>
                      <td>
                        <div className="inv-info-cell">
                          <div className="inv-thumb" aria-hidden="true">
                            <TshirtThumbIcon />
                          </div>
                          <div>
                            <div className="inv-name">{row.name}</div>
                            <div className="inv-sku">{row.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td>{row.category}</td>
                      <td>{row.size}</td>
                      <td>
                        {isEditing ? (
                          <div className="inv-inline-stepper">
                            <button
                              type="button"
                              className="inv-stepper-btn"
                              aria-label={`Decrease ${row.name} size ${row.size} stock`}
                              disabled={draftStock <= 0}
                              onClick={() => setDraftStock((q) => Math.max(0, q - 1))}
                            >
                              &minus;
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              className="inv-stepper-input"
                              aria-label={`${row.name} size ${row.size} quantity`}
                              value={draftStock}
                              onChange={(e) => {
                                const parsed = parseInt(e.target.value.replace(/\D/g, ''), 10);
                                setDraftStock(Number.isNaN(parsed) ? 0 : Math.min(9999, parsed));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveRow(row.id);
                                } else if (e.key === 'Escape') {
                                  setEditingRowId(null);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="inv-stepper-btn"
                              aria-label={`Increase ${row.name} size ${row.size} stock`}
                              onClick={() => setDraftStock((q) => Math.min(9999, q + 1))}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="inv-stock-text">{row.stock} pcs</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${statusInfo.className}`}>
                          <span className="status-dot" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        {isEditing ? (
                          <button
                            type="button"
                            className="inv-save-btn"
                            onClick={() => handleSaveRow(row.id)}
                          >
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Save</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="inv-update-btn"
                            onClick={() => handleStartEditRow(row)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Update</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                    No inventory variants match your current search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="inv-pagination-bar">
          <div className="inv-showing-text">
            {filteredVariants.length === 0
              ? 'Showing 0 variants'
              : isDefaultUnfiltered
              ? `Showing ${(currentPage - 1) * 8 + 1}–${Math.min(currentPage * 8, 612)} of 612 variants`
              : `Showing 1–${filteredVariants.length} of ${filteredVariants.length} variants`}
          </div>

          <div className="inv-page-controls" aria-label="Inventory Pagination">
            <button
              type="button"
              className="inv-page-btn"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              &lsaquo;
            </button>

            <button
              type="button"
              className={`inv-page-btn ${currentPage === 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>

            {totalPages >= 2 && (
              <button
                type="button"
                className={`inv-page-btn ${currentPage === 2 ? 'active' : ''}`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
            )}

            {totalPages >= 3 && (
              <button
                type="button"
                className={`inv-page-btn ${currentPage === 3 ? 'active' : ''}`}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
            )}

            {totalPages > 4 && (
              <span className="inv-page-btn dots" aria-hidden="true">
                ...
              </span>
            )}

            {totalPages > 3 && (
              <button
                type="button"
                className={`inv-page-btn ${currentPage === totalPages ? 'active' : ''}`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            )}

            <button
              type="button"
              className="inv-page-btn"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>

      {/* Modal Update Stock Cepat dari Tombol Header */}
      {bulkModalOpen && (
        <div className="inv-modal-backdrop" onClick={() => setBulkModalOpen(false)}>
          <div className="inv-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="inv-modal-title">Update Stock</h3>
            <p className="inv-modal-sub">Select a product size variant and set its available stock quantity.</p>

            <form onSubmit={handleConfirmBulkModal}>
              <div className="inv-modal-field">
                <label htmlFor="modal-variant-select" className="inv-modal-label">
                  Product &amp; Size
                </label>
                <select
                  id="modal-variant-select"
                  className="inv-modal-select"
                  value={modalVariantId}
                  onChange={(e) => {
                    const nextId = Number(e.target.value);
                    setModalVariantId(nextId);
                    const found = variants.find((v) => v.id === nextId);
                    if (found) setModalStockValue(found.stock);
                  }}
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.sku}) — Size {v.size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inv-modal-field" style={{ marginBottom: 0 }}>
                <label htmlFor="modal-stock-input" className="inv-modal-label">
                  New Stock Quantity (pcs)
                </label>
                <input
                  id="modal-stock-input"
                  type="number"
                  min="0"
                  max="9999"
                  className="inv-modal-input"
                  value={modalStockValue}
                  onChange={(e) => setModalStockValue(Math.max(0, Number(e.target.value)))}
                />
              </div>

              <div className="inv-modal-actions">
                <button type="button" className="inv-modal-cancel" onClick={() => setBulkModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="inv-primary-btn" style={{ height: '38px' }}>
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}