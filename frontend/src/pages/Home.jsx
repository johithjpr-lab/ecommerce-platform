import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import AnimatedPage, { staggerContainer, fadeInUp, scaleIn } from '../components/AnimatedPage.jsx';

function HeroCanvas() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    resize();
    window.addEventListener('resize', resize);

    const shapes = [];
    const colors = ['#6366f1', '#a78bfa', '#22d3ee', '#f472b6', '#818cf8', '#34d399'];
    for (let i = 0; i < 15; i++) {
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 20 + Math.random() * 60,
        sides: Math.floor(Math.random() * 4) + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.3 + Math.random() * 0.7,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        rot: Math.random() * Math.PI * 2,
        alpha: 0.08 + Math.random() * 0.12,
        floatOffset: Math.random() * Math.PI * 2,
      });
    }

    function drawShape(s, time) {
      ctx.save();
      const floatY = Math.sin(time * s.speed + s.floatOffset) * 20;
      ctx.translate(s.x, s.y + floatY);
      s.rot += s.rotSpeed;
      ctx.rotate(s.rot);
      ctx.beginPath();
      for (let i = 0; i <= s.sides; i++) {
        const angle = (i / s.sides) * Math.PI * 2;
        const px = Math.cos(angle) * s.size;
        const py = Math.sin(angle) * s.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner wireframe
      ctx.beginPath();
      for (let i = 0; i <= s.sides; i++) {
        const angle = (i / s.sides) * Math.PI * 2;
        const px = Math.cos(angle) * s.size * 0.5;
        const py = Math.sin(angle) * s.size * 0.5;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.globalAlpha = s.alpha * 0.5;
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of shapes) drawShape(s, t);
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
}

const categories = [
  { id: 'smartphones', name: 'Smartphones', icon: '📱', color: '#6366f1' },
  { id: 'laptops', name: 'Laptops', icon: '💻', color: '#8b5cf6' },
  { id: 'tablets', name: 'Tablets', icon: '📋', color: '#a78bfa' },
  { id: 'audio', name: 'Audio', icon: '🎧', color: '#22d3ee' },
  { id: 'wearables', name: 'Wearables', icon: '⌚', color: '#f472b6' },
  { id: 'cameras', name: 'Cameras', icon: '📷', color: '#34d399' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#f59e0b' },
  { id: 'accessories', name: 'Accessories', icon: '🔌', color: '#ef4444' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    api.getProducts('featured=true&limit=8').then(d => setFeatured(d.products || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AnimatedPage>
      {/* Hero with animated canvas */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 550 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(168,85,247,0.1) 0%, transparent 60%)'
        }} />
        <HeroCanvas />
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '100px 20px 80px', textAlign: 'center' }}>
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontSize: 56, fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}
          >
            <span style={{ background: 'linear-gradient(135deg, #fff 0%, #e0e7ff 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Premium Electronics
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Delivered to Your Door
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{ fontSize: 18, color: '#94a3b8', marginBottom: 36, maxWidth: 600, margin: '0 auto 36px' }}
          >
            Discover the latest gadgets with secure payments, real-time tracking, and free shipping over ₹1,000
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.div whileHover={{ scale: 1.08, y: -3 }} whileTap={{ scale: 0.95 }}>
              <Link to="/products" className="btn btn-lg" style={{
                background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                color: '#0f172a', fontWeight: 700,
                boxShadow: '0 4px 30px rgba(251,191,36,0.4)',
                fontSize: 17
              }}>Shop Now</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08, y: -3 }} whileTap={{ scale: 0.95 }}>
              <Link to="/track" className="btn btn-lg" style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>Track Order</Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 52, flexWrap: 'wrap' }}
          >
            {['Free Shipping 1K+', 'Secure Payments', 'Live Tracking', '24/7 Support'].map((f, i) => (
              <motion.div key={f}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                style={{ fontSize: 14, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span style={{ color: '#4ade80', textShadow: '0 0 10px rgba(74,222,128,0.5)' }}>✓</span> {f}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container" style={{ padding: '60px 20px' }}>
        <motion.h2 variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}
          className="section-title text-center" style={{ fontSize: 28 }}>Shop by Category</motion.h2>
        <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
          {categories.map((cat, i) => (
            <motion.div key={cat.id} variants={scaleIn} custom={i}>
              <Link to={`/products?category=${cat.id}`}>
                <motion.div
                  whileHover={{ scale: 1.08, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  className="card"
                  style={{
                    padding: 24, textAlign: 'center', cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(15,15,35,0.9), rgba(15,15,35,0.7))',
                    borderColor: `${cat.color}33`
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    style={{ fontSize: 36, marginBottom: 8, filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.3))' }}
                  >{cat.icon}</motion.div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="container" style={{ padding: '0 20px 60px' }}>
        <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="section-title" style={{ margin: 0, fontSize: 28 }}>Featured Products</h2>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to="/products" className="btn btn-secondary btn-sm">View All</Link>
          </motion.div>
        </motion.div>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}
            className="grid grid-4">
            {featured.map((product, i) => (
              <motion.div key={product._id} variants={fadeInUp} custom={i}>
                <motion.div
                  whileHover={{ y: -12, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="card" style={{ overflow: 'hidden' }}
                >
                  <Link to={`/products/${product._id}`}>
                    <div style={{
                      height: 200,
                      background: 'linear-gradient(135deg, rgba(30,30,60,0.5), rgba(15,15,35,0.8))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 70%)'
                      }} />
                      <img src={product.images?.[0] || 'https://placehold.co/400x400/1e1e3e/818cf8?text=Gadget'} alt={product.name}
                        style={{ height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                    </div>
                  </Link>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{product.brand}</div>
                    <Link to={`/products/${product._id}`}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{product.name}</h3>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                      <span style={{ color: '#fbbf24', textShadow: '0 0 8px rgba(251,191,36,0.5)' }}>{'★'.repeat(Math.round(product.rating))}</span>
                      <span className="text-sm text-muted">({product.reviewCount})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>₹{product.price.toLocaleString()}</span>
                        {product.compareAtPrice && (
                          <span style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 8 }}>₹{product.compareAtPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => addItem(product)} className="btn btn-primary btn-sm">Add</motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Payment Methods */}
      <section style={{ padding: '60px 20px', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.03), transparent)'
        }} />
        <div className="container text-center" style={{ position: 'relative' }}>
          <motion.h2 variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}
            className="section-title" style={{ fontSize: 28 }}>Secure Payment Options</motion.h2>
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}
            style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '💳', name: 'Credit/Debit Card', desc: 'Visa, Mastercard, Amex', color: '#6366f1' },
              { icon: '📱', name: 'UPI', desc: 'GPay, PhonePe, Paytm', color: '#22d3ee' },
              { icon: '🅿️', name: 'PayPal', desc: 'Secure PayPal checkout', color: '#f59e0b' },
              { icon: '👛', name: 'Digital Wallet', desc: 'GadgetZone Wallet', color: '#a78bfa' },
              { icon: '💵', name: 'Cash on Delivery', desc: 'Pay when delivered', color: '#34d399' },
            ].map((m, i) => (
              <motion.div key={m.name} variants={scaleIn} custom={i}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                <div className="card" style={{
                  padding: 24, minWidth: 170,
                  borderColor: `${m.color}33`
                }}>
                  <motion.div
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: 'linear' }}
                    style={{ fontSize: 32, marginBottom: 10, display: 'inline-block' }}
                  >{m.icon}</motion.div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{m.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </AnimatedPage>
  );
}
