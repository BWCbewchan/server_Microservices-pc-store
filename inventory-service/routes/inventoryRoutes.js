// inventory-service/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const supplierController = require('../controllers/supplierController');

// Route để lấy tất cả các sản phẩm trong tồn kho
router.get('/', inventoryController.listAllInventory);

// Route để lấy thông tin tồn kho theo productId
router.get('/:productId', inventoryController.getInventory);

// Route để cập nhật tồn kho theo productId
router.put('/:productId', inventoryController.updateInventory);

// New routes
router.get('/alerts/low-stock', inventoryController.getStockAlerts);
router.get('/:productId/purchase-history', inventoryController.getPurchaseHistory);
router.post('/:productId/purchase', inventoryController.addPurchaseHistory);
router.post('/:productId/forecast', inventoryController.updateDemandForecast);

// Supplier routes
router.post('/:productId/suppliers', supplierController.addSupplier);
router.put('/:productId/suppliers/:supplierId', supplierController.updateSupplier);
router.delete('/:productId/suppliers/:supplierId', supplierController.removeSupplier);

module.exports = router;
