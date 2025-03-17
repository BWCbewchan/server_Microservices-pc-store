const ProductModel = require("../../models/ProductModel");

async function searchProduct(req, res) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Perform a case-insensitive search
    const products = await ProductModel.find({ name: new RegExp(query, 'i') });
    res.status(200).json({ data: products });
  } catch (error) {
    res.status(500).json({ message: "Error searching for products", error });
  }
}

module.exports = searchProduct;