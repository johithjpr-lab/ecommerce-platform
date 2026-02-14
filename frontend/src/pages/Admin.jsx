import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedPage, { fadeInUp, staggerContainer } from '../components/AnimatedPage.jsx';

const STATUS_COLORS = {
  confirmed: '#6366f1', processing: '#f59e0b', shipped: '#8b5cf6',
  out_for_delivery: '#06b6d4', delivered: '#16a34a', cancelled: '#dc2626'
};

function AdminScene() {
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
      t += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      // Rotating dodecahedron-like shape
      const sides = 12;
      for (let layer = 0; layer < 2; layer++) {
        const r = 80 + layer * 50;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const a = (i / sides) * Math.PI * 2 + t * (layer + 1);
          const wobble = Math.sin(t * 3 + i) * 5;
          const px = cx + Math.cos(a) * (r + wobble);
          const py = cy + Math.sin(a) * (r + wobble) * 0.6;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = '#6366f1';
        ctx.globalAlpha = 0.04;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

function AnimatedBar({ value, max, color, delay = 0 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, delay, ease: 'easeOut' }}
        style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 4, boxShadow: `0 0 8px ${color}40` }}
      />
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [payments, setPayments] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadTab(tab);
  }, [user, tab]);

  const loadTab = async (t) => {
    setLoading(true);
    try {
      switch (t) {
        case 'dashboard': setStats(await api.getAdminStats()); break;
        case 'orders': { const d = await api.getAllOrders(); setOrders(d.orders || []); } break;
        case 'inventory': setInventory(await api.getInventory()); break;
        case 'payments': setPayments(await api.getAdminPayments()); break;
        case 'customers': setCustomers(await api.getAdminCustomers()); break;
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, { status, note: `Status updated to ${status} by admin` });
      loadTab('orders');
    } catch (err) { alert(err.message); }
  };

  if (!user || user.role !== 'admin') return null;

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'inventory', label: 'Inventory', icon: '🏷️' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'customers', label: 'Customers', icon: '👥' },
  ];

  return (
    <AnimatedPage>
      <div className="container" style={{ padding: '32px 20px', position: 'relative' }}>
        <AdminScene />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="page-title"
            style={{ background: 'linear-gradient(135deg, #fff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Admin Dashboard
          </motion.h1>

          {/* Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{
              display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--border)', paddingBottom: 0,
              background: 'rgba(15,15,35,0.4)', borderRadius: '12px 12px 0 0', backdropFilter: 'blur(10px)'
            }}>
            {TABS.map((t, i) => (
              <motion.button key={t.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '12px 20px', border: 'none',
                  background: tab === t.id ? 'linear-gradient(135deg, #6366f1, #818cf8)' : 'transparent',
                  color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 14, borderRadius: '8px 8px 0 0', cursor: 'pointer',
                  boxShadow: tab === t.id ? '0 -4px 15px rgba(99,102,241,0.3)' : 'none',
                  transition: 'all 0.3s'
                }}>
                <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
              </motion.button>
            ))}
          </motion.div>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Dashboard */}
              {tab === 'dashboard' && stats && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid-4" style={{ marginBottom: 24 }}>
                    {[
                      { label: 'Total Orders', value: stats.totalOrders, color: '#6366f1', icon: '📦' },
                      { label: 'Total Customers', value: stats.totalCustomers, color: '#8b5cf6', icon: '👥' },
                      { label: 'Total Products', value: stats.totalProducts, color: '#f59e0b', icon: '🏷️' },
                      { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, color: '#16a34a', icon: '💰' },
                    ].map((s, i) => (
                      <motion.div key={s.label} variants={fadeInUp}
                        whileHover={{ y: -8, scale: 1.03, boxShadow: `0 15px 40px ${s.color}20` }}
                        className="card" style={{
                          padding: 20, borderTop: `3px solid ${s.color}`,
                          background: `linear-gradient(135deg, rgba(15,15,35,0.8), ${s.color}08)`
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div className="text-sm text-muted">{s.label}</div>
                            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 200 }}
                              style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#fff' }}>{s.value}</motion.div>
                          </div>
                          <motion.span animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                            style={{ fontSize: 28, filter: `drop-shadow(0 0 8px ${s.color}40)` }}>{s.icon}</motion.span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="grid-2">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                      className="card p-3">
                      <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>Orders by Status</h3>
                      {stats.ordersByStatus && (() => {
                        const maxCount = Math.max(...Object.values(stats.ordersByStatus));
                        return Object.entries(stats.ordersByStatus).map(([status, count], i) => (
                          <motion.div key={status}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.08 }}
                            style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                  style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[status] || '#94a3b8', boxShadow: `0 0 6px ${STATUS_COLORS[status] || '#94a3b8'}40` }} />
                                <span style={{ textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</span>
                              </div>
                              <span style={{ fontWeight: 700 }}>{count}</span>
                            </div>
                            <AnimatedBar value={count} max={maxCount} color={STATUS_COLORS[status] || '#94a3b8'} delay={0.6 + i * 0.1} />
                          </motion.div>
                        ));
                      })()}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                      className="card p-3">
                      <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>Recent Orders</h3>
                      {stats.recentOrders?.slice(0, 5).map((order, i) => (
                        <motion.div key={order._id}
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.08 }}
                          whileHover={{ x: 4, background: 'rgba(99,102,241,0.05)' }}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', borderBottom: '1px solid var(--border)', fontSize: 14, borderRadius: 6, transition: 'background 0.2s' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{order.orderNumber}</div>
                            <div className="text-sm text-muted">{order.customer?.name || 'Customer'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: '#818cf8' }}>₹{order.total?.toLocaleString()}</div>
                            <span className="badge" style={{
                              background: `${STATUS_COLORS[order.orderStatus]}20`,
                              color: STATUS_COLORS[order.orderStatus], fontSize: 11,
                              border: `1px solid ${STATUS_COLORS[order.orderStatus]}30`
                            }}>
                              {order.orderStatus?.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Orders Management */}
              {tab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="card" style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'rgba(99,102,241,0.08)' }}>
                        {['Order #', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid var(--border)', color: '#818cf8' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, i) => (
                        <motion.tr key={order._id}
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff' }}>{order.orderNumber}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div>{order.customer?.name}</div>
                            <div className="text-sm text-muted">{order.customer?.email}</div>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#818cf8' }}>₹{order.total?.toLocaleString()}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>{order.paymentStatus}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge" style={{
                              background: `${STATUS_COLORS[order.orderStatus]}20`,
                              color: STATUS_COLORS[order.orderStatus],
                              border: `1px solid ${STATUS_COLORS[order.orderStatus]}30`
                            }}>
                              {order.orderStatus?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                              <select
                                className="input"
                                style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                                value=""
                                onChange={(e) => { if (e.target.value) updateStatus(order._id, e.target.value); }}
                              >
                                <option value="">Update...</option>
                                {['processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
                                  .filter(s => s !== order.orderStatus)
                                  .map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                              </select>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <div className="text-center p-3 text-muted">No orders yet</div>}
                </motion.div>
              )}

              {/* Inventory */}
              {tab === 'inventory' && inventory && (
                <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  {inventory.lowStock?.length > 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="card p-3 mb-3" style={{
                        borderLeft: '4px solid var(--danger)',
                        background: 'rgba(220,38,38,0.05)',
                        animation: 'pulseGlow 3s infinite'
                      }}>
                      <h3 style={{ fontWeight: 700, color: '#f87171', marginBottom: 12 }}>Low Stock Alert ({inventory.lowStock.length} items)</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {inventory.lowStock.map((p, i) => (
                          <motion.div key={p._id}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ x: 4 }}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(220,38,38,0.08)', borderRadius: 6, fontSize: 14, border: '1px solid rgba(220,38,38,0.15)' }}>
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                            <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
                              className="badge badge-danger">{p.inventory} left</motion.span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="card" style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ background: 'rgba(99,102,241,0.08)' }}>
                          {['SKU', 'Product', 'Category', 'Price', 'Stock'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid var(--border)', color: '#818cf8' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.products?.map((p, i) => (
                          <motion.tr key={p._id}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#818cf8' }}>{p.sku}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff' }}>{p.name}</td>
                            <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{p.category}</td>
                            <td style={{ padding: '12px 16px' }}>₹{p.price?.toLocaleString()}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span className={`badge ${p.inventory < 10 ? 'badge-danger' : p.inventory < 30 ? 'badge-warning' : 'badge-success'}`}>
                                {p.inventory}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                </motion.div>
              )}

              {/* Payments */}
              {tab === 'payments' && payments && (
                <motion.div key="payments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <motion.div variants={staggerContainer} initial="initial" animate="animate"
                    className="grid-3" style={{ marginBottom: 24 }}>
                    {payments.summary?.map((s, i) => (
                      <motion.div key={i} variants={fadeInUp}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="card" style={{ padding: 16, borderTop: '3px solid #6366f1' }}>
                        <div className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>{s._id.method} - {s._id.status}</div>
                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
                          style={{ fontWeight: 800, fontSize: 20, marginTop: 4, background: 'linear-gradient(135deg, #fff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{s.total?.toLocaleString()}</motion.div>
                        <div className="text-sm text-muted">{s.count} transactions</div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="card" style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ background: 'rgba(99,102,241,0.08)' }}>
                          {['Transaction ID', 'Order', 'Customer', 'Method', 'Amount', 'Status', 'Date'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid var(--border)', color: '#818cf8' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payments.payments?.map((p, i) => (
                          <motion.tr key={p._id}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#818cf8' }}>{p.transactionId || '-'}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff' }}>{p.order?.orderNumber || '-'}</td>
                            <td style={{ padding: '12px 16px' }}>{p.customer?.name || '-'}</td>
                            <td style={{ padding: '12px 16px', textTransform: 'uppercase' }}>{p.method}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#818cf8' }}>₹{p.amount?.toLocaleString()}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span className={`badge ${p.status === 'completed' ? 'badge-success' : p.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {(!payments.payments || payments.payments.length === 0) && <div className="text-center p-3 text-muted">No payments yet</div>}
                  </motion.div>
                </motion.div>
              )}

              {/* Customers */}
              {tab === 'customers' && (
                <motion.div key="customers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="card" style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'rgba(99,102,241,0.08)' }}>
                        {['Name', 'Email', 'Phone', 'Joined'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid var(--border)', color: '#818cf8' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c, i) => (
                        <motion.tr key={c._id}
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          whileHover={{ background: 'rgba(99,102,241,0.03)' }}
                          style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff' }}>{c.name}</td>
                          <td style={{ padding: '12px 16px' }}>{c.email}</td>
                          <td style={{ padding: '12px 16px' }}>{c.phone}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {customers.length === 0 && <div className="text-center p-3 text-muted">No customers yet</div>}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
