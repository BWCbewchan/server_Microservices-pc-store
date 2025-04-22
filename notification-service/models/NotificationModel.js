const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["order", "promotion", "system", "support"], required: true },
  status: { type: String, enum: ["unread", "read", "archived"], default: "unread" },
  isRead: { type: Boolean, default: false },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  orderStatus: { type: String, enum: ["pending", "shipped", "delivered", "canceled"], default: "pending" },
  platform: { type: String, enum: ["web", "mobile", "email", "sms"], default: "web" },
  createdAt: { type: Date, default: Date.now },
});

const NotificationModel = mongoose.model("Notification", notificationSchema);

module.exports = NotificationModel;
