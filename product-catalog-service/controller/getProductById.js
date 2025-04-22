// controllers/getProductById.js
const ProductModel = require("../models/ProductModel");

async function getProductById(req, res) {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(400).json({ message: "❌ Thiếu productId" });
        }

        console.log("📌 Kiểm tra Product ID:", productId);

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "❌ Không tìm thấy sản phẩm" });
        }

        res.status(200).json({ data: product });
    } catch (error) {
        console.error("🚨 Lỗi lấy sản phẩm:", error);
        res.status(500).json({ message: "❌ Lỗi server khi lấy sản phẩm", error: error.message });
    }
}

module.exports = getProductById;
