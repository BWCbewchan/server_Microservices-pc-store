// controllers/deleteProduct.js
const ProductModel = require("../models/ProductModel");


async function deleteProduct(req, res) {
    try {
        const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(200).json({ message: "Xóa sản phẩm thành công!" });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi xóa sản phẩm", error });
    }
}

module.exports = deleteProduct;
