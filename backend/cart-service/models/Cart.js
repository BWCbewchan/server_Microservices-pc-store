const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
}, { _id: false });

const CartSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    items: [CartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);
