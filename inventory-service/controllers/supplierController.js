const Inventory = require('../models/inventory');

exports.addSupplier = async (req, res) => {
  try {
    const { productId } = req.params;
    const supplierData = req.body;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    inventory.suppliers.push(supplierData);
    await inventory.save();

    res.status(201).json(inventory.suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { productId, supplierId } = req.params;
    const updateData = req.body;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const supplier = inventory.suppliers.id(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
    }

    Object.assign(supplier, updateData);
    await inventory.save();

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeSupplier = async (req, res) => {
  try {
    const { productId, supplierId } = req.params;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    inventory.suppliers.pull(supplierId);
    await inventory.save();

    res.json({ message: 'Đã xóa nhà cung cấp' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};