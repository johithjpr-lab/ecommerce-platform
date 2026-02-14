import { Router } from 'express';
import supabase from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get all products with filtering, search, pagination
router.get('/', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, search, sort, page = 1, limit = 12, featured } = req.query;

    let query = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (brand) query = query.ilike('brand', `%${brand}%`);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`);
    if (featured === 'true') query = query.eq('is_featured', true);

    // Sorting
    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (sort === 'rating') query = query.order('rating', { ascending: false });
    else if (sort === 'name') query = query.order('name', { ascending: true });
    else query = query.order('created_at', { ascending: false });

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: products, count, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Map to frontend format
    const mapped = (products || []).map(p => ({
      _id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.short_description,
      price: Number(p.price),
      compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
      category: p.category,
      brand: p.brand,
      images: p.images || [],
      specifications: p.specifications || {},
      inventory: p.inventory,
      sku: p.sku,
      rating: Number(p.rating),
      reviewCount: p.review_count,
      tags: p.tags || [],
      isActive: p.is_active,
      isFeatured: p.is_featured,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    res.json({
      products: mapped,
      pagination: { page: Number(page), limit: Number(limit), total: count || 0, pages: Math.ceil((count || 0) / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  res.json(['smartphones', 'laptops', 'tablets', 'audio', 'wearables', 'cameras', 'gaming', 'accessories']);
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { data: product, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
    if (error || !product) return res.status(404).json({ error: 'Product not found' });

    res.json({
      _id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.short_description,
      price: Number(product.price),
      compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : undefined,
      category: product.category,
      brand: product.brand,
      images: product.images || [],
      specifications: product.specifications || {},
      inventory: product.inventory,
      sku: product.sku,
      rating: Number(product.rating),
      reviewCount: product.review_count,
      tags: product.tags || [],
      isActive: product.is_active,
      isFeatured: product.is_featured,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create product
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sku = `GZ-${(req.body.category || 'gen').substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const { data: product, error } = await supabase.from('products').insert({
      name: req.body.name,
      slug,
      description: req.body.description,
      short_description: req.body.shortDescription,
      price: req.body.price,
      compare_at_price: req.body.compareAtPrice,
      category: req.body.category,
      brand: req.body.brand,
      images: req.body.images || [],
      specifications: req.body.specifications || {},
      inventory: req.body.inventory || 0,
      sku,
      rating: req.body.rating || 0,
      review_count: req.body.reviewCount || 0,
      tags: req.body.tags || [],
      is_featured: req.body.isFeatured || false
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update product
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updates = { updated_at: new Date().toISOString() };
    const fieldMap = {
      name: 'name', description: 'description', shortDescription: 'short_description',
      price: 'price', compareAtPrice: 'compare_at_price', category: 'category',
      brand: 'brand', images: 'images', specifications: 'specifications',
      inventory: 'inventory', rating: 'rating', reviewCount: 'review_count',
      tags: 'tags', isFeatured: 'is_featured', isActive: 'is_active'
    };
    Object.entries(fieldMap).forEach(([from, to]) => {
      if (req.body[from] !== undefined) updates[to] = req.body[from];
    });

    const { data: product, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete product (soft delete)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await supabase.from('products').update({ is_active: false }).eq('id', req.params.id);
    res.json({ message: 'Product deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
