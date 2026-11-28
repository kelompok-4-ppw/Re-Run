import { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import '../../styles/admin-orders.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const INITIAL_ORDERS = [
  { id: '#RR-20482', slug: 'RR-20482', customer: 'Alya Putri', date: '20 Nov 2026', timestamp: 20261120, daysAgo: 8, items: 3, total: 917000, status: 'Pending' },
  { id: '#RR-20481', slug: 'RR-20481', customer: 'Bima Pratama', date: '19 Nov 2026', timestamp: 20261119, daysAgo: 9, items: 2, total: 638000, status: 'Processing' },
  { id: '#RR-20480', slug: 'RR-20480', customer: 'Citra Lestari', date: '19 Nov 2026', timestamp: 20261119, daysAgo: 9, items: 1, total: 249000, status: 'Completed' },
  { id: '#RR-20479', slug: 'RR-20479', customer: 'Dimas Aditya', date: '18 Nov 2026', timestamp: 20261118, daysAgo: 10, items: 1, total: 389000, status: 'Cancelled' },
  { id: '#RR-20478', slug: 'RR-20478', customer: 'Eka Wulandari', date: '18 Nov 2026', timestamp: 20261118, daysAgo: 10, items: 4, total: 1126000, status: 'Completed' },
  { id: '#RR-20477', slug: 'RR-20477', customer: 'Fajar Ramadhan', date: '17 Nov 2026', timestamp: 20261117, daysAgo: 11, items: 2, total: 508000, status: 'Processing' },
  { id: '#RR-20476', slug: 'RR-20476', customer: 'Gita Anjani', date: '17 Nov 2026', timestamp: 20261117, daysAgo: 11, items: 1, total: 199000, status: 'Pending' },
  { id: '#RR-20475', slug: 'RR-20475', customer: 'Hendra Wijaya', date: '16 Nov 2026', timestamp: 20261116, daysAgo: 12, items: 3, total: 795000, status: 'Completed' },
];

const STATUS_TABS = [
  { key: 'All', label: 'All', defaultCount: '1.284' },
  { key: 'Pending', label: 'Pending', defaultCount: '23' },
  { key: 'Processing', label: 'Processing', defaultCount: '41' },
  { key: 'Completed', label: 'Completed', defaultCount: '1.198' },
  { key: 'Cancelled', label: 'Cancelled', defaultCount: '22' },
];

const STATUS_OPTIONS = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled'];
const DATE_OPTIONS = ['Last 30 days', 'Last 10 days', 'Last 7 days', 'All time'];
const SORT_OPTIONS = ['Newest', 'Oldest', 'Total: High to Low', 'Total: Low to High'];

function formatRupiah(amount) {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
}

