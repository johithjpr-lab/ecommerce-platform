import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  category: { type: String, required: true, enum: ['smartphones', 'laptops', 'tablets', 'audio', 'wearables', 'cameras', 'gaming', 'accessories'] },
  brand: { type: String, required: true },
  images: [String],
  specifications: mongoose.Schema.Types.Mixed,
  inventory: { type: Number, default: 0, min: 0 },
  sku: { type: String, unique: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (!this.sku) {
    this.sku = `GZ-${this.category.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });

export default mongoose.model('Product', productSchema);
