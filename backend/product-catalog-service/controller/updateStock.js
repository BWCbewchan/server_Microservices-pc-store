const ProductModel = require("../models/ProductModel");

async function updateStock(req, res) {
    try {
        // Lấy productId và stock mới từ URL params
        const productId = req.params.id;
        const newStock = req.params.stock;

        if (!productId || !newStock || isNaN(newStock)) {
            return res.status(400).json({ message: "❌ Dữ liệu không hợp lệ: cần productId và stock hợp lệ" });
        }

        console.log("🔄 Updating stock for Product ID:", productId);
        console.log("📦 New Stock:", newStock);

        // Cập nhật lại trường stock của sản phẩm
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            { $set: { stock: Number(newStock) } },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "❌ Không tìm thấy sản phẩm" });
        }

        res.status(200).json({
            message: "✅ Cập nhật stock sản phẩm thành công!",
            data: updatedProduct
        });
    } catch (error) {
        console.error("🚨 Lỗi khi cập nhật stock sản phẩm:", error);
        res.status(500).json({ message: "❌ Lỗi server khi cập nhật stock sản phẩm", error: error.message });
    }
}

module.exports = updateStock;
