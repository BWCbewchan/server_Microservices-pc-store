// product-service/models/product.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  attributes: { type: Object } // Optional:  RAM, CPU, Ổ cứng, ...
});

module.exports = mongoose.model('Product', productSchema);
