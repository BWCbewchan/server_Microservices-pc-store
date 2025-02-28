const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validateProduct = require('../middleware/productValidation');
const { authenticateToken, authorizeRole } = require('../../api-gateway/middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (require authentication and authorization)
router.post('/', authenticateToken, authorizeRole(['admin']), validateProduct, productController.createProduct);
router.put('/:id', authenticateToken, authorizeRole(['admin']), validateProduct, productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), productController.deleteProduct);

module.exports = router;
