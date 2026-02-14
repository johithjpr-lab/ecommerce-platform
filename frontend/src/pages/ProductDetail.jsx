import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import AnimatedPage, { fadeInUp, slideInLeft, slideInRight } from '../components/AnimatedPage.jsx';

function Product3DScene() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, t = 0;
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    resize();
    window.addEventListener('resize', resize);
    function draw() {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      // Rotating wireframe cube
      for (let ring = 0; ring < 3; ring++) {
        const r = 60 + ring * 40;
        const sides = 6;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const a = (i / sides) * Math.PI * 2 + t * (1 + ring * 0.3);
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r * 0.6;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = ['#6366f1', '#a78bfa', '#22d3ee'][ring];
        ctx.globalAlpha = 0.15 - ring * 0.03;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      // Pulsing glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 + Math.sin(t * 2) * 20);
      grad.addColorStop(0, 'rgba(99,102,241,0.08)');
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    api.getProduct(id).then(setProduct).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!product) return null;

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  return (
    <AnimatedPage>
      <div className="container" style={{ padding: '32px 20px' }}>
        <motion.button {...fadeInUp} onClick={() => navigate(-1)} className="btn btn-secondary btn-sm mb-3"
          style={{ backdropFilter: 'blur(10px)' }}>← Back</motion.button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {/* Image with 3D backdrop */}
          <motion.div initial={{ opacity: 0, x: -50, rotateY: -10 }} animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              background: 'linear-gradient(135deg, rgba(15,15,35,0.9), rgba(30,30,60,0.6))',
              borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: 450, position: 'relative', overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <Product3DScene />
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              src={product.images?.[0] || 'https://placehold.co/600x600/1e1e3e/818cf8?text=Gadget'}
              alt={product.name}
              style={{ maxHeight: 380, objectFit: 'contain', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 10px 30px rgba(99,102,241,0.3))' }}
            />
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ fontSize: 13, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{product.brand} • {product.category}</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ fontSize: 30, fontWeight: 800, marginBottom: 12, background: 'linear-gradient(135deg, #fff, #e0e7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{product.name}</motion.h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ color: '#fbbf24', fontSize: 16, textShadow: '0 0 10px rgba(251,191,36,0.5)' }}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
              <span className="text-muted">{product.rating} ({product.reviewCount} reviews)</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
              style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg, #fff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{product.price.toLocaleString()}</span>
              {product.compareAtPrice && (
                <>
                  <span style={{ fontSize: 18, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.compareAtPrice.toLocaleString()}</span>
                  <span className="badge badge-success">{discount}% OFF</span>
                </>
              )}
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.7 }}>{product.description}</motion.p>

            {/* Stock */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
              style={{ marginBottom: 20 }}>
              {product.inventory > 0 ? (
                <span className="badge badge-success" style={{ animation: 'pulseGlow 3s infinite' }}>In Stock ({product.inventory} available)</span>
              ) : (
                <span className="badge badge-danger">Out of Stock</span>
              )}
            </motion.div>

            {/* Quantity & Add to Cart */}
            {product.inventory > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  border: '1px solid var(--border)', borderRadius: 12,
                  background: 'rgba(15,15,35,0.6)', backdropFilter: 'blur(10px)'
                }}>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '10px 16px', border: 'none', background: 'none', fontSize: 18, color: '#fff', cursor: 'pointer' }}>-</motion.button>
                  <span style={{ padding: '10px 18px', fontWeight: 600, color: '#fff' }}>{quantity}</span>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    style={{ padding: '10px 16px', border: 'none', background: 'none', fontSize: 18, color: '#fff', cursor: 'pointer' }}>+</motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(99,102,241,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAdd} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                  {added ? '✓ Added to Cart!' : 'Add to Cart'}
                </motion.button>
              </motion.div>
            )}

            {/* Specs */}
            {product.specifications && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Specifications</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(product.specifications).map(([key, val], i) => (
                    <motion.div key={key}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + i * 0.05 }}
                      style={{
                        padding: 12, background: 'rgba(99,102,241,0.08)', borderRadius: 10,
                        border: '1px solid rgba(99,102,241,0.1)'
                      }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{val}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Features */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['Free Shipping over ₹1,000', 'Secure Payments', 'Real-time GPS Tracking', 'SMS & Email Updates'].map((f, i) => (
                <motion.div key={f}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + i * 0.08 }}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    padding: 12, background: 'rgba(34,197,94,0.08)', borderRadius: 10,
                    fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                    border: '1px solid rgba(34,197,94,0.15)'
                  }}>
                  <span style={{ color: '#4ade80', textShadow: '0 0 8px rgba(74,222,128,0.5)' }}>✓</span> {f}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
}
