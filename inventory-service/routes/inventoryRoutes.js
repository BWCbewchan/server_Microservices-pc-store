// inventory-service/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, authorizeRole } = require('../../api-gateway/middleware/authMiddleware');

router.get('/:productId', inventoryController.getInventory);
router.put('/:productId', authenticateToken, authorizeRole(['admin']), inventoryController.updateInventory);

module.exports = router;
