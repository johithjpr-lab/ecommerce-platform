import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Customer from './models/Customer.js';
import Wallet from './models/Wallet.js';

dotenv.config();

const products = [
  { name: 'iPhone 15 Pro Max', description: 'Apple flagship smartphone with A17 Pro chip, 48MP camera system, titanium design, and all-day battery life.', shortDescription: 'Latest Apple flagship', price: 134900, compareAtPrice: 149900, category: 'smartphones', brand: 'Apple', images: ['https://placehold.co/400x400/1a1a2e/eee?text=iPhone+15+Pro'], specifications: { display: '6.7" Super Retina XDR OLED', chip: 'A17 Pro', camera: '48MP + 12MP + 12MP', battery: '4422 mAh', storage: '256GB' }, inventory: 50, rating: 4.8, reviewCount: 1250, tags: ['flagship', '5g', 'ios'], isFeatured: true },
  { name: 'Samsung Galaxy S24 Ultra', description: 'Samsung premium smartphone with Snapdragon 8 Gen 3, 200MP camera, S Pen, and AI-powered features.', shortDescription: 'Samsung AI flagship', price: 129999, compareAtPrice: 139999, category: 'smartphones', brand: 'Samsung', images: ['https://placehold.co/400x400/1a1a2e/eee?text=Galaxy+S24'], specifications: { display: '6.8" Dynamic AMOLED 2X', chip: 'Snapdragon 8 Gen 3', camera: '200MP + 12MP + 50MP + 10MP', battery: '5000 mAh', storage: '256GB' }, inventory: 45, rating: 4.7, reviewCount: 890, tags: ['flagship', '5g', 'android', 'ai'], isFeatured: true },
  { name: 'MacBook Pro 16" M3 Max', description: 'Apple professional laptop with M3 Max chip, 40-core GPU, 48GB unified memory, and stunning Liquid Retina XDR display.', shortDescription: 'Pro-level performance', price: 349900, compareAtPrice: 399900, category: 'laptops', brand: 'Apple', images: ['https://placehold.co/400x400/1a1a2e/eee?text=MacBook+Pro'], specifications: { display: '16.2" Liquid Retina XDR', chip: 'Apple M3 Max', ram: '48GB Unified', storage: '1TB SSD', battery: '22 hours' }, inventory: 25, rating: 4.9, reviewCount: 560, tags: ['professional', 'creative', 'macos'], isFeatured: true },
  { name: 'Dell XPS 15', description: 'Premium Windows ultrabook with Intel Core i9, NVIDIA RTX 4070, 32GB RAM, and InfinityEdge display.', shortDescription: 'Premium Windows ultrabook', price: 189990, compareAtPrice: 209990, category: 'laptops', brand: 'Dell', images: ['https://placehold.co/400x400/1a1a2e/eee?text=Dell+XPS+15'], specifications: { display: '15.6" OLED 3.5K', processor: 'Intel Core i9-13900H', gpu: 'NVIDIA RTX 4070', ram: '32GB DDR5', storage: '1TB SSD' }, inventory: 30, rating: 4.6, reviewCount: 340, tags: ['ultrabook', 'windows', 'oled'] },
  { name: 'iPad Pro 12.9" M2', description: 'Apple professional tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil 2 support.', shortDescription: 'Pro tablet experience', price: 112900, compareAtPrice: 124900, category: 'tablets', brand: 'Apple', images: ['https://placehold.co/400x400/1a1a2e/eee?text=iPad+Pro'], specifications: { display: '12.9" Liquid Retina XDR', chip: 'Apple M2', camera: '12MP + 10MP', storage: '256GB', connectivity: 'Wi-Fi 6E + 5G' }, inventory: 40, rating: 4.8, reviewCount: 720, tags: ['professional', 'creative', 'ipados'], isFeatured: true },
  { name: 'Sony WH-1000XM5', description: 'Industry-leading noise cancelling wireless headphones with 30-hour battery and Hi-Res Audio.', shortDescription: 'Best ANC headphones', price: 29990, compareAtPrice: 34990, category: 'audio', brand: 'Sony', images: ['https://placehold.co/400x400/1a1a2e/eee?text=Sony+XM5'], specifications: { driver: '30mm', anc: 'Adaptive Sound Control', battery: '30 hours', codec: 'LDAC, AAC, SBC', weight: '250g' }, inventory: 80, rating: 4.7, reviewCount: 2100, tags: ['wireless', 'anc', 'premium'], isFeatured: true },
  { name: 'AirPods Pro 2nd Gen', description: 'Apple wireless earbuds with active noise cancellation, adaptive transparency, and personalized spatial audio.', shortDescription: 'Apple premium earbuds', price: 24900, compareAtPrice: 26900, category: 'audio', brand: 'Apple', images: ['https://placehold.co/400x400/1a1a2e/eee?text=AirPods+Pro'], specifications: { driver: 'Custom Apple', anc: 'Active Noise Cancellation', battery: '6h (30h with case)', codec: 'AAC', features: 'Spatial Audio, Adaptive EQ' }, inventory: 100, rating: 4.6, reviewCount: 3200, tags: ['wireless', 'anc', 'apple'] },
  { name: 'Apple Watch Ultra 2', description: 'Rugged titanium smartwatch with precision GPS, 36-hour battery, and advanced health monitoring.', shortDescription: 'Ultimate sports watch', price: 89900, compareAtPrice: 92900, category: 'wearables', brand: 'Apple', images: ['https://placehold.co/400x400/1a1a2e/eee?text=Watch+Ultra+2'], specifications: { display: '49mm Always-On Retina', chip: 'S9 SiP', battery: '36 hours', water: '100m', sensors: 'Heart rate, SpO2, Temperature' }, inventory: 35, rating: 4.8, reviewCount: 450, tags: ['smartwatch', 'fitness', 'rugged'], isFeatured: true },
  { name: 'Samsung Galaxy Watch 6 Classic', description: 'Premium smartwatch with rotating bezel, advanced sleep tracking, and Samsung Health integration.', shortDescription: 'Classic smartwatch design', price: 36999, compareAtPrice: 39999, category: 'wearables', brand: 'Samsung', images: ['https://placehold.co/400x400/1a1a2e/eee?text=Galaxy+Watch+6'], specifications: { display: '1.5" Super AMOLED', chip: 'Exynos W930', battery: '425 mAh', water: '5ATM + IP68', sensors: 'BioActive Sensor' }, inventory: 55, rating: 4.5, reviewCount: 380, tags: ['smartwatch', 'android', 'fitness'] },
  { name: 'Sony Alpha A7 IV', description: 'Full-frame mirrorless camera with 33MP sensor, 4K 60fps video, and advanced autofocus system.', shortDescription: 'Pro mirrorless camera', price: 198990, compareAtPrice: 219990, category: 'cameras', brand: 'Sony', images: ['https://placehold.co/400x400/1a1a2e/eee?text=Sony+A7+IV'], specifications: { sensor: '33MP Full-Frame CMOS', video: '4K 60fps, 10-bit', af: '759-point Phase Detection', iso: '100-51200', stabilization: '5-axis IBIS' }, inventory: 15, rating: 4.9, reviewCount: 280, tags: ['mirrorless', 'fullframe', 'professional'] },
  { name: 'PlayStation 5 Slim', description: 'Next-gen gaming console with 1TB SSD, ray tracing, 4K gaming, and DualSense controller.', shortDescription: 'Next-gen gaming', price: 49990, compareAtPrice: 54990, category: 'gaming', brand: 'Sony', images: ['https://placehold.co/400x400/1a1a2e/eee?text=PS5+Slim'], specifications: { gpu: '10.28 TFLOPS RDNA 2', cpu: 'AMD Zen 2, 8 cores', storage: '1TB SSD', resolution: '4K @ 120fps', features: 'Ray Tracing, Haptic Feedback' }, inventory: 60, rating: 4.7, reviewCount: 4500, tags: ['console', '4k', 'gaming'], isFeatured: true },
  { name: 'Nintendo Switch OLED', description: 'Portable gaming console with vibrant 7-inch OLED screen and enhanced audio.', shortDescription: 'Portable gaming fun', price: 27999, compareAtPrice: 32999, category: 'gaming', brand: 'Nintendo', images: ['https://placehold.co/400x400/1a1a2e/eee?text=Switch+OLED'], specifications: { display: '7" OLED', storage: '64GB', battery: '4.5-9 hours', modes: 'TV, Tabletop, Handheld', audio: 'Enhanced stereo' }, inventory: 70, rating: 4.6, reviewCount: 3100, tags: ['portable', 'console', 'oled'] },
  { name: 'Anker 737 Power Bank', description: '24,000mAh portable charger with 140W output, smart display, and USB-C fast charging.', shortDescription: 'Ultimate power bank', price: 9999, compareAtPrice: 12999, category: 'accessories', brand: 'Anker', images: ['https://placehold.co/400x400/1a1a2e/eee?text=Anker+737'], specifications: { capacity: '24000mAh', output: '140W USB-C', ports: '2x USB-C, 1x USB-A', display: 'Smart LED', weight: '630g' }, inventory: 120, rating: 4.5, reviewCount: 890, tags: ['power bank', 'fast charging', 'portable'] },
  { name: 'Logitech MX Master 3S', description: 'Advanced wireless mouse with MagSpeed scrolling, ergonomic design, and multi-device support.', shortDescription: 'Premium wireless mouse', price: 8995, compareAtPrice: 10995, category: 'accessories', brand: 'Logitech', images: ['https://placehold.co/400x400/1a1a2e/eee?text=MX+Master+3S'], specifications: { sensor: '8000 DPI Darkfield', battery: '70 days', connectivity: 'Bluetooth + USB receiver', buttons: '7 programmable', scroll: 'MagSpeed Electromagnetic' }, inventory: 90, rating: 4.8, reviewCount: 1560, tags: ['wireless', 'ergonomic', 'productivity'] },
  { name: 'Samsung Galaxy Buds2 Pro', description: 'Premium wireless earbuds with intelligent ANC, 360 Audio, and Hi-Fi 24bit audio.', shortDescription: 'Samsung premium earbuds', price: 17999, compareAtPrice: 20999, category: 'audio', brand: 'Samsung', images: ['https://placehold.co/400x400/1a1a2e/eee?text=Galaxy+Buds2+Pro'], specifications: { driver: 'Custom 2-way', anc: 'Intelligent ANC', battery: '5h (18h with case)', codec: 'Samsung Seamless, AAC', audio: '24bit Hi-Fi' }, inventory: 65, rating: 4.4, reviewCount: 920, tags: ['wireless', 'anc', 'samsung'] },
  { name: 'GoPro HERO12 Black', description: 'Action camera with 5.3K60 video, HyperSmooth 6.0 stabilization, and waterproof design.', shortDescription: 'Action camera king', price: 44990, compareAtPrice: 49990, category: 'cameras', brand: 'GoPro', images: ['https://placehold.co/400x400/1a1a2e/eee?text=GoPro+12'], specifications: { video: '5.3K60, 4K120', stabilization: 'HyperSmooth 6.0', waterproof: '10m without housing', photo: '27MP', battery: '1720mAh' }, inventory: 40, rating: 4.6, reviewCount: 670, tags: ['action', 'waterproof', '4k'] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([Product.deleteMany({}), Customer.deleteMany({}), Wallet.deleteMany({})]);

    // Create products
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    // Create admin user
    const admin = await Customer.create({
      name: 'Admin User', email: 'admin@gadgetzone.com', password: 'admin123', phone: '+919876543210', role: 'admin'
    });
    await Wallet.create({ customer: admin._id, balance: 100000 });

    // Create demo customer
    const customer = await Customer.create({
      name: 'John Doe', email: 'john@example.com', password: 'password123', phone: '+919876543211',
      addresses: [{ label: 'Home', street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India', isDefault: true }]
    });
    await Wallet.create({ customer: customer._id, balance: 5000 });

    console.log('Seeded admin and demo customer');
    console.log('Admin: admin@gadgetzone.com / admin123');
    console.log('Customer: john@example.com / password123');

    await mongoose.disconnect();
    console.log('Seed completed!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
