const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // Giá tại thời điểm đặt hàng
});

const OrderSchema = new mongoose.Schema({
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: String, required: true },
    customer: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    items: [OrderItemSchema],
    shipping: {
        method: { type: String, required: true },
        fee: { type: Number, required: true, default: 0 },
        status: { type: String, enum: ["processing", "shipped", "delivered"], default: "processing" },
        trackingNumber: { type: String, default: "" }
    },
    payment: {
        method: { type: String, required: true },
        status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" }
    },
    finalTotal: { type: Number, required: true }, // Tổng tiền cuối cùng sau phí vận chuyển
    notes: {
        customerNote: { type: String, default: "" },
        sellerNote: { type: String, default: "" }
    },
    status: { type: String, enum: ["pending", "confirmed",  "completed","cancelled"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
