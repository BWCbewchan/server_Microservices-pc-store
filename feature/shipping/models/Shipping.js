const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },
  trackingNumber: String,
  carrier: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  }
}, { timestamps: true }); 