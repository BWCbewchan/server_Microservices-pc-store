// order-service/models/order.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const trackingSchema = new Schema({
  status: {
    type: String,
    enum: ['processing', 'in_transit', 'out_for_delivery', 'delivered', 'failed'],
    default: 'processing'
  },
  location: String,
  timestamp: { type: Date, default: Date.now },
  description: String,
  carrier: String,
  trackingNumber: String
});

const returnSchema = new Schema({
  reason: {
    type: String,
    required: true
  },
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: Number,
    reason: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  refundAmount: Number,
  refundStatus: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  tracking: [trackingSchema],
  returnRequest: returnSchema,
  invoiceNumber: String,
  invoiceUrl: String,
  emailNotifications: [{
    type: String,
    timestamp: Date,
    status: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
