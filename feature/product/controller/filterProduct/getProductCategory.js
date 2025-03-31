const ProductModel = require("../../models/ProductModel");

async function getProductCategory(req, res) {
  try {
    const products = await ProductModel.find({ category: req.params.category });
    if (products.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm theo danh mục" });
    }

    res.status(200).json({ data: products });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi lấy sản phẩm theo danh mục", error });
  }
}

module.exports = getProductCategory;
