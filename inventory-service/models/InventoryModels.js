const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true    },
    quantity: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now },
    reserved: { type: Number,  default: 0 }, // Số lượng đã reserve
});

module.exports = mongoose.model("Inventory", inventorySchema);
// const inventorySchema = new mongoose.Schema({
//     productId: { type: String, required: true, unique: true },
//     quantity: { type: Number, required: true, default: 0 },
//     reservedQuantity: { type: Number, required: true, default: 0 }, //  Hàng đã đặt trước, tránh over-selling
//     lowStockThreshold: { type: Number, default: 5 }, //  Ngưỡng cảnh báo tồn kho thấp

//     updatedAt: { type: Date, default: Date.now }
// });