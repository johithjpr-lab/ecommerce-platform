import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { motion } from 'framer-motion';

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: 'rgba(3,0,20,0.8)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.img
              src="/logo.png"
              alt="Gadget World"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              style={{
                height: 42,
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
              }}
            />
          </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { to: '/products', label: 'Products' },
            { to: '/track', label: 'Track Order' },
          ].map(link => (
            <motion.div key={link.to} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to={link.to} className="btn btn-secondary btn-sm" style={location.pathname === link.to ? { borderColor: 'var(--primary)', background: 'rgba(99,102,241,0.15)' } : {}}>
                {link.label}
              </Link>
            </motion.div>
          ))}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/cart" className="btn btn-secondary btn-sm" style={{ position: 'relative', ...(location.pathname === '/cart' ? { borderColor: 'var(--primary)', background: 'rgba(99,102,241,0.15)' } : {}) }}>
              Cart
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  style={{
                    position: 'absolute', top: -8, right: -8,
                    background: 'linear-gradient(135deg, #ef4444, #f97316)', color: '#fff',
                    borderRadius: '50%', width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    boxShadow: '0 0 10px rgba(239,68,68,0.5)'
                  }}
                >{itemCount}</motion.span>
              )}
            </Link>
          </motion.div>

          {user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/orders" className="btn btn-secondary btn-sm">Orders</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/profile" className="btn btn-secondary btn-sm">Profile</Link>
              </motion.div>
              {user.role === 'admin' && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/admin" className="btn btn-accent btn-sm">Admin</Link>
                </motion.div>
              )}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { logout(); navigate('/'); }}
                className="btn btn-sm" style={{ background: 'none', color: 'var(--text-muted)' }}
              >Logout</motion.button>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/auth" className="btn btn-primary btn-sm">Sign In</Link>
            </motion.div>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
