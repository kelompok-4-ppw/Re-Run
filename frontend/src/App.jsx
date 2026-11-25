import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import ForgotPassword from './pages/admin/ForgotPassword';

function AdminDashboardPlaceholder() {
  return (
    <div style={{ padding: '48px', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary-navy)' }}>
        Admin Dashboard
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
        Login berhasil. Halaman Admin Dashboard siap dihubungkan ke komponen berikutnya.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin" element={<AdminDashboardPlaceholder />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}