export default function Orders() {
  const outletContext = useOutletContext();
  const topbarSearch = outletContext?.searchQuery || '';

  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('Last 30 days');
  const [selectedSort, setSelectedSort] = useState('Newest');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filterBarRef = useRef(null);

  useEffect(() => {
    const statusOverrides = JSON.parse(localStorage.getItem('rerun_admin_order_statuses') || '{}');
    if (Object.keys(statusOverrides).length > 0) {
      setOrders(
        INITIAL_ORDERS.map((ord) =>
          statusOverrides[ord.slug] ? { ...ord, status: statusOverrides[ord.slug] } : ord
        )
      );
    }

    const token = localStorage.getItem('rerun_admin_token');
    fetch(`${API_BASE_URL}/admin/orders`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (Array.isArray(json?.data) && json.data.length > 0) {
          setOrders(json.data);
        }
      })
      .catch(() => {
        // Gunakan data mockup saat REST API Laravel belum aktif
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

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        !effectiveQuery ||
        order.id.toLowerCase().includes(effectiveQuery) ||
        order.customer.toLowerCase().includes(effectiveQuery);
      const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
      const matchesDate =
        selectedDate === 'All time' ||
        selectedDate === 'Last 30 days' ||
        (selectedDate === 'Last 10 days' && order.daysAgo <= 10) ||
        (selectedDate === 'Last 7 days' && order.daysAgo <= 7);
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (selectedSort === 'Oldest') return a.timestamp - b.timestamp || a.slug.localeCompare(b.slug);
      if (selectedSort === 'Total: High to Low') return b.total - a.total;
      if (selectedSort === 'Total: Low to High') return a.total - b.total;
      return b.timestamp - a.timestamp || b.slug.localeCompare(a.slug);
    });

  const isDefaultUnfiltered =
    !effectiveQuery &&
    selectedStatus === 'All' &&
    selectedDate === 'Last 30 days' &&
    orders.length === INITIAL_ORDERS.length;

  const totalOrdersDisplay = isDefaultUnfiltered ? '1.284' : String(filteredOrders.length);
  const totalPages = isDefaultUnfiltered ? 161 : Math.max(1, Math.ceil(filteredOrders.length / 8));

  const handleSelectStatus = (statusKey) => {
    setSelectedStatus(statusKey);
    setCurrentPage(1);
    setOpenDropdown(null);
  };

  return (
    <div>
      {/* Header Bar Atas */}
      <div className="ord-page-header">
        <h2 className="ord-header-title">Order Management</h2>
        <p className="ord-header-sub">Track, review, and update customer orders.</p>
      </div>

      {/* Card Utama */}
      <div className="ord-card">
        {/* Status Tabs */}
        <div className="ord-tabs-bar" role="tablist" aria-label="Order Status Tabs">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`ord-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectStatus(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="ord-tab-badge">{tab.defaultCount}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar Pencarian & 3 Pill Filter */}
        <div className="ord-toolbar" ref={filterBarRef}>
          <div className="ord-search-wrap">
            <span className="ord-search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="ord-search-input"
              placeholder="Search order ID or customer..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="ord-filters-group">
            {/* Filter Status */}
            <div className="ord-dropdown">
              <button
                type="button"
                className="ord-filter-pill"
                onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              >
                <span>Status:</span>
                <strong>{selectedStatus}</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'status' && (
                <div className="ord-dropdown-menu" role="menu">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`ord-dropdown-option ${selectedStatus === option ? 'selected' : ''}`}
                      onClick={() => handleSelectStatus(option)}
                    >
                      <span>{option}</span>
                      {selectedStatus === option && <span>&#10003;</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Date */}
            <div className="ord-dropdown">
              <button
                type="button"
                className="ord-filter-pill"
                onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Date:</span>
                <strong>{selectedDate}</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'date' && (
                <div className="ord-dropdown-menu" role="menu">
                  {DATE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`ord-dropdown-option ${selectedDate === option ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedDate(option);
                        setOpenDropdown(null);
                        setCurrentPage(1);
                      }}
                    >
                      <span>{option}</span>
                      {selectedDate === option && <span>&#10003;</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Sort */}
            <div className="ord-dropdown">
              <button
                type="button"
                className="ord-filter-pill"
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              >
                <span>Sort:</span>
                <strong>{selectedSort}</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'sort' && (
                <div className="ord-dropdown-menu" role="menu">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`ord-dropdown-option ${selectedSort === option ? 'selected' : ''}`}
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

        {/* Tabel Daftar Pesanan */}
        <div className="ord-table-wrap">
          <table className="ord-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="ord-id-text">{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>{order.items}</td>
                    <td className="ord-total-text">{formatRupiah(order.total)}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        <span className="status-dot" />
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/admin/orders/${order.slug}`}
                        className="ord-view-btn"
                        aria-label={`View order ${order.id}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                    No orders match your current search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="ord-pagination-bar">
          <div className="ord-showing-text">
            {filteredOrders.length === 0
              ? 'Showing 0 orders'
              : isDefaultUnfiltered
              ? `Showing ${(currentPage - 1) * 8 + 1}–${Math.min(currentPage * 8, 1284)} of ${totalOrdersDisplay} orders`
              : `Showing 1–${filteredOrders.length} of ${totalOrdersDisplay} orders`}
          </div>

          <div className="ord-page-controls" aria-label="Orders Pagination">
            <button
              type="button"
              className="ord-page-btn"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              &lsaquo;
            </button>

            <button
              type="button"
              className={`ord-page-btn ${currentPage === 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>

            {totalPages >= 2 && (
              <button
                type="button"
                className={`ord-page-btn ${currentPage === 2 ? 'active' : ''}`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
            )}

            {totalPages >= 3 && (
              <button
                type="button"
                className={`ord-page-btn ${currentPage === 3 ? 'active' : ''}`}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
            )}

            {totalPages > 4 && (
              <span className="ord-page-btn dots" aria-hidden="true">
                ...
              </span>
            )}

            {totalPages > 3 && (
              <button
                type="button"
                className={`ord-page-btn ${currentPage === totalPages ? 'active' : ''}`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            )}

            <button
              type="button"
              className="ord-page-btn"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}