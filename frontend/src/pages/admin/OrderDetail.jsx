import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../styles/admin-order-detail.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const ORDER_STATUS_OPTIONS = ['Pending', 'Processing', 'Completed', 'Cancelled'];

const SEED_ORDER_DETAILS = {
  'RR-20482': {
    id: '#RR-20482',
    slug: 'RR-20482',
    orderDate: '20 Nov 2026, 14:32',
    status: 'Pending',
    customer: {
      name: 'Alya Putri',
      email: 'alya@email.com',
      phone: '+62 812-3456-7890',
      address: 'Jl. Kemang Raya No. 18, RT 04/RW 02, Kemang, Jakarta Selatan 12730',
    },
    payment: {
      method: 'QRIS',
      status: 'Paid',
      transactionId: 'TRX-8F2A91C3',
      paidAt: '20 Nov 2026, 14:36',
    },
    items: [
      { id: 1, name: 'AeroFit Running Tee', sku: 'SKU RR-SS-001', size: 'M', qty: 1, price: 249000 },
      { id: 2, name: 'CoolDry Run Tee', sku: 'SKU RR-LS-014', size: 'L', qty: 1, price: 389000 },
      { id: 3, name: 'Pace Lite Tee', sku: 'SKU RR-SG-007', size: 'M', qty: 1, price: 279000 },
    ],
  },
  'RR-20481': {
    id: '#RR-20481',
    slug: 'RR-20481',
    orderDate: '19 Nov 2026, 10:15',
    status: 'Processing',
    customer: {
      name: 'Bima Pratama',
      email: 'bima.pratama@email.com',
      phone: '+62 813-9988-1122',
      address: 'Jl. Tebet Barat Dalam IX No. 12, Tebet, Jakarta Selatan 12810',
    },
    payment: {
      method: 'Virtual Account BCA',
      status: 'Paid',
      transactionId: 'TRX-7D19B4E0',
      paidAt: '19 Nov 2026, 10:19',
    },
    items: [
      { id: 1, name: 'AeroFit Running Tee', sku: 'SKU RR-SS-001', size: 'L', qty: 1, price: 249000 },
      { id: 2, name: 'CoolDry Run Tee', sku: 'SKU RR-LS-014', size: 'M', qty: 1, price: 389000 },
    ],
  },
  'RR-20480': {
    id: '#RR-20480',
    slug: 'RR-20480',
    orderDate: '19 Nov 2026, 09:40',
    status: 'Completed',
    customer: {
      name: 'Citra Lestari',
      email: 'citra.lestari@email.com',
      phone: '+62 821-7766-5544',
      address: 'Jl. Rawamangun Muka Raya No. 45, Pulo Gadung, Jakarta Timur 13220',
    },
    payment: {
      method: 'QRIS',
      status: 'Paid',
      transactionId: 'TRX-6C08A2D1',
      paidAt: '19 Nov 2026, 09:42',
    },
    items: [
      { id: 1, name: 'AeroFit Running Tee', sku: 'SKU RR-SS-001', size: 'S', qty: 1, price: 249000 },
    ],
  },
  'RR-20479': {
    id: '#RR-20479',
    slug: 'RR-20479',
    orderDate: '18 Nov 2026, 16:20',
    status: 'Cancelled',
    customer: {
      name: 'Dimas Aditya',
      email: 'dimas.aditya@email.com',
      phone: '+62 857-2233-4455',
      address: 'Jl. Bintaro Utama 3A Blok DC No. 7, Tangerang Selatan 15225',
    },
    payment: {
      method: 'QRIS',
      status: 'Paid',
      transactionId: 'TRX-5B97E1C4',
      paidAt: '18 Nov 2026, 16:23',
    },
    items: [
      { id: 1, name: 'CoolDry Run Tee', sku: 'SKU RR-LS-014', size: 'XL', qty: 1, price: 389000 },
    ],
  },
  'RR-20478': {
    id: '#RR-20478',
    slug: 'RR-20478',
    orderDate: '18 Nov 2026, 13:05',
    status: 'Completed',
    customer: {
      name: 'Eka Wulandari',
      email: 'eka.wulandari@email.com',
      phone: '+62 811-6655-4433',
      address: 'Jl. Senopati No. 72, Kebayoran Baru, Jakarta Selatan 12190',
    },
    payment: {
      method: 'Virtual Account Mandiri',
      status: 'Paid',
      transactionId: 'TRX-4A86D0B9',
      paidAt: '18 Nov 2026, 13:10',
    },
    items: [
      { id: 1, name: 'Boxy Run Tee', sku: 'SKU RR-LS-020', size: 'M', qty: 1, price: 459000 },
      { id: 2, name: 'AeroFit Running Tee', sku: 'SKU RR-SS-001', size: 'L', qty: 1, price: 249000 },
      { id: 3, name: 'Lightweight Run Tee', sku: 'SKU RR-SS-009', size: 'S', qty: 1, price: 219000 },
      { id: 4, name: 'Seamless Run Tee', sku: 'SKU RR-SS-012', size: 'M', qty: 1, price: 199000 },
    ],
  },
  'RR-20477': {
    id: '#RR-20477',
    slug: 'RR-20477',
    orderDate: '17 Nov 2026, 19:12',
    status: 'Processing',
    customer: {
      name: 'Fajar Ramadhan',
      email: 'fajar.ramadhan@email.com',
      phone: '+62 812-5544-3322',
      address: 'Jl. Margonda Raya No. 210, Beji, Depok 16424',
    },
    payment: {
      method: 'QRIS',
      status: 'Paid',
      transactionId: 'TRX-3F75C9A8',
      paidAt: '17 Nov 2026, 19:15',
    },
    items: [
      { id: 1, name: 'Pace Lite Tee', sku: 'SKU RR-SG-007', size: 'M', qty: 1, price: 279000 },
      { id: 2, name: 'City Run Tee', sku: 'SKU RR-SG-011', size: 'L', qty: 1, price: 229000 },
    ],
  },
  'RR-20476': {
    id: '#RR-20476',
    slug: 'RR-20476',
    orderDate: '17 Nov 2026, 11:48',
    status: 'Pending',
    customer: {
      name: 'Gita Anjani',
      email: 'gita.anjani@email.com',
      phone: '+62 878-1122-3344',
      address: 'Jl. Cikini Raya No. 54, Menteng, Jakarta Pusat 10330',
    },
    payment: {
      method: 'QRIS',
      status: 'Paid',
      transactionId: 'TRX-2E64B897',
      paidAt: '17 Nov 2026, 11:51',
    },
    items: [
      { id: 1, name: 'Seamless Run Tee', sku: 'SKU RR-SS-012', size: 'S', qty: 1, price: 199000 },
    ],
  },
  'RR-20475': {
    id: '#RR-20475',
    slug: 'RR-20475',
    orderDate: '16 Nov 2026, 15:30',
    status: 'Completed',
    customer: {
      name: 'Hendra Wijaya',
      email: 'hendra.wijaya@email.com',
      phone: '+62 819-4433-2211',
      address: 'Jl. Boulevard Raya Blok QA1 No. 9, Kelapa Gading, Jakarta Utara 14240',
    },
    payment: {
      method: 'Virtual Account BCA',
      status: 'Paid',
      transactionId: 'TRX-1D53A786',
      paidAt: '16 Nov 2026, 15:35',
    },
    items: [
      { id: 1, name: 'City Run Tee', sku: 'SKU RR-SG-011', size: 'L', qty: 1, price: 329000 },
      { id: 2, name: 'AeroFit Running Tee', sku: 'SKU RR-SS-001', size: 'M', qty: 1, price: 249000 },
      { id: 3, name: 'Lightweight Run Tee', sku: 'SKU RR-SS-009', size: 'L', qty: 1, price: 217000 },
    ],
  },
};

