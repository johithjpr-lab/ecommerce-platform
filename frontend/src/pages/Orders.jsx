import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedPage, { staggerContainer, fadeInUp } from '../components/AnimatedPage.jsx';

const STATUS_COLORS = {
  confirmed: '#6366f1', processing: '#f59e0b', shipped: '#8b5cf6',
  out_for_delivery: '#22d3ee', delivered: '#4ade80', cancelled: '#f87171'
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    api.getOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <AnimatedPage>
      <div className="container" style={{ padding: '32px 20px' }}>
        <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="page-title">My Orders</motion.h1>
        {orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-3">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: 64, marginBottom: 16, filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.3))' }}>📦</motion.div>
            <p className="text-muted mb-2" style={{ fontSize: 18 }}>No orders yet</p>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order, i) => (
              <motion.div key={order._id} variants={fadeInUp} custom={i}
                whileHover={{ scale: 1.02, x: 8 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                <Link to={`/orders/${order._id}`} className="card" style={{ padding: 20, display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: '#fff' }}>{order.orderNumber}</div>
                      <div className="text-sm text-muted">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className="text-sm mt-1">{order.items.length} item(s)</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge" style={{
                        background: `${STATUS_COLORS[order.orderStatus]}20`,
                        color: STATUS_COLORS[order.orderStatus],
                        border: `1px solid ${STATUS_COLORS[order.orderStatus]}40`,
                        boxShadow: `0 0 10px ${STATUS_COLORS[order.orderStatus]}20`
                      }}>
                        {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <div style={{ fontWeight: 800, fontSize: 18, marginTop: 8, background: 'linear-gradient(135deg, #fff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{order.total.toLocaleString()}</div>
                      <div className="text-sm text-muted">{order.paymentMethod.toUpperCase()} - {order.paymentStatus}</div>
                    </div>
                  </div>
                  {order.items.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, overflow: 'hidden' }}>
                      {order.items.slice(0, 4).map((item, j) => (
                        <motion.div key={j} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + j * 0.05 }}
                          style={{
                            width: 50, height: 50,
                            background: 'linear-gradient(135deg, rgba(30,30,60,0.5), rgba(15,15,35,0.8))',
                            borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                            border: '1px solid var(--border)'
                          }}>
                          <img src={item.image || 'https://placehold.co/50x50/1e1e3e/818cf8?text=.'} alt="" style={{ height: '100%', objectFit: 'cover' }} />
                        </motion.div>
                      ))}
                      {order.items.length > 4 && (
                        <div style={{
                          width: 50, height: 50, background: 'rgba(99,102,241,0.1)', borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#818cf8'
                        }}>+{order.items.length - 4}</div>
                      )}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  );
}
