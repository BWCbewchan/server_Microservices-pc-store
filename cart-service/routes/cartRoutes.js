const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Route để thêm sản phẩm vào giỏ hàng
router.post('/add', cartController.addToCart);

// Route để lấy giỏ hàng của người dùng
router.get('/:userId', cartController.getCart);

// Route để xóa sản phẩm khỏi giỏ hàng
router.delete('/remove', cartController.removeFromCart);

module.exports = router;