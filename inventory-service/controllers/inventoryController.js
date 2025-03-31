// inventory-service/controllers/inventoryController.js
const Inventory = require('../models/inventory');

exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ productId: req.params.productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin tồn kho' });
    }
    res.json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { quantity, reserved } = req.body;

    // Kiểm tra đầu vào
    if (typeof quantity !== 'number' || typeof reserved !== 'number') {
      return res.status(400).json({ message: 'Số lượng và số lượng đã đặt phải là số' });
    }

    const inventory = await Inventory.findOneAndUpdate(
      { productId: req.params.productId },
      { quantity, reserved },
      { new: true, upsert: true }
    );

    res.json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi cập nhật tồn kho', error: err.message });
  }
};

// Hàm liệt kê tất cả các sản phẩm trong tồn kho
exports.listAllInventory = async (req, res) => {
  try {
    const inventories = await Inventory.find(); // Lấy tất cả các sản phẩm trong tồn kho
    res.status(200).json(inventories); // Trả về danh sách tồn kho
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.addPurchaseHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const purchaseData = req.body;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    inventory.purchaseHistory.push(purchaseData);
    inventory.quantity += purchaseData.quantity;
    await inventory.save();

    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDemandForecast = async (req, res) => {
  try {
    const { productId } = req.params;
    const forecastData = req.body;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    inventory.demandForecasts.push(forecastData);
    await inventory.save();

    res.status(201).json(inventory.demandForecasts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStockAlerts = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $where: function() {
        return this.quantity <= this.minStockLevel;
      }
    });

    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPurchaseHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    let history = inventory.purchaseHistory;
    if (startDate && endDate) {
      history = history.filter(h => 
        h.orderDate >= new Date(startDate) && 
        h.orderDate <= new Date(endDate)
      );
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
