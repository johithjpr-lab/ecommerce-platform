import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import AnimatedPage, { fadeInUp, staggerContainer } from '../components/AnimatedPage.jsx';

export default function Cart() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <AnimatedPage>
        <div className="container text-center" style={{ padding: '80px 20px' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ fontSize: 80, marginBottom: 20, filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.3))' }}>🛒</motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ marginBottom: 8, background: 'linear-gradient(135deg, #fff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your cart is empty</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-muted mb-3">Browse our products and add items to your cart</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}>
            <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
          </motion.div>
        </div>
      </AnimatedPage>
    );
  }

  const tax = Math.round(total * 0.18 * 100) / 100;
  const shipping = total > 1000 ? 0 : 99;
  const grandTotal = total + tax + shipping;

  return (
    <AnimatedPage>
      <div className="container" style={{ padding: '32px 20px' }}>
        <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="page-title">
          Shopping Cart ({itemCount} items)
        </motion.h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.95 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="card" style={{ display: 'flex', padding: 16, gap: 16 }}>
                  <div style={{
                    width: 100, height: 100,
                    background: 'linear-gradient(135deg, rgba(30,30,60,0.5), rgba(15,15,35,0.8))',
                    borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}>
                    <img src={item.image || 'https://placehold.co/100x100/1e1e3e/818cf8?text=Item'} alt={item.name} style={{ height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link to={`/products/${item.productId}`}><h3 style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</h3></Link>
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: '#818cf8' }}>₹{item.price.toLocaleString()}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        border: '1px solid var(--border)', borderRadius: 8,
                        background: 'rgba(15,15,35,0.6)'
                      }}>
                        <motion.button whileTap={{ scale: 0.8 }}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          style={{ padding: '4px 12px', border: 'none', background: 'none', color: '#fff', cursor: 'pointer' }}>-</motion.button>
                        <span style={{ padding: '4px 14px', fontWeight: 600 }}>{item.quantity}</span>
                        <motion.button whileTap={{ scale: 0.8 }}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          style={{ padding: '4px 12px', border: 'none', background: 'none', color: '#fff', cursor: 'pointer' }}>+</motion.button>
                      </div>
                      <span className="text-muted text-sm">Subtotal: ₹{(item.price * item.quantity).toLocaleString()}</span>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.productId)}
                        style={{ marginLeft: 'auto', color: '#f87171', background: 'none', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Remove</motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="card" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 90, animation: 'pulseGlow 4s infinite' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Subtotal</span><span>₹{total.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Shipping</span><span>{shipping === 0 ? <span style={{ color: '#4ade80', textShadow: '0 0 6px rgba(74,222,128,0.4)' }}>FREE</span> : `₹${shipping}`}</span></div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, #fff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{grandTotal.toLocaleString()}</motion.span>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Proceed to Checkout</Link>
            </motion.div>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#818cf8', fontSize: 14 }}>Continue Shopping</Link>
          </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
}
