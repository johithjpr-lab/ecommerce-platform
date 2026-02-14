import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  trackingNumber: { type: String, unique: true },
  carrier: { type: String, default: 'GadgetZone Express' },
  status: { type: String, default: 'preparing', enum: ['preparing', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'] },
  currentLocation: {
    lat: Number,
    lng: Number,
    address: String,
    updatedAt: Date
  },
  origin: { address: String, lat: Number, lng: Number },
  destination: { address: String, lat: Number, lng: Number },
  estimatedDelivery: Date,
  actualDelivery: Date,
  trackingHistory: [{
    status: String,
    location: { lat: Number, lng: Number, address: String },
    timestamp: { type: Date, default: Date.now },
    description: String
  }],
  notificationsLog: [{
    type: { type: String, enum: ['sms', 'email'] },
    message: String,
    sentAt: Date,
    status: { type: String, enum: ['sent', 'failed'] }
  }]
}, { timestamps: true });

shipmentSchema.pre('save', function (next) {
  if (!this.trackingNumber) {
    this.trackingNumber = `GZT${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
  next();
});

export default mongoose.model('Shipment', shipmentSchema);
