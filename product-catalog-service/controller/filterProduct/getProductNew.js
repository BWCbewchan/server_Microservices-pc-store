const ProductModel = require("../../models/ProductModel");

async function getProductNew(req, res) {
  try {
    const products = await ProductModel.find({ new: true });
    res.status(200).json({ data: products });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi lấy sản phẩm mới", error });
  }
}

module.exports = getProductNew;
