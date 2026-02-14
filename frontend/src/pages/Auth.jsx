import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedPage from '../components/AnimatedPage.jsx';

function AuthScene() {
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
      // Rotating rings
      for (let r = 0; r < 3; r++) {
        const radius = 80 + r * 50;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 0.4, t * (r + 1) * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = ['#6366f1', '#a78bfa', '#22d3ee'][r];
        ctx.globalAlpha = 0.1 - r * 0.02;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // Floating dots
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t * 0.5;
        const r = 100 + Math.sin(t * 2 + i) * 20;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.4, 3, 0, Math.PI * 2);
        ctx.fillStyle = ['#6366f1', '#f472b6', '#22d3ee', '#a78bfa'][i % 4];
        ctx.globalAlpha = 0.2;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) { navigate(location.state?.from || '/'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isLogin && form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!isLogin && form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.name || !form.phone) { setError('All fields are required'); setLoading(false); return; }
        await register(form.name, form.email, form.password, form.phone);
      }
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div style={{ minHeight: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative' }}>
        <AuthScene />
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
          className="card"
          style={{
            width: '100%', maxWidth: 440, padding: 40, position: 'relative', zIndex: 2,
            animation: 'pulseGlow 4s infinite'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <motion.div
                whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}
                style={{ marginBottom: 16 }}
              >
                <img src="/logo.png" alt="Gadget World" style={{ height: 52, objectFit: 'contain' }} />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.div key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 style={{ fontWeight: 800, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-muted text-sm">{isLogin ? 'Sign in to your Gadget World account' : 'Join Gadget World for the best deals'}</p>
                </motion.div>
              </AnimatePresence>
            </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AnimatePresence>
              {!isLogin && (
                <>
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <input className="input" type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <input className="input" type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <input className="input" type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <input className="input" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required minLength={6} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}
                  style={{ padding: 12, background: 'rgba(220,38,38,0.15)', borderRadius: 10, color: '#f87171', fontSize: 13, border: '1px solid rgba(220,38,38,0.3)' }}>{error}</motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(99,102,241,0.5)' }} whileTap={{ scale: 0.97 }}
              type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <motion.button whileHover={{ scale: 1.05 }}
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </motion.button>
          </div>


        </motion.div>
      </div>
    </AnimatedPage>
  );
}
