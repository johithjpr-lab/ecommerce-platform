import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  method: { type: String, required: true, enum: ['card', 'upi', 'cod', 'paypal', 'wallet'] },
  gateway: { type: String, enum: ['stripe', 'paypal', 'razorpay', 'internal', 'cod'] },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, default: 'pending', enum: ['pending', 'completed', 'failed', 'refunded'] },
  transactionId: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  refundId: String,
  refundAmount: Number,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
