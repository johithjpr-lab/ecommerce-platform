import { Router } from 'express';
import supabase from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { processStripePayment, createStripePaymentIntent, processPayPalPayment, processUPIPayment, processCODPayment, processWalletPayment } from '../services/payment.js';

const router = Router();

function genOrderNumber() {
  return `GZ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function genTrackingNumber() {
  return `GZT${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// Create order
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentMethodId, upiId } = req.body;
    if (!items?.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const { data: product } = await supabase.from('products').select('*').eq('id', item.productId).single();
      if (!product || product.inventory < item.quantity) {
        return res.status(400).json({ error: `${product?.name || 'Product'} unavailable or insufficient stock` });
      }
      subtotal += Number(product.price) * item.quantity;
      orderItems.push({
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: item.quantity,
        image: product.images?.[0] || ''
      });
    }

    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const shippingCost = subtotal > 1000 ? 0 : 99;
    const total = subtotal + tax + shippingCost;

    // Process payment
    let paymentResult;
    switch (paymentMethod) {
      case 'card':
        if (paymentMethodId) {
          paymentResult = await processStripePayment(total, 'inr', paymentMethodId, { customerId: req.customer.id });
        } else {
          paymentResult = await createStripePaymentIntent(total);
          if (paymentResult.success) {
            return res.json({ requiresAction: true, clientSecret: paymentResult.clientSecret });
          }
        }
        break;
      case 'paypal':
        paymentResult = await processPayPalPayment(req.body.paypalOrderId);
        break;
      case 'upi':
        paymentResult = await processUPIPayment(upiId, total);
        break;
      case 'wallet':
        const { data: wallet } = await supabase.from('wallets').select('*').eq('customer_id', req.customer.id).single();
        if (!wallet || Number(wallet.balance) < total) {
          return res.status(400).json({ error: 'Insufficient wallet balance' });
        }
        await supabase.from('wallets').update({ balance: Number(wallet.balance) - total, updated_at: new Date().toISOString() }).eq('id', wallet.id);
        await supabase.from('wallet_transactions').insert({ wallet_id: wallet.id, type: 'debit', amount: total, description: 'Order payment' });
        paymentResult = await processWalletPayment(wallet.id, total);
        break;
      case 'cod':
        paymentResult = await processCODPayment('new', total);
        break;
      default:
        return res.status(400).json({ error: 'Invalid payment method' });
    }

    if (!paymentResult.success && paymentMethod !== 'cod') {
      return res.status(400).json({ error: paymentResult.error || 'Payment failed' });
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (paymentMethod === 'cod' ? 7 : 5));

    // Create order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      order_number: genOrderNumber(),
      customer_id: req.customer.id,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
      subtotal, tax, shipping_cost: shippingCost, total,
      estimated_delivery: estimatedDelivery.toISOString()
    }).select().single();

    if (orderError) return res.status(500).json({ error: orderError.message });

    // Insert order items
    const itemsToInsert = orderItems.map(i => ({ ...i, order_id: order.id }));
    await supabase.from('order_items').insert(itemsToInsert);

    // Status history
    await supabase.from('order_status_history').insert({ order_id: order.id, status: 'confirmed', note: 'Order placed successfully' });

    // Payment record
    await supabase.from('payments').insert({
      order_id: order.id,
      customer_id: req.customer.id,
      method: paymentMethod,
      gateway: paymentMethod === 'card' ? 'stripe' : paymentMethod === 'paypal' ? 'paypal' : paymentMethod === 'upi' ? 'razorpay' : paymentMethod === 'cod' ? 'cod' : 'internal',
      amount: total,
      status: paymentMethod === 'cod' ? 'pending' : 'completed',
      transaction_id: paymentResult.transactionId
    });

    // Create shipment
    const { data: shipment } = await supabase.from('shipments').insert({
      order_id: order.id,
      customer_id: req.customer.id,
      tracking_number: genTrackingNumber(),
      estimated_delivery: estimatedDelivery.toISOString(),
      destination: { address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}` },
      origin: { address: 'GadgetZone Warehouse, Mumbai, Maharashtra', lat: 19.076, lng: 72.8777 }
    }).select().single();

    if (shipment) {
      await supabase.from('tracking_history').insert({
        shipment_id: shipment.id,
        status: 'preparing',
        description: 'Order confirmed, preparing for shipment',
        location: { address: 'GadgetZone Warehouse, Mumbai' }
      });
    }

    // Update inventory
    for (const item of items) {
      const { data: p } = await supabase.from('products').select('inventory').eq('id', item.productId).single();
      if (p) await supabase.from('products').update({ inventory: p.inventory - item.quantity }).eq('id', item.productId);
    }

    // Return full order with items
    const { data: fullItems } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    res.status(201).json({
      _id: order.id,
      orderNumber: order.order_number,
      items: fullItems?.map(i => ({
        product: i.product_id,
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        image: i.image
      })) || [],
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shippingCost: Number(order.shipping_cost),
      total: Number(order.total),
      estimatedDelivery: order.estimated_delivery,
      createdAt: order.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', req.customer.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Fetch items for each order
    const result = [];
    for (const order of (orders || [])) {
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
      result.push({
        _id: order.id,
        orderNumber: order.order_number,
        customer: req.customer.id,
        items: (items || []).map(i => ({
          _id: i.id,
          product: { _id: i.product_id, name: i.name, images: [i.image], price: Number(i.price) },
          name: i.name,
          price: Number(i.price),
          quantity: i.quantity,
          image: i.image
        })),
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        shippingCost: Number(order.shipping_cost),
        total: Number(order.total),
        estimatedDelivery: order.estimated_delivery,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all orders
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (status) query = query.eq('order_status', status);

    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: orders, count, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Enrich with customer info
    const result = [];
    for (const order of (orders || [])) {
      const { data: customer } = await supabase.from('customers').select('name, email, phone').eq('id', order.customer_id).single();
      result.push({
        _id: order.id,
        orderNumber: order.order_number,
        customer: customer || {},
        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        total: Number(order.total),
        createdAt: order.created_at
      });
    }

    res.json({ orders: result, pagination: { page: Number(page), total: count || 0, pages: Math.ceil((count || 0) / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', req.params.id).eq('customer_id', req.customer.id).single();
    if (error || !order) return res.status(404).json({ error: 'Order not found' });

    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    const { data: shipment } = await supabase.from('shipments').select('*').eq('order_id', order.id).single();
    const { data: payment } = await supabase.from('payments').select('*').eq('order_id', order.id).single();
    const { data: statusHistory } = await supabase.from('order_status_history').select('*').eq('order_id', order.id).order('created_at', { ascending: true });

    // Enrich items with product data
    const enrichedItems = [];
    for (const item of (items || [])) {
      const { data: product } = await supabase.from('products').select('*').eq('id', item.product_id).single();
      enrichedItems.push({
        _id: item.id,
        product: product ? {
          _id: product.id, name: product.name, images: product.images, price: Number(product.price),
          slug: product.slug, category: product.category, brand: product.brand
        } : null,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image
      });
    }

    let trackingHistory = [];
    if (shipment) {
      const { data: th } = await supabase.from('tracking_history').select('*').eq('shipment_id', shipment.id).order('created_at', { ascending: true });
      trackingHistory = th || [];
    }

    res.json({
      order: {
        _id: order.id,
        orderNumber: order.order_number,
        items: enrichedItems,
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        shippingCost: Number(order.shipping_cost),
        total: Number(order.total),
        estimatedDelivery: order.estimated_delivery,
        statusHistory: (statusHistory || []).map(s => ({ status: s.status, timestamp: s.created_at, note: s.note })),
        createdAt: order.created_at
      },
      shipment: shipment ? {
        _id: shipment.id,
        trackingNumber: shipment.tracking_number,
        carrier: shipment.carrier,
        status: shipment.status,
        currentLocation: shipment.current_location,
        origin: shipment.origin,
        destination: shipment.destination,
        estimatedDelivery: shipment.estimated_delivery,
        trackingHistory: trackingHistory.map(t => ({
          status: t.status, location: t.location, timestamp: t.created_at, description: t.description
        }))
      } : null,
      payment: payment ? {
        _id: payment.id,
        method: payment.method,
        gateway: payment.gateway,
        amount: Number(payment.amount),
        status: payment.status,
        transactionId: payment.transaction_id
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update order status
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    const { data: order, error } = await supabase
      .from('orders')
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !order) return res.status(404).json({ error: 'Order not found' });

    await supabase.from('order_status_history').insert({ order_id: order.id, status, note });

    // Update shipment
    const shipmentStatusMap = { processing: 'preparing', shipped: 'in_transit', out_for_delivery: 'out_for_delivery', delivered: 'delivered' };
    if (shipmentStatusMap[status]) {
      const { data: shipment } = await supabase.from('shipments').select('*').eq('order_id', order.id).single();
      if (shipment) {
        const shipUpdate = { status: shipmentStatusMap[status], updated_at: new Date().toISOString() };
        if (status === 'delivered') shipUpdate.actual_delivery = new Date().toISOString();
        await supabase.from('shipments').update(shipUpdate).eq('id', shipment.id);
        await supabase.from('tracking_history').insert({
          shipment_id: shipment.id,
          status: shipmentStatusMap[status],
          description: note || `Status updated to ${status}`
        });
      }
    }

    if (status === 'delivered' && order.payment_method === 'cod') {
      await supabase.from('payments').update({ status: 'completed' }).eq('order_id', order.id);
    }

    res.json({ _id: order.id, orderNumber: order.order_number, orderStatus: order.order_status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
