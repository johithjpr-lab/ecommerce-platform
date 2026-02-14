import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedPage, { fadeInUp, staggerContainer } from '../components/AnimatedPage.jsx';

const STATUS_STEPS = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const STATUS_LABELS = { confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' };

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    api.getOrder(id).then(setData).catch(() => navigate('/orders')).finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!data) return null;

  const { order, shipment, payment } = data;
  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <AnimatedPage>
      <div className="container" style={{ padding: '32px 20px' }}>
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }} onClick={() => navigate('/orders')} className="btn btn-secondary btn-sm mb-3">← Back to Orders</motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, #fff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Order {order.orderNumber}</h1>
            <p className="text-muted text-sm">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{order.total.toLocaleString()}</motion.div>
        </motion.div>

        {/* Status Tracker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-3 mb-3">
          <h3 style={{ fontWeight: 700, marginBottom: 20, color: '#fff' }}>Order Status</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
            <div style={{ position: 'absolute', top: 16, left: 30, right: 30, height: 3, background: 'var(--border)', borderRadius: 2 }} />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, currentStep) / (STATUS_STEPS.length - 1) * (100 - 8)}%` }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
              style={{
                position: 'absolute', top: 16, left: 30, height: 3,
                background: 'linear-gradient(90deg, #6366f1, #a78bfa, #22d3ee)',
                borderRadius: 2, boxShadow: '0 0 10px rgba(99,102,241,0.5)'
              }}
            />
            {STATUS_STEPS.map((step, i) => (
              <motion.div key={step}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, minWidth: 80 }}>
                <motion.div
                  animate={i <= currentStep ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ delay: 0.5 + i * 0.2, duration: 0.4 }}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: i <= currentStep ? 'linear-gradient(135deg, #6366f1, #a78bfa)' : 'rgba(15,15,35,0.8)',
                    border: `3px solid ${i <= currentStep ? '#818cf8' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: i <= currentStep ? '#fff' : 'var(--text-muted)', fontWeight: 700, fontSize: 14, marginBottom: 8,
                    boxShadow: i <= currentStep ? '0 0 15px rgba(99,102,241,0.4)' : 'none'
                  }}>
                  {i < currentStep ? '✓' : i + 1}
                </motion.div>
                <span style={{ fontSize: 12, fontWeight: i === currentStep ? 700 : 400, color: i <= currentStep ? '#818cf8' : 'var(--text-muted)', textAlign: 'center' }}>{STATUS_LABELS[step]}</span>
              </motion.div>
            ))}
          </div>
          {order.estimatedDelivery && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ textAlign: 'center', marginTop: 20, padding: 14, background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)' }}>
              <span className="text-muted text-sm">Estimated Delivery: </span>
              <span style={{ fontWeight: 700, color: '#fff' }}>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </motion.div>
          )}
        </motion.div>

        <div className="grid-2">
          {/* Items */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="card p-3">
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>Items</h3>
            {order.items.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{
                  width: 60, height: 60,
                  background: 'linear-gradient(135deg, rgba(30,30,60,0.5), rgba(15,15,35,0.8))',
                  borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  border: '1px solid var(--border)'
                }}>
                  <img src={item.image || 'https://placehold.co/60x60/1e1e3e/818cf8?text=.'} alt="" style={{ height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                  <div className="text-sm text-muted">Qty: {item.quantity} x ₹{item.price.toLocaleString()}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#818cf8' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
              </motion.div>
            ))}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}><span className="text-muted">Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}><span className="text-muted">Tax</span><span>₹{order.tax.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}><span className="text-muted">Shipping</span><span>{order.shippingCost === 0 ? <span style={{ color: '#4ade80' }}>FREE</span> : `₹${order.shippingCost}`}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 8 }}>
                <span>Total</span>
                <span style={{ background: 'linear-gradient(135deg, #fff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Shipping */}
            <motion.div variants={fadeInUp} className="card p-3">
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Shipping Address</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </p>
            </motion.div>

            {/* Payment */}
            <motion.div variants={fadeInUp} className="card p-3">
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Payment</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-muted">Method</span>
                <span style={{ fontWeight: 600, color: '#818cf8' }}>{order.paymentMethod.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Status</span>
                <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
              {payment?.transactionId && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Transaction: {payment.transactionId}</div>
              )}
            </motion.div>

            {/* Tracking */}
            {shipment && (
              <motion.div variants={fadeInUp} className="card p-3">
                <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Tracking</h3>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <span className="text-muted">Tracking #: </span>
                  <span style={{ fontWeight: 600, color: '#22d3ee' }}>{shipment.trackingNumber}</span>
                </div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <span className="text-muted">Carrier: </span>
                  <span style={{ fontWeight: 600 }}>{shipment.carrier}</span>
                </div>
                {shipment.currentLocation?.address && (
                  <motion.div animate={{ boxShadow: ['0 0 10px rgba(74,222,128,0.2)', '0 0 20px rgba(74,222,128,0.4)', '0 0 10px rgba(74,222,128,0.2)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ padding: 14, background: 'rgba(34,197,94,0.08)', borderRadius: 10, fontSize: 13, border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div style={{ fontWeight: 600, color: '#4ade80', marginBottom: 4 }}>📍 Current Location</div>
                    {shipment.currentLocation.address}
                    {shipment.currentLocation.lat && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        GPS: {shipment.currentLocation.lat.toFixed(4)}, {shipment.currentLocation.lng.toFixed(4)}
                      </div>
                    )}
                  </motion.div>
                )}
                {shipment.trackingHistory?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>History</div>
                    {shipment.trackingHistory.map((h, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13 }}>
                        <motion.div
                          animate={i === 0 ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: i === 0 ? '#6366f1' : 'var(--border)',
                            marginTop: 5, flexShrink: 0,
                            boxShadow: i === 0 ? '0 0 8px rgba(99,102,241,0.5)' : 'none'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{h.description || h.status}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>{new Date(h.timestamp).toLocaleString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
}
