const ProductModel = require("../../models/ProductModel");

async function getProductsByFilters(req, res) {
  try {
    const { name, category, priceRange } = req.query;
    let priceBounds = [];

    if (priceRange) {
      priceBounds = priceRange.split("-").map((price) => parseFloat(price.replace(/[^0-9.-]+/g, "")));
    }

    const query = {
      ...(name && { name: new RegExp(name, "i") }),
      ...(category && { category }),
      ...(priceRange && { price: { $gte: priceBounds[0], $lte: priceBounds[1] || Infinity } }),
    };

    const products = await ProductModel.find(query);
    res.status(200).json({ data: products });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi lấy danh sách sản phẩm", error });
  }
}

module.exports = getProductsByFilters;
