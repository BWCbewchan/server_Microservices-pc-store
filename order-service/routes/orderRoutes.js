const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const trackingController = require('../controllers/trackingController');
const returnController = require('../controllers/returnController');
const invoiceController = require('../controllers/invoiceController');
const validateOrder = require('../middleware/orderValidation');
const { authenticateToken, authorizeRole } = require('../../api-gateway/middleware/authMiddleware');

// Public routes (no authentication required - for example, webhook from payment gateway)
// router.post('/webhook', orderController.handlePaymentWebhook); // Example

// Protected routes (require authentication)
router.get('/', authenticateToken, authorizeRole(['admin']), orderController.getAllOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.post('/', authenticateToken, validateOrder, orderController.createOrder);
router.put('/:id', authenticateToken, authorizeRole(['admin']), orderController.updateOrder);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), orderController.deleteOrder);

// Tracking routes
router.get('/:orderId/tracking', authenticateToken, trackingController.getTrackingHistory);
router.post('/:orderId/tracking', authenticateToken, authorizeRole(['admin']), trackingController.updateTracking);

// Return/Refund routes
router.post('/:orderId/return', authenticateToken, returnController.createReturnRequest);
router.put('/:orderId/refund', authenticateToken, authorizeRole(['admin']), returnController.processRefund);

// Invoice routes
router.get('/:orderId/invoice', authenticateToken, invoiceController.generateInvoice);

module.exports = router;
