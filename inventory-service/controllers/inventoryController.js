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
