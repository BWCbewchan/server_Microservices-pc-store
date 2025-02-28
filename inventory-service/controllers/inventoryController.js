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
    const inventory = await Inventory.findOneAndUpdate(
      { productId: req.params.productId },
      { quantity: req.body.quantity },
      { new: true, upsert: true } // Create if not exists
    );

    res.json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi cập nhật tồn kho', error: err.message });
  }
};
