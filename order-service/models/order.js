// order-service/models/order.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  customer: { type: String, required: true }, // Can be a reference to User model in Customer Service
  items: [{ type: Schema.Types.ObjectId, ref: 'Product' }], // Reference to products in Product Service
  total: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  billingAddress: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled'], default: 'pending' },
  orderDate: { type: Date, default: Date.now },
  shippingDate: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
