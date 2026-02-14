import jwt from 'jsonwebtoken';
import supabase from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();

    if (error || !customer) return res.status(401).json({ error: 'Invalid token' });

    // Also fetch addresses
    const { data: addresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', customer.id);

    customer.addresses = addresses || [];
    const { password, ...safeCustomer } = customer;
    req.customer = safeCustomer;
    req.customerPassword = password;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.customer.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
