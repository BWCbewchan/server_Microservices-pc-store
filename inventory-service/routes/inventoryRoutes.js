// inventory-service/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Route để lấy tất cả các sản phẩm trong tồn kho
router.get('/', inventoryController.listAllInventory);

// Route để lấy thông tin tồn kho theo productId
router.get('/:productId', inventoryController.getInventory);

// Route để cập nhật tồn kho theo productId
router.put('/:productId', inventoryController.updateInventory);

module.exports = router;
