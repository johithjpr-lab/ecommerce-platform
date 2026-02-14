import { Router } from 'express';
import { createStripePaymentIntent } from '../services/payment.js';
import { authenticate } from '../middleware/auth.js';
import supabase from '../config/db.js';

const router = Router();

// Create Stripe payment intent
router.post('/stripe/create-intent', authenticate, async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;
    const result = await createStripePaymentIntent(amount, currency);
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get wallet balance
router.get('/wallet', authenticate, async (req, res) => {
  try {
    let { data: wallet } = await supabase.from('wallets').select('*').eq('customer_id', req.customer.id).single();
    if (!wallet) {
      const { data: newWallet } = await supabase.from('wallets').insert({ customer_id: req.customer.id }).select().single();
      wallet = newWallet;
    }

    const { data: transactions } = await supabase.from('wallet_transactions').select('*').eq('wallet_id', wallet.id).order('created_at', { ascending: false });

    res.json({
      _id: wallet.id,
      customer: wallet.customer_id,
      balance: Number(wallet.balance),
      currency: wallet.currency,
      transactions: (transactions || []).map(t => ({
        type: t.type, amount: Number(t.amount), description: t.description, timestamp: t.created_at
      })),
      isActive: wallet.is_active
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add funds to wallet
router.post('/wallet/add', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    let { data: wallet } = await supabase.from('wallets').select('*').eq('customer_id', req.customer.id).single();
    if (!wallet) {
      const { data: newWallet } = await supabase.from('wallets').insert({ customer_id: req.customer.id }).select().single();
      wallet = newWallet;
    }

    const newBalance = Number(wallet.balance) + amount;
    await supabase.from('wallets').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', wallet.id);
    await supabase.from('wallet_transactions').insert({ wallet_id: wallet.id, type: 'credit', amount, description: 'Wallet top-up' });

    const { data: transactions } = await supabase.from('wallet_transactions').select('*').eq('wallet_id', wallet.id).order('created_at', { ascending: false });

    res.json({
      _id: wallet.id,
      customer: wallet.customer_id,
      balance: newBalance,
      currency: wallet.currency,
      transactions: (transactions || []).map(t => ({
        type: t.type, amount: Number(t.amount), description: t.description, timestamp: t.created_at
      })),
      isActive: wallet.is_active
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment methods info
router.get('/methods', (req, res) => {
  res.json({
    methods: [
      { id: 'card', name: 'Credit/Debit Card', icon: 'card', description: 'Visa, Mastercard, Amex via Stripe', gateway: 'stripe' },
      { id: 'upi', name: 'UPI', icon: 'upi', description: 'Google Pay, PhonePe, Paytm UPI', gateway: 'razorpay' },
      { id: 'paypal', name: 'PayPal', icon: 'paypal', description: 'Pay with PayPal wallet', gateway: 'paypal' },
      { id: 'wallet', name: 'GadgetZone Wallet', icon: 'wallet', description: 'Pay from wallet balance', gateway: 'internal' },
      { id: 'cod', name: 'Cash on Delivery', icon: 'cod', description: 'Pay when delivered', gateway: 'cod' }
    ]
  });
});

export default router;