function formatRupiah(amount) {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
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

export default function OrderDetail() {
  const { orderId } = useParams();
  const normalizedSlug = (orderId || 'RR-20482').replace(/^#/, '');

  const [order, setOrder] = useState(() => {
    const base = SEED_ORDER_DETAILS[normalizedSlug] || SEED_ORDER_DETAILS['RR-20482'];
    const overrides = JSON.parse(localStorage.getItem('rerun_admin_order_statuses') || '{}');
    return overrides[base.slug] ? { ...base, status: overrides[base.slug] } : base;
  });

  const [selectedNextStatus, setSelectedNextStatus] = useState('Processing');
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');
  const [updatedAtText, setUpdatedAtText] = useState('');

  useEffect(() => {
    const base = SEED_ORDER_DETAILS[normalizedSlug] || SEED_ORDER_DETAILS['RR-20482'];
    const overrides = JSON.parse(localStorage.getItem('rerun_admin_order_statuses') || '{}');
    const resolvedStatus = overrides[base.slug] || base.status;

    setOrder({ ...base, status: resolvedStatus });
    setSelectedNextStatus(resolvedStatus === 'Pending' ? 'Processing' : resolvedStatus);
    setDropdownOpen(true);
    setStatusNotice('');

    const token = localStorage.getItem('rerun_admin_token');
    fetch(`${API_BASE_URL}/admin/orders/${normalizedSlug}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const remote = json?.data || json;
        if (remote?.id) {
          setOrder(remote);
          setSelectedNextStatus(remote.status === 'Pending' ? 'Processing' : remote.status);
        }
      })
      .catch(() => {
        // Tetap gunakan data lokal saat backend Laravel belum aktif
      });
  }, [normalizedSlug]);

  const totalItems = order.items.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleUpdateStatus = async () => {
    if (updating) return;
    setUpdating(true);
    setStatusNotice('');

    try {
      const token = localStorage.getItem('rerun_admin_token');
      await fetch(`${API_BASE_URL}/admin/orders/${order.slug}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: selectedNextStatus }),
      });
    } catch {
      // Lanjutkan pembaruan pada state & storage lokal
    } finally {
      const overrides = JSON.parse(localStorage.getItem('rerun_admin_order_statuses') || '{}');
      overrides[order.slug] = selectedNextStatus;
      localStorage.setItem('rerun_admin_order_statuses', JSON.stringify(overrides));

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setUpdatedAtText(`28 Nov 2026, ${timeStr}`);
      setOrder((prev) => ({ ...prev, status: selectedNextStatus }));
      setDropdownOpen(false);
      setUpdating(false);
      setStatusNotice(`Order ${order.id} status updated to ${selectedNextStatus}.`);
    }
  };

  const isProcessingDone = order.status === 'Processing' || order.status === 'Completed';
  const isCompletedDone = order.status === 'Completed';
  const isCancelled = order.status === 'Cancelled';

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="odet-breadcrumb" aria-label="Breadcrumb">
        <Link to="/admin/orders">Orders</Link>
        <span className="odet-breadcrumb-sep" aria-hidden="true">
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
        <span className="odet-breadcrumb-current">{order.id}</span>
      </nav>

      {/* Header Row */}
      <div className="odet-header-row">
        <div className="odet-title-group">
          <h2 className="odet-title">Order {order.id}</h2>
          <span className={`status-badge status-${order.status.toLowerCase()}`}>
            <span className="status-dot" />
            {order.status}
          </span>
        </div>

        <Link to="/admin/orders" className="odet-back-btn">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 12.5L5.5 8L10 3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back to Orders</span>
        </Link>
      </div>

      {statusNotice && (
        <div className="odet-toast" role="status">
          <span>{statusNotice}</span>
          <button
            type="button"
            className="odet-toast-close"
            aria-label="Dismiss notification"
            onClick={() => setStatusNotice('')}
          >
            &times;
          </button>
        </div>
      )}

      {/* Grid 2 Kolom */}
      <div className="odet-grid">
        {/* Kolom Kiri */}
        <div className="odet-col">
          {/* Card 1: Order Information */}
          <section className="odet-card">
            <h3 className="odet-card-title">Order Information</h3>
            <div className="odet-meta-grid-3">
              <div>
                <div className="odet-meta-label">Order ID</div>
                <div className="odet-meta-value">{order.id}</div>
              </div>
              <div>
                <div className="odet-meta-label">Order Date</div>
                <div className="odet-meta-value">{order.orderDate}</div>
              </div>
              <div>
                <div className="odet-meta-label">Current Status</div>
                <div>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    <span className="status-dot" />
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Customer Information */}
          <section className="odet-card">
            <h3 className="odet-card-title">Customer Information</h3>
            <div className="odet-meta-grid-3">
              <div>
                <div className="odet-meta-label">Customer Name</div>
                <div className="odet-meta-value">{order.customer.name}</div>
              </div>
              <div>
                <div className="odet-meta-label">Email</div>
                <div className="odet-meta-value">{order.customer.email}</div>
              </div>
              <div>
                <div className="odet-meta-label">Phone</div>
                <div className="odet-meta-value">{order.customer.phone}</div>
              </div>
            </div>

            <div className="odet-meta-block">
              <div className="odet-meta-label">Shipping Address</div>
              <div className="odet-meta-value">{order.customer.address}</div>
            </div>
          </section>

          {/* Card 3: Payment Information */}
          <section className="odet-card">
            <h3 className="odet-card-title">Payment Information</h3>
            <div className="odet-meta-grid-4">
              <div>
                <div className="odet-meta-label">Payment Method</div>
                <div className="odet-meta-value">{order.payment.method}</div>
              </div>
              <div>
                <div className="odet-meta-label">Payment Status</div>
                <div>
                  <span className="status-badge status-paid">
                    <span className="status-dot" />
                    {order.payment.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="odet-meta-label">Transaction ID</div>
                <div className="odet-meta-value">{order.payment.transactionId}</div>
              </div>
              <div>
                <div className="odet-meta-label">Paid At</div>
                <div className="odet-meta-value">{order.payment.paidAt}</div>
              </div>
            </div>
          </section>

          {/* Card 4: Ordered Products */}
          <section className="odet-card">
            <h3 className="odet-card-title">Ordered Products</h3>

            <div className="odet-items-table-wrap">
              <table className="odet-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="odet-prod-cell">
                          <div className="odet-prod-thumb" aria-hidden="true">
                            <TshirtThumbIcon />
                          </div>
                          <div>
                            <div className="odet-prod-name">{item.name}</div>
                            <div className="odet-prod-sku">{item.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.size}</td>
                      <td>{item.qty}</td>
                      <td>{formatRupiah(item.price)}</td>
                      <td>{formatRupiah(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="odet-summary-box">
              <div className="odet-summary-row">
                <span>Total Items</span>
                <strong>{totalItems}</strong>
              </div>
              <div className="odet-summary-total">
                <span>Total Price</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Kolom Kanan: Status Management & Order Timeline */}
        <div className="odet-col">
          {/* Card 5: Status Management */}
          <section className="odet-card">
            <h3 className="odet-card-title">Status Management</h3>

            <div className="odet-status-current-row">
              <span>Current Status</span>
              <span className={`status-badge status-${order.status.toLowerCase()}`}>
                <span className="status-dot" />
                {order.status}
              </span>
            </div>

            <label className="odet-update-label">Update to</label>

            <div className="odet-status-dropdown">
              <button
                type="button"
                className={`odet-status-trigger ${dropdownOpen ? 'open' : ''}`}
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <span className={`status-badge status-${selectedNextStatus.toLowerCase()}`}>
                  <span className="status-dot" />
                  {selectedNextStatus}
                </span>

                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-secondary)"
                  strokeWidth="2"
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="odet-status-menu" role="listbox" aria-label="Select next order status">
                  {ORDER_STATUS_OPTIONS.map((statusOption) => {
                    const isSelected = selectedNextStatus === statusOption;
                    return (
                      <button
                        key={statusOption}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`odet-status-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedNextStatus(statusOption);
                          setDropdownOpen(false);
                        }}
                      >
                        <span className={`status-badge status-${statusOption.toLowerCase()}`}>
                          <span className="status-dot" />
                          {statusOption}
                        </span>

                        {isSelected && (
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="var(--color-royal-blue)"
                            strokeWidth="2"
                          >
                            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              className="odet-update-btn"
              disabled={updating}
              onClick={handleUpdateStatus}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </section>

          {/* Card 6: Order Timeline */}
          <section className="odet-card">
            <h3 className="odet-card-title">Order Timeline</h3>

            <div className="odet-timeline">
              {/* Step 1: Order placed */}
              <div className="odet-timeline-step done">
                <span className="odet-step-circle done" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <div className="odet-step-title">Order placed</div>
                  <div className="odet-step-sub">{order.orderDate}</div>
                </div>
              </div>

              {/* Step 2: Payment received */}
              <div className={`odet-timeline-step ${isProcessingDone || isCancelled ? 'done' : ''}`}>
                <span className="odet-step-circle done" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <div className="odet-step-title">Payment received</div>
                  <div className="odet-step-sub">
                    {order.payment.paidAt} &middot; {order.payment.method}
                  </div>
                </div>
              </div>

              {isCancelled ? (
                <div className="odet-timeline-step">
                  <span className="odet-step-circle cancelled" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <div className="odet-step-title">Order cancelled</div>
                    <div className="odet-step-sub">{updatedAtText || 'Cancelled by store manager'}</div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 3: Processing */}
                  <div className={`odet-timeline-step ${isCompletedDone ? 'done' : ''}`}>
                    <span className={`odet-step-circle ${isProcessingDone ? 'done' : 'pending'}`} aria-hidden="true">
                      {isProcessingDone && (
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <div className={`odet-step-title ${!isProcessingDone ? 'muted' : ''}`}>Processing</div>
                      <div className="odet-step-sub">
                        {isProcessingDone ? updatedAtText || '19 Nov 2026, 11:00' : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Completed */}
                  <div className="odet-timeline-step">
                    <span className={`odet-step-circle ${isCompletedDone ? 'done' : 'pending'}`} aria-hidden="true">
                      {isCompletedDone && (
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <div className={`odet-step-title ${!isCompletedDone ? 'muted' : ''}`}>Completed</div>
                      <div className="odet-step-sub">
                        {isCompletedDone ? updatedAtText || '19 Nov 2026, 16:45' : '—'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}