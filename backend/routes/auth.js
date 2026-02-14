import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import supabase from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const { data: exists } = await supabase.from('customers').select('id').eq('email', email.toLowerCase()).single();
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({ name, email: email.toLowerCase(), password: hashedPassword, phone })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await supabase.from('wallets').insert({ customer_id: customer.id });

    const { password: _, ...safeCustomer } = customer;
    res.status(201).json({ customer: safeCustomer, token: generateToken(customer.id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !customer || !(await bcrypt.compare(password, customer.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...safeCustomer } = customer;
    res.json({ customer: safeCustomer, token: generateToken(customer.id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile
router.get('/profile', authenticate, (req, res) => {
  res.json(req.customer);
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const updates = {};
    ['name', 'phone'].forEach(f => { if (req.body[f]) updates[f] = req.body[f]; });
    updates.updated_at = new Date().toISOString();

    const { data: customer, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', req.customer.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    const { password: _, ...safeCustomer } = customer;
    res.json(safeCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add address
router.post('/addresses', authenticate, async (req, res) => {
  try {
    if (req.body.isDefault || req.body.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('customer_id', req.customer.id);
    }

    const { error } = await supabase.from('addresses').insert({
      customer_id: req.customer.id,
      label: req.body.label || 'Home',
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zip_code: req.body.zipCode || req.body.zip_code,
      country: req.body.country || 'India',
      is_default: req.body.isDefault || req.body.is_default || false
    });

    if (error) return res.status(500).json({ error: error.message });

    const { data: addresses } = await supabase.from('addresses').select('*').eq('customer_id', req.customer.id);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete address
router.delete('/addresses/:addressId', authenticate, async (req, res) => {
  try {
    await supabase.from('addresses').delete().eq('id', req.params.addressId).eq('customer_id', req.customer.id);
    const { data: addresses } = await supabase.from('addresses').select('*').eq('customer_id', req.customer.id);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
