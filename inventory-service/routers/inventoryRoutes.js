const express = require("express");
const router = express.Router();
const inventoryController = require("../controller/inventoryController");

// ✅ API lấy danh sách sản phẩm từ Product Service
router.get("/products", inventoryController.getAllProducts);

// ✅ API lấy danh sách tồn kho từ Inventory Model
router.get("/", inventoryController.getInventory);

// ✅ API kiểm tra tồn kho theo productId (truyền qua params)
router.get("/:productId", inventoryController.getProductStock);

// ✅ API lấy stock theo danh sách productIds (mảng các id được truyền dưới dạng chuỗi phân cách bởi dấu phẩy)
router.get("/bulk/:productIds", inventoryController.getStockByProductIds);

// ✅ API thống kê tổng tồn kho
router.get("/stats", inventoryController.getStockStats);

// ✅ API nhập hàng vào kho (truyền productId và quantity qua params)
router.post("/import/:productId/:quantity", inventoryController.importStock);

// ✅ API đồng bộ Inventory với Product Service
router.post("/syncInventory", inventoryController.syncInventory);

// // ✅ Route đặt chỗ sản phẩm (truyền productId và quantity qua params)
// router.post("/reserve/:productId/:quantity", inventoryController.reserveStock);

// // ✅ Route giải phóng sản phẩm (truyền productId và quantity qua params)
// router.post("/release/:productId/:quantity", inventoryController.releaseStock);

// (Optional) Route xác nhận đơn hàng: truyền items dưới dạng chuỗi JSON trong params
router.post("/confirm/:items", inventoryController.confirmOrder);

// (Optional) Route restore stock: truyền productId và quantity qua params
router.post("/restore/:productId/:quantity", inventoryController.restoreStock);

module.exports = router;
