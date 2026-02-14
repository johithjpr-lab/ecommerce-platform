import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import AnimatedPage, { staggerContainer, fadeInUp } from '../components/AnimatedPage.jsx';

const CATEGORIES = ['all', 'smartphones', 'laptops', 'tablets', 'audio', 'wearables', 'cameras', 'gaming', 'accessories'];
const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name', label: 'Name A-Z' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    params.set('page', searchParams.get('page') || '1');
    api.getProducts(params.toString())
      .then(d => { setProducts(d.products || []); setPagination(d.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, sort, searchParams]);

  const doSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) params.set('search', search); else params.delete('search');
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <AnimatedPage>
      <div className="container" style={{ padding: '32px 20px' }}>
        <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="page-title">All Products</motion.h1>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center',
            padding: 20, background: 'rgba(15,15,35,0.6)', borderRadius: 16,
            border: '1px solid var(--border)', backdropFilter: 'blur(10px)'
          }}>
          <form onSubmit={doSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 250 }}>
            <input className="input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" type="submit">Search</motion.button>
          </form>
          <select className="input" style={{ width: 'auto', minWidth: 160 }} value={category} onChange={e => { setCategory(e.target.value); setSearchParams({ page: '1' }); }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select className="input" style={{ width: 'auto', minWidth: 160 }} value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </motion.div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-3">
            <p className="text-muted" style={{ fontSize: 18 }}>No products found.</p>
          </motion.div>
        ) : (
          <>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-4">
              {products.map((product, i) => (
                <motion.div key={product._id} variants={fadeInUp} custom={i}>
                  <motion.div
                    whileHover={{ y: -12, scale: 1.03, rotateY: 3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="card" style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
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
                          background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)'
                        }} />
                        <img src={product.images?.[0] || 'https://placehold.co/400x400/1e1e3e/818cf8?text=Gadget'} alt={product.name}
                          style={{ height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                      </div>
                    </Link>
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{product.brand}</div>
                      <Link to={`/products/${product._id}`}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{product.name}</h3>
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <span style={{ color: '#fbbf24', fontSize: 13, textShadow: '0 0 6px rgba(251,191,36,0.4)' }}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
                        <span className="text-sm text-muted">({product.reviewCount})</span>
                      </div>
                      {product.inventory < 10 && product.inventory > 0 && (
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                          style={{ fontSize: 12, color: '#f87171', fontWeight: 600, marginBottom: 4 }}>Only {product.inventory} left!</motion.div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <div>
                          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>₹{product.price.toLocaleString()}</span>
                          {product.compareAtPrice && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 6 }}>₹{product.compareAtPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                          onClick={() => addItem(product)} className="btn btn-primary btn-sm" disabled={product.inventory === 0}>
                          {product.inventory === 0 ? 'Out of Stock' : 'Add'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {pagination.pages > 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}
                    className={`btn btn-sm ${pagination.page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', i + 1); setSearchParams(p); }}>
                    {i + 1}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </AnimatedPage>
  );
}
