import { Router } from 'express';
import supabase from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get tracking info for an order
router.get('/order/:orderId', authenticate, async (req, res) => {
  try {
    const { data: shipment, error } = await supabase.from('shipments').select('*').eq('order_id', req.params.orderId).single();
    if (error || !shipment) return res.status(404).json({ error: 'Shipment not found' });

    const { data: history } = await supabase.from('tracking_history').select('*').eq('shipment_id', shipment.id).order('created_at', { ascending: true });
    const { data: order } = await supabase.from('orders').select('*').eq('id', shipment.order_id).single();

    res.json({
      _id: shipment.id,
      order: order ? { _id: order.id, orderNumber: order.order_number, orderStatus: order.order_status } : null,
      trackingNumber: shipment.tracking_number,
      carrier: shipment.carrier,
      status: shipment.status,
      currentLocation: shipment.current_location,
      origin: shipment.origin,
      destination: shipment.destination,
      estimatedDelivery: shipment.estimated_delivery,
      actualDelivery: shipment.actual_delivery,
      trackingHistory: (history || []).map(h => ({
        status: h.status, location: h.location, timestamp: h.created_at, description: h.description
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tracking by tracking number (public)
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { data: shipment, error } = await supabase.from('shipments').select('*').eq('tracking_number', req.params.trackingNumber).single();
    if (error || !shipment) return res.status(404).json({ error: 'Tracking number not found' });

    const { data: history } = await supabase.from('tracking_history').select('*').eq('shipment_id', shipment.id).order('created_at', { ascending: true });

    res.json({
      trackingNumber: shipment.tracking_number,
      carrier: shipment.carrier,
      status: shipment.status,
      currentLocation: shipment.current_location,
      estimatedDelivery: shipment.estimated_delivery,
      trackingHistory: (history || []).map(h => ({
        status: h.status, location: h.location, timestamp: h.created_at, description: h.description
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update GPS location
router.put('/:id/location', authenticate, requireAdmin, async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const currentLocation = { lat, lng, address, updatedAt: new Date().toISOString() };

    const { data: shipment, error } = await supabase
      .from('shipments')
      .update({ current_location: currentLocation, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !shipment) return res.status(404).json({ error: 'Shipment not found' });

    await supabase.from('tracking_history').insert({
      shipment_id: shipment.id,
      status: shipment.status,
      location: { lat, lng, address },
      description: `Location updated: ${address}`
    });

    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all shipments
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: shipments, error } = await supabase.from('shipments').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    const result = [];
    for (const s of (shipments || [])) {
      const { data: order } = await supabase.from('orders').select('order_number, order_status').eq('id', s.order_id).single();
      const { data: customer } = await supabase.from('customers').select('name, email, phone').eq('id', s.customer_id).single();
      result.push({
        _id: s.id,
        trackingNumber: s.tracking_number,
        carrier: s.carrier,
        status: s.status,
        order: order ? { orderNumber: order.order_number, orderStatus: order.order_status } : null,
        customer: customer || {},
        estimatedDelivery: s.estimated_delivery,
        createdAt: s.created_at
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
