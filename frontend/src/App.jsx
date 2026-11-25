import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import ForgotPassword from './pages/admin/ForgotPassword';
import CheckEmail from './pages/admin/CheckEmail';
import ResetPassword from './pages/admin/ResetPassword';
import PasswordUpdated from './pages/admin/PasswordUpdated';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';

function AdminSubpagePlaceholder({ title }) {
  return (
    <div className="dash-card">
      <h2 className="dash-section-title">{title}</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
        Halaman {title} siap dilengkapi pada tahap berikutnya.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Autentikasi Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/check-email" element={<CheckEmail />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin/password-updated" element={<PasswordUpdated />} />

        {/* Panel Admin dengan Sidebar & Topbar */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminSubpagePlaceholder title="Products" />} />
          <Route path="products/create" element={<AdminSubpagePlaceholder title="Add Product" />} />
          <Route path="orders" element={<AdminSubpagePlaceholder title="Orders" />} />
          <Route path="inventory" element={<AdminSubpagePlaceholder title="Inventory" />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}