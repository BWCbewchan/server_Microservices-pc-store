const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const validateOrder = require('../middleware/orderValidation');
const { authenticateToken, authorizeRole } = require('../../api-gateway/middleware/authMiddleware');

// Public routes (no authentication required - for example, webhook from payment gateway)
// router.post('/webhook', orderController.handlePaymentWebhook); // Example

// Protected routes (require authentication)
router.get('/', authenticateToken, authorizeRole(['admin']),orderController.getAllOrders); // Admin only
router.get('/:id', authenticateToken, orderController.getOrderById); //  Logged in User
router.post('/', authenticateToken, validateOrder, orderController.createOrder); //  Logged in User can create order
router.put('/:id', authenticateToken, authorizeRole(['admin']), orderController.updateOrder); // Admin Only
router.delete('/:id', authenticateToken, authorizeRole(['admin']), orderController.deleteOrder); // Admin Only


module.exports = router;
