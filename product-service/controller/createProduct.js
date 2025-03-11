const ProductModel = require("../models/ProductModel");

async function createProduct(req, res) {
  try {
    let { details, color, ...otherData } = req.body;

    // Kiểm tra nếu `details` và `color` không phải mảng thì ép kiểu
    details = Array.isArray(details) ? details : [];
    color = Array.isArray(color) ? color : [];

    const newProduct = new ProductModel({ ...otherData, details, color });
    await newProduct.save();

    res.status(201).json({ message: "Thêm sản phẩm thành công!", product: newProduct });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi tạo sản phẩm", error });
  }
}

module.exports = createProduct;
