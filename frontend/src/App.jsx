import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Header from './components/Header.jsx';
import ParticleField from './components/ParticleField.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Profile from './pages/Profile.jsx';
import Auth from './pages/Auth.jsx';
import TrackOrder from './pages/TrackOrder.jsx';
import Admin from './pages/Admin.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ParticleField />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 70px)', paddingBottom: 40 }}>
              <AnimatedRoutes />
            </main>
            <footer style={{
              background: 'linear-gradient(180deg, transparent, rgba(3,0,20,0.95))',
              borderTop: '1px solid rgba(99,102,241,0.15)',
              color: '#64748b', padding: '40px 20px', textAlign: 'center',
              position: 'relative', zIndex: 1
            }}>
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 20, fontSize: 14 }}>
                  <a href="/products" style={{ color: '#94a3b8', transition: 'color 0.3s' }}>Products</a>
                  <a href="/track" style={{ color: '#94a3b8', transition: 'color 0.3s' }}>Track Order</a>
                  <a href="/orders" style={{ color: '#94a3b8', transition: 'color 0.3s' }}>My Orders</a>
                  <a href="/profile" style={{ color: '#94a3b8', transition: 'color 0.3s' }}>Account</a>
                </div>
                <p style={{ fontSize: 13, color: '#475569' }}>© 2024 GadgetZone. All rights reserved. | Secure Payments | Free Shipping over ₹1,000</p>
              </div>
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
