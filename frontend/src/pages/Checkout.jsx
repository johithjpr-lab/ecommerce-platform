import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../services/api.js';
import AnimatedPage, { fadeInUp, staggerContainer } from '../components/AnimatedPage.jsx';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard via Stripe', color: '#6366f1' },
  { id: 'upi', name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm', color: '#22d3ee' },
  { id: 'paypal', name: 'PayPal', icon: '🅿️', desc: 'PayPal wallet', color: '#f59e0b' },
  { id: 'wallet', name: 'GadgetZone Wallet', icon: '👛', desc: 'Pay from balance', color: '#a78bfa' },
  { id: 'cod', name: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered', color: '#34d399' },
];

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState({
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    zipCode: user?.addresses?.[0]?.zipCode || '',
    country: user?.addresses?.[0]?.country || 'India',
  });
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  if (!user) { navigate('/auth'); return null; }
  if (items.length === 0) { navigate('/cart'); return null; }

  const tax = Math.round(total * 0.18 * 100) / 100;
  const shipping = total > 1000 ? 0 : 99;
  const grandTotal = total + tax + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      return setError('Please fill in all address fields');
    }
    setLoading(true); setError('');
    try {
      const orderData = {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address, paymentMethod,
      };
      if (paymentMethod === 'upi') orderData.upiId = upiId;
      const order = await api.createOrder(orderData);
      clearCart();
      navigate(`/orders/${order._id}`);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <AnimatedPage>
      <div className="container" style={{ padding: '32px 20px' }}>
        <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="page-title">Checkout</motion.h1>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
            <motion.div variants={staggerContainer} initial="initial" animate="animate"
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Shipping Address */}
              <motion.div variants={fadeInUp} className="card p-3">
                <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>Shipping Address</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input className="input" placeholder="Street Address *" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} required />
                  <div className="grid-2">
                    <input className="input" placeholder="City *" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required />
                    <input className="input" placeholder="State *" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} required />
                  </div>
                  <div className="grid-2">
                    <input className="input" placeholder="ZIP Code *" value={address.zipCode} onChange={e => setAddress({ ...address, zipCode: e.target.value })} required />
                    <input className="input" placeholder="Country" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div variants={fadeInUp} className="card p-3">
                <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>Payment Method</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PAYMENT_METHODS.map((m, i) => (
                    <motion.label key={m.id}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                        border: `2px solid ${paymentMethod === m.id ? m.color : 'var(--border)'}`,
                        borderRadius: 12, cursor: 'pointer',
                        background: paymentMethod === m.id ? `${m.color}15` : 'transparent',
                        transition: 'all .3s',
                        boxShadow: paymentMethod === m.id ? `0 0 20px ${m.color}20` : 'none'
                      }}>
                      <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} style={{ display: 'none' }} />
                      <motion.span animate={paymentMethod === m.id ? { rotateY: [0, 360] } : {}}
                        transition={{ duration: 0.5 }}
                        style={{ fontSize: 24 }}>{m.icon}</motion.span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.desc}</div>
                      </div>
                      {paymentMethod === m.id && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                          style={{ marginLeft: 'auto', color: m.color, fontWeight: 700, fontSize: 18 }}>✓</motion.span>
                      )}
                    </motion.label>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {paymentMethod === 'card' && (
                    <motion.div key="card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 16, padding: 16, background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Card payment processed securely via Stripe</p>
                      <input className="input" placeholder="Card Number (demo: any 16 digits)" value={cardNumber} onChange={e => setCardNumber(e.target.value)} style={{ marginBottom: 8 }} />
                      <div className="grid-2">
                        <input className="input" placeholder="MM/YY" />
                        <input className="input" placeholder="CVC" />
                      </div>
                    </motion.div>
                  )}
                  {paymentMethod === 'upi' && (
                    <motion.div key="upi" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 16, padding: 16, background: 'rgba(34,211,238,0.08)', borderRadius: 10, border: '1px solid rgba(34,211,238,0.15)' }}>
                      <input className="input" placeholder="Enter UPI ID (e.g., name@upi)" value={upiId} onChange={e => setUpiId(e.target.value)} />
                    </motion.div>
                  )}
                  {paymentMethod === 'cod' && (
                    <motion.div key="cod" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 16, padding: 14, background: 'rgba(245,158,11,0.1)', borderRadius: 10, fontSize: 13, color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                      Additional ₹49 COD fee may apply. Pay cash or card on delivery.
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="card" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 90 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {items.map(item => (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span className="text-muted">{item.name} x {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span className="text-muted">Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span className="text-muted">GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span className="text-muted">Shipping</span><span>{shipping === 0 ? <span style={{ color: '#4ade80' }}>FREE</span> : `₹${shipping}`}</span></div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, #fff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    style={{ marginTop: 12, padding: 12, background: 'rgba(220,38,38,0.15)', borderRadius: 10, color: '#f87171', fontSize: 13, border: '1px solid rgba(220,38,38,0.3)' }}>{error}</motion.div>
                )}
              </AnimatePresence>
              <motion.button whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(99,102,241,0.5)' }} whileTap={{ scale: 0.97 }}
                type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
                {loading ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString()}`}
              </motion.button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>🔒</motion.span> Secure checkout with SSL encryption
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </AnimatedPage>
  );
}
