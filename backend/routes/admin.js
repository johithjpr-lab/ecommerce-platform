import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import supabase from '../config/db.js';

const router = Router();

// Dashboard stats
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: totalCustomers } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('role', 'customer');
    const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true);

    // Total revenue
    const { data: paidOrders } = await supabase.from('orders').select('total').eq('payment_status', 'paid');
    const totalRevenue = (paidOrders || []).reduce((sum, o) => sum + Number(o.total), 0);

    // Recent orders
    const { data: recentOrdersRaw } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10);
    const recentOrders = [];
    for (const o of (recentOrdersRaw || [])) {
      const { data: customer } = await supabase.from('customers').select('name, email').eq('id', o.customer_id).single();
      recentOrders.push({
        _id: o.id,
        orderNumber: o.order_number,
        customer: customer || {},
        orderStatus: o.order_status,
        total: Number(o.total),
        createdAt: o.created_at
      });
    }

    // Orders by status
    const { data: allOrders } = await supabase.from('orders').select('order_status');
    const ordersByStatus = {};
    (allOrders || []).forEach(o => {
      ordersByStatus[o.order_status] = (ordersByStatus[o.order_status] || 0) + 1;
    });

    res.json({ totalOrders, totalCustomers, totalProducts, totalRevenue, recentOrders, ordersByStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inventory management
router.get('/inventory', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, sku, category, inventory, price')
      .eq('is_active', true)
      .order('inventory', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const mapped = (products || []).map(p => ({
      _id: p.id, name: p.name, sku: p.sku, category: p.category, inventory: p.inventory, price: Number(p.price)
    }));

    res.json({ products: mapped, lowStock: mapped.filter(p => p.inventory < 10), totalProducts: mapped.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment reconciliation
router.get('/payments', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: payments } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(50);

    const enriched = [];
    for (const p of (payments || [])) {
      const { data: order } = await supabase.from('orders').select('order_number').eq('id', p.order_id).single();
      const { data: customer } = await supabase.from('customers').select('name, email').eq('id', p.customer_id).single();
      enriched.push({
        _id: p.id,
        order: order ? { orderNumber: order.order_number } : null,
        customer: customer || {},
        method: p.method,
        gateway: p.gateway,
        amount: Number(p.amount),
        status: p.status,
        transactionId: p.transaction_id,
        createdAt: p.created_at
      });
    }

    // Summary by method+status
    const summary = {};
    (payments || []).forEach(p => {
      const key = `${p.method}_${p.status}`;
      if (!summary[key]) summary[key] = { _id: { method: p.method, status: p.status }, total: 0, count: 0 };
      summary[key].total += Number(p.amount);
      summary[key].count += 1;
    });

    res.json({ payments: enriched, summary: Object.values(summary) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notification logs
router.get('/notifications', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: logs } = await supabase.from('notification_logs').select('*, shipments(tracking_number)').order('sent_at', { ascending: false }).limit(50);
    res.json(logs || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer analytics
router.get('/customers', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name, email, phone, created_at')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json((customers || []).map(c => ({
      _id: c.id, name: c.name, email: c.email, phone: c.phone, createdAt: c.created_at
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
