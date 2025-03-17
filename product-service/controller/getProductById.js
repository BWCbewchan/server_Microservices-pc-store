// controllers/getProductById.js
const ProductModel = require("../models/ProductModel");
const mongoose = require("mongoose");

async function getProductById(req, res) {
    try {
        const productId = req.params.id;
        
        // Kiểm tra productId có hợp lệ không
        if (!productId) {
            return res.status(400).json({ message: "❌ Thiếu productId" });
        }

        // Kiểm tra định dạng ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "❌ ID sản phẩm không hợp lệ" });
        }

        console.log("📌 Đang tìm Product ID:", productId);

        const product = await ProductModel.findById(productId);
        
        if (!product) {
            return res.status(404).json({ 
                message: "❌ Không tìm thấy sản phẩm",
                requestedId: productId 
            });
        }

        // Log thành công
        console.log("✅ Đã tìm thấy sản phẩm:", product.name);

        res.status(200).json({ data: product });
    } catch (error) {
        console.error("🚨 Lỗi khi tìm sản phẩm:", error);
        res.status(500).json({ 
            message: "❌ Lỗi server khi lấy sản phẩm", 
            error: error.message,
            requestedId: req.params.id
        });
    }
}

module.exports = getProductById;
