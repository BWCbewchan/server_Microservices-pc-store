// controllers/addReview.js
const ProductModel = require("../models/ProductModel");


async function addReview(req, res) {
    try {
        const { rating: newRating } = req.body; // đảm bảo rating được gửi lên
        if (typeof newRating !== 'number') {
            return res.status(400).json({ message: "Vui lòng cung cấp số rating hợp lệ" });
        }
        const product = await ProductModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        // Sử dụng method addReview đã định nghĩa trong schema
        product.addReview(newRating);
        await product.save();
        res.status(200).json({ message: "Đánh giá sản phẩm thành công!", data: product });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi thêm đánh giá", error });
    }
}

module.exports = addReview;
