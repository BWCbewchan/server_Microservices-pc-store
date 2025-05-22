const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Thêm sản phẩm vào giỏ (userId, productId, quantity đều được truyền qua params)
// Ví dụ: POST /cart/add/USER_ID/PRODUCT_ID/QUANTITY
router.post("/add/:userId/:productId/:quantity", cartController.addToCart);

// Cập nhật số lượng sản phẩm trong giỏ (userId, productId, quantity qua params)
// Ví dụ: PUT /cart/update/USER_ID/PRODUCT_ID/QUANTITY
router.put("/update/:userId/:productId/:quantity", cartController.updateCartItem);

// Xóa sản phẩm khỏi giỏ (userId, productId qua params)
// Ví dụ: DELETE /cart/remove/USER_ID/PRODUCT_ID
router.delete("/remove/:userId/:productId", cartController.removeFromCart);

// Xóa sạch giỏ hàng của user (userId qua params)
// Ví dụ: DELETE /cart/clear/USER_ID
router.delete("/clear/:userId", cartController.clearCart);

// Kiểm tra giỏ hàng (so sánh số lượng với tồn kho) (userId qua params)
// Ví dụ: GET /cart/check/USER_ID
router.get("/check/:userId", cartController.checkCart);


// Lấy giỏ hàng của user (userId qua params)
// Ví dụ: GET /cart/USER_ID
router.get("/:userId", cartController.getCart);

module.exports = router;
