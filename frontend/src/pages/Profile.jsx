import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedPage, { fadeInUp, staggerContainer } from '../components/AnimatedPage.jsx';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [wallet, setWallet] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    setForm({ name: user.name, phone: user.phone });
    api.getWallet().then(setWallet).catch(() => {});
  }, [user]);

  if (!user) return null;

  const handleUpdateProfile = async () => {
    setLoading(true);
    try { const updated = await api.updateProfile(form); updateUser(updated); setEditing(false); }
    catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleAddAddress = async () => {
    try { const addresses = await api.addAddress(newAddress); updateUser({ ...user, addresses }); setShowAddAddress(false);
      setNewAddress({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });
    } catch (err) { alert(err.message); }
  };

  const handleDeleteAddress = async (id) => {
    try { const addresses = await api.deleteAddress(id); updateUser({ ...user, addresses }); }
    catch (err) { alert(err.message); }
  };

  const handleAddFunds = async () => {
    const amount = Number(addAmount);
    if (!amount || amount <= 0) return;
    try { const w = await api.addWalletFunds(amount); setWallet(w); setAddAmount(''); }
    catch (err) { alert(err.message); }
  };

  return (
    <AnimatedPage>
      <div className="container" style={{ padding: '32px 20px', maxWidth: 800 }}>
        <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="page-title">My Profile</motion.h1>

        <motion.div variants={staggerContainer} initial="initial" animate="animate"
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile Card */}
          <motion.div variants={fadeInUp} className="card p-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontWeight: 700, color: '#fff' }}>Personal Information</h3>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(!editing)} className="btn btn-secondary btn-sm">{editing ? 'Cancel' : 'Edit'}</motion.button>
            </div>
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <input className="input" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleUpdateProfile} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</motion.button>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Name', value: user.name },
                    { label: 'Email', value: user.email },
                    { label: 'Phone', value: user.phone },
                    { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString() },
                  ].map((item, i) => (
                    <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <span className="text-muted text-sm">{item.label}</span>
                      <div style={{ fontWeight: 600 }}>{item.value}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Wallet */}
          <motion.div variants={fadeInUp} className="card p-3">
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>GadgetZone Wallet</h3>
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 24,
                background: 'linear-gradient(135deg, #6366f1, #a78bfa, #8b5cf6)',
                borderRadius: 14, color: '#fff', marginBottom: 16,
                boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
                position: 'relative', overflow: 'hidden'
              }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', bottom: -30, left: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 13, opacity: .8 }}>Available Balance</div>
                <motion.div key={wallet?.balance} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                  style={{ fontSize: 36, fontWeight: 800 }}>₹{(wallet?.balance || 0).toLocaleString()}</motion.div>
              </div>
              <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: 44, position: 'relative' }}>👛</motion.div>
            </motion.div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" type="number" placeholder="Amount to add" value={addAmount} onChange={e => setAddAmount(e.target.value)} style={{ flex: 1 }} />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleAddFunds} className="btn btn-primary">Add Funds</motion.button>
            </div>
            {wallet?.transactions?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Recent Transactions</h4>
                {wallet.transactions.slice(-5).reverse().map((t, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span>{t.description}</span>
                    <span style={{ fontWeight: 600, color: t.type === 'credit' ? '#4ade80' : '#f87171' }}>
                      {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Addresses */}
          <motion.div variants={fadeInUp} className="card p-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, color: '#fff' }}>Saved Addresses</h3>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddAddress(!showAddAddress)} className="btn btn-primary btn-sm">{showAddAddress ? 'Cancel' : '+ Add Address'}</motion.button>
            </div>
            <AnimatePresence>
              {showAddAddress && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ padding: 16, background: 'rgba(99,102,241,0.05)', borderRadius: 10, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--border)' }}>
                  <div className="grid-2">
                    <input className="input" placeholder="Label (Home/Work)" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} />
                    <input className="input" placeholder="Street" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                  </div>
                  <div className="grid-2">
                    <input className="input" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                    <input className="input" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                  </div>
                  <div className="grid-2">
                    <input className="input" placeholder="ZIP Code" value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} />
                    <input className="input" placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} />
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} onClick={handleAddAddress} className="btn btn-primary">Save Address</motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            {user.addresses?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {user.addresses.map((addr, i) => (
                  <motion.div key={addr._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 14, border: '1px solid var(--border)', borderRadius: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{addr.label} {addr.isDefault && <span className="badge badge-info" style={{ fontSize: 10 }}>Default</span>}</div>
                      <div className="text-sm text-muted">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</div>
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteAddress(addr._id)}
                      className="btn btn-sm" style={{ color: '#f87171', background: 'none', border: 'none', fontSize: 12 }}>Delete</motion.button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No saved addresses</p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
