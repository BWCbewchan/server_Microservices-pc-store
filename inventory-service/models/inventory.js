// inventory-service/models/inventory.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const inventorySchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  reserved: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('inventories', inventorySchema);
