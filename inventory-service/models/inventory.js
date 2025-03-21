// inventory-service/models/inventory.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const inventorySchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0
  },
  location: String,
  lastRestocked: Date,
  lowStockThreshold: {
    type: Number,
    default: 10
  }
}, { timestamps: true });

module.exports = mongoose.model('inventories', inventorySchema);
