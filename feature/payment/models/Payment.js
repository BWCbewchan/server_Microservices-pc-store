const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order'
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['momo', 'vnpay', 'paypal'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionId: String,
  paymentDetails: {
    type: Map,
    of: String
  }
}, { timestamps: true }); 