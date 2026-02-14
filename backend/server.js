import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import supabase from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import trackingRoutes from './routes/tracking.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'supabase', timestamp: new Date().toISOString() });
});

// Serve frontend static files in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Auto-seed function
async function autoSeed() {
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  if (count > 0) {
    console.log(`Database already has ${count} products, skipping seed`);
    return;
  }
  console.log('Seeding Supabase database with sample data...');

  const products = [
    { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', description: 'Apple flagship smartphone with A17 Pro chip, 48MP camera system, titanium design.', short_description: 'Latest Apple flagship', price: 134900, compare_at_price: 149900, category: 'smartphones', brand: 'Apple', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&fit=crop'], specifications: { display: '6.7" Super Retina XDR OLED', chip: 'A17 Pro', camera: '48MP + 12MP + 12MP', battery: '4422 mAh', storage: '256GB' }, inventory: 50, sku: 'GZ-SMR-IP15PM', rating: 4.8, review_count: 1250, tags: ['flagship', '5g', 'ios'], is_featured: true },
      { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', description: 'Samsung premium smartphone with Snapdragon 8 Gen 3, 200MP camera, S Pen.', short_description: 'Samsung AI flagship', price: 129999, compare_at_price: 139999, category: 'smartphones', brand: 'Samsung', images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&fit=crop'], specifications: { display: '6.8" Dynamic AMOLED 2X', chip: 'Snapdragon 8 Gen 3', camera: '200MP + 12MP + 50MP + 10MP', battery: '5000 mAh', storage: '256GB' }, inventory: 45, sku: 'GZ-SMR-SGS24U', rating: 4.7, review_count: 890, tags: ['flagship', '5g', 'android'], is_featured: true },
      { name: 'MacBook Pro 16" M3 Max', slug: 'macbook-pro-16-m3-max', description: 'Apple professional laptop with M3 Max chip, 40-core GPU, 48GB unified memory.', short_description: 'Pro-level performance', price: 349900, compare_at_price: 399900, category: 'laptops', brand: 'Apple', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&fit=crop'], specifications: { display: '16.2" Liquid Retina XDR', chip: 'Apple M3 Max', ram: '48GB Unified', storage: '1TB SSD', battery: '22 hours' }, inventory: 25, sku: 'GZ-LAP-MBP16M3', rating: 4.9, review_count: 560, tags: ['professional', 'creative', 'macos'], is_featured: true },
      { name: 'Dell XPS 15', slug: 'dell-xps-15', description: 'Premium Windows ultrabook with Intel Core i9, NVIDIA RTX 4070, 32GB RAM.', short_description: 'Premium Windows ultrabook', price: 189990, compare_at_price: 209990, category: 'laptops', brand: 'Dell', images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&fit=crop'], specifications: { display: '15.6" OLED 3.5K', processor: 'Intel Core i9-13900H', gpu: 'NVIDIA RTX 4070', ram: '32GB DDR5', storage: '1TB SSD' }, inventory: 30, sku: 'GZ-LAP-DXPS15', rating: 4.6, review_count: 340, tags: ['ultrabook', 'windows', 'oled'] },
      { name: 'iPad Pro 12.9" M2', slug: 'ipad-pro-12-9-m2', description: 'Apple professional tablet with M2 chip, Liquid Retina XDR display.', short_description: 'Pro tablet experience', price: 112900, compare_at_price: 124900, category: 'tablets', brand: 'Apple', images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&fit=crop'], specifications: { display: '12.9" Liquid Retina XDR', chip: 'Apple M2', storage: '256GB' }, inventory: 40, sku: 'GZ-TAB-IPP129', rating: 4.8, review_count: 720, tags: ['professional', 'creative'], is_featured: true },
      { name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: 'Industry-leading noise cancelling wireless headphones with 30-hour battery.', short_description: 'Best ANC headphones', price: 29990, compare_at_price: 34990, category: 'audio', brand: 'Sony', images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&fit=crop'], specifications: { driver: '30mm', anc: 'Adaptive Sound Control', battery: '30 hours' }, inventory: 80, sku: 'GZ-AUD-SWHXM5', rating: 4.7, review_count: 2100, tags: ['wireless', 'anc', 'premium'], is_featured: true },
      { name: 'AirPods Pro 2nd Gen', slug: 'airpods-pro-2nd-gen', description: 'Apple wireless earbuds with ANC, adaptive transparency, spatial audio.', short_description: 'Apple premium earbuds', price: 24900, compare_at_price: 26900, category: 'audio', brand: 'Apple', images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&fit=crop'], specifications: { driver: 'Custom Apple', anc: 'Active Noise Cancellation', battery: '6h (30h with case)' }, inventory: 100, sku: 'GZ-AUD-APP2', rating: 4.6, review_count: 3200, tags: ['wireless', 'anc'] },
      { name: 'Apple Watch Ultra 2', slug: 'apple-watch-ultra-2', description: 'Rugged titanium smartwatch with precision GPS, 36-hour battery.', short_description: 'Ultimate sports watch', price: 89900, compare_at_price: 92900, category: 'wearables', brand: 'Apple', images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&fit=crop'], specifications: { display: '49mm Always-On Retina', battery: '36 hours' }, inventory: 35, sku: 'GZ-WEA-AWU2', rating: 4.8, review_count: 450, tags: ['smartwatch', 'fitness'], is_featured: true },
      { name: 'PlayStation 5 Slim', slug: 'playstation-5-slim', description: 'Next-gen gaming console with 1TB SSD, ray tracing, 4K gaming.', short_description: 'Next-gen gaming', price: 49990, compare_at_price: 54990, category: 'gaming', brand: 'Sony', images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&fit=crop'], specifications: { gpu: '10.28 TFLOPS RDNA 2', storage: '1TB SSD', resolution: '4K @ 120fps' }, inventory: 60, sku: 'GZ-GAM-PS5S', rating: 4.7, review_count: 4500, tags: ['console', '4k', 'gaming'], is_featured: true },
      { name: 'Nintendo Switch OLED', slug: 'nintendo-switch-oled', description: 'Portable gaming console with vibrant 7-inch OLED screen.', short_description: 'Portable gaming fun', price: 27999, compare_at_price: 32999, category: 'gaming', brand: 'Nintendo', images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&fit=crop'], specifications: { display: '7" OLED', storage: '64GB', battery: '4.5-9 hours' }, inventory: 70, sku: 'GZ-GAM-NSW', rating: 4.6, review_count: 3100, tags: ['portable', 'console'] },
      { name: 'Sony Alpha A7 IV', slug: 'sony-alpha-a7-iv', description: 'Full-frame mirrorless camera with 33MP sensor, 4K 60fps video.', short_description: 'Pro mirrorless camera', price: 198990, compare_at_price: 219990, category: 'cameras', brand: 'Sony', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&fit=crop'], specifications: { sensor: '33MP Full-Frame', video: '4K 60fps' }, inventory: 15, sku: 'GZ-CAM-SA7IV', rating: 4.9, review_count: 280, tags: ['mirrorless', 'professional'] },
      { name: 'GoPro HERO12 Black', slug: 'gopro-hero12-black', description: 'Action camera with 5.3K60 video, HyperSmooth 6.0 stabilization.', short_description: 'Action camera king', price: 44990, compare_at_price: 49990, category: 'cameras', brand: 'GoPro', images: ['https://images.unsplash.com/photo-1526920929362-5b26677c148c?w=500&fit=crop'], specifications: { video: '5.3K60', waterproof: '10m' }, inventory: 40, sku: 'GZ-CAM-GPH12', rating: 4.6, review_count: 670, tags: ['action', 'waterproof'] },
      { name: 'Anker 737 Power Bank', slug: 'anker-737-power-bank', description: '24,000mAh portable charger with 140W output, USB-C fast charging.', short_description: 'Ultimate power bank', price: 9999, compare_at_price: 12999, category: 'accessories', brand: 'Anker', images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&fit=crop'], specifications: { capacity: '24000mAh', output: '140W USB-C' }, inventory: 120, sku: 'GZ-ACC-A737', rating: 4.5, review_count: 890, tags: ['power bank', 'fast charging'] },
      { name: 'Logitech MX Master 3S', slug: 'logitech-mx-master-3s', description: 'Advanced wireless mouse with MagSpeed scrolling, ergonomic design.', short_description: 'Premium wireless mouse', price: 8995, compare_at_price: 10995, category: 'accessories', brand: 'Logitech', images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&fit=crop'], specifications: { sensor: '8000 DPI', battery: '70 days' }, inventory: 90, sku: 'GZ-ACC-MXM3S', rating: 4.8, review_count: 1560, tags: ['wireless', 'ergonomic'] },
      { name: 'Samsung Galaxy Buds2 Pro', slug: 'samsung-galaxy-buds2-pro', description: 'Premium wireless earbuds with intelligent ANC, Hi-Fi 24bit audio.', short_description: 'Samsung premium earbuds', price: 17999, compare_at_price: 20999, category: 'audio', brand: 'Samsung', images: ['https://images.unsplash.com/photo-1590658165737-15a047b7c0b0?w=500&fit=crop'], specifications: { driver: 'Custom 2-way', anc: 'Intelligent ANC' }, inventory: 65, sku: 'GZ-AUD-SGB2P', rating: 4.4, review_count: 920, tags: ['wireless', 'anc'] },
      { name: 'Samsung Galaxy Watch 6', slug: 'samsung-galaxy-watch-6', description: 'Premium smartwatch with rotating bezel, advanced sleep tracking.', short_description: 'Classic smartwatch', price: 36999, compare_at_price: 39999, category: 'wearables', brand: 'Samsung', images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&fit=crop'], specifications: { display: '1.5" Super AMOLED', battery: '425 mAh' }, inventory: 55, sku: 'GZ-WEA-SGW6', rating: 4.5, review_count: 380, tags: ['smartwatch', 'android'] },
  ];

  const { error: productError } = await supabase.from('products').insert(products);
  if (productError) {
    console.error('Product seed error:', productError.message);
    return;
  }
  console.log(`Seeded ${products.length} products`);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const { data: admin, error: adminError } = await supabase
    .from('customers')
    .insert({ name: 'Admin User', email: 'admin@gadgetzone.com', password: adminPassword, phone: '+919876543210', role: 'admin' })
    .select()
    .single();

  if (adminError) {
    console.error('Admin seed error:', adminError.message);
  } else {
    await supabase.from('wallets').insert({ customer_id: admin.id, balance: 100000 });
  }

  // Create test customer
  const customerPassword = await bcrypt.hash('password123', 12);
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({ name: 'John Doe', email: 'john@example.com', password: customerPassword, phone: '+919876543211' })
    .select()
    .single();

  if (customerError) {
    console.error('Customer seed error:', customerError.message);
  } else {
    await supabase.from('wallets').insert({ customer_id: customer.id, balance: 5000 });
    await supabase.from('addresses').insert({
      customer_id: customer.id, label: 'Home', street: '123 MG Road', city: 'Mumbai',
      state: 'Maharashtra', zip_code: '400001', country: 'India', is_default: true
    });
  }

  console.log('Seeded users -> Admin: admin@gadgetzone.com/admin123 | Customer: john@example.com/password123');
}

// Start server
async function start() {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('products').select('id', { count: 'exact', head: true });
    if (error) throw error;
    console.log('Supabase connected successfully');

    await autoSeed();
  } catch (e) {
    console.error('Startup error:', e.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
