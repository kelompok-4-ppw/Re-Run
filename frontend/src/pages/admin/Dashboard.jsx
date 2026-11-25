import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const INITIAL_DASHBOARD_DATA = {
  stats: {
    totalProducts: 248,
    totalProductsTrend: '+12 this month',
    availableProducts: 201,
    availableProductsTrend: '81% in stock',
    totalOrders: '1.284',
    totalOrdersTrend: '+8,2% vs last week',
    pendingOrders: 23,
    pendingOrdersTrend: 'Needs attention',
  },
  recentOrders: [
    { id: '#RR-20482', customer: 'Alya Putri', date: '20 Nov 2026', total: 'Rp 917.000', status: 'Pending' },
    { id: '#RR-20481', customer: 'Bima Pratama', date: '19 Nov 2026', total: 'Rp 638.000', status: 'Processing' },
    { id: '#RR-20480', customer: 'Citra Lestari', date: '19 Nov 2026', total: 'Rp 249.000', status: 'Completed' },
    { id: '#RR-20479', customer: 'Dimas Aditya', date: '18 Nov 2026', total: 'Rp 389.000', status: 'Cancelled' },
    { id: '#RR-20478', customer: 'Eka Wulandari', date: '18 Nov 2026', total: 'Rp 1.126.000', status: 'Completed' },
  ],
  lowStockProducts: [
    { name: 'CoolDry Run Tee (L)', qty: '3 pcs' },
    { name: 'Lightweight Run Tee (S)', qty: '2 pcs' },
    { name: 'Seamless Run Tee (M)', qty: '4 pcs' },
  ],
  outOfStockProducts: [
    { name: 'Pace Lite Tee (M)', qty: '0 pcs' },
    { name: 'Race Day Tee', qty: '0 pcs' },
  ],
};

export default function Dashboard() {
  const outletContext = useOutletContext();
  const searchQuery = (outletContext?.searchQuery || '').toLowerCase();
  const [data, setData] = useState(INITIAL_DASHBOARD_DATA);

  useEffect(() => {
    const token = localStorage.getItem('rerun_admin_token');
    fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.stats) {
          setData((prev) => ({ ...prev, ...json }));
        }
      })
      .catch(() => {
        // Gunakan data default saat REST API Laravel belum berjalan
      });
  }, []);

  const filteredOrders = data.recentOrders.filter(
    (order) =>
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery) ||
      order.customer.toLowerCase().includes(searchQuery) ||
      order.status.toLowerCase().includes(searchQuery)
  );

  const filteredLowStock = data.lowStockProducts.filter(
    (item) => !searchQuery || item.name.toLowerCase().includes(searchQuery)
  );

  const filteredOutOfStock = data.outOfStockProducts.filter(
    (item) => !searchQuery || item.name.toLowerCase().includes(searchQuery)
  );

  return (
    <div>
      {/* 4 Kartu Ringkasan */}
      <section className="dash-stats-grid" aria-label="Store Summary Statistics">
        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <span className="dash-stat-label">Total Products</span>
            <span className="dash-stat-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
          </div>
          <div className="dash-stat-value">{data.stats.totalProducts}</div>
          <div className="dash-stat-sub positive">{data.stats.totalProductsTrend}</div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <span className="dash-stat-label">Available Products</span>
            <span className="dash-stat-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>
          <div className="dash-stat-value">{data.stats.availableProducts}</div>
          <div className="dash-stat-sub positive">{data.stats.availableProductsTrend}</div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <span className="dash-stat-label">Total Orders</span>
            <span className="dash-stat-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <rect x="5" y="4" width="14" height="17" rx="2" />
                <path d="M9 4V2h6v2" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="9" y1="14" x2="15" y2="14" />
                <line x1="9" y1="18" x2="12" y2="18" />
              </svg>
            </span>
          </div>
          <div className="dash-stat-value">{data.stats.totalOrders}</div>
          <div className="dash-stat-sub positive">{data.stats.totalOrdersTrend}</div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <span className="dash-stat-label">Pending Orders</span>
            <span className="dash-stat-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" />
              </svg>
            </span>
          </div>
          <div className="dash-stat-value">{data.stats.pendingOrders}</div>
          <div className="dash-stat-sub warning">{data.stats.pendingOrdersTrend}</div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dash-card dash-quick-card">
        <h2 className="dash-section-title">Quick Actions</h2>
        <div className="dash-quick-grid">
          <Link to="/admin/products/create" className="dash-qa-btn dash-qa-primary">
            Add Product
          </Link>
          <Link to="/admin/orders" className="dash-qa-btn dash-qa-secondary">
            Manage Orders
          </Link>
          <Link to="/admin/inventory" className="dash-qa-btn dash-qa-outline">
            Update Inventory
          </Link>
        </div>
      </section>

      {/* Recent Orders & Inventory Overview */}
      <section className="dash-bottom-grid">
        {/* Tabel Recent Orders */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-section-title">Recent Orders</h2>
            <Link to="/admin/orders" className="dash-view-all">
              View all
            </Link>
          </div>

          <div className="dash-table-wrap">
            <table className="dash-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link to="/admin/orders" className="dash-order-id">
                          {order.id}
                        </Link>
                      </td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td>{order.total}</td>
                      <td>
                        <span className={`status-badge status-${order.status.toLowerCase()}`}>
                          <span className="status-dot" />
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '24px' }}>
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kartu Inventory Overview */}
        <div className="dash-card">
          <h2 className="dash-section-title">Inventory Overview</h2>

          <div className="inv-group">
            <div className="inv-group-header">
              <span className="inv-group-title">Low Stock Products</span>
              <span className="status-badge status-low-stock">
                <span className="status-dot" />
                Low Stock
              </span>
            </div>

            <div className="inv-item-list">
              {filteredLowStock.map((item) => (
                <div key={item.name} className="inv-item-row">
                  <span className="inv-item-name">{item.name}</span>
                  <span className="inv-item-qty">{item.qty}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="inv-group">
            <div className="inv-group-header">
              <span className="inv-group-title">Out of Stock Products</span>
              <span className="status-badge status-out-of-stock">
                <span className="status-dot" />
                Out of Stock
              </span>
            </div>

            <div className="inv-item-list">
              {filteredOutOfStock.map((item) => (
                <div key={item.name} className="inv-item-row">
                  <span className="inv-item-name">{item.name}</span>
                  <span className="inv-item-qty">{item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}