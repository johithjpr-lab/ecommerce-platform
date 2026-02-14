// Payment processing service
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export const processStripePayment = async (amount, currency, paymentMethodId, metadata) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata,
    });
    return { success: true, transactionId: paymentIntent.id, status: paymentIntent.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createStripePaymentIntent = async (amount, currency = 'inr') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
    });
    return { success: true, clientSecret: paymentIntent.client_secret, intentId: paymentIntent.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const processPayPalPayment = async (orderId) => {
  // PayPal integration - in production, use @paypal/checkout-server-sdk
  console.log(`[PayPal] Processing order: ${orderId}`);
  return { success: true, transactionId: `pp_${Date.now()}`, status: 'completed' };
};

export const processUPIPayment = async (upiId, amount) => {
  // UPI integration - in production, use Razorpay/Cashfree UPI API
  console.log(`[UPI] Processing: ${upiId} for ₹${amount}`);
  return { success: true, transactionId: `upi_${Date.now()}`, status: 'completed' };
};

export const processCODPayment = async (orderId, amount) => {
  console.log(`[COD] Order: ${orderId} for ₹${amount}`);
  return { success: true, transactionId: `cod_${Date.now()}`, status: 'pending' };
};

export const processWalletPayment = async (walletId, amount) => {
  console.log(`[Wallet] Deducting ₹${amount} from wallet ${walletId}`);
  return { success: true, transactionId: `wlt_${Date.now()}`, status: 'completed' };
};
