import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/customer/Home';
import Shop from './pages/customer/Shop';

function PlaceholderPage({ title }) {
  return (
    <div className="container" style={{ padding: '80px 24px' }}>
      <h1 style={{ color: 'var(--color-primary-navy)', marginBottom: '8px' }}>{title}</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Komponen React untuk halaman ini siap dilengkapi.</p>
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);

  const handleAddToCart = (product, size) => {
    setCart((prev) => [...prev, { ...product, size, qty: 1 }]);
    alert(`Berhasil menambahkan "${product.name}" (Size ${size}) ke keranjang React!`);
  };

  return (
    <BrowserRouter>
      <Navbar cartCount={cart.length} />
      <main>
        <Routes>
          <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
          <Route path="/shop" element={<Shop onAddToCart={handleAddToCart} />} />
          <Route path="/product/:slug" element={<PlaceholderPage title="Product Detail" />} />
          <Route path="/cart" element={<PlaceholderPage title="Shopping Cart" />} />
          <Route path="/checkout" element={<PlaceholderPage title="Checkout" />} />
          <Route path="/payment" element={<PlaceholderPage title="Payment" />} />
          <Route path="/order-success" element={<PlaceholderPage title="Order Success" />} />
          <Route path="/wishlist" element={<PlaceholderPage title="My Wishlist" />} />
          <Route path="/profile" element={<PlaceholderPage title="My Profile" />} />
          <Route path="/about" element={<PlaceholderPage title="About Re-Run" />} />
          <Route path="/login" element={<PlaceholderPage title="Customer Login" />} />
          <Route path="/register" element={<PlaceholderPage title="Create Account" />} />
          <Route path="/admin/login" element={<PlaceholderPage title="Admin Login" />} />
          <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" />} />
          <Route path="/admin/products" element={<PlaceholderPage title="Admin Products" />} />
          <Route path="/admin/orders" element={<PlaceholderPage title="Admin Orders" />} />
          <Route path="/admin/inventory" element={<PlaceholderPage title="Admin Inventory" />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}