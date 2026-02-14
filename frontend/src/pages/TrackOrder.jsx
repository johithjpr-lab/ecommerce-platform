import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import AnimatedPage, { fadeInUp, staggerContainer } from '../components/AnimatedPage.jsx';

const STATUS_LABELS = {
  preparing: 'Preparing', picked_up: 'Picked Up', in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered'
};
const STATUS_COLORS = {
  preparing: '#f59e0b', picked_up: '#8b5cf6', in_transit: '#2563eb',
  out_for_delivery: '#06b6d4', delivered: '#16a34a'
};

function TrackingScene() {
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
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      for (let ring = 0; ring < 4; ring++) {
        const r = 30 + ring * 25 + Math.sin(t * 2 + ring) * 5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#6366f1';
        ctx.globalAlpha = 0.06 - ring * 0.01;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + t;
        const px = cx + Math.cos(a) * 80;
        const py = cy + Math.sin(a) * 50;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#a78bfa';
        ctx.globalAlpha = 0.15;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

export default function TrackOrder() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError('');
    setShipment(null);
    try {
      const data = await api.trackByNumber(trackingNumber.trim());
      setShipment(data);
    } catch (err) {
      setError(err.message || 'Tracking number not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="container" style={{ padding: '32px 20px', maxWidth: 800, margin: '0 auto' }}>
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="page-title text-center"
          style={{ background: 'linear-gradient(135deg, #fff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Track Your Order
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-muted text-center mb-3">Enter your tracking number to get real-time updates on your shipment</motion.p>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          onSubmit={handleTrack} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <input
            className="input"
            placeholder="Enter tracking number (e.g., GZT...)"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            style={{ flex: 1, fontSize: 16, padding: 14 }}
          />
          <motion.button whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }} whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-lg" type="submit" disabled={loading}>
            {loading ? 'Tracking...' : 'Track'}
          </motion.button>
        </motion.form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="card p-3 text-center" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
              <p style={{ color: '#f87171', fontWeight: 600 }}>{error}</p>
            </motion.div>
          )}

          {shipment && (
            <motion.div key="shipment" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Status Banner */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="card" style={{
                  padding: 24, marginBottom: 20,
                  background: `${STATUS_COLORS[shipment.status]}10`,
                  borderLeft: `4px solid ${STATUS_COLORS[shipment.status]}`,
                  boxShadow: `0 0 20px ${STATUS_COLORS[shipment.status]}15`
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div className="text-sm text-muted">Tracking Number</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>{shipment.trackingNumber}</div>
                  </div>
                  <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="badge" style={{
                      background: `${STATUS_COLORS[shipment.status]}20`, color: STATUS_COLORS[shipment.status],
                      fontSize: 14, padding: '6px 16px',
                      boxShadow: `0 0 12px ${STATUS_COLORS[shipment.status]}30`,
                      border: `1px solid ${STATUS_COLORS[shipment.status]}40`
                    }}>
                    {STATUS_LABELS[shipment.status] || shipment.status}
                  </motion.span>
                </div>
              </motion.div>

              <div className="grid-2">
                {/* Shipment Info */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="card p-3" style={{ position: 'relative', overflow: 'hidden' }}>
                  <TrackingScene />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>Shipment Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <span className="text-muted text-sm">Carrier</span>
                        <div style={{ fontWeight: 600 }}>{shipment.carrier}</div>
                      </div>
                      {shipment.estimatedDelivery && (
                        <div>
                          <span className="text-muted text-sm">Estimated Delivery</span>
                          <div style={{ fontWeight: 600 }}>{new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                      )}
                    </div>
                    {shipment.currentLocation?.address && (
                      <motion.div animate={{ boxShadow: ['0 0 10px rgba(74,222,128,0.2)', '0 0 20px rgba(74,222,128,0.4)', '0 0 10px rgba(74,222,128,0.2)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ marginTop: 16, padding: 14, background: 'rgba(34,197,94,0.08)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
                        <div style={{ fontWeight: 600, color: '#4ade80', marginBottom: 6, fontSize: 14 }}>Current Location</div>
                        <div style={{ fontSize: 14 }}>{shipment.currentLocation.address}</div>
                        {shipment.currentLocation.lat && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            GPS: {shipment.currentLocation.lat.toFixed(4)}, {shipment.currentLocation.lng.toFixed(4)}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Tracking History */}
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                  className="card p-3">
                  <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>Tracking History</h3>
                  {shipment.trackingHistory?.length > 0 ? (
                    <div style={{ position: 'relative', paddingLeft: 20 }}>
                      <div style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 2, background: 'var(--border)' }} />
                      {[...shipment.trackingHistory].reverse().map((h, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          style={{ position: 'relative', marginBottom: 20, paddingLeft: 16 }}>
                          <motion.div
                            animate={i === 0 ? { scale: [1, 1.3, 1], boxShadow: ['0 0 5px rgba(99,102,241,0.3)', '0 0 15px rgba(99,102,241,0.6)', '0 0 5px rgba(99,102,241,0.3)'] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                              position: 'absolute', left: -18, top: 4, width: 12, height: 12, borderRadius: '50%',
                              background: i === 0 ? '#6366f1' : 'var(--border)',
                              border: '2px solid rgba(15,15,35,0.8)'
                            }} />
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{h.description || STATUS_LABELS[h.status] || h.status}</div>
                          {h.location?.address && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{h.location.address}</div>}
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(h.timestamp).toLocaleString()}</div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-sm">No tracking updates yet</p>
                  )}
                </motion.div>
              </div>

              {/* Notification Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="card p-3 mt-2" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[
                    { icon: '📱', text: 'SMS updates sent at each stage' },
                    { icon: '📧', text: 'Email notifications for all updates' },
                    { icon: '📍', text: 'Live GPS tracking available' },
                  ].map((n, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        style={{ fontSize: 20 }}>{n.icon}</motion.span>
                      <span>{n.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        {!shipment && !error && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ marginTop: 40 }}>
            <h3 className="section-title text-center" style={{ background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>How Order Tracking Works</h3>
            <motion.div variants={staggerContainer} initial="initial" animate="animate"
              className="grid-4" style={{ marginTop: 20 }}>
              {[
                { icon: '✅', title: 'Order Confirmed', desc: 'Payment verified, order is being prepared', color: '#6366f1' },
                { icon: '📦', title: 'Processing', desc: 'Items picked and packed at warehouse', color: '#f59e0b' },
                { icon: '🚚', title: 'Shipped', desc: 'On the way with live GPS tracking', color: '#8b5cf6' },
                { icon: '🏠', title: 'Delivered', desc: 'Package delivered to your doorstep', color: '#4ade80' },
              ].map((s, i) => (
                <motion.div key={s.title} variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.05, boxShadow: `0 15px 40px ${s.color}20` }}
                  className="card text-center" style={{ padding: 24, border: `1px solid ${s.color}20` }}>
                  <motion.div animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                    style={{ fontSize: 36, marginBottom: 8, filter: `drop-shadow(0 0 10px ${s.color}40)` }}>{s.icon}</motion.div>
                  <div style={{ fontWeight: 700, marginBottom: 4, color: '#fff' }}>{s.title}</div>
                  <div className="text-sm text-muted">{s.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  );
}
