const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Legacy URL parameter method
router.post(
    "/create/:userId/:customer/:items/:shipping/:payment/:finalTotal/:notes",
    orderController.createOrder
);

// Add new JSON body-based route (more reliable)
router.post("/create", orderController.createOrderJSON);

// Lấy đơn hàng theo id
router.get("/:orderId", orderController.getOrderById);

// Lấy đơn hàng của user
router.get("/user/:userId", orderController.getOrdersByUser);

// Lấy tất cả đơn hàng (Admin)
router.get("/", orderController.getAllOrders);

// Cập nhật đơn hàng (Admin)
router.put('/update/:orderId/:updateData', orderController.updateOrder);

// Hủy đơn hàng
router.post("/cancel/:orderId", orderController.cancelOrder);
// Hủy đơn hàng (Admin) - cho phép hủy bất kỳ đơn hàng nào
router.post("/admin/cancel/:orderId", orderController.adminCancelOrder);

// Xóa đơn hàng (Admin) - xóa hoàn toàn đơn hàng khỏi CSDL
router.delete("/admin/delete/:orderId", orderController.adminDeleteOrder);

module.exports = router;
