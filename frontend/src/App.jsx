import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingGuest from './pages/customer/LandingGuest';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerLogin from './pages/customer/CustomerLogin';
import AdminLogin from './pages/admin/AdminLogin';
import ForgotPassword from './pages/admin/ForgotPassword';
import CheckEmail from './pages/admin/CheckEmail';
import ResetPassword from './pages/admin/ResetPassword';
import PasswordUpdated from './pages/admin/PasswordUpdated';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import Orders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import Inventory from './pages/admin/Inventory';

function CustomerPagePlaceholder({ title }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
      <h2 style={{ color: 'var(--color-primary-navy)', marginBottom: '8px' }}>{title}</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
        Halaman {title} siap dibuat pada tahap berikutnya.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Customer (Guest & Storefront) */}
        <Route path="/" element={<LandingGuest />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/home" element={<CustomerPagePlaceholder title="Customer Home (Logged In)" />} />

        {/* Halaman Autentikasi Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/check-email" element={<CheckEmail />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin/password-updated" element={<PasswordUpdated />} />

        {/* Panel Admin dengan Sidebar & Topbar */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/create" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}