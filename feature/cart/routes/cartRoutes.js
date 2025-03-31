const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Cart management routes
router.get('/:userId', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update-quantity', cartController.updateQuantity);
router.delete('/remove', cartController.removeFromCart);
router.delete('/:userId/clear', cartController.clearCart);
router.get('/:userId/summary', cartController.getCartSummary);

module.exports = router;